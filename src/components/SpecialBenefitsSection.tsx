import React from 'react';

interface SpecialBenefitsSectionProps {
  onCheckEligibility: () => void;
  onExploreMore: () => void;
}

export const SpecialBenefitsSection: React.FC<SpecialBenefitsSectionProps> = ({
  onCheckEligibility,
  onExploreMore,
}) => {
  return (
    <section className="mb-10">
      <div className="text-center mb-5">
        <span className="text-[#F97316] text-xs font-bold tracking-wider">SPECIAL BENEFIT</span>
        <h2 className="text-2xl font-extrabold text-[#131b2e] mt-1 tracking-tight">
          더리본 스페셜 멤버십 3대 혜택
        </h2>
        <p className="text-xs text-slate-600 mt-1">
          가전도 지원받고, 납입금은 만기 시 전액 그대로 환급!
        </p>
      </div>

      <div className="space-y-3.5">
        {/* 혜택 01 */}
        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm relative overflow-hidden">
          <div className="absolute -right-2 -bottom-2 text-[#e2e7ff]/60 text-[72px] font-bold select-none leading-none pointer-events-none">
            01
          </div>
          <div className="flex items-start gap-3 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-[#1e40af] text-white flex items-center justify-center shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-[22px]">redeem</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#1e40af]">BENEFIT 01</span>
                <span className="bg-[#DC2626] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                  즉시지급
                </span>
              </div>
              <h3 className="text-base font-bold text-[#131b2e] mt-0.5">
                스페셜멤버십 최신 가전 전액 지원
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                월 3~6만원대 부담 없는 알뜰 멤버십 구성으로, 가입 즉시 최신 프리미엄 가전을
                본인부담금 0원에 무상 증정합니다.
              </p>
            </div>
          </div>
        </div>

        {/* 혜택 02 */}
        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm relative overflow-hidden">
          <div className="absolute -right-2 -bottom-2 text-[#e2e7ff]/60 text-[72px] font-bold select-none leading-none pointer-events-none">
            02
          </div>
          <div className="flex items-start gap-3 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-[#0051d5] text-white flex items-center justify-center shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-[22px]">flight_takeoff</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#0051d5]">BENEFIT 02</span>
                <span className="bg-[#eaedff] text-[#00288e] text-[10px] font-bold px-1.5 py-0.5 rounded">
                  라이프케어
                </span>
              </div>
              <h3 className="text-base font-bold text-[#131b2e] mt-0.5">
                폭넓은 라이프 전환 멤버십 서비스
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                여행, 크루즈, 웨딩, 어학연수, 프리미엄 이사 및 패밀리 라이프 서비스까지 원할 때 언제든
                필요한 혜택으로 전환 이용 가능합니다.
              </p>
            </div>
          </div>
        </div>

        {/* 혜택 03 */}
        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm relative overflow-hidden">
          <div className="absolute -right-2 -bottom-2 text-[#e2e7ff]/60 text-[72px] font-bold select-none leading-none pointer-events-none">
            03
          </div>
          <div className="flex items-start gap-3 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-[#059669] text-white flex items-center justify-center shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-[22px]">savings</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#059669]">BENEFIT 03</span>
                <span className="bg-[#FEF3C7] text-[#131b2e] text-[10px] font-bold px-1.5 py-0.5 rounded border border-amber-300">
                  100% 반환
                </span>
              </div>
              <h3 className="text-base font-bold text-[#131b2e] mt-0.5">
                188회 만기 시 납입금 100% 전액 환급
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                지원받은 가전 반납 의무 일체 없음! 188회 만기 시 전자제품 할부금을 포함하여 납입하신 금액 100% 전액을 그대로 안전하게
                환급해 드립니다.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 강조 배너 */}
      <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-[#00288e] to-[#1e40af] text-white flex items-center justify-between shadow-md">
        <div>
          <p className="text-xs text-slate-200">부담 없는 0원 가전 솔루션</p>
          <h4 className="text-base font-bold mt-0.5">100% 전액지원 + 100% 전액환급!</h4>
        </div>
        <button
          onClick={onCheckEligibility}
          className="bg-white text-[#00288e] px-3.5 py-2 rounded-lg text-xs font-bold shrink-0 shadow active:scale-95 transition-transform hover:bg-slate-50"
        >
          자격확인 &gt;
        </button>
      </div>
    </section>
  );
};
