export interface ApplianceItem {
  id: string;
  name: string;
  category: 'tv' | 'fridge' | 'washer' | 'ac' | 'healthcare' | 'digital' | 'kitchen' | 'beauty' | 'living';
  brand: string;
  spec: string;
  marketPrice: string;
  tag: string;
  tagColor: string;
  iconName: string;
  imageUrl?: string;
  features: string[];
}

export interface ApplicantRecord {
  id: string;
  date: string;
  time?: string;
  name: string;
  maskedPhone: string;
  phoneRaw?: string;
  ageGroup: string;
  appliance1: string;
  appliance2?: string;
  region?: string;
  status: '접수완료' | '자격심사중' | '상담원배정' | '해피콜완료' | '배송일정조율';
  isUserSubmission?: boolean;
}

export interface AppliancePackage {
  id: string;
  name: string;
  subtitle: string;
  tag: string;
  appliance1Id: string;
  appliance2Id?: string;
  description: string;
}

export interface MembershipPlan {
  id: string;
  name: string;
  shortName: string;
  tierGrade: '다이아몬드' | '골드' | '실버';
  groupType: '트리플' | '더블' | '싱글';
  accountsCount: number; // 3, 2, 1 구좌
  totalAmount: number; // 총 금액 (원)
  totalMonths: number; // 188회
  phase1Months: number; // 60회
  phase1Monthly: number; // 1~60회 월 납입액
  phase1LifeAmount: number; // 상조부금
  phase1ApplianceAmount: number; // 전자제품 할부금
  phase2Months: number; // 128회 (61~188회)
  phase2Monthly: number; // 61~188회 월 납입액 (상조부금)
  services: string;
  refundPolicy: string;
  tag: string;
  description: string;
}

export interface ApplicationFormData {
  name: string;
  phonePrefix: string;
  phoneMid: string;
  phoneEnd: string;
  ageGroup: string;
  appliance1: string;
  appliance2: string;
  preferredTime: string;
  privacyAgreed: boolean;
  planId?: string;
}

