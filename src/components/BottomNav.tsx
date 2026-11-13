import React from 'react';

interface BottomNavProps {
  currentTab: 'home' | 'benefits';
  onChangeTab: (tab: 'home' | 'benefits') => void;
  onScrollToForm: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onChangeTab,
  onScrollToForm,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 w-full z-50 flex justify-around items-center px-3 py-2 max-w-xl lg:max-w-4xl xl:max-w-5xl mx-auto bg-white/95 backdrop-blur-md shadow-[0_-4px_20px_rgba(0,0,0,0.08)] border-t border-slate-200">
      {/* 홈 */}
      <button
        onClick={() => {
          onChangeTab('home');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        className={`flex flex-col items-center justify-center px-4 py-1.5 rounded-xl transition-all duration-150 active:scale-95 ${
          currentTab === 'home'
            ? 'text-[#00288e] font-bold bg-[#eaedff]'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
        }`}
      >
        <span
          className={`material-symbols-outlined text-[22px] ${
            currentTab === 'home' ? 'material-symbols-fill' : ''
          }`}
        >
          home
        </span>
        <span className="text-[11px] mt-0.5">홈</span>
      </button>

      {/* 지원혜택 */}
      <button
        onClick={() => {
          onChangeTab('benefits');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        className={`flex flex-col items-center justify-center px-4 py-1.5 rounded-xl transition-all duration-150 active:scale-95 ${
          currentTab === 'benefits'
            ? 'text-[#00288e] font-bold bg-[#eaedff]'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
        }`}
      >
        <span
          className={`material-symbols-outlined text-[22px] ${
            currentTab === 'benefits' ? 'material-symbols-fill' : ''
          }`}
        >
          redeem
        </span>
        <span className="text-[11px] mt-0.5">지원혜택</span>
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
        className="flex flex-col items-center justify-center bg-gradient-to-r from-[#1e40af] to-[#00288e] text-white rounded-xl px-5 py-1.5 active:scale-95 transition-transform duration-150 shadow-md shadow-[#1e40af]/30 hover:brightness-110"
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
