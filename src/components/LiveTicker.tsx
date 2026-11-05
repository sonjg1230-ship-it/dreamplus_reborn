import React, { useState } from 'react';
import { ApplicantRecord } from '../types';

interface LiveTickerProps {
  applicants: ApplicantRecord[];
  todayCount: number;
  remainingQuota: number;
  onSimulateNewApplicant: () => void;
  onSelectApplicantDetail: (applicant: ApplicantRecord) => void;
}

export const LiveTicker: React.FC<LiveTickerProps> = ({
  applicants,
  todayCount,
  remainingQuota,
  onSimulateNewApplicant,
  onSelectApplicantDetail,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'user' | 'today'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredApplicants = applicants.filter((item) => {
    if (filterType === 'user' && !item.isUserSubmission) return false;

    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchPhone = item.maskedPhone.includes(q);
      const matchAppliance = item.appliance1.toLowerCase().includes(q);
      return matchName || matchPhone || matchAppliance;
    }

    return true;
  });

  return (
    <section className="mb-10 scroll-mt-20" id="live-ticker-section">
      {/* Top Header with live ping */}
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#059669] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#059669]"></span>
          </span>
          <h2 className="text-lg font-bold text-[#131b2e] tracking-tight">실시간 접수 현황</h2>
          <span className="bg-[#FEF3C7] text-[#131b2e] text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-300">
            실시간 연동중
          </span>
        </div>

        <button
          type="button"
          onClick={onSimulateNewApplicant}
          className="text-[11px] font-semibold text-[#00288e] hover:text-[#1e40af] bg-[#eaedff] px-2 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer active:scale-95"
          title="실시간 접수 시뮬레이션 테스트"
        >
          <span className="material-symbols-outlined text-[14px]">refresh</span>
          <span>실시간 수신 테스트</span>
        </button>
      </div>

      {/* Real-time Statistics KPI Bar */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-500 font-medium">오늘 실시간 접수 누적</div>
            <div className="text-base font-black text-[#00288e] font-mono">
              {todayCount.toLocaleString()}
              <span className="text-xs font-normal text-slate-600 ml-0.5">명 신청완료</span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-[#eaedff] text-[#00288e] flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px]">group_add</span>
          </div>
        </div>

        <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-500 font-medium">오늘 선착순 잔여 수량</div>
            <div className="text-base font-black text-[#DC2626] font-mono">
              {remainingQuota}
              <span className="text-xs font-normal text-slate-600 ml-0.5">대 남음 (마감임박)</span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-red-50 text-[#DC2626] flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px]">alarm_on</span>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        {/* Table Filter Tabs and Search Bar */}
        <div className="p-2.5 bg-[#F8FAFC] border-b border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex gap-1 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filterType === 'all'
                  ? 'bg-[#00288e] text-white shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              전체 접수 ({applicants.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('user')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                filterType === 'user'
                  ? 'bg-[#059669] text-white shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>내 신청건</span>
              {applicants.some((a) => a.isUserSubmission) && (
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
              )}
            </button>
          </div>

          <div className="relative w-full sm:w-44">
            <span className="material-symbols-outlined absolute left-2 top-2 text-slate-400 text-sm">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="이름 또는 가전 검색"
              className="w-full h-8 pl-7 pr-3 rounded-lg border border-slate-200 bg-white text-[11px] outline-none focus:border-[#3B82F6]"
            />
          </div>
        </div>

        {/* Table Column Headers */}
        <div className="grid grid-cols-12 bg-slate-100 text-[11px] text-slate-600 font-bold px-3 py-2 border-b border-[#E2E8F0] text-center">
          <div className="col-span-3">접수일시</div>
          <div className="col-span-2">고객명</div>
          <div className="col-span-3">연락처</div>
          <div className="col-span-2">연령/지역</div>
          <div className="col-span-2">진행상태</div>
        </div>

        {/* Table Rolling Rows */}
        <div className="divide-y divide-[#E2E8F0]/60 text-xs max-h-64 overflow-y-auto">
          {filteredApplicants.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              {filterType === 'user'
                ? '아직 직접 신청하신 내역이 없습니다. 하단 신청서를 작성하시면 즉시 여기에 등록됩니다.'
                : '검색 조건과 일치하는 신청 내역이 없습니다.'}
            </div>
          ) : (
            filteredApplicants.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => onSelectApplicantDetail(item)}
                className={`grid grid-cols-12 px-3 py-2.5 text-center items-center hover:bg-[#eaedff]/40 transition-colors cursor-pointer ${
                  item.isUserSubmission
                    ? 'bg-emerald-50/70 border-l-4 border-l-[#059669]'
                    : idx === 0
                    ? 'bg-blue-50/40'
                    : ''
                }`}
                title="클릭하여 상세 접수정보 보기"
              >
                {/* Date & Time */}
                <div className="col-span-3 text-[11px] text-slate-500 font-mono flex flex-col items-center">
                  <span>{item.date}</span>
                  <span className="text-[10px] text-slate-400">{item.time || '12:00'}</span>
                </div>

                {/* Name */}
                <div className="col-span-2 font-bold text-[#131b2e] flex items-center justify-center gap-1">
                  <span>{item.name}</span>
                  {item.isUserSubmission && (
                    <span className="text-[9px] bg-[#059669] text-white px-1 py-0.2 rounded font-bold">
                      나
                    </span>
                  )}
                  {idx === 0 && !item.isUserSubmission && (
                    <span className="text-[9px] bg-red-600 text-white px-1 py-0.2 rounded font-bold animate-pulse">
                      NEW
                    </span>
                  )}
                </div>

                {/* Masked Phone */}
                <div className="col-span-3 font-mono text-[#00288e] font-bold text-[11px]">
                  {item.maskedPhone}
                </div>

                {/* Age & Region */}
                <div className="col-span-2 text-[10px] text-slate-600">
                  <span className="inline-block px-1.5 py-0.5 bg-slate-100 rounded text-slate-700 font-medium">
                    {item.region ? `${item.region} · ` : ''}
                    {item.ageGroup}
                  </span>
                </div>

                {/* Status Badge */}
                <div className="col-span-2">
                  <span
                    className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      item.status === '접수완료'
                        ? 'bg-blue-100 text-[#00288e]'
                        : item.status === '자격심사중'
                        ? 'bg-amber-100 text-amber-800'
                        : item.status === '상담원배정'
                        ? 'bg-emerald-100 text-[#059669]'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info bar */}
        <div className="px-3 py-2.5 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-1 text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#059669] animate-ping" />
            <span>* 고객 정보는 개인정보보호법에 의거하여 마스킹 처리됩니다.</span>
          </div>
          <span className="font-bold text-[#00288e] cursor-pointer hover:underline">
            행을 클릭하면 신청 가전 상세를 볼 수 있습니다 &gt;
          </span>
        </div>
      </div>
    </section>
  );
};
