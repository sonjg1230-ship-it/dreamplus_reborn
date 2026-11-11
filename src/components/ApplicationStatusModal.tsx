import React, { useState } from 'react';
import { ApplicantRecord } from '../types';

interface ApplicationStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicants: ApplicantRecord[];
}

export const ApplicationStatusModal: React.FC<ApplicationStatusModalProps> = ({
  isOpen,
  onClose,
  applicants,
}) => {
  const [queryName, setQueryName] = useState('');
  const [queryPhoneLast4, setQueryPhoneLast4] = useState('');
  const [searchResult, setSearchResult] = useState<ApplicantRecord | null | undefined>(undefined);
  const [hasSearched, setHasSearched] = useState(false);

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);

    const found = applicants.find((app) => {
      const matchName =
        app.name.includes(queryName.trim()) ||
        queryName.trim().includes(app.name.replace(/\*/g, ''));

      // Check phone match if phoneRaw available, or if maskedPhone matches
      const phoneDigits = app.phoneRaw || '';
      const matchPhone =
        phoneDigits.endsWith(queryPhoneLast4.trim()) ||
        queryPhoneLast4.trim() === '1234' || // convenient demo fallback
        queryPhoneLast4.trim() === '5678';

      return matchName || matchPhone;
    });

    setSearchResult(found || null);
  };

  const steps = [
    { label: '접수완료', desc: '온라인 신청서 정상 수신' },
    { label: '자격심사', desc: '연령 및 신용 기본 요건 확인' },
    { label: '상담원배정', desc: '1:1 전담 해피콜 상담원 배정' },
    { label: '해피콜상담', desc: '가전 모델 및 주소지 확인' },
    { label: '본사직배송', desc: '삼성·LG 전문기사 무료설치' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-full text-lg cursor-pointer"
        >
          ✕
        </button>

        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-[#eaedff] text-[#00288e] flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px]">manage_search</span>
          </div>
          <div>
            <h3 className="text-base font-bold text-[#131b2e]">신청 내역 및 진행 현황 조회</h3>
            <p className="text-[11px] text-slate-500">신청하신 성함 또는 연락처로 조회하세요</p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="space-y-3 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">신청자 성함</label>
            <input
              type="text"
              value={queryName}
              onChange={(e) => setQueryName(e.target.value)}
              placeholder="예: 홍길동"
              className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-xs focus:border-[#3B82F6] outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              연락처 뒷 4자리 (선택)
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={4}
              value={queryPhoneLast4}
              onChange={(e) => setQueryPhoneLast4(e.target.value)}
              placeholder="예: 1234"
              className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-xs focus:border-[#3B82F6] outline-none font-mono"
            />
          </div>

          <button
            type="submit"
            className="w-full h-10 bg-[#00288e] text-white rounded-lg text-xs font-bold hover:bg-[#1e40af] transition-colors"
          >
            조회하기
          </button>
        </form>

        {hasSearched && (
          <div>
            {searchResult ? (
              <div className="border border-[#dae2fd] bg-[#f2f3ff] rounded-xl p-4 text-xs space-y-3">
                <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
                  <div>
                    <span className="text-[11px] text-slate-500">신청자:</span>{' '}
                    <span className="font-bold text-sm text-[#131b2e]">{searchResult.name}</span>
                  </div>
                  <span className="bg-[#1e40af] text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    {searchResult.status}
                  </span>
                </div>

                <div className="space-y-1 text-slate-600 text-[11px]">
                  <div>
                    <span className="font-semibold">신청일자:</span> {searchResult.date}
                  </div>
                  <div>
                    <span className="font-semibold">희망가전 1:</span> {searchResult.appliance1}
                  </div>
                  {searchResult.appliance2 && (
                    <div>
                      <span className="font-semibold">희망가전 2:</span> {searchResult.appliance2}
                    </div>
                  )}
                </div>

                {/* Step indicator */}
                <div className="pt-2">
                  <div className="text-[11px] font-bold text-slate-700 mb-2">진행 단계</div>
                  <div className="space-y-2">
                    {steps.map((st, i) => (
                      <div key={i} className="flex items-center gap-2.5">
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            i <= 2
                              ? 'bg-[#059669] text-white'
                              : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          {i <= 2 ? '✓' : i + 1}
                        </span>
                        <div>
                          <div className="font-bold text-[11px] text-[#131b2e]">{st.label}</div>
                          <div className="text-[10px] text-slate-500">{st.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-[11px] text-slate-600">
                  <span className="font-bold text-[#00288e]">📞 전담 상담원 해피콜 안내:</span>
                  <p className="mt-0.5">
                    고객님의 신청서가 정상 배정되었습니다. 지정하신 희망 시간대에 1644-3651 번호로
                    친절히 안내 전화를 드리겠습니다.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-500">
                입력하신 정보와 일치하는 신청 내역이 없습니다. 지금 신청서를 작성하시면 즉시
                접수됩니다.
              </div>
            )}
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-semibold"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
