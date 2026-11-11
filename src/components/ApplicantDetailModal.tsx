import React from 'react';
import { ApplicantRecord } from '../types';

interface ApplicantDetailModalProps {
  applicant: ApplicantRecord | null;
  onClose: () => void;
}

export const ApplicantDetailModal: React.FC<ApplicantDetailModalProps> = ({
  applicant,
  onClose,
}) => {
  if (!applicant) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 relative text-left">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-full text-base cursor-pointer"
        >
          ✕
        </button>

        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-[#eaedff] text-[#00288e] flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px]">verified_user</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#131b2e]">실시간 접수 상세 정보</h3>
            <p className="text-[11px] text-slate-500">개인정보보호법에 의거 일부 마스킹 처리</p>
          </div>
        </div>

        <div className="bg-[#F8FAFC] rounded-xl p-3 border border-slate-200 text-xs space-y-2 mb-3">
          <div className="flex justify-between items-center border-b border-slate-200/60 pb-1.5">
            <span className="text-slate-500">접수자 성함</span>
            <span className="font-bold text-[#131b2e] flex items-center gap-1">
              {applicant.name}
              {applicant.isUserSubmission && (
                <span className="text-[10px] bg-[#059669] text-white px-1.5 py-0.2 rounded font-bold">
                  본인 접수건
                </span>
              )}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500">연락처</span>
            <span className="font-mono font-bold text-[#00288e]">{applicant.maskedPhone}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500">연령대 / 지역</span>
            <span className="font-semibold text-slate-700">
              {applicant.region ? `${applicant.region} · ` : ''}
              {applicant.ageGroup}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500">접수 일시</span>
            <span className="font-mono text-slate-700">
              {applicant.date} {applicant.time || '12:00'}
            </span>
          </div>

          <div className="border-t border-slate-200/60 pt-1.5">
            <span className="text-slate-500 block mb-0.5">신청 지원가전:</span>
            <span className="font-bold text-[#131b2e]">{applicant.appliance1}</span>
            {applicant.appliance2 && applicant.appliance2 !== 'none' && (
              <span className="block font-bold text-[#059669] mt-0.5">
                + {applicant.appliance2} (1+1 지원)
              </span>
            )}
          </div>

          <div className="flex justify-between items-center border-t border-slate-200/60 pt-1.5">
            <span className="text-slate-500">현재 처리 상태</span>
            <span className="font-bold text-[#00288e] bg-blue-100 px-2 py-0.5 rounded">
              {applicant.status}
            </span>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 bg-blue-50/60 p-2.5 rounded-lg border border-blue-100 flex items-start gap-1.5 mb-3">
          <span className="material-symbols-outlined text-[14px] text-[#00288e] shrink-0 mt-0.5">
            info
          </span>
          <span>
            상담원 배정 후 순차적으로 1644-3651 번호로 지원 자격 확인 및 가전 배송 일정을 안내해
            드립니다.
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full h-10 bg-[#00288e] hover:bg-[#1e40af] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
        >
          확인 닫기
        </button>
      </div>
    </div>
  );
};
