import React from 'react';
import { ASSETS } from '../data/mockData';

interface HeroSectionProps {
  onApplyClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onApplyClick }) => {
  const [heroImg, setHeroImg] = React.useState(ASSETS.showcaseHero);

  return (
    <section className="mt-2 mb-8">
      {/* 삼성/LG 파트너십 뱃지 */}
      <div className="inline-flex items-center gap-1.5 bg-[#e2e7ff] px-3 py-1 rounded-full text-[#0051d5] text-xs font-semibold mb-3">
        <span className="material-symbols-outlined text-[16px] text-[#0051d5]">verified</span>
        <span>삼성 · LG 공식인증 파트너십 특별 기획전</span>
      </div>

      {/* 메인 카피 */}
      <h1 className="text-3xl font-extrabold text-[#131b2e] tracking-tight mb-2 leading-tight">
        최신가전, <br />
        <span className="text-[#1e40af] underline decoration-[#F97316] decoration-wavy decoration-2">
          전액지원
        </span>{' '}
        받아가기
      </h1>
      <p className="text-sm text-slate-600 mb-5 leading-relaxed">
        멤버십 가입하고 삼성, LG 프리미엄 최신가전을 본인부담금 0원으로 장만하세요!
      </p>

      {/* 핵심 자격요건 칩 세로 스택 */}
      <div className="grid grid-cols-1 gap-2.5 mb-6">
        <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-[#E2E8F0] shadow-sm">
          <div className="w-9 h-9 rounded-lg bg-[#eaedff] flex items-center justify-center text-[#00288e] shrink-0">
            <span className="material-symbols-outlined text-[20px]">filter_2</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-[#131b2e]">1인 최대 2개 제품 전액 무상지원</span>
            <span className="text-[11px] text-[#757684]">
              TV, 세탁기, 냉장고 등 원하는 품목 2개까지 선택 가능
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-[#E2E8F0] shadow-sm">
          <div className="w-9 h-9 rounded-lg bg-[#eaedff] flex items-center justify-center text-[#00288e] shrink-0">
            <span className="material-symbols-outlined text-[20px]">person_check</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-[#131b2e]">만 25세 ~ 70세 대상 (신용 결격사유 없는 분)</span>
            <span className="text-[11px] text-[#757684]">
              대한민국 성인 남녀 누구나 조건 충족 시 100% 대상자 선정
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-[#E2E8F0] shadow-sm">
          <div className="w-9 h-9 rounded-lg bg-[#eaedff] flex items-center justify-center text-[#00288e] shrink-0">
            <span className="material-symbols-outlined text-[20px]">local_shipping</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-[#131b2e]">
              제조사 정품 신제품 공장출고 &amp; 무료 배송설치
            </span>
            <span className="text-[11px] text-[#757684]">
              리퍼브 No, 본사 직배송 전문 기사 안전 무료 설치
            </span>
          </div>
        </div>
      </div>

      {/* 프리미엄 인테리어 가전 쇼케이스 카드 */}
      <div
        onClick={onApplyClick}
        className="relative overflow-hidden rounded-2xl bg-white border border-[#E2E8F0] shadow-md group cursor-pointer"
        role="button"
        tabIndex={0}
      >
        <div className="relative min-h-[220px] h-56 sm:h-64 w-full overflow-hidden bg-slate-900">
          <img
            alt="LG Objet Collection 및 Samsung Bespoke 프리미엄 인테리어 주방 가전"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 block"
            src={heroImg}
            loading="eager"
            onError={() => {
              setHeroImg('/images/showcase_hero.jpg');
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/90 via-black/30 to-black/20 pointer-events-none"></div>

          <div className="absolute top-3 left-3 bg-[#1e40af] text-white text-xs font-semibold px-2.5 py-1 rounded-md shadow flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">star</span>
            <span>LG Objet &amp; Samsung Bespoke 특별전</span>
          </div>

          <div className="absolute bottom-3 left-3 right-3 text-white">
            <span className="text-[10px] text-slate-300 tracking-wider uppercase font-mono">
              Official Household Appliance Subsidy
            </span>
            <h3 className="text-lg font-bold text-white drop-shadow-sm mt-0.5">
              최신 냉장고 · 워시타워 · 대형TV 전액지원
            </h3>
            <p className="text-xs text-slate-200 opacity-90 mt-0.5">
              시중가 200~300만원대 하이엔드 라인업 그대로 무상 제공
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
