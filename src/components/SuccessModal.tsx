import React from 'react';
import { ApplicationFormData } from '../types';
import { APPLIANCES, REBORN_MEMBERSHIP_PLANS } from '../data/mockData';

interface SuccessModalProps {
  formData: ApplicationFormData | null;
  onClose: () => void;
  onCheckStatus: () => void;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  formData,
  onClose,
  onCheckStatus,
}) => {
  if (!formData) return null;

  const app1 = APPLIANCES.find((a) => a.id === formData.appliance1)?.name || formData.appliance1;
  const app2 =
    formData.appliance2 && formData.appliance2 !== 'none'
      ? APPLIANCES.find((a) => a.id === formData.appliance2)?.name || formData.appliance2
      : null;

  const matchedPlan = REBORN_MEMBERSHIP_PLANS.find((p) => p.id === formData.planId);
  const planDisplayName = matchedPlan ? matchedPlan.name : '상담 후 맞춤 플랜 배정';

  const refNumber = `TR-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative text-center">
        {/* Success Icon */}
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#059669] flex items-center justify-center mx-auto mb-4 ring-8 ring-emerald-50">
          <span className="material-symbols-outlined text-[36px]">check_circle</span>
        </div>

        <span className="bg-[#FEF3C7] text-[#131b2e] text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-amber-300">
          신청 완료 (접수번호: {refNumber})
        </span>

        <h3 className="text-xl font-extrabold text-[#131b2e] mt-2 tracking-tight">
          최신가전 전액지원 접수 완료!
        </h3>
        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
          <strong className="text-[#00288e]">{formData.name}</strong> 고객님의 신청서가 성공적으로
          접수되었습니다. 전문 상담사가 빠른 시간 내에 안내 전화를 드립니다.
        </p>

        {/* Summary Details */}
        <div className="my-4 bg-[#F8FAFC] p-3.5 rounded-xl border border-slate-200 text-left text-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-500">신청자 성함</span>
            <span className="font-bold text-[#131b2e]">{formData.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">연락처</span>
            <span className="font-mono font-bold text-[#00288e]">
              {formData.phonePrefix}-{formData.phoneMid}-****
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">연령대</span>
            <span className="font-semibold text-slate-700">{formData.ageGroup}</span>
          </div>
          <div className="border-t border-slate-200/60 pt-2 flex justify-between items-start">
            <span className="text-slate-500 shrink-0">희망가전 1</span>
            <span className="font-bold text-[#131b2e] text-right truncate pl-2">{app1}</span>
          </div>
          {app2 && (
            <div className="flex justify-between items-start">
              <span className="text-slate-500 shrink-0">희망가전 2 (1+1)</span>
              <span className="font-bold text-[#059669] text-right truncate pl-2">{app2}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-slate-500">신청 플랜</span>
            <span className="font-bold text-[#1e40af]">{planDisplayName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">약정 조건</span>
            <span className="font-semibold text-[#059669]">188회 만기 100% 전액환급형</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">희망 상담시간</span>
            <span className="font-semibold text-slate-700">{formData.preferredTime}</span>
          </div>
        </div>

        {/* Simulated SMS Alert Card */}
        <div className="p-3 bg-blue-50 border border-blue-200/80 rounded-xl text-left text-[11px] text-blue-900 mb-4 flex items-start gap-2">
          <span className="material-symbols-outlined text-[16px] text-[#1e40af] shrink-0 mt-0.5">
            sms
          </span>
          <div>
            <span className="font-bold">[더리본 알림톡]</span> 접수 확인 문자가 발송되었습니다.
            고객님의 소중한 정보는 철저히 보안 유지됩니다.
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onCheckStatus}
            className="flex-1 h-12 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            신청진행 조회
          </button>
          <button
            onClick={onClose}
            className="flex-1 h-12 rounded-xl bg-[#00288e] text-white text-xs font-bold hover:bg-[#1e40af] active:scale-95 transition-all shadow-md"
          >
            확인 완료
          </button>
        </div>
      </div>
    </div>
  );
};
