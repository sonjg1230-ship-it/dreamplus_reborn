import React, { useState } from 'react';
import { APPLIANCES } from '../data/mockData';
import { ApplianceItem } from '../types';

interface AppliancesCatalogViewProps {
  onSelectToApply: (applianceId: string) => void;
}

export const AppliancesCatalogView: React.FC<AppliancesCatalogViewProps> = ({
  onSelectToApply,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', label: '전체 (200여종)' },
    { id: 'tv', label: '대형 TV' },
    { id: 'fridge', label: '냉장고/김치' },
    { id: 'washer', label: '세탁·건조기' },
    { id: 'ac', label: '에어컨/청정' },
    { id: 'healthcare', label: '안마의자/세라젬' },
    { id: 'beauty', label: '홈세라/뷰티' },
    { id: 'kitchen', label: '주방가전/쿠쿠' },
    { id: 'living', label: '생활/로봇청소기' },
    { id: 'digital', label: '디지털/노트북' },
  ];

  const filteredAppliances = APPLIANCES.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.spec.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="pt-24 pb-28 max-w-xl mx-auto px-4 bg-[#faf8ff] min-h-screen">
      {/* Title */}
      <div className="text-center mb-5">
        <span className="text-[#00288e] text-xs font-bold tracking-wider">OFFICIAL LINEUP</span>
        <h1 className="text-2xl font-extrabold text-[#131b2e] tracking-tight mt-1">
          인기 지원가전 전체 라인업
        </h1>
        <p className="text-xs text-slate-600 mt-1">
          삼성전자 · LG전자 공식 본사 직배송 프리미엄 라인업 1인 최대 2개 지원
        </p>
      </div>

      {/* 1+1 Recommendation Banner */}
      <div className="mb-5 p-3.5 bg-gradient-to-r from-[#1e40af] to-[#0051d5] rounded-2xl text-white shadow-md flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[20px]">recommend</span>
          </div>
          <div>
            <div className="text-[10px] font-bold text-amber-300">1+1 동시 신청 꿀팁</div>
            <div className="text-xs font-bold">대형TV + 워시타워 결합 신청 1위</div>
          </div>
        </div>
        <button
          onClick={() => onSelectToApply('samsung-85tv')}
          className="bg-white text-[#00288e] px-2.5 py-1.5 rounded-lg text-xs font-bold active:scale-95 transition-transform"
        >
          세트신청
        </button>
      </div>

      {/* Search Input */}
      <div className="mb-4 relative">
        <span className="material-symbols-outlined absolute left-3.5 top-3 text-slate-400 text-lg">
          search
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="원하는 가전 모델명, 브랜드 검색 (예: TV, 냉장고, 비스포크)"
          className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-xs text-[#131b2e] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 outline-none"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        )}
      </div>

      {/* Category Filter Chips */}
      <div className="flex gap-1.5 overflow-x-auto pb-3 mb-5 no-scrollbar scroll-smooth">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs transition-all active:scale-95 shrink-0 ${
                isActive
                  ? 'bg-[#1e40af] text-white font-bold shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Product List Cards */}
      <div className="space-y-4">
        {filteredAppliances.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-xs text-slate-500">
            검색 결과와 일치하는 가전이 없습니다. 상담 신청 시 80여종 전체 목록에서 선택 가능합니다.
          </div>
        ) : (
          filteredAppliances.map((item: ApplianceItem) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:border-[#1e40af] transition-all"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5">
                  <span className={`${item.tagColor} text-[10px] font-bold px-2 py-0.5 rounded`}>
                    {item.tag}
                  </span>
                  <span className="text-[11px] font-bold text-slate-500">{item.brand}</span>
                </div>
                <span className="text-[10px] text-[#059669] font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  본사 무료 직배송
                </span>
              </div>

              <div className="flex gap-3 my-3">
                <div className="w-20 h-20 rounded-xl bg-[#F8FAFC] border border-slate-200/80 flex items-center justify-center shrink-0 overflow-hidden relative shadow-inner">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <span className="material-symbols-outlined text-[38px] text-[#00288e]">
                      {item.iconName}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-[#131b2e] leading-snug">{item.name}</h3>
                  <p className="text-[11px] text-slate-500 mt-1 truncate">{item.spec}</p>

                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-[11px] text-slate-400 line-through">
                      시중가 {item.marketPrice}
                    </span>
                    <span className="text-sm font-extrabold text-[#DC2626]">
                      본인부담금 0원 (전액지원)
                    </span>
                  </div>
                </div>
              </div>

              {/* Key Features Bullets */}
              <div className="grid grid-cols-2 gap-1.5 py-2.5 border-t border-slate-100 text-[11px] text-slate-600">
                {item.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px] text-[#059669]">check</span>
                    <span className="truncate">{feat}</span>
                  </div>
                ))}
              </div>

              {/* Action Button */}
              <button
                onClick={() => onSelectToApply(item.id)}
                className="w-full mt-2 h-11 bg-[#1e40af] text-white rounded-xl text-xs font-bold hover:bg-[#00288e] active:scale-98 transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>이 가전으로 전액지원 신청하기</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          ))
        )}
      </div>

      <p className="text-xs text-center text-slate-500 mt-6 leading-relaxed">
        ※ 위 가전 외에도 스타일러, 다이슨 청소기, 공기청정기, 노트북, 오븐레인지 등 80여 종 품목이 준비되어
        있으며, 전문 상담원 통화 시 원하시는 모델로 자유롭게 변경 가능합니다.
      </p>
    </div>
  );
};
