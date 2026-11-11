import React from 'react';
import { ASSETS } from '../data/mockData';

interface HeaderProps {
  onOpenConsultation: () => void;
  onOpenStatusCheck: () => void;
  onOpenCalculator?: () => void;
  activeTab: string;
  onSelectTab: (tab: 'home' | 'benefits' | 'appliances') => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenConsultation,
  onOpenStatusCheck,
  onOpenCalculator,
  onSelectTab,
}) => {
  return (
    <header className="fixed top-10 left-0 right-0 z-40 bg-[#faf8ff] shadow-sm flex justify-between items-center px-4 max-w-xl lg:max-w-4xl xl:max-w-5xl mx-auto h-14 border-b border-slate-200/70">
      <div className="flex items-center gap-2">
        {/* 더리본 로고 이미지 & 홈 이동 */}
        <button
          onClick={() => onSelectTab('home')}
          className="flex items-center gap-1.5 active:scale-95 transition-transform duration-150 text-left cursor-pointer"
          title="더리본 홈으로 이동"
        >
          <img
            alt="더리본"
            className="h-8 w-auto object-contain"
            src={ASSETS.logo}
            referrerPolicy="no-referrer"
          />
          <span className="text-lg font-bold text-[#00288e] tracking-tight">더리본</span>
        </button>

        <span className="bg-[#eaedff] text-[#00288e] text-xs font-bold px-2 py-0.5 rounded-full border border-[#dae2fd]">
          가전지원
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        {onOpenCalculator && (
          <button
            onClick={onOpenCalculator}
            className="text-xs font-semibold text-[#0051d5] hover:text-[#00288e] bg-[#eaedff]/60 px-2 py-1 rounded transition-colors flex items-center gap-0.5"
            title="실시간 혜택 계산기"
          >
            <span className="material-symbols-outlined text-[14px]">calculate</span>
            <span className="hidden xs:inline">혜택계산</span>
          </button>
        )}

        <button
          onClick={onOpenStatusCheck}
          className="text-xs font-medium text-slate-600 hover:text-[#00288e] px-2 py-1 rounded transition-colors"
          title="내 신청 현황 조회"
        >
          신청조회
        </button>

        <button
          onClick={onOpenConsultation}
          className="bg-[#1e40af] text-white px-3 py-1.5 rounded-lg text-xs font-bold active:scale-95 transition-transform duration-150 shadow-sm flex items-center gap-1 hover:bg-[#00288e]"
        >
          <span className="material-symbols-outlined text-[15px]">verified_user</span>
          <span>간편상담</span>
        </button>
      </div>
    </header>
  );
};
