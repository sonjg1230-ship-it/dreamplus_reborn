import React, { useState, useMemo } from 'react';
import { APPLIANCES, APPLIANCE_PACKAGES, REBORN_MEMBERSHIP_PLANS } from '../data/mockData';
import { ApplianceItem, MembershipPlan } from '../types';

interface SavingsBenefitCalculatorProps {
  onApplyWithPackage: (appliance1Id: string, appliance2Id: string, planId?: string) => void;
}

export const SavingsBenefitCalculator: React.FC<SavingsBenefitCalculatorProps> = ({
  onApplyWithPackage,
}) => {
  // 6 Official Membership Plans
  const [selectedPlanId, setSelectedPlanId] = useState<string>('plan-double-gold');
  const [planGroupFilter, setPlanGroupFilter] = useState<'all' | '트리플' | '더블' | '싱글'>('all');

  // Appliance Package Selection
  const [selectedPackageId, setSelectedPackageId] = useState<string>('wedding-move');
  const [customAppliance1, setCustomAppliance1] = useState<string>('samsung-85tv');
  const [customAppliance2, setCustomAppliance2] = useState<string>('wash-tower');

  // Term & Card Discount
  const [termMonths, setTermMonths] = useState<number>(188); // 188회 (공식 만기), 120회, 60회
  const [useCardDiscount, setUseCardDiscount] = useState<boolean>(true); // -15,000원/월 제휴카드 청구할인
  const [copiedToast, setCopiedToast] = useState(false);

  // Selected Plan Data
  const currentPlan: MembershipPlan = useMemo(() => {
    return (
      REBORN_MEMBERSHIP_PLANS.find((p) => p.id === selectedPlanId) ||
      REBORN_MEMBERSHIP_PLANS[3]
    );
  }, [selectedPlanId]);

  // Filtered Plans list
  const filteredPlans = useMemo(() => {
    if (planGroupFilter === 'all') return REBORN_MEMBERSHIP_PLANS;
    return REBORN_MEMBERSHIP_PLANS.filter((p) => p.groupType === planGroupFilter);
  }, [planGroupFilter]);

  // Parse price helper
  const parsePrice = (priceStr: string): number => {
    const num = parseInt(priceStr.replace(/[^0-9]/g, ''), 10);
    return isNaN(num) ? 0 : num;
  };

  // Determine active appliances
  const { appliance1, appliance2, packageName, packageSubtitle, isCustom } = useMemo(() => {
    if (selectedPackageId === 'custom') {
      const a1 = APPLIANCES.find((a) => a.id === customAppliance1) || APPLIANCES[0];
      const a2 = APPLIANCES.find((a) => a.id === customAppliance2) || null;
      return {
        appliance1: a1,
        appliance2: a2,
        packageName: '직접 맞춤 선택 패키지',
        packageSubtitle: `${a1.name}${a2 ? ` + ${a2.name}` : ''}`,
        isCustom: true,
      };
    }

    const pkg = APPLIANCE_PACKAGES.find((p) => p.id === selectedPackageId) || APPLIANCE_PACKAGES[0];
    const a1 = APPLIANCES.find((a) => a.id === pkg.appliance1Id) || APPLIANCES[0];
    const a2 = pkg.appliance2Id ? APPLIANCES.find((a) => a.id === pkg.appliance2Id) || null : null;

    return {
      appliance1: a1,
      appliance2: a2,
      packageName: pkg.name,
      packageSubtitle: pkg.subtitle,
      isCustom: false,
    };
  }, [selectedPackageId, customAppliance1, customAppliance2]);

  // Financial Calculations
  const app1Price = parsePrice(appliance1.marketPrice);
  const app2Price = appliance2 ? parsePrice(appliance2.marketPrice) : 0;
  const totalMarketPrice = app1Price + app2Price;

  // Monthly breakdown for selected plan
  const cardDiscountAmount = useCardDiscount ? 15000 : 0;

  // Phase 1 (1~60 months)
  const actualPhase1Monthly = Math.max(0, currentPlan.phase1Monthly - cardDiscountAmount);
  // Phase 2 (61~188 months)
  const actualPhase2Monthly = Math.max(0, currentPlan.phase2Monthly - cardDiscountAmount);

  // Total Paid over selected term
  const monthsInPhase1 = Math.min(termMonths, currentPlan.phase1Months);
  const monthsInPhase2 = Math.max(0, termMonths - currentPlan.phase1Months);

  const totalPaidOut =
    monthsInPhase1 * actualPhase1Monthly + monthsInPhase2 * actualPhase2Monthly;

  const totalStandardContractPaid =
    monthsInPhase1 * currentPlan.phase1Monthly + monthsInPhase2 * currentPlan.phase2Monthly;

  const totalCardSaved = cardDiscountAmount * termMonths;

  // 100% Maturity refund (Based on official contract full amount: 188회 완납 시 100% 전액환급)
  const maturityRefundAmount =
    termMonths >= 188
      ? currentPlan.totalAmount
      : Math.round(totalStandardContractPaid * (termMonths >= 120 ? 0.95 : 0.85));

  // Net economic benefit: Appliance value + any card discount + refund
  const totalEconomicBenefit = totalMarketPrice + (termMonths >= 188 ? totalCardSaved : 0);

  const handleCopySummary = () => {
    const text = `[더리본 ${currentPlan.name} 공식 혜택 견적서]
- 선택 멤버십 플랜: ${currentPlan.name} (${currentPlan.accountsCount}구좌 / ${currentPlan.tierGrade})
- 만기 약정기간: 총 ${currentPlan.totalMonths}회 (188개월) 만기 100% 환급형
- 1회~60회 납입금: 월 ${currentPlan.phase1Monthly.toLocaleString()}원 (상조부금 ${currentPlan.phase1LifeAmount.toLocaleString()}원 + 전자제품 ${currentPlan.phase1ApplianceAmount.toLocaleString()}원)
  * 제휴카드 할인 적용 시: 월 ${actualPhase1Monthly.toLocaleString()}원
- 61회~188회 납입금: 월 ${currentPlan.phase2Monthly.toLocaleString()}원 (상조부금)
- 만기 시 100% 전액 환급액: +${currentPlan.totalAmount.toLocaleString()}원 (전자제품 할부금 포함 100% 환급)
- 지원 가전 패키지: ${packageName} (${appliance1.name}${appliance2 ? ` + ${appliance2.name}` : ''})
- 가전 시중 소비자 가격: ${totalMarketPrice.toLocaleString()}원 (고객 부담금 0원)
- 총 경제적 순이익: +${totalEconomicBenefit.toLocaleString()}원 상당 혜택
- 이용 서비스: ${currentPlan.services}`;

    navigator.clipboard.writeText(text);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2500);
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-[#1e40af] p-4 sm:p-5 shadow-xl relative overflow-hidden my-8">
      {/* Decorative Accent */}
      <div className="absolute -right-12 -top-12 w-52 h-52 bg-[#eaedff]/60 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="border-b border-[#E2E8F0] pb-4 mb-5 text-center relative z-10">
        <div className="inline-flex items-center gap-1.5 bg-[#eaedff] text-[#00288e] text-[11px] font-bold px-3 py-1 rounded-full mb-1.5 border border-[#dae2fd]">
          <span className="material-symbols-outlined text-[15px]">verified</span>
          <span>더리본 리빙플러스 공식 6대 멤버십 플랜 &amp; 188회 만기환급 계산기</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-[#131b2e] tracking-tight">
          공식 멤버십 6개 플랜 &amp; 만기환급 시뮬레이터
        </h2>
        <p className="text-xs text-slate-600 mt-1">
          더리본 공식 규정(188회 만기 100% 전액환급)에 따른 전자제품 지원 및 만기 환급금을 확인하세요.
        </p>
      </div>

      {/* 1. Official 6 Membership Plans Selector */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-[#131b2e] flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-[#1e40af] text-white text-[10px] flex items-center justify-center font-bold">
              1
            </span>
            <span>더리본 리빙플러스 공식 6대 멤버십 플랜 선택</span>
          </label>
          <span className="text-[11px] text-[#0051d5] font-semibold">188회 만기 100% 환급</span>
        </div>

        {/* Group Filter Chips: 전체 / 트리플(3구좌) / 더블(2구좌) / 싱글(1구좌) */}
        <div className="flex gap-1.5 mb-2.5">
          {[
            { id: 'all', label: '전체 (6개 플랜)' },
            { id: '트리플', label: '트리플 (3구좌)' },
            { id: '더블', label: '더블 (2구좌)' },
            { id: '싱글', label: '싱글 (1구좌)' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setPlanGroupFilter(tab.id as any)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                planGroupFilter === tab.id
                  ? 'bg-[#00288e] text-white font-bold shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 6 Plans Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {filteredPlans.map((plan) => {
            const isSelected = selectedPlanId === plan.id;
            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => setSelectedPlanId(plan.id)}
                className={`p-3 rounded-xl border text-left transition-all active:scale-[0.98] cursor-pointer relative flex flex-col justify-between ${
                  isSelected
                    ? 'border-2 border-[#1e40af] bg-[#eaedff]/60 shadow-md ring-2 ring-[#1e40af]/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        plan.groupType === '트리플'
                          ? 'bg-[#1e40af] text-white'
                          : plan.groupType === '더블'
                          ? 'bg-[#0051d5] text-white'
                          : 'bg-[#059669] text-white'
                      }`}
                    >
                      {plan.accountsCount}구좌 · {plan.tierGrade}
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold">
                      총 {plan.totalAmount.toLocaleString()}원
                    </span>
                  </div>

                  <div className="text-xs font-bold text-[#131b2e] leading-snug">
                    {plan.name}
                  </div>

                  <div className="mt-1.5 text-[11px] text-slate-600 space-y-0.5 font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">1~60회차:</span>
                      <span className="font-bold text-[#1e40af]">
                        월 {plan.phase1Monthly.toLocaleString()}원
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">61~188회차:</span>
                      <span className="font-bold text-slate-700">
                        월 {plan.phase2Monthly.toLocaleString()}원
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-2 pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
                  <span className="text-[#059669] font-bold">188회 만기 100% 환급</span>
                  <span className="text-slate-500 truncate max-w-[120px]">{plan.tag}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Plan Detail Box */}
        <div className="mt-3 p-3 bg-[#f2f3ff] rounded-xl border border-[#dae2fd] text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#00288e] text-sm">{currentPlan.name}</span>
            <span className="bg-[#1e40af] text-white text-[10px] font-bold px-2 py-0.5 rounded">
              {currentPlan.accountsCount}구좌 이용서비스
            </span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">{currentPlan.description}</p>
          <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-slate-700">
            <div>
              <span className="text-slate-500">초기 1~60회:</span>{' '}
              <strong className="text-[#1e40af]">
                월 {currentPlan.phase1Monthly.toLocaleString()}원
              </strong>
              <div className="text-[10px] text-slate-500">
                (상조부금 {currentPlan.phase1LifeAmount.toLocaleString()}원 + 가전{' '}
                {currentPlan.phase1ApplianceAmount.toLocaleString()}원)
              </div>
            </div>
            <div>
              <span className="text-slate-500">잔여 61~188회:</span>{' '}
              <strong className="text-slate-800">
                월 {currentPlan.phase2Monthly.toLocaleString()}원
              </strong>
              <div className="text-[10px] text-slate-500">(상조부금 단독 납입)</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Appliance Package Selection */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-[#131b2e] flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-[#1e40af] text-white text-[10px] flex items-center justify-center font-bold">
              2
            </span>
            <span>지원 가전 패키지 선택</span>
          </label>
          <span className="text-[11px] text-[#0051d5] font-semibold">1인 최대 2개 결합 가능</span>
        </div>

        {/* Package horizontal cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {APPLIANCE_PACKAGES.map((pkg) => {
            const isSelected = selectedPackageId === pkg.id;
            return (
              <button
                key={pkg.id}
                type="button"
                onClick={() => setSelectedPackageId(pkg.id)}
                className={`p-2.5 rounded-xl border text-left transition-all active:scale-[0.98] cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-2 border-[#1e40af] bg-[#eaedff]/60 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded inline-block mb-1 ${
                      isSelected
                        ? 'bg-[#1e40af] text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {pkg.tag}
                  </span>
                  <div className="text-xs font-bold text-[#131b2e] leading-snug truncate">
                    {pkg.name}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                    {pkg.subtitle}
                  </div>
                </div>
              </button>
            );
          })}

          {/* Custom option */}
          <button
            type="button"
            onClick={() => setSelectedPackageId('custom')}
            className={`p-2.5 rounded-xl border text-left transition-all active:scale-[0.98] cursor-pointer flex flex-col justify-between ${
              selectedPackageId === 'custom'
                ? 'border-2 border-[#1e40af] bg-[#eaedff]/60 shadow-sm'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div>
              <span
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded inline-block mb-1 ${
                  selectedPackageId === 'custom'
                    ? 'bg-[#1e40af] text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                자유 구성
              </span>
              <div className="text-xs font-bold text-[#131b2e] leading-snug">직접 맞춤 선택</div>
              <div className="text-[10px] text-slate-500 mt-0.5">80여종 중 직접 조합</div>
            </div>
          </button>
        </div>

        {/* Custom selectors if 'custom' is active */}
        {isCustom && (
          <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                희망가전 1 선택
              </label>
              <select
                value={customAppliance1}
                onChange={(e) => setCustomAppliance1(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-xs text-[#131b2e] font-medium outline-none focus:border-[#3B82F6]"
              >
                {APPLIANCES.map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.name} ({app.marketPrice})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                희망가전 2 선택 (선택사항)
              </label>
              <select
                value={customAppliance2}
                onChange={(e) => setCustomAppliance2(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-xs text-[#131b2e] font-medium outline-none focus:border-[#3B82F6]"
              >
                <option value="">선택 안 함 (1개만 신청)</option>
                {APPLIANCES.map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.name} ({app.marketPrice})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Selected Appliances Preview */}
        <div className="mt-3 p-2.5 bg-[#F8FAFC] rounded-xl border border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-slate-500 shrink-0">선택된 가전:</span>
            <span className="font-bold text-[#131b2e] truncate">
              {appliance1.name}
              {appliance2 ? ` + ${appliance2.name}` : ''}
            </span>
          </div>
          <span className="font-mono text-[#DC2626] font-bold shrink-0 ml-2">
            시중가 {totalMarketPrice.toLocaleString()}원 상당 (0원 지원)
          </span>
        </div>
      </div>

      {/* 3. Maturity Term & Card Discount Setting */}
      <div className="mb-6 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-[#131b2e] flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-[#1e40af] text-white text-[10px] flex items-center justify-center font-bold">
              3
            </span>
            <span>만기 약정기간 및 추가 청구할인 설정</span>
          </label>
          <span className="text-[11px] text-slate-500 font-semibold">공식 만기 188회 (100% 환급)</span>
        </div>

        {/* Term options: 188회 (공식 만기), 120회, 60회 */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          {[
            { months: 188, label: '188회 (공식 만기)', desc: '원금 100% 전액환급' },
            { months: 120, label: '120회 (10년)', desc: '95% 안심환급' },
            { months: 60, label: '60회 (5년)', desc: '가전할부 종료구간' },
          ].map((t) => (
            <button
              key={t.months}
              type="button"
              onClick={() => setTermMonths(t.months)}
              className={`p-2 rounded-xl border text-center transition-all ${
                termMonths === t.months
                  ? 'border-2 border-[#1e40af] bg-[#eaedff] text-[#00288e] font-bold shadow-sm'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              <div className="font-bold">{t.label}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{t.desc}</div>
            </button>
          ))}
        </div>

        {/* Card Discount Toggle */}
        <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl flex items-center justify-between text-xs cursor-pointer">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={useCardDiscount}
              onChange={(e) => setUseCardDiscount(e.target.checked)}
              className="w-4 h-4 rounded text-[#1e40af] focus:ring-[#1e40af] border-slate-300"
            />
            <span className="font-bold text-[#131b2e]">
              제휴카드 전월 실적 청구할인 적용{' '}
              <span className="text-[#DC2626] font-bold">(매월 15,000원 추가 절감)</span>
            </span>
          </label>
          <span className="text-[10px] text-amber-800 font-semibold bg-amber-100 px-2 py-0.5 rounded">
            인기
          </span>
        </div>
      </div>

      {/* 4. Official Real-Time Financial Dashboard */}
      <div className="bg-gradient-to-br from-[#00288e] via-[#1e40af] to-[#00174b] text-white rounded-2xl p-4 sm:p-5 shadow-lg relative mb-5">
        <div className="flex items-center justify-between border-b border-white/20 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-blue-200 font-medium">{currentPlan.name}</span>
            <span className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded">
              {termMonths}회 약정 시뮬레이션
            </span>
          </div>
          <span className="bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            만기 100% 원금환급 (전자제품 포함)
          </span>
        </div>

        {/* Top 2 Big Numbers */}
        <div className="grid grid-cols-2 gap-3 mb-4 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/15">
            <div className="text-[11px] text-blue-200">고객 가전 실부담금</div>
            <div className="text-xl sm:text-2xl font-black text-white mt-1">
              0원 <span className="text-xs font-normal text-emerald-300">(전액지원)</span>
            </div>
            <div className="text-[10px] text-blue-200 line-through mt-0.5">
              정상가 {totalMarketPrice.toLocaleString()}원
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/15">
            <div className="text-[11px] text-blue-200">만기 시 전액 환급금</div>
            <div className="text-xl sm:text-2xl font-black text-amber-300 mt-1">
              +{maturityRefundAmount.toLocaleString()}원
            </div>
            <div className="text-[10px] text-blue-200 mt-0.5">
              {termMonths >= 188 ? '납입 원금 100% 전액 반환' : `${termMonths}회차 기준 환급`}
            </div>
          </div>
        </div>

        {/* Detailed Financial Breakdown */}
        <div className="space-y-2 text-xs bg-black/25 rounded-xl p-3.5 border border-white/10">
          <div className="flex justify-between items-center text-blue-100">
            <span>지원 가전 시중 소비자 가격</span>
            <span className="font-bold text-white font-mono">
              {totalMarketPrice.toLocaleString()}원 상당 (100% 무상 지급)
            </span>
          </div>

          <div className="flex justify-between items-center text-blue-100">
            <span>초기 1~60회 월 실납입금</span>
            <span className="font-bold text-white font-mono">
              월 {actualPhase1Monthly.toLocaleString()}원
              {useCardDiscount && (
                <span className="text-amber-300 text-[10px] ml-1">
                  (정상 {currentPlan.phase1Monthly.toLocaleString()}원 - 1.5만원 할인)
                </span>
              )}
            </span>
          </div>

          <div className="flex justify-between items-center text-blue-100">
            <span>잔여 61~188회 월 실납입금</span>
            <span className="font-bold text-white font-mono">
              월 {actualPhase2Monthly.toLocaleString()}원
              {useCardDiscount && (
                <span className="text-amber-300 text-[10px] ml-1">
                  (정상 {currentPlan.phase2Monthly.toLocaleString()}원 - 1.5만원 할인)
                </span>
              )}
            </span>
          </div>

          <div className="flex justify-between items-center text-blue-100">
            <span>가전 소유권 및 반납 의무</span>
            <span className="font-bold text-emerald-300">
              반납 의무 없음 (60회 완료 시 영구 고객 소유)
            </span>
          </div>

          <div className="flex justify-between items-center text-blue-100">
            <span>전환 가능 라이프케어 서비스</span>
            <span className="font-bold text-white">{currentPlan.services}</span>
          </div>

          {useCardDiscount && (
            <div className="flex justify-between items-center text-amber-300 border-t border-white/10 pt-2">
              <span>제휴카드 188회 누적 청구할인액</span>
              <span className="font-bold font-mono">+{totalCardSaved.toLocaleString()}원 추가 절감</span>
            </div>
          )}

          <div className="border-t border-white/20 pt-2.5 mt-1 flex justify-between items-center">
            <div>
              <span className="text-xs font-bold text-white">총 체감 경제적 순이익</span>
              <p className="text-[10px] text-blue-200">
                (가전 전액지원 + 만기 100% 전액환급 + 카드청구할인)
              </p>
            </div>
            <span className="text-lg sm:text-xl font-black text-emerald-300 font-mono">
              +{totalEconomicBenefit.toLocaleString()}원
            </span>
          </div>
        </div>
      </div>

      {/* 5. 188회 만기 로드맵 마일스톤 타임라인 */}
      <div className="mb-5 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
        <h4 className="font-bold text-[#131b2e] mb-3 flex items-center justify-between">
          <span>더리본 188회 만기 환급 안심 프로세스</span>
          <span className="text-[10px] text-[#00288e] font-bold">100% 법적 보호</span>
        </h4>

        <div className="space-y-2.5">
          <div className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-[#1e40af] text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
              1
            </span>
            <div>
              <div className="font-bold text-[#131b2e]">가입 즉시 (0개월): 최신 가전 무료 배송·설치</div>
              <p className="text-[11px] text-slate-500">
                삼성·LG 공식 본사 물류 기사 방문 무료 설치, 시중가 {totalMarketPrice.toLocaleString()}원 혜택 즉시 실현
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-[#0051d5] text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
              2
            </span>
            <div>
              <div className="font-bold text-[#131b2e]">60회차 (5년): 전자제품 할부 대금 납입 완료</div>
              <p className="text-[11px] text-slate-500">
                가전 완전 소유권 확정. 61회부터는 상조부금({currentPlan.phase2Monthly.toLocaleString()}원)만 단독 납입
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-amber-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
              3
            </span>
            <div>
              <div className="font-bold text-[#131b2e]">가입 기간 중: 하이브리드 라이프 전환 서비스</div>
              <p className="text-[11px] text-slate-500">
                크루즈 여행, 웨딩, 어학연수, 프리미엄 이사 등 필요한 시점에 {currentPlan.accountsCount}구좌 자유 전환
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-[#059669] text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
              4
            </span>
            <div>
              <div className="font-bold text-[#059669]">
                188회 만기: 납입금 100% 전액 현금 환급 ({currentPlan.totalAmount.toLocaleString()}원)
              </div>
              <p className="text-[11px] text-slate-500">
                전자제품 할부금을 포함하여 고객님이 납입하신 총액 {currentPlan.totalAmount.toLocaleString()}원 전액 반환!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={() =>
            onApplyWithPackage(appliance1.id, appliance2 ? appliance2.id : 'none', currentPlan.id)
          }
          className="w-full h-13 bg-gradient-to-r from-[#316bf3] via-[#1e40af] to-[#00288e] text-white rounded-xl text-sm font-bold shadow-lg shadow-[#1e40af]/30 hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>[{currentPlan.name}] 플랜으로 전액지원 신청하기</span>
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopySummary}
            className="flex-1 h-10 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">content_copy</span>
            <span>{copiedToast ? '공식 견적 결과가 복사되었습니다!' : '공식 견적서 요약 복사하기'}</span>
          </button>
        </div>
      </div>

      {/* Escrow Legal Notice */}
      <p className="text-[10px] text-center text-slate-400 mt-3 leading-relaxed">
        * (주)더리본 공식 규정: 납입기간(188회) 만료 1개월 경과 후 해약 시 전자제품 할부금을 포함하여
        100% 전액 환급됩니다. (할부거래법 제27조에 따라 신한은행·하나은행 50% 법정 선수금 예치 완료)
      </p>
    </div>
  );
};
