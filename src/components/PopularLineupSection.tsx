import React, { useState, useMemo } from 'react';
import { Sparkles, Check, X, Search, ChevronDown, Eye } from 'lucide-react';
import { REBORN_LINEUP_DATA, ApplianceLineupItem } from '../data/rebornLineupData';

export type BrandTabType = 'LG' | '삼성' | '세라젬' | '홈세라' | '바디프랜드' | '쿠쿠' | '생활/헬스' | '전체';

export { REBORN_LINEUP_DATA as APPLIANCE_LINEUP_DATA };
export type { ApplianceLineupItem };

interface PopularLineupSectionProps {
  onSelectAppliance: (applianceId: string) => void;
  onSelectAppliancePair?: (app1: string, app2: string) => void;
  selectedAppliance1?: string;
  selectedAppliance2?: string;
  onViewAllAppliances?: () => void;
}

const BRAND_TABS: BrandTabType[] = [
  'LG',
  '삼성',
  '세라젬',
  '홈세라',
  '바디프랜드',
  '쿠쿠',
  '생활/헬스',
  '전체',
];

export const PopularLineupSection: React.FC<PopularLineupSectionProps> = ({
  onSelectAppliance,
  onSelectAppliancePair,
  selectedAppliance1,
  selectedAppliance2,
}) => {
  const [activeBrand, setActiveBrand] = useState<BrandTabType>('LG');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState<number>(24);

  // Slot 1 and Slot 2 tracking
  const [slot1, setSlot1] = useState<ApplianceLineupItem | null>(() => {
    if (selectedAppliance1) {
      return REBORN_LINEUP_DATA.find((i) => i.id === selectedAppliance1) || null;
    }
    return null;
  });

  const [slot2, setSlot2] = useState<ApplianceLineupItem | null>(() => {
    if (selectedAppliance2 && selectedAppliance2 !== 'none') {
      return REBORN_LINEUP_DATA.find((i) => i.id === selectedAppliance2) || null;
    }
    return null;
  });

  // Keep internal slot states synced with external props if changed externally
  React.useEffect(() => {
    if (selectedAppliance1) {
      const found = REBORN_LINEUP_DATA.find((i) => i.id === selectedAppliance1);
      if (found) setSlot1(found);
    }
  }, [selectedAppliance1]);

  React.useEffect(() => {
    if (selectedAppliance2) {
      if (selectedAppliance2 === 'none') {
        setSlot2(null);
      } else {
        const found = REBORN_LINEUP_DATA.find((i) => i.id === selectedAppliance2);
        if (found) setSlot2(found);
      }
    }
  }, [selectedAppliance2]);

  // Reset pagination on brand tab or search query change
  const handleBrandChange = (brand: BrandTabType) => {
    setActiveBrand(brand);
    setVisibleCount(24);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setVisibleCount(24);
  };

  // Filter items based on active brand & search query
  const filteredItems = useMemo(() => {
    return REBORN_LINEUP_DATA.filter((item) => {
      // Brand filter
      const matchesBrand = activeBrand === '전체' || item.brand === activeBrand;

      // Search filter
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        q === '' ||
        item.title.toLowerCase().includes(q) ||
        item.modelCode.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.brand.toLowerCase().includes(q);

      return matchesBrand && matchesSearch;
    });
  }, [activeBrand, searchQuery]);

  const visibleItems = useMemo(() => {
    return filteredItems.slice(0, visibleCount);
  }, [filteredItems, visibleCount]);

  const selectedCount = (slot1 ? 1 : 0) + (slot2 ? 1 : 0);

  // Smooth scroll helper to form
  const triggerScrollToForm = (app1Id: string, app2Id?: string) => {
    if (onSelectAppliancePair) {
      onSelectAppliancePair(app1Id, app2Id || 'none');
    } else {
      onSelectAppliance(app1Id);
    }

    const formElement = document.getElementById('apply-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Handle item click / selection toggle
  const handleToggleItem = (item: ApplianceLineupItem) => {
    // If clicking on slot 1 -> deselect slot 1 (and promote slot 2 to slot 1 if present)
    if (slot1?.id === item.id) {
      setSlot1(slot2);
      setSlot2(null);
      return;
    }

    // If clicking on slot 2 -> deselect slot 2
    if (slot2?.id === item.id) {
      setSlot2(null);
      return;
    }

    // If slot 1 is empty -> fill slot 1
    if (!slot1) {
      setSlot1(item);
      return;
    }

    // If slot 1 is filled and slot 2 is empty -> fill slot 2 and auto scroll to form
    if (!slot2) {
      setSlot2(item);
      setTimeout(() => {
        triggerScrollToForm(slot1.id, item.id);
      }, 350);
      return;
    }

    // If both slots are already filled -> replace slot 2 with new item
    setSlot2(item);
    setTimeout(() => {
      triggerScrollToForm(slot1.id, item.id);
    }, 350);
  };

  const handleProceedWithCurrent = () => {
    if (slot1 && slot2) {
      triggerScrollToForm(slot1.id, slot2.id);
    } else if (slot1) {
      triggerScrollToForm(slot1.id, 'none');
    }
  };

  return (
    <section className="mb-14 w-full">
      {/* Top Header Section */}
      <div className="flex flex-col items-center text-center mb-6">
        {/* Blue Badge */}
        <div className="inline-flex items-center gap-1.5 bg-[#EFF6FF] border border-[#BFDBFE] text-[#1D4ED8] text-xs font-semibold px-3 py-1 rounded-full mb-3">
          <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
          <span>더리본 리빙플러스 최대 2개 가전제품 동시 지원</span>
        </div>

        {/* Main Title */}
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight mb-2">
          더리본 가전지원 공식 라인업
        </h2>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
          원하시는 가전을 <span className="text-[#2563EB] font-bold">2개까지 선택</span>하시면 본인부담금 0원으로 동시에 전액 지원됩니다.
          <br className="hidden sm:inline" /> LG, 삼성, 세라젬, 홈세라, 바디프랜드, 쿠쿠 등 공식 200여 종 전체 지원!
        </p>
      </div>

      {/* Brand Filter Tabs (Exact Screenshot Pill Style) */}
      <div className="flex items-center justify-center gap-2 sm:gap-2.5 flex-wrap mb-6">
        {BRAND_TABS.map((brand) => {
          const isActive = activeBrand === brand;
          const count =
            brand === '전체'
              ? REBORN_LINEUP_DATA.length
              : REBORN_LINEUP_DATA.filter((i) => i.brand === brand).length;

          return (
            <button
              key={brand}
              type="button"
              onClick={() => handleBrandChange(brand)}
              className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                isActive
                  ? 'bg-[#0D6EFD] text-white shadow-sm ring-2 ring-[#0D6EFD]/20'
                  : 'bg-white text-slate-700 hover:text-slate-900 border border-slate-200 hover:border-slate-300 shadow-2xs'
              }`}
            >
              <span>{brand}</span>
              <span
                className={`text-[10px] sm:text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                  isActive ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selection Status Bar (선택 현황 바) */}
      <div className="w-full bg-white rounded-2xl border border-slate-200/90 p-4 mb-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Left: Selection Counter & Pills */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="text-xs sm:text-sm font-bold text-slate-800">
            선택 <span className="text-[#0D6EFD] font-extrabold text-sm sm:text-base">{selectedCount}</span> / 2
          </span>

          {/* 1순위 Pill */}
          {slot1 ? (
            <span className="inline-flex items-center gap-1.5 bg-[#EFF6FF] border border-[#BFDBFE] text-[#1D4ED8] text-xs font-semibold px-2.5 py-1 rounded-full animate-fade-in">
              <Check className="w-3 h-3 text-[#2563EB]" />
              <span className="max-w-[120px] sm:max-w-[160px] truncate">1순위: {slot1.title}</span>
              <button
                type="button"
                onClick={() => {
                  setSlot1(slot2);
                  setSlot2(null);
                }}
                className="hover:text-red-500 cursor-pointer ml-0.5"
                title="1순위 선택 해제"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ) : (
            <span className="inline-flex items-center text-slate-500 bg-slate-100 border border-slate-200/80 text-xs px-2.5 py-1 rounded-full">
              1순위 미선택
            </span>
          )}

          {/* 2순위 Pill */}
          {slot2 ? (
            <span className="inline-flex items-center gap-1.5 bg-[#EFF6FF] border border-[#BFDBFE] text-[#1D4ED8] text-xs font-semibold px-2.5 py-1 rounded-full animate-fade-in">
              <Check className="w-3 h-3 text-[#2563EB]" />
              <span className="max-w-[120px] sm:max-w-[160px] truncate">2순위: {slot2.title}</span>
              <button
                type="button"
                onClick={() => setSlot2(null)}
                className="hover:text-red-500 cursor-pointer ml-0.5"
                title="2순위 선택 해제"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ) : (
            <span className="inline-flex items-center text-slate-500 bg-slate-100 border border-slate-200/80 text-xs px-2.5 py-1 rounded-full">
              2순위 미선택
            </span>
          )}
        </div>

        {/* Right: Status text or Action button */}
        <div className="text-xs text-slate-500 font-medium w-full sm:w-auto flex justify-end">
          {selectedCount === 2 ? (
            <button
              type="button"
              onClick={handleProceedWithCurrent}
              className="bg-[#0D6EFD] hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer flex items-center gap-1"
            >
              <span>2개 선택 완료! 신청 화면으로 이동</span>
              <span className="text-xs">➜</span>
            </button>
          ) : selectedCount === 1 ? (
            <button
              type="button"
              onClick={handleProceedWithCurrent}
              className="text-[#0D6EFD] hover:underline font-bold text-xs flex items-center gap-1 cursor-pointer"
            >
              <span>1개만 선택하고 바로 신청하기 ➜</span>
            </button>
          ) : (
            <span className="text-slate-400">2개를 고르면 신청 화면으로 이동합니다</span>
          )}
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap sm:flex-nowrap">
        <div className="text-xs text-slate-500 font-medium">
          총 <span className="text-slate-900 font-bold">{filteredItems.length}</span>개의 지원 가전
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="가전 모델명·브랜드·제품명 검색..."
            className="w-full h-9 pl-9 pr-7 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder-slate-400 focus:border-[#0D6EFD] focus:ring-1 focus:ring-[#0D6EFD] outline-none shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => handleSearchChange('')}
              className="absolute right-2.5 top-2.5 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Product Cards Grid (Matching the Exact Screenshot Design) */}
      {filteredItems.length === 0 ? (
        <div className="w-full p-10 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
          검색어 &apos;{searchQuery}&apos;와 일치하는 가전 모델이 없습니다.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {visibleItems.map((item) => {
              const isSlot1 = slot1?.id === item.id;
              const isSlot2 = slot2?.id === item.id;
              const isSelected = isSlot1 || isSlot2;
              const rankLabel = isSlot1 ? '1순위' : isSlot2 ? '2순위' : null;

              return (
                <div
                  key={item.id}
                  onClick={() => handleToggleItem(item)}
                  className={`bg-white rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden flex flex-col justify-between group shadow-2xs ${
                    isSelected
                      ? 'border-[#0D6EFD] ring-2 ring-blue-100 shadow-md'
                      : 'border-slate-200/90 hover:border-blue-400 hover:shadow-sm'
                  }`}
                  role="button"
                  tabIndex={0}
                >
                  {/* 1. Top Image Area */}
                  <div className="h-36 sm:h-44 w-full bg-white p-3 flex items-center justify-center relative overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 block"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (item.fallbackImage && target.src !== item.fallbackImage) {
                          target.src = item.fallbackImage;
                        }
                      }}
                    />
                    {/* Selected Badge Indicator */}
                    {isSelected && (
                      <div className="absolute top-2.5 right-2.5 bg-[#0D6EFD] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1 z-10">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                        <span>{rankLabel} 선택</span>
                      </div>
                    )}
                  </div>

                  {/* 2. Middle Gray Category & Model Bar */}
                  <div className="w-full bg-[#E5E9F0] py-1.5 px-2 text-center text-[10px] sm:text-[11px] font-semibold text-slate-700 tracking-tight select-none truncate">
                    {item.category} | {item.modelCode}
                  </div>

                  {/* 3. Bottom Title & Selection Action Button */}
                  <div className="p-3 text-center flex flex-col items-center justify-between flex-1">
                    <h3
                      className="text-xs sm:text-sm font-bold text-slate-900 leading-snug mb-2 line-clamp-2 w-full min-h-[2.5rem] flex items-center justify-center"
                      title={item.title}
                    >
                      {item.title}
                    </h3>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleItem(item);
                      }}
                      className={`text-xs sm:text-sm font-bold transition-all py-1 px-3 rounded-lg cursor-pointer ${
                        isSelected
                          ? 'text-red-600 hover:bg-red-50'
                          : 'text-[#0D6EFD] hover:bg-blue-50'
                      }`}
                    >
                      {isSelected ? '선택 해제' : '선택'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Load More Button if more items exist */}
          {filteredItems.length > visibleCount && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 mt-8">
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => prev + 24)}
                className="bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-xs sm:text-sm px-6 py-2.5 rounded-full shadow-2xs hover:shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <span>가전 라인업 더보기 ({visibleItems.length} / {filteredItems.length})</span>
                <ChevronDown className="w-4 h-4 text-slate-500" />
              </button>
              <button
                type="button"
                onClick={() => setVisibleCount(filteredItems.length)}
                className="text-xs text-slate-500 hover:text-[#0D6EFD] underline font-medium px-3 py-1 cursor-pointer flex items-center gap-1"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>전체 {filteredItems.length}개 한 번에 보기</span>
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
};
