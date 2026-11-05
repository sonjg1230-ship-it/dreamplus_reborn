import React, { useState } from 'react';
import { FAQS } from '../data/mockData';

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="mb-10">
      <div className="text-center mb-4">
        <span className="text-[#00288e] text-xs font-bold tracking-wider">FREQUENTLY ASKED</span>
        <h2 className="text-xl font-extrabold text-[#131b2e] tracking-tight">자주 묻는 질문 (FAQ)</h2>
        <p className="text-xs text-slate-500 mt-0.5">고객님들이 가장 궁금해하시는 핵심 사항입니다</p>
      </div>

      <div className="space-y-2.5">
        {FAQS.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden transition-all"
            >
              <button
                type="button"
                onClick={() => toggle(idx)}
                className="w-full p-3.5 text-left flex items-center justify-between gap-2 cursor-pointer hover:bg-slate-50"
              >
                <div className="flex items-start gap-2">
                  <span className="text-[#1e40af] font-bold text-sm shrink-0">Q.</span>
                  <span className="text-sm font-bold text-[#131b2e] leading-snug">{faq.q}</span>
                </div>
                <span
                  className={`material-symbols-outlined text-slate-400 text-lg transition-transform duration-200 shrink-0 ${
                    isOpen ? 'rotate-180 text-[#00288e]' : ''
                  }`}
                >
                  expand_more
                </span>
              </button>

              {isOpen && (
                <div className="px-3.5 pb-3.5 pt-1 text-xs text-slate-600 border-t border-slate-100 bg-[#f8fafc]/50 leading-relaxed">
                  <div className="flex items-start gap-2">
                    <span className="text-[#059669] font-bold text-xs shrink-0">A.</span>
                    <p>{faq.a}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
