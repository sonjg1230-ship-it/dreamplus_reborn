# Firestore Security Specification

## 1. Data Invariants
1. An application document in `/applications/{applicationId}` MUST contain valid applicant fields (`name`, `phone`, `ageGroup`, `appliance1`, `planId`, `planName`, `preferredTime`, `privacyAgreed == true`, `status == '접수완료'`, `createdAt == request.time`) on creation and no extra shadow fields.
2. Document IDs `{applicationId}` and `{adminId}` MUST match `^[a-zA-Z0-9_-]+$` and be <= 128 characters.
3. Because `/applications` stores PII (`name`, `phone`), `get`, `list`, `update`, and `delete` are strictly restricted to verified administrators (`isAdmin()`). Unauthenticated or non-admin users cannot read or list any application records.
4. `createdAt` is immutable after creation (`incoming().createdAt == existing().createdAt`).
5. Admin updates on `/applications/{applicationId}` may only modify `status`, `adminNote`, and `updatedAt` (verified to `request.time`).
6. `/admins/{adminId}` may only be created, updated, or deleted by the bootstrapped owner admin (`email == 'sonjg1230@gmail.com' && email_verified == true`).

## 2. Dirty Dozen Adversarial Payloads
1. **Unauthenticated List Read**: Non-admin user calls `list` on `/applications` -> `PERMISSION_DENIED`.
2. **Unauthenticated Get Read**: Non-admin user calls `get` on `/applications/{id}` -> `PERMISSION_DENIED`.
3. **Spoofed Unverified Email Admin Read**: Signed-in user with `email_verified == false` attempts `read` on `/applications` -> `PERMISSION_DENIED`.
4. **Shadow Field Injection on Create**: Visitor submits `create` with extra field `isAdmin: true` -> `PERMISSION_DENIED`.
5. **Initial Status Tampering**: Visitor submits `create` with `status: '배송일정조율'` instead of `'접수완료'` -> `PERMISSION_DENIED`.
6. **Client Timestamp Forgery on Create**: Visitor submits `create` with backdated `createdAt` (`!= request.time`) -> `PERMISSION_DENIED`.
7. **Consent Bypass**: Visitor submits `create` with `privacyAgreed: false` -> `PERMISSION_DENIED`.
8. **Invalid Phone Pattern / Overlong String**: Visitor submits `phone` containing `<script>` or > 20 chars -> `PERMISSION_DENIED`.
9. **ID Poisoning**: Write to `/applications/` with a 300-char or slash-containing ID -> `PERMISSION_DENIED`.
10. **Immutable `createdAt` Tampering on Update**: Admin update attempts to alter `createdAt` or `name` -> `PERMISSION_DENIED`.
11. **Non-Admin Update / Delete**: Non-admin signed-in user attempts `update` or `delete` on `/applications/{id}` -> `PERMISSION_DENIED`.
12. **Privilege Escalation in `/admins`**: Non-owner signed-in user attempts `create` on `/admins/{uid}` -> `PERMISSION_DENIED`.
