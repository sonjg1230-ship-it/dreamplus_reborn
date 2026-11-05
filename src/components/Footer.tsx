import React from 'react';

interface FooterProps {
  onOpenPrivacyTerms: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenPrivacyTerms }) => {
  return (
    <footer className="w-full max-w-xl mx-auto px-4 py-8 flex flex-col items-center justify-center gap-3 text-center mb-16 bg-[#F8FAFC] border-t border-slate-200">
      <div className="text-lg font-bold text-[#131b2e] tracking-tight">
        더리본
      </div>

      <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs text-[#757684]">
        <button
          onClick={onOpenPrivacyTerms}
          className="hover:text-[#00288e] underline transition-colors"
        >
          이용약관
        </button>
        <span>|</span>
        <button
          onClick={onOpenPrivacyTerms}
          className="hover:text-[#00288e] underline transition-colors font-bold"
        >
          개인정보처리방침
        </button>
        <span>|</span>
        <button
          onClick={onOpenPrivacyTerms}
          className="hover:text-[#00288e] underline transition-colors"
        >
          책임한계 및 법적고지
        </button>
        <span>|</span>
        <a href="tel:1588-4640" className="hover:text-[#00288e] underline transition-colors">
          고객센터 1588-4640
        </a>
      </div>

      <div className="text-[11px] text-[#757684] space-y-1 leading-relaxed max-w-md">
        <p>(주)더리본 | 대표이사: 송기동 | 사업자등록번호: 214-88-29471</p>
        <p>통신판매업신고: 제2013-서울강남-02198호 | 서울특별시 강남구 논현로 648</p>
        <p>
          선수금 보전기관: 신한은행·하나은행 소비자피해보상보험 채무지급보증 체결
        </p>
        <p className="text-slate-400 pt-2 text-[10px]">
          본 이벤트는 만 25세~63세 대한민국 성인 대상 특별 전액지원 프로모션이며, 제조사 직배송 사은품은 한정수량 소진 시 조기 마감될 수 있습니다.
        </p>
        <p className="text-slate-400 text-[10px]">
          Copyright © THE REBORN Co., Ltd. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
};
