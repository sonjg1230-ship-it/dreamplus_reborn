import React from 'react';

export const ProcessSection: React.FC = () => {
  return (
    <section className="mb-10 bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0]">
      <div className="text-center mb-4">
        <h3 className="text-base font-bold text-[#131b2e]">간편 3단계 신청 프로세스</h3>
        <p className="text-xs text-slate-500 mt-0.5">서류 방문 없이 모바일로 간편하게 접수 완료</p>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center relative">
        {/* Step 1 */}
        <div className="bg-white p-2.5 rounded-xl border border-[#E2E8F0] shadow-sm flex flex-col items-center">
          <span className="w-6 h-6 rounded-full bg-[#1e40af] text-white text-xs font-bold flex items-center justify-center mb-1.5 shadow-sm">
            1
          </span>
          <span className="text-xs font-bold text-[#131b2e]">상담 신청</span>
          <span className="text-[10px] text-slate-500 mt-0.5">원하는 가전 선택</span>
        </div>

        {/* Step 2 */}
        <div className="bg-white p-2.5 rounded-xl border border-[#E2E8F0] shadow-sm flex flex-col items-center">
          <span className="w-6 h-6 rounded-full bg-[#0051d5] text-white text-xs font-bold flex items-center justify-center mb-1.5 shadow-sm">
            2
          </span>
          <span className="text-xs font-bold text-[#131b2e]">가입 상담</span>
          <span className="text-[10px] text-slate-500 mt-0.5">전문상담원 안내</span>
        </div>

        {/* Step 3 */}
        <div className="bg-white p-2.5 rounded-xl border border-[#E2E8F0] shadow-sm flex flex-col items-center">
          <span className="w-6 h-6 rounded-full bg-[#059669] text-white text-xs font-bold flex items-center justify-center mb-1.5 shadow-sm">
            3
          </span>
          <span className="text-xs font-bold text-[#131b2e]">방문 설치</span>
          <span className="text-[10px] text-slate-500 mt-0.5">본사 무료 배송</span>
        </div>
      </div>
    </section>
  );
};
