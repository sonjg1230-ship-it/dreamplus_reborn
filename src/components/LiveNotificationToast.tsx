import React from 'react';
import { ApplicantRecord } from '../types';

interface LiveNotificationToastProps {
  applicant: ApplicantRecord | null;
  onClose: () => void;
  onClick: () => void;
}

export const LiveNotificationToast: React.FC<LiveNotificationToastProps> = ({
  applicant,
  onClose,
  onClick,
}) => {
  if (!applicant) return null;

  return (
    <aside
      aria-label="실시간 신규 접수 알림"
      className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-40 bg-[#0F172A]/95 text-white p-3 rounded-2xl shadow-2xl border border-slate-700/80 backdrop-blur-md flex items-center justify-between gap-3 animate-fade-in transition-all"
    >
      <div
        onClick={onClick}
        className="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1"
        role="button"
        tabIndex={0}
      >
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#1e40af] to-[#3B82F6] text-white flex items-center justify-center shrink-0 shadow-md">
          <span className="material-symbols-outlined text-[20px]">notifications_active</span>
        </div>
        <div className="min-w-0 flex-1 text-left">
          <div className="flex items-center gap-1.5 text-[10px] text-amber-300 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            <span>실시간 접수 발생</span>
            <span className="text-slate-400 font-normal">| 방금 전</span>
          </div>
          <div className="text-xs font-bold text-white truncate mt-0.5">
            {applicant.region ? `${applicant.region} ` : ''}
            {applicant.name} ({applicant.maskedPhone})
          </div>
          <div className="text-[11px] text-slate-300 truncate">
            {applicant.appliance1} 전액지원 신청
          </div>
        </div>
      </div>

      <button
        onClick={onClose}
        className="text-slate-400 hover:text-white p-1 rounded-full text-xs cursor-pointer shrink-0"
        title="알림 닫기"
      >
        ✕
      </button>
    </aside>
  );
};
