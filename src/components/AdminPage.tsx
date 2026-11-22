import React, { useCallback, useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import {
  ArrowLeft,
  Check,
  Download,
  FileSpreadsheet,
  KeyRound,
  Lock,
  LogOut,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { AdminApplicationRecord, ApplicationStatus } from '../types';

interface AdminPageProps {
  onBackHome: () => void;
}

interface ApiApplicationItem {
  id: string;
  name: string;
  phone: string;
  ageGroup: string;
  appliance1: string;
  appliance2?: string;
  planId: string;
  planName: string;
  preferredTime: string;
  privacyAgreed: boolean;
  status: ApplicationStatus;
  adminNote?: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}

const STATUS_OPTIONS: ApplicationStatus[] = [
  '접수완료',
  '자격심사중',
  '상담원배정',
  '해피콜완료',
  '배송일정조율',
];

const STATUS_BADGE_CLASS: Record<ApplicationStatus, string> = {
  접수완료: 'bg-blue-50 text-blue-700 border-blue-200',
  자격심사중: 'bg-amber-50 text-amber-700 border-amber-200',
  상담원배정: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  해피콜완료: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  배송일정조율: 'bg-purple-50 text-purple-700 border-purple-200',
};

function parseIsoDateOrNull(val: unknown): Date | null {
  if (!val) return null;
  if (val instanceof Date) return val;
  if (typeof val === 'string') {
    const parsed = new Date(val);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
}

function formatDateTimeKR(date: Date | null | undefined): string {
  if (!date) return '-';
  return date.toLocaleString('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function sanitizeCellText(value: string): string {
  const trimmed = value ?? '';
  if (/^[=+\-@\t\r]/.test(trimmed)) {
    return `'${trimmed}`;
  }
  return trimmed;
}

function mapApiItemToRecord(item: ApiApplicationItem): AdminApplicationRecord {
  const safeStatus: ApplicationStatus = STATUS_OPTIONS.includes(item.status)
    ? item.status
    : '접수완료';
  return {
    id: item.id,
    name: item.name || '',
    phone: item.phone || '',
    ageGroup: item.ageGroup || '',
    appliance1: item.appliance1 || '',
    appliance2: item.appliance2 || '',
    planId: item.planId || '',
    planName: item.planName || '',
    preferredTime: item.preferredTime || '',
    privacyAgreed: Boolean(item.privacyAgreed),
    status: safeStatus,
    adminNote: item.adminNote || '',
    createdAt: parseIsoDateOrNull(item.createdAt),
    updatedAt: parseIsoDateOrNull(item.updatedAt),
  };
}

export const AdminPage: React.FC<AdminPageProps> = ({ onBackHome }) => {
  // Server-side passcode session (held strictly in JS memory, never localStorage)
  const [statusLoading, setStatusLoading] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [passcodeSource, setPasscodeSource] = useState<'env' | 'db' | 'none'>('none');
  const [adminToken, setAdminToken] = useState<string | null>(null);

  const [passcodeInput, setPasscodeInput] = useState('');
  const [confirmPasscodeInput, setConfirmPasscodeInput] = useState('');
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // DB records
  const [records, setRecords] = useState<AdminApplicationRecord[]>([]);
  const [dbLoading, setDbLoading] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  // Dashboard filters & UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | ApplicationStatus>('ALL');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [actionBanner, setActionBanner] = useState<string | null>(null);

  // Optional passcode change drawer
  const [showChangePasscode, setShowChangePasscode] = useState(false);
  const [newPasscode, setNewPasscode] = useState('');
  const [newPasscodeConfirm, setNewPasscodeConfirm] = useState('');
  const [changePasscodeMsg, setChangePasscodeMsg] = useState<string | null>(null);

  const showTempBanner = (msg: string) => {
    setActionBanner(msg);
    setTimeout(() => {
      setActionBanner((curr) => (curr === msg ? null : curr));
    }, 3200);
  };

  // Check server admin passcode status
  const fetchPasscodeStatus = useCallback(async () => {
    setStatusLoading(true);
    setAuthError(null);
    try {
      const res = await fetch('/api/admin/status');
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error(
          '백엔드 인증 서버 응답을 받지 못했습니다. 최신 버전으로 다시 배포(공유 업데이트)했는지 확인해 주세요.'
        );
      }
      if (!res.ok) throw new Error('서버 상태를 확인하지 못했습니다.');
      const data = (await res.json()) as {
        configured: boolean;
        needsSetup: boolean;
        source: 'env' | 'db' | 'none';
      };
      setNeedsSetup(Boolean(data.needsSetup));
      setPasscodeSource(data.source || 'none');
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : '관리자 인증 서버와 연결할 수 없습니다.');
    } finally {
      setStatusLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchPasscodeStatus();
  }, [fetchPasscodeStatus]);

  // Fetch application DB records once passcode session token is granted
  const fetchApplications = useCallback(
    async (silent = false) => {
      if (!adminToken) return;
      if (!silent) setDbLoading(true);
      setDbError(null);
      try {
        const res = await fetch('/api/admin/applications', {
          headers: { Authorization: `Bearer ${adminToken}` },
        });
        if (res.status === 401) {
          setAdminToken(null);
          setRecords([]);
          setAuthError('관리자 세션이 만료되었습니다. 비밀번호를 다시 입력해 주세요.');
          return;
        }
        const data = (await res.json()) as { items?: ApiApplicationItem[]; error?: string };
        if (!res.ok || !Array.isArray(data.items)) {
          setDbError(data.error || '접수 DB를 불러오지 못했습니다.');
          return;
        }
        setRecords(data.items.map(mapApiItemToRecord));
      } catch {
        setDbError('서버와 연결하는 중 오류가 발생했습니다.');
      } finally {
        if (!silent) setDbLoading(false);
      }
    },
    [adminToken]
  );

  useEffect(() => {
    if (!adminToken) {
      setRecords([]);
      setDbLoading(false);
      return;
    }
    void fetchApplications(false);
    const interval = setInterval(() => {
      void fetchApplications(true);
    }, 15000);
    return () => clearInterval(interval);
  }, [adminToken, fetchApplications]);

  // First-time passcode setup submit
  const handleSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const trimmed = passcodeInput.trim();
    if (trimmed.length < 4) {
      setAuthError('비밀번호는 4자 이상 입력해 주세요.');
      return;
    }
    if (trimmed !== confirmPasscodeInput.trim()) {
      setAuthError('비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    setAuthSubmitting(true);
    try {
      const res = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: trimmed }),
      });
      const data = (await res.json()) as { token?: string; error?: string };
      if (!res.ok || !data.token) {
        setAuthError(data.error || '비밀번호 설정에 실패했습니다.');
        return;
      }
      setNeedsSetup(false);
      setPasscodeSource('db');
      setPasscodeInput('');
      setConfirmPasscodeInput('');
      setAdminToken(data.token);
    } catch {
      setAuthError('네트워크 오류가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setAuthSubmitting(false);
    }
  };

  // Standard passcode login submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const trimmed = passcodeInput.trim();
    if (!trimmed) {
      setAuthError('관리자 비밀번호를 입력해 주세요.');
      return;
    }

    setAuthSubmitting(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: trimmed }),
      });
      const data = (await res.json()) as { token?: string; error?: string; needsSetup?: boolean };
      if (data.needsSetup) {
        setNeedsSetup(true);
        setAuthError(data.error || '초기 비밀번호 설정이 필요합니다.');
        return;
      }
      if (!res.ok || !data.token) {
        setAuthError(data.error || '비밀번호가 일치하지 않습니다.');
        return;
      }
      setPasscodeInput('');
      setAdminToken(data.token);
    } catch {
      setAuthError('네트워크 오류가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleAdminLogout = () => {
    setAdminToken(null);
    setRecords([]);
    setShowChangePasscode(false);
  };

  const handleStatusChange = async (record: AdminApplicationRecord, nextStatus: ApplicationStatus) => {
    if (!adminToken || record.status === nextStatus) return;
    setSavingId(record.id);
    setDbError(null);
    try {
      const res = await fetch(`/api/admin/applications/${encodeURIComponent(record.id)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.status === 401) {
        setAdminToken(null);
        setAuthError('세션이 만료되었습니다. 비밀번호를 다시 입력해 주세요.');
        return;
      }
      const data = (await res.json()) as { item?: ApiApplicationItem; error?: string };
      if (!res.ok || !data.item) {
        setDbError(data.error || '상태 변경에 실패했습니다.');
        return;
      }
      const mapped = mapApiItemToRecord(data.item);
      setRecords((prev) => prev.map((r) => (r.id === mapped.id ? mapped : r)));
      showTempBanner(`${record.name} 님의 상태가 '${nextStatus}'(으)로 변경되었습니다.`);
    } catch {
      setDbError('상태 변경 중 네트워크 오류가 발생했습니다.');
    } finally {
      setSavingId(null);
    }
  };

  const handleSaveNote = async (record: AdminApplicationRecord) => {
    if (!adminToken) return;
    const safeNote = editingNoteText.trim().slice(0, 500);
    setSavingId(record.id);
    setDbError(null);
    try {
      const res = await fetch(`/api/admin/applications/${encodeURIComponent(record.id)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ adminNote: safeNote }),
      });
      if (res.status === 401) {
        setAdminToken(null);
        setAuthError('세션이 만료되었습니다. 비밀번호를 다시 입력해 주세요.');
        return;
      }
      const data = (await res.json()) as { item?: ApiApplicationItem; error?: string };
      if (!res.ok || !data.item) {
        setDbError(data.error || '메모 저장에 실패했습니다.');
        return;
      }
      const mapped = mapApiItemToRecord(data.item);
      setRecords((prev) => prev.map((r) => (r.id === mapped.id ? mapped : r)));
      setEditingNoteId(null);
      setEditingNoteText('');
      showTempBanner(`${record.name} 님의 관리자 메모가 저장되었습니다.`);
    } catch {
      setDbError('메모 저장 중 네트워크 오류가 발생했습니다.');
    } finally {
      setSavingId(null);
    }
  };

  const handleDeleteRecord = async (record: AdminApplicationRecord) => {
    if (!adminToken) return;
    setSavingId(record.id);
    setDbError(null);
    try {
      const res = await fetch(`/api/admin/applications/${encodeURIComponent(record.id)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.status === 401) {
        setAdminToken(null);
        setAuthError('세션이 만료되었습니다. 비밀번호를 다시 입력해 주세요.');
        return;
      }
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) {
        setDbError(data.error || '삭제 처리에 실패했습니다.');
        return;
      }
      setRecords((prev) => prev.filter((r) => r.id !== record.id));
      setConfirmDeleteId(null);
      showTempBanner(`${record.name} 님의 접수 내역이 삭제되었습니다.`);
    } catch {
      setDbError('삭제 처리 중 네트워크 오류가 발생했습니다.');
    } finally {
      setSavingId(null);
    }
  };

  const handleChangePasscodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangePasscodeMsg(null);
    if (!adminToken) return;
    const trimmed = newPasscode.trim();
    if (trimmed.length < 4) {
      setChangePasscodeMsg('새 비밀번호는 4자 이상이어야 합니다.');
      return;
    }
    if (trimmed !== newPasscodeConfirm.trim()) {
      setChangePasscodeMsg('새 비밀번호 확인이 일치하지 않습니다.');
      return;
    }
    try {
      const res = await fetch('/api/admin/change-passcode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ newPasscode: trimmed }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) {
        setChangePasscodeMsg(data.error || '비밀번호 변경에 실패했습니다.');
        return;
      }
      setNewPasscode('');
      setNewPasscodeConfirm('');
      setShowChangePasscode(false);
      showTempBanner('관리자 비밀번호가 안전하게 변경되었습니다.');
    } catch {
      setChangePasscodeMsg('서버와 통신 중 오류가 발생했습니다.');
    }
  };

  const filteredRecords = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    return records.filter((item) => {
      const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
      if (!matchesStatus) return false;
      if (!keyword) return true;
      return (
        item.name.toLowerCase().includes(keyword) ||
        item.phone.toLowerCase().includes(keyword) ||
        item.appliance1.toLowerCase().includes(keyword) ||
        (item.appliance2 || '').toLowerCase().includes(keyword) ||
        item.planName.toLowerCase().includes(keyword)
      );
    });
  }, [records, searchTerm, statusFilter]);

  const metrics = useMemo(() => {
    const todayPrefix = new Date().toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' });
    let todayCount = 0;
    let waitingCount = 0;
    let progressCount = 0;

    for (const r of records) {
      if (r.createdAt) {
        const dStr = r.createdAt.toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' });
        if (dStr === todayPrefix) todayCount += 1;
      }
      if (r.status === '접수완료' || r.status === '자격심사중') waitingCount += 1;
      if (r.status === '상담원배정' || r.status === '해피콜완료' || r.status === '배송일정조율') {
        progressCount += 1;
      }
    }
    return {
      total: records.length,
      today: todayCount,
      waiting: waitingCount,
      progress: progressCount,
    };
  }, [records]);

  const handleExportExcel = () => {
    const exportList = filteredRecords;
    if (exportList.length === 0) {
      showTempBanner('내보낼 접수 데이터가 없습니다.');
      return;
    }

    const rows = exportList.map((item, idx) => ({
      번호: idx + 1,
      접수일시: formatDateTimeKR(item.createdAt),
      성함: sanitizeCellText(item.name),
      연락처: sanitizeCellText(item.phone),
      연령대: sanitizeCellText(item.ageGroup),
      희망가전1: sanitizeCellText(item.appliance1),
      희망가전2: sanitizeCellText(item.appliance2 || '-'),
      멤버십플랜: sanitizeCellText(item.planName),
      희망상담시간: sanitizeCellText(item.preferredTime),
      처리상태: sanitizeCellText(item.status),
      관리자메모: sanitizeCellText(item.adminNote || ''),
      개인정보동의: item.privacyAgreed ? '동의' : '미동의',
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    worksheet['!cols'] = [
      { wch: 6 },
      { wch: 20 },
      { wch: 12 },
      { wch: 16 },
      { wch: 10 },
      { wch: 28 },
      { wch: 28 },
      { wch: 24 },
      { wch: 20 },
      { wch: 13 },
      { wch: 28 },
      { wch: 12 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '가전지원_접수DB');

    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const filename = `더리본_접수DB_${y}${m}${d}_${hh}${mm}.xlsx`;

    XLSX.writeFile(workbook, filename);
    showTempBanner(`엑셀 파일(${filename}) 다운로드가 시작되었습니다.`);
  };

  // Single-step Passcode Gate (no extra Google login required)
  if (!adminToken) {
    return (
      <main className="pt-28 pb-16 max-w-xl mx-auto px-4 w-full min-h-screen">
        <div className="mb-4">
          <button
            type="button"
            onClick={onBackHome}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#00288e] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>이벤트 페이지로 돌아가기</span>
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 sm:p-8 space-y-6">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#eaedff] text-[#00288e] flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-extrabold text-[#131b2e]">
              {needsSetup ? '관리자 비밀번호 최초 설정' : '관리자 페이지 로그인'}
            </h1>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
              {needsSetup
                ? '최초 1회 관리자 비밀번호를 설정해 주세요. 설정 완료 후 비밀번호만 입력하여 즉시 접수 DB 조회 및 엑셀 내보내기가 가능합니다.'
                : '관리자 비밀번호만 입력하시면 접수 DB 조회 및 엑셀 내보내기 페이지로 바로 이동합니다.'}
            </p>
          </div>

          {statusLoading ? (
            <div className="py-8 flex flex-col items-center gap-2 text-xs text-slate-500">
              <RefreshCw className="w-5 h-5 animate-spin text-[#00288e]" />
              <span>관리자 인증 상태 확인 중...</span>
            </div>
          ) : needsSetup ? (
            <form onSubmit={handleSetupSubmit} className="space-y-4">
              {authError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                  {authError}
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-[#131b2e] mb-1.5" htmlFor="setup-passcode">
                  관리자 비밀번호 (4자 이상)
                </label>
                <input
                  id="setup-passcode"
                  type="password"
                  value={passcodeInput}
                  onChange={(e) => setPasscodeInput(e.target.value)}
                  placeholder="사용할 관리자 비밀번호 입력"
                  autoFocus
                  required
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:border-[#1e40af] focus:ring-2 focus:ring-[#1e40af]/20 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#131b2e] mb-1.5" htmlFor="setup-passcode-confirm">
                  비밀번호 확인
                </label>
                <input
                  id="setup-passcode-confirm"
                  type="password"
                  value={confirmPasscodeInput}
                  onChange={(e) => setConfirmPasscodeInput(e.target.value)}
                  placeholder="비밀번호 재입력"
                  required
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:border-[#1e40af] focus:ring-2 focus:ring-[#1e40af]/20 outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={authSubmitting}
                className="w-full h-12 bg-[#00288e] hover:bg-[#1e40af] text-white font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                <KeyRound className="w-4 h-4" />
                <span>{authSubmitting ? '설정 중...' : '비밀번호 설정 및 바로 입장'}</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {authError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                  {authError}
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-[#131b2e] mb-1.5" htmlFor="admin-passcode">
                  관리자 비밀번호
                </label>
                <input
                  id="admin-passcode"
                  type="password"
                  value={passcodeInput}
                  onChange={(e) => setPasscodeInput(e.target.value)}
                  placeholder="비밀번호를 입력하세요"
                  autoFocus
                  required
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:border-[#1e40af] focus:ring-2 focus:ring-[#1e40af]/20 outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={authSubmitting}
                className="w-full h-12 bg-[#00288e] hover:bg-[#1e40af] text-white font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{authSubmitting ? '확인 중...' : '관리자 페이지 입장'}</span>
              </button>
            </form>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="pt-28 pb-16 max-w-5xl w-full mx-auto px-4 min-h-screen space-y-5">
      {/* Top Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackHome}
            className="inline-flex items-center gap-1 text-xs font-bold text-[#00288e] bg-[#eaedff] hover:bg-[#dae2fd] px-3 py-2 rounded-xl transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>이벤트 홈</span>
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-extrabold text-[#131b2e]">
              더리본 접수 DB 관리자
            </h1>
            <p className="text-[11px] text-slate-500">
              실시간 접수 현황 조회 · 상태 관리 · 엑셀(.xlsx) 내보내기
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void fetchApplications(false)}
            disabled={dbLoading}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-[#00288e] bg-slate-100 hover:bg-slate-200/70 px-3 py-2 rounded-xl transition-colors cursor-pointer"
            title="DB 새로고침"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${dbLoading ? 'animate-spin' : ''}`} />
            <span>새로고침</span>
          </button>
          {passcodeSource === 'db' && (
            <button
              type="button"
              onClick={() => setShowChangePasscode((prev) => !prev)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-[#00288e] bg-slate-100 hover:bg-slate-200/70 px-3 py-2 rounded-xl transition-colors cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>비밀번호 변경</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-3.5 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>엑셀(.xlsx) 내보내기</span>
          </button>
          <button
            type="button"
            onClick={handleAdminLogout}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-red-600 bg-slate-100 hover:bg-red-50 px-3 py-2 rounded-xl transition-colors cursor-pointer"
            title="관리자 잠금"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>로그아웃</span>
          </button>
        </div>
      </div>

      {/* Action Notification Banner */}
      {actionBanner && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionBanner}</span>
        </div>
      )}

      {/* Optional Passcode Change Panel */}
      {showChangePasscode && (
        <form
          onSubmit={handleChangePasscodeSubmit}
          className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#131b2e]">관리자 비밀번호 변경</h2>
            <button
              type="button"
              onClick={() => setShowChangePasscode(false)}
              className="text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
            >
              닫기
            </button>
          </div>
          {changePasscodeMsg && (
            <p className="text-xs text-red-600 font-medium">{changePasscodeMsg}</p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              type="password"
              value={newPasscode}
              onChange={(e) => setNewPasscode(e.target.value)}
              placeholder="새 비밀번호 (4자 이상)"
              className="h-10 px-3 rounded-xl border border-slate-200 text-xs outline-none focus:border-[#1e40af]"
              required
            />
            <input
              type="password"
              value={newPasscodeConfirm}
              onChange={(e) => setNewPasscodeConfirm(e.target.value)}
              placeholder="새 비밀번호 확인"
              className="h-10 px-3 rounded-xl border border-slate-200 text-xs outline-none focus:border-[#1e40af]"
              required
            />
            <button
              type="submit"
              className="h-10 bg-[#00288e] hover:bg-[#1e40af] text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              변경 저장
            </button>
          </div>
        </form>
      )}

      {/* DB Error Alert */}
      {dbError && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-red-800 text-xs font-bold">
            <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />
            <span>{dbError}</span>
          </div>
          <button
            type="button"
            onClick={() => void fetchApplications(false)}
            className="text-xs font-bold text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg cursor-pointer"
          >
            재시도
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500">전체 접수 DB</div>
          <div className="text-2xl font-extrabold text-[#00288e] mt-1">{metrics.total}건</div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500">오늘 접수</div>
          <div className="text-2xl font-extrabold text-[#131b2e] mt-1">{metrics.today}건</div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500">접수 · 심사 대기</div>
          <div className="text-2xl font-extrabold text-amber-600 mt-1">{metrics.waiting}건</div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500">상담 · 배송 진행</div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1">{metrics.progress}건</div>
        </div>
      </div>

      {/* Search & Status Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="성함, 연락처, 희망가전, 플랜 검색..."
              className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:border-[#1e40af] outline-none"
            />
          </div>
          <div className="text-xs text-slate-500 font-medium">
            검색 결과: <span className="font-bold text-[#131b2e]">{filteredRecords.length}</span>건
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition-colors cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-[#00288e] text-white border-[#00288e]'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            전체 ({records.length})
          </button>
          {STATUS_OPTIONS.map((status) => {
            const count = records.filter((r) => r.status === status).length;
            return (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition-colors cursor-pointer ${
                  statusFilter === status
                    ? 'bg-[#00288e] text-white border-[#00288e]'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {status} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* DB Records List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {dbLoading && records.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-[#00288e]" />
            <span>접수 DB를 불러오는 중...</span>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <p className="text-sm font-bold text-slate-700">접수된 DB 내역이 없습니다.</p>
            <p className="text-xs text-slate-500">
              이벤트 페이지 신청서를 통해 접수되면 이곳에 실시간으로 기록됩니다.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600">
                    <th className="py-3 px-4">접수일시</th>
                    <th className="py-3 px-4">고객정보</th>
                    <th className="py-3 px-4">희망가전</th>
                    <th className="py-3 px-4">멤버십 · 상담시간</th>
                    <th className="py-3 px-4">처리상태</th>
                    <th className="py-3 px-4">관리자 메모</th>
                    <th className="py-3 px-4 text-right">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredRecords.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 align-top">
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                        {formatDateTimeKR(item.createdAt)}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-[#131b2e]">
                          {item.name} <span className="text-slate-400 font-normal">({item.ageGroup})</span>
                        </div>
                        <div className="font-mono text-[11px] text-[#00288e] font-semibold mt-0.5">
                          {item.phone}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 max-w-[220px]">
                        <div className="font-semibold text-slate-800">{item.appliance1}</div>
                        {item.appliance2 && (
                          <div className="text-[11px] text-slate-500 mt-0.5">+ {item.appliance2}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 max-w-[200px]">
                        <div className="font-medium text-slate-800">{item.planName}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{item.preferredTime}</div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <select
                          value={item.status}
                          disabled={savingId === item.id}
                          onChange={(e) =>
                            void handleStatusChange(item, e.target.value as ApplicationStatus)
                          }
                          className={`text-[11px] font-bold px-2.5 py-1.5 rounded-lg border outline-none cursor-pointer ${STATUS_BADGE_CLASS[item.status]}`}
                        >
                          {STATUS_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3.5 px-4 min-w-[180px]">
                        {editingNoteId === item.id ? (
                          <div className="space-y-1.5">
                            <input
                              type="text"
                              maxLength={500}
                              value={editingNoteText}
                              onChange={(e) => setEditingNoteText(e.target.value)}
                              placeholder="상담 메모 입력..."
                              className="w-full h-8 px-2.5 rounded-lg border border-[#1e40af] text-xs outline-none"
                            />
                            <div className="flex gap-1">
                              <button
                                type="button"
                                disabled={savingId === item.id}
                                onClick={() => void handleSaveNote(item)}
                                className="px-2.5 py-1 bg-[#00288e] text-white text-[11px] font-bold rounded-md cursor-pointer"
                              >
                                저장
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingNoteId(null)}
                                className="px-2 py-1 bg-slate-100 text-slate-600 text-[11px] rounded-md cursor-pointer"
                              >
                                취소
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingNoteId(item.id);
                              setEditingNoteText(item.adminNote || '');
                            }}
                            className="text-left text-[11px] text-slate-600 hover:text-[#00288e] underline decoration-dashed cursor-pointer"
                          >
                            {item.adminNote ? item.adminNote : '+ 메모 추가'}
                          </button>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {confirmDeleteId === item.id ? (
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              disabled={savingId === item.id}
                              onClick={() => void handleDeleteRecord(item)}
                              className="px-2 py-1 bg-red-600 text-white text-[11px] font-bold rounded-md cursor-pointer"
                            >
                              삭제확인
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-2 py-1 bg-slate-100 text-slate-600 text-[11px] rounded-md cursor-pointer"
                            >
                              취소
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(item.id)}
                            className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                            title="접수 내역 삭제"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List */}
            <div className="lg:hidden divide-y divide-slate-100">
              {filteredRecords.map((item) => (
                <div key={item.id} className="p-4 space-y-2.5 text-xs">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-sm text-[#131b2e]">
                        {item.name}{' '}
                        <span className="text-xs font-normal text-slate-500">({item.ageGroup})</span>
                      </div>
                      <div className="font-mono text-xs font-bold text-[#00288e] mt-0.5">
                        {item.phone}
                      </div>
                    </div>
                    <select
                      value={item.status}
                      disabled={savingId === item.id}
                      onChange={(e) =>
                        void handleStatusChange(item, e.target.value as ApplicationStatus)
                      }
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border outline-none ${STATUS_BADGE_CLASS[item.status]}`}
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-2.5 space-y-1 text-[11px] text-slate-700">
                    <div>
                      <span className="font-semibold text-slate-500">가전1:</span> {item.appliance1}
                    </div>
                    {item.appliance2 && (
                      <div>
                        <span className="font-semibold text-slate-500">가전2:</span> {item.appliance2}
                      </div>
                    )}
                    <div>
                      <span className="font-semibold text-slate-500">플랜:</span> {item.planName}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-500">희망시간:</span> {item.preferredTime}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-500">접수일시:</span>{' '}
                      {formatDateTimeKR(item.createdAt)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    {editingNoteId === item.id ? (
                      <div className="flex-1 flex gap-1.5">
                        <input
                          type="text"
                          maxLength={500}
                          value={editingNoteText}
                          onChange={(e) => setEditingNoteText(e.target.value)}
                          placeholder="메모 입력..."
                          className="flex-1 h-8 px-2.5 rounded-lg border border-[#1e40af] text-xs outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => void handleSaveNote(item)}
                          className="px-2.5 h-8 bg-[#00288e] text-white text-[11px] font-bold rounded-lg cursor-pointer"
                        >
                          저장
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingNoteId(item.id);
                          setEditingNoteText(item.adminNote || '');
                        }}
                        className="text-[11px] text-slate-600 underline decoration-dashed cursor-pointer"
                      >
                        {item.adminNote ? `메모: ${item.adminNote}` : '+ 메모 추가'}
                      </button>
                    )}

                    {confirmDeleteId === item.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => void handleDeleteRecord(item)}
                          className="px-2 py-1 bg-red-600 text-white text-[11px] font-bold rounded-md cursor-pointer"
                        >
                          확인
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-2 py-1 bg-slate-100 text-slate-600 text-[11px] rounded-md cursor-pointer"
                        >
                          취소
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(item.id)}
                        className="text-[11px] text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                      >
                        삭제
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Bottom Quick Excel Download Bar */}
      <div className="flex justify-center pt-2">
        <button
          type="button"
          onClick={handleExportExcel}
          className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>현재 목록 엑셀(.xlsx) 다운로드 ({filteredRecords.length}건)</span>
        </button>
      </div>
    </main>
  );
};
