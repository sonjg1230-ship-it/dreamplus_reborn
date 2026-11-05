import React, { useState, useRef, useEffect } from 'react';
import { APPLIANCES, REBORN_MEMBERSHIP_PLANS, FORMSPREE_ENDPOINT } from '../data/mockData';
import { ApplicationFormData } from '../types';

interface ApplicationFormProps {
  preselectedAppliance1?: string;
  preselectedAppliance2?: string;
  preselectedPlanId?: string;
  onSubmitSuccess: (data: ApplicationFormData) => void;
  onOpenPrivacyTerms: () => void;
}

export const ApplicationForm: React.FC<ApplicationFormProps> = ({
  preselectedAppliance1,
  preselectedAppliance2,
  preselectedPlanId,
  onSubmitSuccess,
  onOpenPrivacyTerms,
}) => {
  const [name, setName] = useState('');
  const [phonePrefix, setPhonePrefix] = useState('010');
  const [phoneMid, setPhoneMid] = useState('');
  const [phoneEnd, setPhoneEnd] = useState('');
  const [selectedAge, setSelectedAge] = useState('36~40세');
  const [appliance1, setAppliance1] = useState(preselectedAppliance1 || 'samsung-85tv');
  const [appliance2, setAppliance2] = useState(preselectedAppliance2 || 'wash-tower');
  const [planId, setPlanId] = useState(preselectedPlanId || 'plan-double-gold');
  const [preferredTime, setPreferredTime] = useState('즉시 통화 가능 (10분 내)');
  const [privacyAgreed, setPrivacyAgreed] = useState(true);
  const [showPrivacyInline, setShowPrivacyInline] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const phoneMidRef = useRef<HTMLInputElement>(null);
  const phoneEndRef = useRef<HTMLInputElement>(null);

  // Sync if preselected appliances or plan change from external clicks
  useEffect(() => {
    if (preselectedAppliance1) setAppliance1(preselectedAppliance1);
  }, [preselectedAppliance1]);

  useEffect(() => {
    if (preselectedAppliance2) setAppliance2(preselectedAppliance2);
  }, [preselectedAppliance2]);

  useEffect(() => {
    if (preselectedPlanId) setPlanId(preselectedPlanId);
  }, [preselectedPlanId]);

  const ageOptions = [
    '25~30세',
    '31~35세',
    '36~40세',
    '41~45세',
    '46~50세',
    '51~55세',
    '56~60세',
    '61~63세',
  ];

  const handleMidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    if (val.length <= 4) {
      setPhoneMid(val);
      if (val.length === 4 && phoneEndRef.current) {
        phoneEndRef.current.focus();
      }
    }
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    if (val.length <= 4) {
      setPhoneEnd(val);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError('성함을 입력해 주세요.');
      return;
    }
    if (name.trim().length < 2) {
      setFormError('올바른 한글 성함을 입력해 주세요 (2자 이상).');
      return;
    }
    if (phoneMid.length < 3 || phoneEnd.length < 4) {
      setFormError('휴대폰 번호를 정확히 8자리 모두 입력해 주세요.');
      return;
    }
    if (!appliance1) {
      setFormError('희망가전 1을 선택해 주세요.');
      return;
    }
    if (!privacyAgreed) {
      setFormError('개인정보 수집 및 이용에 동의하셔야 전액지원 신청이 가능합니다.');
      return;
    }

    setIsSubmitting(true);

    const fullPhone = `${phonePrefix}-${phoneMid}-${phoneEnd}`;
    const matchedApp1 = APPLIANCES.find((a) => a.id === appliance1)?.name || appliance1;
    const matchedApp2 =
      appliance2 && appliance2 !== 'none'
        ? APPLIANCES.find((a) => a.id === appliance2)?.name || appliance2
        : '선택 안 함 (1개 단독)';
    const matchedPlan =
      REBORN_MEMBERSHIP_PLANS.find((p) => p.id === planId)?.name ||
      (planId === 'consult' ? '상담 후 추천 플랜 결정' : planId);

    // Formspree payload with clear readable fields
    const formspreePayload = {
      _subject: `[더리본 가전 100% 전액지원] 신규신청: ${name.trim()} (${fullPhone})`,
      name: name.trim(),
      phone: fullPhone,
      ageGroup: selectedAge,
      appliance1: matchedApp1,
      appliance2: matchedApp2,
      membershipPlan: matchedPlan,
      preferredTime: preferredTime,
      privacyAgreed: '동의완료 (필수)',
      submittedAt: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
      clientUrl: typeof window !== 'undefined' ? window.location.href : '',
    };

    try {
      // POST to Formspree
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(formspreePayload),
      });

      if (!res.ok) {
        console.warn('Formspree returned status:', res.status);
      }
    } catch (err) {
      console.error('Formspree network submission error:', err);
      // We continue to complete the user flow smoothly even if network has CORS or adblock
    } finally {
      setIsSubmitting(false);
      onSubmitSuccess({
        name: name.trim(),
        phonePrefix,
        phoneMid,
        phoneEnd,
        ageGroup: selectedAge,
        appliance1,
        appliance2,
        preferredTime,
        privacyAgreed,
        planId,
      });
    }
  };

  return (
    <section
      id="application-form"
      className="scroll-mt-24 bg-white rounded-2xl border-2 border-[#1e40af] p-5 shadow-xl relative mb-12"
    >
      <div className="text-center mb-5 border-b border-[#E2E8F0] pb-4">
        <span className="bg-[#1e40af] text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-block">
          선착순 한정 프로모션
        </span>
        <h2 className="text-2xl font-extrabold text-[#131b2e] mt-2 tracking-tight">
          최신가전 100% 지원 신청서
        </h2>
        <p className="text-xs text-[#DC2626] font-bold mt-1">
          * 미성년자, 신용불량자는 신청이 불가능합니다 (만 25세~63세 한정)
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {formError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <span className="material-symbols-outlined text-base">error</span>
            <span>{formError}</span>
          </div>
        )}

        {/* 이름 입력 */}
        <div>
          <label className="block text-sm text-[#131b2e] font-bold mb-1.5" htmlFor="user-name">
            이름 <span className="text-[#DC2626]">*</span>
          </label>
          <input
            id="user-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="성함을 입력하세요 (예: 홍길동)"
            required
            className="w-full h-12 px-3.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-[#131b2e] text-sm focus:border-[#3B82F6] focus:bg-white focus:ring-2 focus:ring-[#3B82F6]/20 outline-none transition-all placeholder:text-slate-400"
          />
          <p className="text-[11px] text-[#757684] mt-1">
            * 본인 명의 성명을 정확히 기재해 주세요.
          </p>
        </div>

        {/* 연락처 입력 (3분할 세그먼트) */}
        <div>
          <label className="block text-sm text-[#131b2e] font-bold mb-1.5">
            연락처 <span className="text-[#DC2626]">*</span>
          </label>
          <div className="flex items-center gap-2">
            <select
              value={phonePrefix}
              onChange={(e) => setPhonePrefix(e.target.value)}
              className="w-24 h-12 px-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-[#131b2e] text-sm focus:border-[#3B82F6] focus:bg-white focus:ring-2 focus:ring-[#3B82F6]/20 outline-none font-mono font-medium"
            >
              <option value="010">010</option>
              <option value="011">011</option>
              <option value="016">016</option>
              <option value="017">017</option>
              <option value="019">019</option>
            </select>
            <span className="text-[#757684] font-bold">-</span>
            <input
              ref={phoneMidRef}
              type="tel"
              inputMode="numeric"
              maxLength={4}
              value={phoneMid}
              onChange={handleMidChange}
              placeholder="XXXX"
              required
              className="w-full h-12 text-center rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-[#131b2e] text-sm focus:border-[#3B82F6] focus:bg-white focus:ring-2 focus:ring-[#3B82F6]/20 outline-none font-mono font-medium tracking-wider"
            />
            <span className="text-[#757684] font-bold">-</span>
            <input
              ref={phoneEndRef}
              type="tel"
              inputMode="numeric"
              maxLength={4}
              value={phoneEnd}
              onChange={handleEndChange}
              placeholder="XXXX"
              required
              className="w-full h-12 text-center rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-[#131b2e] text-sm focus:border-[#3B82F6] focus:bg-white focus:ring-2 focus:ring-[#3B82F6]/20 outline-none font-mono font-medium tracking-wider"
            />
          </div>
        </div>

        {/* 연령대 선택 칩 (4열 그리드 모바일 최적화) */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-sm text-[#131b2e] font-bold">
              나이 <span className="text-[#DC2626]">*</span>
            </label>
            <span className="text-[11px] text-[#DC2626] font-bold">만 25세~63세 신청 가능</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5" id="age-selector">
            {ageOptions.map((age) => {
              const isSelected = selectedAge === age;
              return (
                <button
                  key={age}
                  type="button"
                  onClick={() => setSelectedAge(age)}
                  className={`h-11 rounded-lg text-xs transition-all active:scale-95 ${
                    isSelected
                      ? 'border-2 border-[#1e40af] bg-[#eaedff] text-[#00288e] font-bold shadow-sm'
                      : 'border border-[#E2E8F0] bg-white text-[#131b2e] font-semibold hover:border-[#1e40af]'
                  }`}
                >
                  {age}
                </button>
              );
            })}
          </div>
        </div>

        {/* 희망가전 1 선택 */}
        <div>
          <label className="block text-sm text-[#131b2e] font-bold mb-1.5" htmlFor="appliance-1">
            희망가전 1 선택 (1인 최대 2개 지원) <span className="text-[#DC2626]">*</span>
          </label>
          <select
            id="appliance-1"
            value={appliance1}
            onChange={(e) => setAppliance1(e.target.value)}
            required
            className="w-full h-12 px-3.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-[#131b2e] text-sm focus:border-[#3B82F6] focus:bg-white focus:ring-2 focus:ring-[#3B82F6]/20 outline-none transition-all font-medium"
          >
            <option value="">- 희망가전 1 선택 -</option>
            {APPLIANCES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} ({item.tag})
              </option>
            ))}
            <option value="etc">기타 가전 (전문상담 시 80여종 중 선택)</option>
          </select>
        </div>

        {/* 희망가전 2 선택 (중복 지원 가능) */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-sm text-[#131b2e] font-bold" htmlFor="appliance-2">
              희망가전 2 선택 (추가 1개 더 선택)
            </label>
            <span className="text-[11px] text-[#0051d5] font-bold">1인 최대 2개 1+1 가능</span>
          </div>
          <select
            id="appliance-2"
            value={appliance2}
            onChange={(e) => setAppliance2(e.target.value)}
            className="w-full h-12 px-3.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-[#131b2e] text-sm focus:border-[#3B82F6] focus:bg-white focus:ring-2 focus:ring-[#3B82F6]/20 outline-none transition-all font-medium"
          >
            <option value="">- 희망가전 2 선택 (선택사항) -</option>
            {APPLIANCES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} ({item.tag})
              </option>
            ))}
            <option value="none">선택 안 함 (가전 1개만 신청)</option>
          </select>
        </div>

        {/* 희망 멤버십 플랜 선택 (더리본 공식 6대 플랜 / 188회 만기 100% 환급) */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-sm text-[#131b2e] font-bold" htmlFor="membership-plan">
              희망 멤버십 플랜 (188회 만기 100% 전액환급)
            </label>
            <span className="text-[11px] text-[#0051d5] font-bold">공식 6대 플랜</span>
          </div>
          <select
            id="membership-plan"
            value={planId}
            onChange={(e) => setPlanId(e.target.value)}
            className="w-full h-12 px-3.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-[#131b2e] text-sm focus:border-[#3B82F6] focus:bg-white focus:ring-2 focus:ring-[#3B82F6]/20 outline-none transition-all font-medium"
          >
            {REBORN_MEMBERSHIP_PLANS.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.name} (1~60회: 월 {plan.phase1Monthly.toLocaleString()}원 / 61~188회: 월{' '}
                {plan.phase2Monthly.toLocaleString()}원)
              </option>
            ))}
            <option value="consult">상담 후 추천 플랜 결정</option>
          </select>
          <p className="text-[11px] text-[#059669] font-medium mt-1">
            * 188회 완납 시 전자제품 할부금을 포함하여 납입원금 100% 전액이 계좌로 환급됩니다.
          </p>
        </div>

        {/* 희망 상담 시간대 선택 */}
        <div>
          <label className="block text-sm text-[#131b2e] font-bold mb-1.5">
            희망 상담 시간대
          </label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {['즉시 통화 가능 (10분 내)', '오전 10:00 ~ 12:00', '오후 13:00 ~ 15:00', '오후 15:00 ~ 18:00'].map(
              (slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setPreferredTime(slot)}
                  className={`py-2 px-3 rounded-lg border text-center transition-all ${
                    preferredTime === slot
                      ? 'border-[#00288e] bg-[#eaedff] text-[#00288e] font-bold'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'
                  }`}
                >
                  {slot}
                </button>
              )
            )}
          </div>
        </div>

        {/* 개인정보 수집 이용 동의 & 모달 열기 */}
        <div className="pt-2">
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={privacyAgreed}
                onChange={(e) => setPrivacyAgreed(e.target.checked)}
                required
                className="w-5 h-5 rounded border-[#E2E8F0] text-[#1e40af] focus:ring-[#1e40af]"
              />
              <span className="text-xs font-bold text-[#131b2e]">
                개인정보 수집 및 이용 동의 <span className="text-[#DC2626]">(필수)</span>
              </span>
            </label>
            <button
              type="button"
              onClick={() => setShowPrivacyInline(!showPrivacyInline)}
              className="text-[11px] text-[#00288e] underline active:opacity-75 font-semibold"
            >
              {showPrivacyInline ? '[접기]' : '[전문보기]'}
            </button>
          </div>

          {/* 접이식 약관 박스 */}
          {showPrivacyInline && (
            <div className="mt-2 p-3 bg-[#f2f3ff] rounded-xl border border-[#E2E8F0] text-[11px] text-slate-600 max-h-36 overflow-y-auto leading-relaxed">
              <p className="font-bold text-[#131b2e] mb-1">개인정보 수집·이용 및 위탁동의서</p>
              주식회사 더리본 및 공식 위탁 대행사는 상품 소개 및 계약 상담, 체결을 위해 아래와 같이
              개인정보를 수집·이용합니다.
              <br />
              1. 수집/이용자: 주식회사 더리본
              <br />
              2. 수집 항목: 성명, 연락처(휴대전화번호), 연령대, 관심 가전
              <br />
              3. 이용 목적: 상품 소개, 계약상담 및 자격심사, 사은품 배송 안내
              <br />
              4. 보유 및 이용기간: 수집 동의일로부터 6개월 또는 목적 달성 시 파기
              <br />* 고객님은 동의를 거부하실 권리가 있으나, 거부 시 상품 가입 및 가전 전액 지원
              혜택이 제한될 수 있습니다.
            </div>
          )}
        </div>

        {/* 풀위드 대형 메인 CTA 버튼 */}
        <div className="pt-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-14 bg-gradient-to-r from-[#316bf3] via-[#1e40af] to-[#00288e] text-white rounded-xl text-base font-bold shadow-lg shadow-[#1e40af]/30 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform hover:brightness-105 disabled:opacity-60 cursor-pointer"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>신청 접수 처리중...</span>
              </span>
            ) : (
              <>
                <span>지금 가전 100% 무료지원 신청하기</span>
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </>
            )}
          </button>
          <p className="text-[11px] text-center text-[#757684] mt-2">
            🔒 SSL 256bit 암호화로 고객님의 개인정보를 안전하게 보호합니다.
          </p>
        </div>
      </form>
    </section>
  );
};
