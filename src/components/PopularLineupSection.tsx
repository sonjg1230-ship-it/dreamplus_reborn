import React from 'react';

interface PopularLineupSectionProps {
  onSelectAppliance: (applianceId: string) => void;
  onViewAllAppliances: () => void;
}

export const PopularLineupSection: React.FC<PopularLineupSectionProps> = ({
  onSelectAppliance,
  onViewAllAppliances,
}) => {
  const lineupItems = [
    {
      id: 'samsung-85tv',
      badge: '인기 1위',
      badgeClass: 'bg-[#DC2626] text-white',
      brand: '삼성/LG',
      icon: 'tv',
      title: '대형 TV & 사운드바',
      subtitle: '75인치 / 85인치 86인치 UHD',
    },
    {
      id: 'fridge-bespoke',
      badge: '베스트',
      badgeClass: 'bg-[#0051d5] text-white',
      brand: '비스포크/오브제',
      icon: 'kitchen',
      title: '양문형 / 김치냉장고',
      subtitle: '대용량 4도어 최신 모델',
    },
    {
      id: 'wash-tower',
      badge: '주부추천',
      badgeClass: 'bg-[#1e40af] text-white',
      brand: '일체형 워시',
      icon: 'local_laundry_service',
      title: '세탁기·건조기 원바디',
      subtitle: '2in1 타워형 스마트 케어',
    },
    {
      id: 'air-conditioner',
      badge: '시즌특가',
      badgeClass: 'bg-[#059669] text-white',
      brand: '무풍/휘센',
      icon: 'mode_fan',
      title: '시스템·스탠드 에어컨',
      subtitle: '2in1 멀티형 쾌적 냉방',
    },
    {
      id: 'massage-chair',
      badge: '효도선물',
      badgeClass: 'bg-amber-600 text-white',
      brand: '코지마/바디프랜드',
      icon: 'chair',
      title: '헬스케어 안마의자',
      subtitle: '전신 체형 맞춤 스트레칭',
    },
    {
      id: 'laptop',
      badge: '+80여종',
      badgeClass: 'bg-slate-500 text-white',
      brand: '디지털가전',
      icon: 'devices_other',
      title: '노트북 · 스타일러 등',
      subtitle: '골프클럽, 청소기 외 다수',
    },
  ];

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-[#00288e] text-xs font-bold tracking-wider">POPULAR LINEUP</span>
          <h2 className="text-xl font-extrabold text-[#131b2e] tracking-tight">인기 지원가전 라인업</h2>
        </div>
        <button
          onClick={onViewAllAppliances}
          className="text-xs text-[#0051d5] font-semibold hover:underline flex items-center gap-0.5"
        >
          <span>총 80여 종 전체보기</span>
          <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {lineupItems.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelectAppliance(item.id)}
            className="bg-white p-3 rounded-xl border border-[#E2E8F0] shadow-sm flex flex-col justify-between hover:border-[#1e40af] hover:shadow-md transition-all cursor-pointer group active:scale-[0.98]"
            role="button"
            tabIndex={0}
          >
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className={`${item.badgeClass} text-[10px] font-bold px-1.5 py-0.5 rounded`}>
                  {item.badge}
                </span>
                <span className="text-[10px] text-slate-500">{item.brand}</span>
              </div>
              <div className="w-full h-24 bg-[#F8FAFC] rounded-lg flex items-center justify-center mb-2 border border-[#E2E8F0]/50 group-hover:bg-[#eaedff]/30 transition-colors">
                <span className="material-symbols-outlined text-[44px] text-[#00288e] group-hover:scale-110 transition-transform">
                  {item.icon}
                </span>
              </div>
              <h3 className="text-sm font-bold text-[#131b2e] leading-tight group-hover:text-[#00288e]">
                {item.title}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">{item.subtitle}</p>
            </div>

            <div className="mt-2.5 pt-2 border-t border-[#E2E8F0] flex items-center justify-between">
              <span className="text-[11px] text-slate-500">지원금</span>
              <span className="text-xs font-bold text-[#DC2626]">전액 100% 무상</span>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-center text-[#757684] mt-2.5">
        ※ 1인당 서로 다른 2개 품목까지 중복 신청 가능합니다.
      </p>
    </section>
  );
};
