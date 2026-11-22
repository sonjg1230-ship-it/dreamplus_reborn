import 'dotenv/config';
import express, { type Request, type Response, type NextFunction } from 'express';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const DATA_DIR = path.join(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'applications.db');
const LEGACY_PASSCODE_FILE = path.join(DATA_DIR, 'admin-passcode.json');
const SESSION_TTL_MS = 4 * 60 * 60 * 1000; // 4 hours

const ALLOWED_STATUSES = [
  '접수완료',
  '자격심사중',
  '상담원배정',
  '해피콜완료',
  '배송일정조율',
] as const;

type AllowedStatus = (typeof ALLOWED_STATUSES)[number];

// Ephemeral CSPRNG fallback when ADMIN_SESSION_SECRET env var is not configured
const SESSION_SECRET =
  process.env.ADMIN_SESSION_SECRET && process.env.ADMIN_SESSION_SECRET.trim().length >= 16
    ? process.env.ADMIN_SESSION_SECRET.trim()
    : crypto.randomBytes(32).toString('hex');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true, mode: 0o700 });
}

const sqliteDb = new DatabaseSync(DB_FILE);
sqliteDb.exec(`
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS applications (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    age_group TEXT NOT NULL,
    appliance1 TEXT NOT NULL,
    appliance2 TEXT NOT NULL DEFAULT '',
    plan_id TEXT NOT NULL,
    plan_name TEXT NOT NULL,
    preferred_time TEXT NOT NULL,
    privacy_agreed INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT '접수완료',
    admin_note TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT
  );
  CREATE TABLE IF NOT EXISTS admin_config (
    key TEXT PRIMARY KEY,
    salt TEXT NOT NULL,
    hash TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT
  );
`);

interface StoredPasscodeRecord {
  salt: string;
  hash: string;
  createdAt: string;
  updatedAt?: string;
}

interface ApplicationRow {
  id: string;
  name: string;
  phone: string;
  age_group: string;
  appliance1: string;
  appliance2: string;
  plan_id: string;
  plan_name: string;
  preferred_time: string;
  privacy_agreed: number;
  status: string;
  admin_note: string;
  created_at: string;
  updated_at: string | null;
}

interface FailAttemptState {
  count: number;
  resetAt: number;
}

const failedAttempts = new Map<string, FailAttemptState>();
const MAX_FAIL_ATTEMPTS = 5;
const LOCK_WINDOW_MS = 15 * 60 * 1000;

function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim().length > 0) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || 'unknown';
}

function checkRateLimit(ip: string): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const state = failedAttempts.get(ip);
  if (!state) return { allowed: true };
  if (now > state.resetAt) {
    failedAttempts.delete(ip);
    return { allowed: true };
  }
  if (state.count >= MAX_FAIL_ATTEMPTS) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((state.resetAt - now) / 1000)),
    };
  }
  return { allowed: true };
}

function recordFailedAttempt(ip: string): void {
  const now = Date.now();
  const current = failedAttempts.get(ip);
  if (!current || now > current.resetAt) {
    failedAttempts.set(ip, { count: 1, resetAt: now + LOCK_WINDOW_MS });
  } else {
    current.count += 1;
    failedAttempts.set(ip, current);
  }
}

function clearFailedAttempts(ip: string): void {
  failedAttempts.delete(ip);
}

function hashPasscode(passcode: string, saltHex?: string): { salt: string; hash: string } {
  const salt = saltHex || crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(passcode, salt, 64);
  return { salt, hash: derived.toString('hex') };
}

function verifyPasscodeAgainstRecord(passcode: string, record: StoredPasscodeRecord): boolean {
  try {
    const derived = crypto.scryptSync(passcode, record.salt, 64);
    const expected = Buffer.from(record.hash, 'hex');
    if (derived.length !== expected.length) return false;
    return crypto.timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}

function readEnvPasscodeRecord(): StoredPasscodeRecord | null {
  const envPass = process.env.ADMIN_PASSCODE?.trim();
  if (!envPass) return null;
  const { salt, hash } = hashPasscode(envPass, 'env-configured-passcode-salt-v1');
  return { salt, hash, createdAt: 'env' };
}

function readDbPasscodeRecord(): StoredPasscodeRecord | null {
  try {
    const row = sqliteDb
      .prepare('SELECT salt, hash, created_at, updated_at FROM admin_config WHERE key = ?')
      .get('admin_passcode') as
      | { salt: string; hash: string; created_at: string; updated_at: string | null }
      | undefined;

    if (row && typeof row.salt === 'string' && typeof row.hash === 'string') {
      return {
        salt: row.salt,
        hash: row.hash,
        createdAt: row.created_at,
        updatedAt: row.updated_at || undefined,
      };
    }

    // Migrate legacy file-based passcode record into SQLite if present
    if (fs.existsSync(LEGACY_PASSCODE_FILE)) {
      const raw = fs.readFileSync(LEGACY_PASSCODE_FILE, 'utf8');
      const parsed = JSON.parse(raw) as Partial<StoredPasscodeRecord>;
      if (typeof parsed.salt === 'string' && typeof parsed.hash === 'string') {
        const createdAt =
          typeof parsed.createdAt === 'string' ? parsed.createdAt : new Date().toISOString();
        sqliteDb
          .prepare(
            'INSERT OR REPLACE INTO admin_config (key, salt, hash, created_at) VALUES (?, ?, ?, ?)'
          )
          .run('admin_passcode', parsed.salt, parsed.hash, createdAt);
        fs.unlinkSync(LEGACY_PASSCODE_FILE);
        return { salt: parsed.salt, hash: parsed.hash, createdAt };
      }
    }
    return null;
  } catch {
    return null;
  }
}

function getActivePasscodeRecord(): {
  source: 'env' | 'db' | 'none';
  record: StoredPasscodeRecord | null;
} {
  const envRec = readEnvPasscodeRecord();
  if (envRec) return { source: 'env', record: envRec };
  const dbRec = readDbPasscodeRecord();
  if (dbRec) return { source: 'db', record: dbRec };
  return { source: 'none', record: null };
}

function writeDbPasscodeRecord(passcode: string): void {
  const { salt, hash } = hashPasscode(passcode);
  const now = new Date().toISOString();
  sqliteDb
    .prepare(
      `INSERT INTO admin_config (key, salt, hash, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET
         salt = excluded.salt,
         hash = excluded.hash,
         updated_at = excluded.updated_at`
    )
    .run('admin_passcode', salt, hash, now, now);
}

function signAdminToken(): { token: string; expiresAt: number } {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const nonce = crypto.randomBytes(12).toString('hex');
  const payload = Buffer.from(JSON.stringify({ role: 'admin', exp: expiresAt, nonce })).toString(
    'base64url'
  );
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
  return { token: `${payload}.${sig}`, expiresAt };
}

function verifyAdminToken(token: string): boolean {
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [payload, sig] = parts;
  if (!payload || !sig) return false;

  try {
    const expectedSig = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(payload)
      .digest('base64url');
    const a = Buffer.from(sig);
    const b = Buffer.from(expectedSig);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return false;
    }
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      role?: string;
      exp?: number;
    };
    return decoded.role === 'admin' && typeof decoded.exp === 'number' && decoded.exp > Date.now();
  } catch {
    return false;
  }
}

function requireAdminToken(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: '관리자 인증 토큰이 필요합니다.' });
    return;
  }
  const token = authHeader.slice('Bearer '.length).trim();
  if (!verifyAdminToken(token)) {
    res.status(401).json({ error: '관리자 세션이 만료되었거나 유효하지 않습니다.' });
    return;
  }
  next();
}

function mapApplicationRow(row: ApplicationRow) {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    ageGroup: row.age_group,
    appliance1: row.appliance1,
    appliance2: row.appliance2,
    planId: row.plan_id,
    planName: row.plan_name,
    preferredTime: row.preferred_time,
    privacyAgreed: row.privacy_agreed === 1,
    status: ALLOWED_STATUSES.includes(row.status as AllowedStatus)
      ? (row.status as AllowedStatus)
      : '접수완료',
    adminNote: row.admin_note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function startServer() {
  const app = express();
  app.set('trust proxy', 1);
  app.use(express.json({ limit: '32kb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ ok: true });
  });

  // Public submission endpoint storing customer application in SQLite DB
  app.post('/api/applications', (req: Request, res: Response) => {
    const body = req.body as Record<string, unknown> | undefined;
    if (!body || typeof body !== 'object') {
      res.status(400).json({ error: '잘못된 요청 형식입니다.' });
      return;
    }

    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
    const ageGroup = typeof body.ageGroup === 'string' ? body.ageGroup.trim() : '';
    const appliance1 = typeof body.appliance1 === 'string' ? body.appliance1.trim() : '';
    const appliance2 = typeof body.appliance2 === 'string' ? body.appliance2.trim() : '';
    const planId = typeof body.planId === 'string' ? body.planId.trim() : '';
    const planName = typeof body.planName === 'string' ? body.planName.trim() : '';
    const preferredTime = typeof body.preferredTime === 'string' ? body.preferredTime.trim() : '';
    const privacyAgreed = body.privacyAgreed === true;

    if (name.length < 2 || name.length > 50) {
      res.status(400).json({ error: '성함은 2자 이상 50자 이하로 입력해 주세요.' });
      return;
    }
    if (phone.length < 9 || phone.length > 20 || !/^[0-9-]+$/.test(phone)) {
      res.status(400).json({ error: '유효한 연락처 형식이 아닙니다.' });
      return;
    }
    if (ageGroup.length < 2 || ageGroup.length > 20) {
      res.status(400).json({ error: '연령대 정보가 올바르지 않습니다.' });
      return;
    }
    if (appliance1.length < 1 || appliance1.length > 200 || appliance2.length > 200) {
      res.status(400).json({ error: '선택한 가전 정보가 올바르지 않습니다.' });
      return;
    }
    if (planId.length < 1 || planId.length > 80 || planName.length < 1 || planName.length > 120) {
      res.status(400).json({ error: '선택한 멤버십 플랜 정보가 올바르지 않습니다.' });
      return;
    }
    if (preferredTime.length < 1 || preferredTime.length > 80) {
      res.status(400).json({ error: '희망 상담 시간이 올바르지 않습니다.' });
      return;
    }
    if (!privacyAgreed) {
      res.status(400).json({ error: '개인정보 수집 및 이용 동의가 필요합니다.' });
      return;
    }

    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    try {
      sqliteDb
        .prepare(
          `INSERT INTO applications (
            id, name, phone, age_group, appliance1, appliance2,
            plan_id, plan_name, preferred_time, privacy_agreed,
            status, admin_note, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          id,
          name,
          phone,
          ageGroup,
          appliance1,
          appliance2,
          planId,
          planName,
          preferredTime,
          1,
          '접수완료',
          '',
          createdAt
        );
      res.status(201).json({ ok: true, id, createdAt });
    } catch (err) {
      console.error('Failed to persist application in SQLite DB:', err);
      res.status(500).json({ error: '접수 내역 저장 중 서버 오류가 발생했습니다.' });
    }
  });

  // Admin Passcode Auth Endpoints
  app.get('/api/admin/status', (_req: Request, res: Response) => {
    const active = getActivePasscodeRecord();
    res.json({
      configured: active.source !== 'none',
      needsSetup: active.source === 'none',
      source: active.source,
    });
  });

  app.post('/api/admin/setup', (req: Request, res: Response) => {
    const active = getActivePasscodeRecord();
    if (active.source !== 'none') {
      res.status(409).json({ error: '관리자 비밀번호가 이미 설정되어 있습니다.' });
      return;
    }
    const rawPasscode = typeof req.body?.passcode === 'string' ? req.body.passcode.trim() : '';
    if (rawPasscode.length < 4 || rawPasscode.length > 64) {
      res.status(400).json({ error: '비밀번호는 4자 이상 64자 이하로 입력해 주세요.' });
      return;
    }

    writeDbPasscodeRecord(rawPasscode);
    const { token, expiresAt } = signAdminToken();
    res.status(201).json({ ok: true, token, expiresAt });
  });

  app.post('/api/admin/login', (req: Request, res: Response) => {
    const ip = getClientIp(req);
    const limit = checkRateLimit(ip);
    if (!limit.allowed) {
      res.status(429).json({
        error: `비밀번호 입력 오류 횟수를 초과했습니다. ${limit.retryAfterSeconds}초 후 다시 시도해 주세요.`,
      });
      return;
    }

    const active = getActivePasscodeRecord();
    if (active.source === 'none' || !active.record) {
      res.status(412).json({ error: '관리자 비밀번호 초기 설정이 필요합니다.', needsSetup: true });
      return;
    }

    const rawPasscode = typeof req.body?.passcode === 'string' ? req.body.passcode.trim() : '';
    if (!rawPasscode || rawPasscode.length > 64) {
      res.status(400).json({ error: '비밀번호를 입력해 주세요.' });
      return;
    }

    if (!verifyPasscodeAgainstRecord(rawPasscode, active.record)) {
      recordFailedAttempt(ip);
      res.status(401).json({ error: '관리자 비밀번호가 일치하지 않습니다.' });
      return;
    }

    clearFailedAttempts(ip);
    const { token, expiresAt } = signAdminToken();
    res.json({ ok: true, token, expiresAt });
  });

  app.get('/api/admin/verify', requireAdminToken, (_req: Request, res: Response) => {
    res.json({ ok: true });
  });

  app.post('/api/admin/change-passcode', requireAdminToken, (req: Request, res: Response) => {
    const active = getActivePasscodeRecord();
    if (active.source === 'env') {
      res
        .status(400)
        .json({ error: '환경변수(ADMIN_PASSCODE)로 설정된 비밀번호는 서버 설정에서 변경해야 합니다.' });
      return;
    }
    const newPasscode = typeof req.body?.newPasscode === 'string' ? req.body.newPasscode.trim() : '';
    if (newPasscode.length < 4 || newPasscode.length > 64) {
      res.status(400).json({ error: '새 비밀번호는 4자 이상 64자 이하로 입력해 주세요.' });
      return;
    }
    writeDbPasscodeRecord(newPasscode);
    res.json({ ok: true });
  });

  // Protected Admin Applications CRUD Endpoints
  app.get('/api/admin/applications', requireAdminToken, (_req: Request, res: Response) => {
    try {
      const rows = sqliteDb
        .prepare('SELECT * FROM applications ORDER BY created_at DESC')
        .all() as unknown as ApplicationRow[];
      res.json({ items: rows.map(mapApplicationRow) });
    } catch (err) {
      console.error('Failed to query applications:', err);
      res.status(500).json({ error: '접수 DB 조회 중 오류가 발생했습니다.' });
    }
  });

  app.patch('/api/admin/applications/:id', requireAdminToken, (req: Request, res: Response) => {
    const id = typeof req.params.id === 'string' ? req.params.id.trim() : '';
    if (!id || id.length > 128 || !/^[a-zA-Z0-9_-]+$/.test(id)) {
      res.status(400).json({ error: '유효하지 않은 접수 ID입니다.' });
      return;
    }

    const body = req.body as Record<string, unknown> | undefined;
    if (!body || typeof body !== 'object') {
      res.status(400).json({ error: '수정할 데이터가 없습니다.' });
      return;
    }

    const hasStatus = 'status' in body;
    const hasNote = 'adminNote' in body;

    if (!hasStatus && !hasNote) {
      res.status(400).json({ error: '변경할 항목을 지정해 주세요.' });
      return;
    }

    let nextStatus: AllowedStatus | undefined;
    if (hasStatus) {
      const rawStatus = typeof body.status === 'string' ? body.status : '';
      if (!ALLOWED_STATUSES.includes(rawStatus as AllowedStatus)) {
        res.status(400).json({ error: '올바르지 않은 처리 상태 값입니다.' });
        return;
      }
      nextStatus = rawStatus as AllowedStatus;
    }

    let nextNote: string | undefined;
    if (hasNote) {
      if (typeof body.adminNote !== 'string') {
        res.status(400).json({ error: '메모 형식이 올바르지 않습니다.' });
        return;
      }
      nextNote = body.adminNote.trim().slice(0, 500);
    }

    try {
      const existing = sqliteDb
        .prepare('SELECT * FROM applications WHERE id = ?')
        .get(id) as unknown as ApplicationRow | undefined;
      if (!existing) {
        res.status(404).json({ error: '해당 접수 내역을 찾을 수 없습니다.' });
        return;
      }

      const updatedAt = new Date().toISOString();
      const finalStatus = nextStatus ?? existing.status;
      const finalNote = nextNote ?? existing.admin_note;

      sqliteDb
        .prepare(
          'UPDATE applications SET status = ?, admin_note = ?, updated_at = ? WHERE id = ?'
        )
        .run(finalStatus, finalNote, updatedAt, id);

      const updated = sqliteDb
        .prepare('SELECT * FROM applications WHERE id = ?')
        .get(id) as unknown as ApplicationRow;
      res.json({ ok: true, item: mapApplicationRow(updated) });
    } catch (err) {
      console.error('Failed to update application:', err);
      res.status(500).json({ error: '접수 내역 수정 중 오류가 발생했습니다.' });
    }
  });

  app.delete('/api/admin/applications/:id', requireAdminToken, (req: Request, res: Response) => {
    const id = typeof req.params.id === 'string' ? req.params.id.trim() : '';
    if (!id || id.length > 128 || !/^[a-zA-Z0-9_-]+$/.test(id)) {
      res.status(400).json({ error: '유효하지 않은 접수 ID입니다.' });
      return;
    }

    try {
      const result = sqliteDb.prepare('DELETE FROM applications WHERE id = ?').run(id);
      if (result.changes === 0) {
        res.status(404).json({ error: '해당 접수 내역을 찾을 수 없습니다.' });
        return;
      }
      res.json({ ok: true });
    } catch (err) {
      console.error('Failed to delete application:', err);
      res.status(500).json({ error: '접수 내역 삭제 중 오류가 발생했습니다.' });
    }
  });

  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.join(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
