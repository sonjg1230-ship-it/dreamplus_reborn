import React, { useState } from 'react';
import { Share2, Copy, Check, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FooterProps {
  onOpenPrivacyTerms: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenPrivacyTerms }) => {
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const handleCopyUrl = async () => {
    try {
      const url = window.location.href;
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = url;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      setCopied(true);
      showToast('이벤트 링크가 클립보드에 복사되었습니다.');
      setTimeout(() => setCopied(false), 2600);
    } catch {
      showToast('링크 복사에 실패했습니다. 브라우저 주소창 링크를 복사해주세요.');
    }
  };

  const handleKakaoShare = async () => {
    const shareData = {
      title: '더리본 | 최신가전 가전지원 특별 프로모션',
      text: '[더리본 공식] 삼성·LG 최신 인기가전 가전지원 이벤트 신청 접수 중! 만기 시 납입금 100% 환급 혜택을 확인해보세요.',
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (error: unknown) {
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }
      }
    }

    try {
      const url = window.location.href;
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = url;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      setCopied(true);
      showToast('링크가 복사되었습니다! 카카오톡 대화방에 붙여넣어 공유해주세요.');
      setTimeout(() => setCopied(false), 2600);
    } catch {
      showToast('카카오톡 공유 링크 복사에 실패했습니다.');
    }
  };

  return (
    <footer className="w-full max-w-xl mx-auto px-4 py-8 flex flex-col items-center justify-center gap-6 text-center mb-16 bg-[#F8FAFC] border-t border-slate-200 relative">
      {/* Social Media Share Section with Entrance Animation */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-20px' }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex flex-col items-center gap-3 relative overflow-hidden"
      >
        {/* Subtle decorative background highlight */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-100/40 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-blue-100/40 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200/60 z-10">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
          <span>특별 혜택 함께 나누기</span>
        </div>

        <h4 className="text-sm font-bold text-slate-800 z-10">
          가족·지인에게 <span className="text-[#00288e]">가전 100% 지원 혜택</span>을 알려주세요
        </h4>

        <div className="flex items-center justify-center gap-2.5 w-full max-w-xs mt-1 z-10">
          {/* KakaoTalk Share Button */}
          <motion.button
            type="button"
            onClick={handleKakaoShare}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="flex-1 flex items-center justify-center gap-2 bg-[#FEE500] hover:bg-[#FDD835] active:bg-[#FBC02D] text-[#191919] font-medium text-xs py-2.5 px-3 rounded-xl transition-colors shadow-xs cursor-pointer border border-[#E4C800]/50"
            title="카카오톡으로 공유하기"
          >
            {/* KakaoTalk Iconic Speech Bubble SVG */}
            <svg
              className="w-4 h-4 fill-current shrink-0"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 3c-5.52 0-10 3.58-10 8 0 2.82 1.84 5.29 4.62 6.64l-1.18 4.34c-.1.38.33.69.66.47l5.12-3.39c.26.02.52.04.78.04 5.52 0 10-3.58 10-8s-4.48-8-10-8z" />
            </svg>
            <span className="font-semibold">카카오톡 공유</span>
          </motion.button>

          {/* Copy URL Button with Animated Checkmark and Visual Feedback */}
          <motion.button
            type="button"
            onClick={handleCopyUrl}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className={`flex-1 flex items-center justify-center gap-1.5 border text-xs font-medium py-2.5 px-3 rounded-xl transition-all duration-200 shadow-xs cursor-pointer relative ${
              copied
                ? 'bg-emerald-500 border-emerald-600 text-white shadow-emerald-200 shadow-md ring-2 ring-emerald-300'
                : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700'
            }`}
            title="페이지 링크 복사"
          >
            <AnimatePresence mode="wait">
              {copied ? (
                <motion.div
                  key="copied-state"
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                  className="flex items-center gap-1.5 font-bold"
                >
                  <motion.div
                    initial={{ rotate: -45, scale: 0 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 600, damping: 18 }}
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                  </motion.div>
                  <span>복사 완료!</span>
                </motion.div>
              ) : (
                <motion.div
                  key="default-state"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>URL 링크 복사</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Animated Toast Notification with checkmark */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="mt-1 text-[11px] font-medium text-[#00288e] bg-blue-50/90 px-3.5 py-1.5 rounded-lg border border-blue-200/80 shadow-xs flex items-center gap-1.5 z-10"
            >
              <div className="w-3.5 h-3.5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </div>
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="text-lg font-bold text-[#131b2e] tracking-tight">
        더리본
      </div>

      <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs text-[#757684]">
        <button
          onClick={onOpenPrivacyTerms}
          className="hover:text-[#00288e] underline transition-colors cursor-pointer"
        >
          이용약관
        </button>
        <span>|</span>
        <button
          onClick={onOpenPrivacyTerms}
          className="hover:text-[#00288e] underline transition-colors font-bold cursor-pointer"
        >
          개인정보처리방침
        </button>
        <span>|</span>
        <button
          onClick={onOpenPrivacyTerms}
          className="hover:text-[#00288e] underline transition-colors cursor-pointer"
        >
          책임한계 및 법적고지
        </button>
        <span>|</span>
        <a href="tel:1644-3651" className="hover:text-[#00288e] underline transition-colors">
          고객센터 1644-3651
        </a>
      </div>

      <div className="text-[11px] text-[#757684] space-y-1.5 leading-relaxed max-w-xl">
        <p>상호명: 더리본(주) &nbsp;|&nbsp; 대표자: 박명하 &nbsp;|&nbsp; 사업자등록번호: 605-81-92018</p>
        <p>tel : 1644-3651 &nbsp;|&nbsp; fax: 02-3447-3666</p>
        <p>서울 본사 : 서울 성동구 성수일로 111, 9F 914호 (성수동, 선명스퀘어) / 부산 본사 : 부산 부산진구 자유평화로 11, 12F (범천동, W웨딩시티)</p>
        <p className="text-slate-400 pt-2 text-[10px]">
          본 이벤트는 만 25세~70세 대한민국 성인 대상 특별 전액지원 프로모션이며, 제조사 직배송 사은품은 한정수량 소진 시 조기 마감될 수 있습니다.
        </p>
        <p className="text-slate-400 text-[10px]">
          Copyright © THE REBORN Co., Ltd. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
};
