import React, { useState, useEffect, useCallback } from 'react';
import { UrgencyTopBar } from './components/UrgencyTopBar';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { HeroSection } from './components/HeroSection';
import { SpecialBenefitsSection } from './components/SpecialBenefitsSection';
import { PopularLineupSection } from './components/PopularLineupSection';
import { SavingsBenefitCalculator } from './components/SavingsBenefitCalculator';
import { ProcessSection } from './components/ProcessSection';
import { LiveTicker } from './components/LiveTicker';
import { ApplicationForm } from './components/ApplicationForm';
import { FAQSection } from './components/FAQSection';
import { Footer } from './components/Footer';
import { BenefitDetailsView } from './components/BenefitDetailsView';
import { AppliancesCatalogView } from './components/AppliancesCatalogView';
import { ApplicationStatusModal } from './components/ApplicationStatusModal';
import { SuccessModal } from './components/SuccessModal';
import { PrivacyModal } from './components/PrivacyModal';
import { ApplicantDetailModal } from './components/ApplicantDetailModal';
import { LiveNotificationToast } from './components/LiveNotificationToast';
import { INITIAL_APPLICANTS, APPLIANCES } from './data/mockData';
import { ApplicantRecord, ApplicationFormData } from './types';

const STORAGE_KEY = 'the_reborn_applicants_v2';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'home' | 'benefits' | 'appliances'>('home');

  // Initialize applicants from localStorage or mockData
  const [applicants, setApplicants] = useState<ApplicantRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      // ignore
    }
    return INITIAL_APPLICANTS;
  });

  // Real-time counter metrics
  const [todayCount, setTodayCount] = useState<number>(348);
  const [remainingQuota, setRemainingQuota] = useState<number>(24);

  // Selected appliances and plan for application form
  const [selectedAppliance1, setSelectedAppliance1] = useState<string>('samsung-85tv');
  const [selectedAppliance2, setSelectedAppliance2] = useState<string>('wash-tower');
  const [selectedPlanId, setSelectedPlanId] = useState<string>('plan-double-gold');

  // Modals state
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [submittedData, setSubmittedData] = useState<ApplicationFormData | null>(null);
  const [selectedDetailApplicant, setSelectedDetailApplicant] = useState<ApplicantRecord | null>(null);

  // Live incoming toast notification state
  const [latestToastApplicant, setLatestToastApplicant] = useState<ApplicantRecord | null>(null);

  // Save applicants to localStorage whenever changed
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(applicants));
    } catch (e) {
      // ignore
    }
  }, [applicants]);

  // Simulate a live incoming applicant
  const addNewIncomingApplicant = useCallback((customData?: Partial<ApplicantRecord>) => {
    const randomNames = ['정*훈', '윤*서', '송*민', '최*진', '강*호', '배*현', '서*우', '권*아', '조*재', '임*경', '문*혁', '오*석'];
    const randomRegions = ['서울 강남구', '경기 수원시', '부산 해운대구', '인천 송도', '대구 수성구', '대전 유성구', '경기 성남시', '광주 서구'];
    const randomAges = ['30대', '40대', '50대', '30대', '40대', '20대', '50대', '60대'];

    const chosenName = randomNames[Math.floor(Math.random() * randomNames.length)];
    const chosenRegion = randomRegions[Math.floor(Math.random() * randomRegions.length)];
    const chosenAge = randomAges[Math.floor(Math.random() * randomAges.length)];
    const randomApp = APPLIANCES[Math.floor(Math.random() * APPLIANCES.length)];
    const prefixNum = Math.floor(2 + Math.random() * 7);

    const now = new Date();
    const timeStr = now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toISOString().slice(0, 10);

    const newRecord: ApplicantRecord = {
      id: `live-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      date: dateStr,
      time: timeStr,
      name: chosenName,
      maskedPhone: `010-${prefixNum}***-****`,
      ageGroup: chosenAge,
      region: chosenRegion,
      appliance1: randomApp.name,
      status: '접수완료',
      ...customData,
    };

    setApplicants((prev) => [newRecord, ...prev.slice(0, 24)]);
    setTodayCount((prev) => prev + 1);
    setRemainingQuota((prev) => Math.max(3, prev - 1));

    // Show floating toast alert for 4.5 seconds
    setLatestToastApplicant(newRecord);
    const toastTimer = setTimeout(() => {
      setLatestToastApplicant(null);
    }, 4500);

    return () => clearTimeout(toastTimer);
  }, []);

  // Periodic Live Background Engine: Every 20~35 seconds a real applicant arrives
  useEffect(() => {
    const triggerNext = () => {
      const delay = Math.floor(18000 + Math.random() * 17000); // 18~35 seconds
      return setTimeout(() => {
        addNewIncomingApplicant();
        timer = triggerNext();
      }, delay);
    };

    let timer = triggerNext();
    return () => clearTimeout(timer);
  }, [addNewIncomingApplicant]);

  const scrollToForm = () => {
    if (currentTab !== 'home') {
      setCurrentTab('home');
      setTimeout(() => {
        const formEl = document.getElementById('application-form');
        formEl?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const formEl = document.getElementById('application-form');
      formEl?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToCalculator = () => {
    if (currentTab !== 'home') {
      setCurrentTab('home');
      setTimeout(() => {
        const calcEl = document.getElementById('savings-calculator');
        calcEl?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const calcEl = document.getElementById('savings-calculator');
      calcEl?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToLiveTicker = () => {
    if (currentTab !== 'home') {
      setCurrentTab('home');
      setTimeout(() => {
        const tickerEl = document.getElementById('live-ticker-section');
        tickerEl?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const tickerEl = document.getElementById('live-ticker-section');
      tickerEl?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectApplianceFromCard = (applianceId: string) => {
    setSelectedAppliance1(applianceId);
    scrollToForm();
  };

  const handleApplyWithPackage = (app1: string, app2: string, planId?: string) => {
    if (app1) setSelectedAppliance1(app1);
    if (app2) setSelectedAppliance2(app2);
    if (planId) setSelectedPlanId(planId);
    scrollToForm();
  };

  // Real submission handler from the user form
  const handleFormSubmitSuccess = (data: ApplicationFormData) => {
    setSubmittedData(data);

    // Mask name e.g. "홍길동" -> "홍*동" or "홍길" -> "홍*"
    const maskedName =
      data.name.length > 2
        ? `${data.name[0]}*${data.name.slice(2)}`
        : `${data.name[0]}*`;

    const app1Name = APPLIANCES.find((a) => a.id === data.appliance1)?.name || data.appliance1;
    const app2Name =
      data.appliance2 && data.appliance2 !== 'none'
        ? APPLIANCES.find((a) => a.id === data.appliance2)?.name || data.appliance2
        : undefined;

    const now = new Date();
    const newApplicant: ApplicantRecord = {
      id: `user-${Date.now()}`,
      date: now.toISOString().slice(0, 10),
      time: now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      name: maskedName,
      maskedPhone: `${data.phonePrefix}-${data.phoneMid.slice(0, 1)}***-****`,
      phoneRaw: `${data.phonePrefix}${data.phoneMid}${data.phoneEnd}`,
      ageGroup: data.ageGroup,
      region: '온라인 직접접수',
      appliance1: app1Name,
      appliance2: app2Name,
      status: '접수완료',
      isUserSubmission: true,
    };

    // Prepend user's actual submission to live applicants list & increment count
    setApplicants((prev) => [newApplicant, ...prev]);
    setTodayCount((prev) => prev + 1);
    setRemainingQuota((prev) => Math.max(1, prev - 1));

    // Show toast
    setLatestToastApplicant(newApplicant);
  };

  return (
    <div className="min-h-screen bg-[#faf8ff] text-[#131b2e] flex flex-col items-center">
      {/* 1. TOP COUNTDOWN BAR (URGENCY BANNER) */}
      <UrgencyTopBar />

      {/* 2. SHARED TOP APP BAR */}
      <Header
        onOpenConsultation={scrollToForm}
        onOpenStatusCheck={() => setIsStatusModalOpen(true)}
        onOpenCalculator={scrollToCalculator}
        activeTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* 3. SCREEN CONTENT ROUTER */}
      {currentTab === 'home' && (
        <main className="pt-24 pb-28 max-w-xl w-full mx-auto px-4 bg-[#faf8ff] min-h-screen">
          {/* HERO SECTION */}
          <HeroSection onApplyClick={scrollToForm} />

          {/* SPECIAL MEMBERSHIP 3대 핵심 혜택 */}
          <SpecialBenefitsSection
            onCheckEligibility={scrollToCalculator}
            onExploreMore={() => setCurrentTab('benefits')}
          />

          {/* INTERACTIVE SAVINGS / BENEFIT CALCULATOR */}
          <div id="savings-calculator" className="scroll-mt-24">
            <SavingsBenefitCalculator onApplyWithPackage={handleApplyWithPackage} />
          </div>

          {/* 인기 지원가전 라인업 6종 카드 */}
          <PopularLineupSection
            onSelectAppliance={handleSelectApplianceFromCard}
            onViewAllAppliances={() => setCurrentTab('appliances')}
          />

          {/* 신청 절차 3단계 */}
          <ProcessSection />

          {/* 실시간 접수 현황 (LIVE TICKER TABLE) */}
          <LiveTicker
            applicants={applicants}
            todayCount={todayCount}
            remainingQuota={remainingQuota}
            onSimulateNewApplicant={() => addNewIncomingApplicant()}
            onSelectApplicantDetail={(app) => setSelectedDetailApplicant(app)}
          />

          {/* 공식 지원 신청서 (HIGH-CONVERSION MOBILE FORM) */}
          <ApplicationForm
            preselectedAppliance1={selectedAppliance1}
            preselectedAppliance2={selectedAppliance2}
            preselectedPlanId={selectedPlanId}
            onSubmitSuccess={handleFormSubmitSuccess}
            onOpenPrivacyTerms={() => setIsPrivacyModalOpen(true)}
          />

          {/* FAQ SECTION */}
          <FAQSection />

          {/* FOOTER */}
          <Footer onOpenPrivacyTerms={() => setIsPrivacyModalOpen(true)} />
        </main>
      )}

      {currentTab === 'benefits' && (
        <BenefitDetailsView
          onGoToApply={(app1, app2, planId) => {
            handleApplyWithPackage(app1 || '', app2 || '', planId);
          }}
        />
      )}

      {currentTab === 'appliances' && (
        <AppliancesCatalogView onSelectToApply={handleSelectApplianceFromCard} />
      )}

      {/* 4. SHARED FIXED BOTTOM NAVIGATION */}
      <BottomNav
        currentTab={currentTab}
        onChangeTab={setCurrentTab}
        onScrollToForm={scrollToForm}
      />

      {/* 5. FLOATING REAL-TIME APPLICATION NOTIFICATION TOAST */}
      <LiveNotificationToast
        applicant={latestToastApplicant}
        onClose={() => setLatestToastApplicant(null)}
        onClick={() => {
          scrollToLiveTicker();
          setLatestToastApplicant(null);
        }}
      />

      {/* 6. MODALS */}
      <ApplicantDetailModal
        applicant={selectedDetailApplicant}
        onClose={() => setSelectedDetailApplicant(null)}
      />

      <ApplicationStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        applicants={applicants}
      />

      <SuccessModal
        formData={submittedData}
        onClose={() => setSubmittedData(null)}
        onCheckStatus={() => {
          setSubmittedData(null);
          setIsStatusModalOpen(true);
        }}
      />

      <PrivacyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />
    </div>
  );
}
