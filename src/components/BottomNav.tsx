import React from 'react';

interface BottomNavProps {
  currentTab: 'home' | 'benefits';
  onChangeTab: (tab: 'home' | 'benefits') => void;
  onScrollToLineup: () => void;
  onScrollToForm: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onChangeTab,
  onScrollToLineup,
  onScrollToForm,
}) => {
  const [activeNav, setActiveNav] = React.useState<'home' | 'lineup'>('home');
  const isHomeActive = currentTab === 'home' && activeNav === 'home';
  const isLineupActive = currentTab === 'home' && activeNav === 'lineup';

  return (
    <nav className="fixed bottom-0 left-0 right-0 w-full z-50 flex justify-around items-center px-3 py-2 max-w-xl lg:max-w-4xl xl:max-w-5xl mx-auto bg-gradient-to-r from-[#001b66] via-[#00288e] to-[#1e40af] text-white shadow-[0_-6px_24px_rgba(0,40,142,0.28)] border-t border-blue-400/40">
      {/* 홈 */}
      <button
        onClick={() => {
          setActiveNav('home');
          onChangeTab('home');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        className={`flex flex-col items-center justify-center px-4 py-1.5 rounded-xl transition-all duration-150 active:scale-95 cursor-pointer ${
          isHomeActive
            ? 'bg-white text-[#00288e] font-bold shadow-sm'
            : 'text-blue-100 hover:text-white hover:bg-white/15'
        }`}
      >
        <span
          className={`material-symbols-outlined text-[22px] ${
            isHomeActive ? 'material-symbols-fill' : ''
          }`}
        >
          home
        </span>
        <span className="text-[11px] mt-0.5">홈</span>
      </button>

      {/* 가전지원 */}
      <button
        onClick={() => {
          setActiveNav('lineup');
          onScrollToLineup();
        }}
        className={`flex flex-col items-center justify-center px-4 py-1.5 rounded-xl transition-all duration-150 active:scale-95 cursor-pointer ${
          isLineupActive
            ? 'bg-white text-[#00288e] font-bold shadow-sm'
            : 'text-blue-100 hover:text-white hover:bg-white/15'
        }`}
      >
        <span
          className={`material-symbols-outlined text-[22px] ${
            isLineupActive ? 'material-symbols-fill' : ''
          }`}
        >
          redeem
        </span>
        <span className="text-[11px] mt-0.5">가전지원</span>
      </button>

      {/* 신청하기 (Active Primary CTA) */}
      <button
        onClick={() => {
          if (currentTab !== 'home') {
            onChangeTab('home');
            setTimeout(onScrollToForm, 100);
          } else {
            onScrollToForm();
          }
        }}
        className="flex flex-col items-center justify-center bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white rounded-xl px-5 py-1.5 active:scale-95 transition-transform duration-150 shadow-md shadow-black/25 ring-1 ring-amber-300/50 hover:brightness-110 cursor-pointer"
      >
        <span
          className="material-symbols-outlined text-[22px]"
          style={{ fontVariationSettings: '"FILL" 1' }}
        >
          app_registration
        </span>
        <span className="text-[11px] mt-0.5 font-bold tracking-tight">신청하기</span>
      </button>
    </nav>
  );
};
