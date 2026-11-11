import React from 'react';
import { SavingsBenefitCalculator } from './SavingsBenefitCalculator';
import { REBORN_MEMBERSHIP_PLANS } from '../data/mockData';

interface BenefitDetailsViewProps {
  onGoToApply: (appliance1Id?: string, appliance2Id?: string, planId?: string) => void;
}

export const BenefitDetailsView: React.FC<BenefitDetailsViewProps> = ({ onGoToApply }) => {
  return (
    <div className="pt-24 pb-28 max-w-xl mx-auto px-4 bg-[#faf8ff] min-h-screen">
      {/* Header banner */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-1.5 bg-[#eaedff] px-3 py-1 rounded-full text-[#00288e] text-xs font-bold mb-2 border border-[#dae2fd]">
          <span className="material-symbols-outlined text-[16px]">verified</span>
          <span>더리본 리빙플러스 공식 6대 멤버십 &amp; 188회 만기환급 안내</span>
        </div>
        <h1 className="text-2xl font-extrabold text-[#131b2e] tracking-tight">
          가전지원 &amp; 188회 만기 전액환급
        </h1>
        <p className="text-xs text-slate-600 mt-1">
          원하는 가전 무료로 쓰고, 납입하신 총액은 188회 만기 시 원금 100% 그대로 돌려받는 혁신적 멤버십!
        </p>
      </div>

      {/* Interactive Savings/Benefit Calculator Component with 6 Official Plans */}
      <SavingsBenefitCalculator
        onApplyWithPackage={(app1, app2, planId) => onGoToApply(app1, app2, planId)}
      />

      {/* Official 6 Plans Comparison Table */}
      <div className="mb-8 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#00288e] text-xl">table_chart</span>
            <h3 className="text-sm font-bold text-[#131b2e]">
              더리본 리빙플러스 공식 6대 상품 스펙 한눈에 보기
            </h3>
          </div>
          <span className="text-[10px] text-slate-500">공식 웹사이트 기준</span>
        </div>

        <div className="space-y-3">
          {REBORN_MEMBERSHIP_PLANS.map((plan, index) => (
            <div
              key={plan.id}
              className="p-3 rounded-xl border border-slate-200/90 bg-[#F8FAFC] text-xs space-y-2 hover:border-[#1e40af] transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#1e40af] text-white text-[10px] font-bold flex items-center justify-center">
                    {index + 1}
                  </span>
                  <span className="font-bold text-sm text-[#131b2e]">{plan.name}</span>
                </div>
                <span className="bg-[#1e40af] text-white text-[10px] font-bold px-2 py-0.5 rounded">
                  {plan.accountsCount}구좌
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 border-t border-slate-200/60 pt-2">
                <div>
                  <span className="text-slate-400">총 금액:</span>{' '}
                  <strong className="text-slate-800 font-mono">
                    {plan.totalAmount.toLocaleString()}원
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400">납입회차:</span>{' '}
                  <strong className="text-[#00288e]">{plan.totalMonths}회 만기</strong>
                </div>
                <div>
                  <span className="text-slate-400">1~60회:</span>{' '}
                  <strong className="text-[#1e40af] font-mono">
                    월 {plan.phase1Monthly.toLocaleString()}원
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400">61~188회:</span>{' '}
                  <strong className="text-slate-700 font-mono">
                    월 {plan.phase2Monthly.toLocaleString()}원
                  </strong>
                </div>
              </div>

              <div className="pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
                <span className="text-[#059669] font-bold">만기 시: {plan.refundPolicy}</span>
                <button
                  type="button"
                  onClick={() => onGoToApply(undefined, undefined, plan.id)}
                  className="bg-[#00288e] text-white px-2.5 py-1 rounded text-[10px] font-bold hover:bg-[#1e40af]"
                >
                  플랜 선택
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3 Core Benefits Deep Dive */}
      <div className="space-y-4 mb-8">
        <h2 className="text-lg font-bold text-[#131b2e] tracking-tight">스페셜 멤버십 3대 안심 약속</h2>

        {/* Point 1 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-6 h-6 rounded-lg bg-[#1e40af] text-white text-xs font-bold flex items-center justify-center">
              1
            </span>
            <h3 className="text-sm font-bold text-[#131b2e]">삼성·LG 최신 정품 100% 무상 지급</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed pl-8">
            리퍼브나 중고가 아닌 제조사 공식 출하 신제품으로 제공됩니다. 배송비와 기본 설치비는
            더리본이 100% 전액 부담하며, 삼성전자 로지텍과 LG전자 공식 물류에서 전문 기사님이 직접 방문
            설치해 드립니다.
          </p>
        </div>

        {/* Point 2 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-6 h-6 rounded-lg bg-[#0051d5] text-white text-xs font-bold flex items-center justify-center">
              2
            </span>
            <h3 className="text-sm font-bold text-[#131b2e]">
              하이브리드 라이프케어 전환 서비스
            </h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed pl-8">
            가입 중 필요할 때 언제든 웨딩(스드메·예식), 해외 럭셔리 크루즈 여행, 어학연수, 프리미엄
            이사 및 장례 케어 등 고객님이 원하는 최적의 패밀리 라이프 서비스로 자유롭게 전환하여 이용하실
            수 있습니다.
          </p>
        </div>

        {/* Point 3 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-6 h-6 rounded-lg bg-[#059669] text-white text-xs font-bold flex items-center justify-center">
              3
            </span>
            <h3 className="text-sm font-bold text-[#131b2e]">만기 시 익월 납입금 100% 전액 환급</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed pl-8">
            약정 만기 시 익월에 고객님이 납입하신 금액 전액(전자제품 할부금 포함)을 원금 그대로 환급해 드립니다. 지급받으신 가전은
            반납 의무 없이 평생 고객님 자산으로 유지됩니다.
          </p>
        </div>
      </div>

      {/* Safety & Financial Escrow Guarantee */}
      <div className="bg-[#f8fafc] p-4 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2 mb-6">
        <div className="flex items-center gap-2 text-[#00288e] font-bold text-sm mb-1">
          <span className="material-symbols-outlined text-[20px]">shield</span>
          <span>고객 선수금 100% 법적 안전 보장 시스템</span>
        </div>
        <p className="leading-relaxed">
          더리본은 할부거래에 관한 법률 제27조에 의거하여 고객님의 선수금을 신한은행 및 하나은행과의
          소비자피해보상보험 채무지급보증 계약을 통해 안전하게 법적으로 예치·보호하고 있습니다.
        </p>
        <div className="flex items-center gap-3 pt-2">
          <span className="bg-white px-2 py-1 rounded border border-slate-200 font-bold text-[11px] text-[#131b2e]">
            신한은행 채무보증
          </span>
          <span className="bg-white px-2 py-1 rounded border border-slate-200 font-bold text-[11px] text-[#131b2e]">
            하나은행 채무보증
          </span>
          <span className="bg-white px-2 py-1 rounded border border-slate-200 font-bold text-[11px] text-[#131b2e]">
            공정거래위원회 등록
          </span>
        </div>
      </div>
    </div>
  );
};
