import React from 'react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 relative max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-3">
          <h3 className="text-base font-bold text-[#131b2e]">개인정보 처리방침 및 수집·이용 동의</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-full text-lg cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto pr-1 text-xs text-slate-600 space-y-3 leading-relaxed flex-1">
          <p className="font-bold text-[#131b2e]">
            주식회사 더리본(이하 '회사')은 고객님의 개인정보를 매우 소중하게 생각하며,
            「개인정보보호법」 및 관련 법령을 철저히 준수합니다.
          </p>

          <div>
            <h4 className="font-bold text-[#131b2e] mb-1">1. 수집하는 개인정보의 항목</h4>
            <p>- 필수 항목: 성명, 휴대전화번호, 연령대, 관심 가전 품목, 상담 희망 시간</p>
            <p>- 서비스 이용 과정에서 생성되는 정보: 접속 IP, 쿠키, 서비스 이용 기록</p>
          </div>

          <div>
            <h4 className="font-bold text-[#131b2e] mb-1">2. 개인정보의 수집 및 이용 목적</h4>
            <p>- 더리본 스페셜 멤버십 상품 소개 및 가입 안내 상담</p>
            <p>- 최신가전 100% 무상지원 대상자 자격 요건 심사 (연령, 신용 기본요건)</p>
            <p>- 사은품 가전제품 본사 배송 및 무료 설치 일정 조율</p>
            <p>- 고객 문의 응대 및 불만 처리, 해피콜 진행</p>
          </div>

          <div>
            <h4 className="font-bold text-[#131b2e] mb-1">3. 개인정보의 보유 및 이용 기간</h4>
            <p>
              수집된 개인정보는 동의일로부터 6개월간 보유 및 이용되며, 상담 및 계약 체결 등 이용
              목적이 달성된 후에는 지체 없이 안전한 방법으로 파기합니다. 단, 관계 법령에 따라 보존할
              필요가 있는 경우 해당 법령이 정한 기간 동안 보관합니다.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-[#131b2e] mb-1">4. 동의 거부 권리 및 불이익 안내</h4>
            <p>
              귀하는 개인정보 수집 및 이용에 대해 동의를 거부할 권리가 있습니다. 단, 필수 항목 동의
              거부 시 상품 상담 및 가전 전액 지원 혜택 제공이 불가할 수 있습니다.
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-200 mt-3 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-[#00288e] text-white rounded-xl text-xs font-bold hover:bg-[#1e40af] transition-colors"
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
