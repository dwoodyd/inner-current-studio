import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { AppProvider } from "@/lib/AppContext";
import { Component, lazy, Suspense, type ErrorInfo, type ReactNode } from "react";
import AppShell from "@/components/AppShell";
import { EnvironmentRedirectNotice } from "@/components/EnvironmentRedirectNotice";
import { PremiumGate } from "@/components/PremiumGate";
import { BetaAccessGate } from "@/components/BetaAccessGate";
import { useAppState } from "@/lib/AppContext";
import { useBetaTrialClaimer } from "@/hooks/useBetaTrialClaimer";

const Home = lazy(() => import("@/pages/Home"));
const Align = lazy(() => import("@/pages/Align"));
const AlignmentWheel = lazy(() => import("@/pages/AlignmentWheel"));
const ReliefWheel = lazy(() => import("@/pages/ReliefWheel"));
const GatherFlow = lazy(() => import("@/pages/GatherFlow"));
const MomentumRing = lazy(() => import("@/pages/MomentumRing"));
const Reset = lazy(() => import("@/pages/Reset"));
const StateLadder = lazy(() => import("@/pages/StateLadder"));
const ContrastReset = lazy(() => import("@/pages/ContrastReset"));
const StillnessTimer = lazy(() => import("@/pages/StillnessTimer"));
const Breathwork = lazy(() => import("@/pages/Breathwork"));
const ResistanceRelease = lazy(() => import("@/pages/ResistanceRelease"));
const QuietMind = lazy(() => import("@/pages/QuietMind"));
const PresentMoment = lazy(() => import("@/pages/PresentMoment"));
const ResistanceScan = lazy(() => import("@/pages/ResistanceScan"));
const AnalyticalOfframp = lazy(() => import("@/pages/AnalyticalOfframp"));
const ThoughtShiftLadder = lazy(() => import("@/pages/ThoughtShiftLadder"));
const MentalClarity = lazy(() => import("@/pages/MentalClarity"));
const PatternSoftener = lazy(() => import("@/pages/PatternSoftener"));
const HigherView = lazy(() => import("@/pages/HigherView"));
const SituationPacks = lazy(() => import("@/pages/SituationPacks"));
const NoProgressSupport = lazy(() => import("@/pages/NoProgressSupport"));
const Reflect = lazy(() => import("@/pages/Reflect"));
const FuturePages = lazy(() => import("@/pages/FuturePages"));
const ImagineIf = lazy(() => import("@/pages/ImagineIf"));
const OverflowPractice = lazy(() => import("@/pages/OverflowPractice"));
const MyCurrent = lazy(() => import("@/pages/MyCurrent"));
const Profile = lazy(() => import("@/pages/Profile"));
const CurrentInsights = lazy(() => import("@/pages/CurrentInsights"));
const MyRituals = lazy(() => import("@/pages/MyRituals"));
const CurrentGuide = lazy(() => import("@/pages/CurrentGuide"));
const PatternMirror = lazy(() => import("@/pages/PatternMirror"));
const Notifications = lazy(() => import("@/pages/Notifications"));
const Onboarding = lazy(() => import("@/pages/Onboarding"));
const Auth = lazy(() => import("@/pages/Auth"));
const About = lazy(() => import("@/pages/About"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const Privacy = lazy(() => import("@/pages/Privacy"));
const Terms = lazy(() => import("@/pages/Terms"));
const Refund = lazy(() => import("@/pages/Refund"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const Welcome = lazy(() => import("@/pages/Welcome"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const Beta = lazy(() => import("@/pages/Beta"));
const OwnerAccess = lazy(() => import("@/pages/OwnerAccess"));
const MoneyCurrent = lazy(() => import("@/pages/MoneyCurrent"));
const MoneyState = lazy(() => import("@/pages/MoneyState"));
const CurrentDeposit = lazy(() => import("@/pages/CurrentDeposit"));
const MoneyOpenings = lazy(() => import("@/pages/MoneyOpenings"));
const OverflowSpending = lazy(() => import("@/pages/OverflowSpending"));
const EvidenceOfSupport = lazy(() => import("@/pages/EvidenceOfSupport"));
const MoneyResistanceRelease = lazy(() => import("@/pages/MoneyResistanceRelease"));
const PaymentShift = lazy(() => import("@/pages/PaymentShift"));
const MoneyGatherFlow = lazy(() => import("@/pages/MoneyGatherFlow"));
const AlignedAction = lazy(() => import("@/pages/AlignedAction"));
const WealthRhythm = lazy(() => import("@/pages/WealthRhythm"));
const MoneyAffirmations = lazy(() => import("@/pages/MoneyAffirmations"));
const AffirmationTracker = lazy(() => import("@/pages/AffirmationTracker"));
const AffirmationCoach = lazy(() => import("@/pages/AffirmationCoach"));
const AffirmationLibrary = lazy(() => import("@/pages/AffirmationLibrary"));
const CurrentsHub = lazy(() => import("@/pages/CurrentsHub"));
const SelfHub = lazy(() => import("@/pages/domain/SelfHub"));
const EnergyHub = lazy(() => import("@/pages/domain/EnergyHub"));
const RelationshipsHub = lazy(() => import("@/pages/domain/RelationshipsHub"));
const HealthHub = lazy(() => import("@/pages/domain/HealthHub"));
const SelfState = lazy(() => import("@/pages/domain/DomainPages").then((m) => ({ default: m.SelfPages.State })));
const SelfAffirmations = lazy(() => import("@/pages/domain/DomainPages").then((m) => ({ default: m.SelfPages.Affirmations })));
const SelfGather = lazy(() => import("@/pages/domain/DomainPages").then((m) => ({ default: m.SelfPages.Gather })));
const SelfResistance = lazy(() => import("@/pages/domain/DomainPages").then((m) => ({ default: m.SelfPages.Resistance })));
const SelfOpenings = lazy(() => import("@/pages/domain/DomainPages").then((m) => ({ default: m.SelfPages.Openings })));
const SelfEvidence = lazy(() => import("@/pages/domain/DomainPages").then((m) => ({ default: m.SelfPages.Evidence })));
const SelfScriptHub = lazy(() => import("@/pages/domain/DomainPages").then((m) => ({ default: m.SelfPages.ScriptHub })));
const SelfScriptNew = lazy(() => import("@/pages/domain/DomainPages").then((m) => ({ default: m.SelfPages.ScriptNew })));
const SelfScriptLibrary = lazy(() => import("@/pages/domain/DomainPages").then((m) => ({ default: m.SelfPages.ScriptLibrary })));
const SelfScriptDetail = lazy(() => import("@/pages/domain/DomainPages").then((m) => ({ default: m.SelfPages.ScriptDetail })));
const EnergyState = lazy(() => import("@/pages/domain/DomainPages").then((m) => ({ default: m.EnergyPages.State })));
const EnergyAffirmations = lazy(() => import("@/pages/domain/DomainPages").then((m) => ({ default: m.EnergyPages.Affirmations })));
const EnergyGather = lazy(() => import("@/pages/domain/DomainPages").then((m) => ({ default: m.EnergyPages.Gather })));
const EnergyResistance = lazy(() => import("@/pages/domain/DomainPages").then((m) => ({ default: m.EnergyPages.Resistance })));
const EnergyOpenings = lazy(() => import("@/pages/domain/DomainPages").then((m) => ({ default: m.EnergyPages.Openings })));
const EnergyEvidence = lazy(() => import("@/pages/domain/DomainPages").then((m) => ({ default: m.EnergyPages.Evidence })));
const EnergyScriptHub = lazy(() => import("@/pages/domain/DomainPages").then((m) => ({ default: m.EnergyPages.ScriptHub })));
const EnergyScriptNew = lazy(() => import("@/pages/domain/DomainPages").then((m) => ({ default: m.EnergyPages.ScriptNew })));
const EnergyScriptLibrary = lazy(() => import("@/pages/domain/DomainPages").then((m) => ({ default: m.EnergyPages.ScriptLibrary })));
const EnergyScriptDetail = lazy(() => import("@/pages/domain/DomainPages").then((m) => ({ default: m.EnergyPages.ScriptDetail })));
const RelationshipsState = lazy(() => import("@/pages/domain/DomainPages").then((m) => ({ default: m.RelationshipsPages.State })));
const RelationshipsAffirmations = lazy(() => import("@/pages/domain/DomainPages").then((m) => ({ default: m.RelationshipsPages.Affirmations })));
const RelationshipsGather = lazy(() => import("@/pages/domain/DomainPages").then((m) => ({ default: m.RelationshipsPages.Gather })));
const RelationshipsResistance = lazy(() => import("@/pages/domain/DomainPages").then((m) => ({ default: m.RelationshipsPages.Resistance })));
const RelationshipsOpenings = lazy(() => import("@/pages/domain/DomainPages").then((m) => ({ default: m.RelationshipsPages.Openings })));
const RelationshipsEvidence = lazy(() => import("@/pages/domain/DomainPages").then((m) => ({ default: m.RelationshipsPages.Evidence })));
const RelationshipsScriptHub = lazy(() => import("@/pages/domain/DomainPages").then((m) => ({ default: m.RelationshipsPages.ScriptHub })));
const RelationshipsScriptNew = lazy(() => import("@/pages/domain/DomainPages").then((m) => ({ default: m.RelationshipsPages.ScriptNew })));
const RelationshipsScriptLibrary = lazy(() => import("@/pages/domain/DomainPages").then((m) => ({ default: m.RelationshipsPages.ScriptLibrary })));
const RelationshipsScriptDetail = lazy(() => import("@/pages/domain/DomainPages").then((m) => ({ default: m.RelationshipsPages.ScriptDetail })));
const HealthState = lazy(() => import("@/pages/domain/DomainPages").then((m) => ({ default: m.HealthPages.State })));
const HealthAffirmations = lazy(() => import("@/pages/domain/DomainPages").then((m) => ({ default: m.HealthPages.Affirmations })));
const HealthGather = lazy(() => import("@/pages/domain/DomainPages").then((m) => ({ default: m.HealthPages.Gather })));
const HealthResistance = lazy(() => import("@/pages/domain/DomainPages").then((m) => ({ default: m.HealthPages.Resistance })));
const HealthOpenings = lazy(() => import("@/pages/domain/DomainPages").then((m) => ({ default: m.HealthPages.Openings })));
const HealthEvidence = lazy(() => import("@/pages/domain/DomainPages").then((m) => ({ default: m.HealthPages.Evidence })));
const HealthScriptHub = lazy(() => import("@/pages/domain/DomainPages").then((m) => ({ default: m.HealthPages.ScriptHub })));
const HealthScriptNew = lazy(() => import("@/pages/domain/DomainPages").then((m) => ({ default: m.HealthPages.ScriptNew })));
const HealthScriptLibrary = lazy(() => import("@/pages/domain/DomainPages").then((m) => ({ default: m.HealthPages.ScriptLibrary })));
const HealthScriptDetail = lazy(() => import("@/pages/domain/DomainPages").then((m) => ({ default: m.HealthPages.ScriptDetail })));
const MoneyScriptHub = lazy(() => import("@/pages/domain/DomainPages").then((m) => ({ default: m.MoneyPages.ScriptHub })));
const MoneyScriptNew = lazy(() => import("@/pages/domain/DomainPages").then((m) => ({ default: m.MoneyPages.ScriptNew })));
const MoneyScriptLibrary = lazy(() => import("@/pages/domain/DomainPages").then((m) => ({ default: m.MoneyPages.ScriptLibrary })));
const MoneyScriptDetail = lazy(() => import("@/pages/domain/DomainPages").then((m) => ({ default: m.MoneyPages.ScriptDetail })));


const queryClient = new QueryClient();

class RouteErrorBoundary extends Component<
  { children: ReactNode; resetKey: string },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Route render failed', error, info);
  }

  componentDidUpdate(prevProps: { resetKey: string }) {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-5 text-center text-foreground">
        <h1 className="font-heading text-3xl font-semibold">This Current needs a refresh</h1>
        <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
          The app updated while this page was cached. Refresh once and it will reopen cleanly.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-7 min-h-[48px] rounded-2xl bg-primary px-6 text-sm font-medium text-primary-foreground"
        >
          Refresh app
        </button>
      </div>
    );
  }
}

function RouteLoader() {
  return (
    <div className="flex min-h-[50dvh] items-center justify-center bg-background">
      <div className="h-10 w-10 rounded-full soul-glow-gold animate-pulse"
        style={{ background: 'radial-gradient(circle at 40% 35%, hsl(var(--primary) / 0.3), hsl(var(--primary) / 0.08))' }}
      />
    </div>
  );
}

function AppRoutes() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const { state } = useAppState();
  useBetaTrialClaimer();
  const current = (domain: string, element: JSX.Element) => <PremiumGate domain={domain}>{element}</PremiumGate>;
  const premium = (feature: string, element: JSX.Element) => <PremiumGate feature={feature}>{element}</PremiumGate>;

  if (loading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-background">
        <div className="h-12 w-12 rounded-full soul-glow-gold animate-pulse"
          style={{ background: 'radial-gradient(circle at 40% 35%, hsl(42 65% 58% / 0.3), hsl(42 65% 58% / 0.08))' }}
        />
      </div>
    );
  }

  if (!user) {
    return (
      <Suspense fallback={<RouteLoader />}><Routes>
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/beta" element={<Beta />} />
        <Route path="/owner" element={<OwnerAccess />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/refund" element={<Refund />} />
        <Route path="*" element={<Navigate to="/welcome" replace />} />
      </Routes>
    </Suspense>
    );
  }

  if (!state.onboarding.completed && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <RouteErrorBoundary resetKey={location.pathname}>
      <Suspense fallback={<RouteLoader />}><Routes>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route element={<AppShell />}>
        <Route path="/" element={<Home />} />
        <Route path="/align" element={<Align />} />
        <Route path="/align/wheel" element={<AlignmentWheel />} />
        <Route path="/align/relief" element={<ReliefWheel />} />
        <Route path="/align/gather" element={<GatherFlow />} />
        <Route path="/align/momentum" element={<MomentumRing />} />
        <Route path="/reset" element={<Reset />} />
        <Route path="/reset/ladder" element={<StateLadder />} />
        <Route path="/reset/contrast" element={<ContrastReset />} />
        <Route path="/reset/stillness" element={<StillnessTimer />} />
        <Route path="/reset/breathwork" element={<Breathwork />} />
        <Route path="/reset/resistance" element={<ResistanceRelease />} />
        <Route path="/reset/quiet" element={<QuietMind />} />
        <Route path="/reset/quiet/present" element={<PresentMoment />} />
        <Route path="/reset/quiet/scan" element={<ResistanceScan />} />
        <Route path="/reset/quiet/offramp" element={<AnalyticalOfframp />} />
        <Route path="/reset/quiet/shift" element={<ThoughtShiftLadder />} />
        <Route path="/reset/quiet/clarity" element={<MentalClarity />} />
        <Route path="/reset/quiet/patterns" element={<PatternSoftener />} />
        <Route path="/reset/quiet/higher" element={<HigherView />} />
        <Route path="/reset/quiet/situations" element={<SituationPacks />} />
        <Route path="/reset/quiet/support" element={<NoProgressSupport />} />
        <Route path="/reflect" element={<Reflect />} />
        <Route path="/reflect/future-pages" element={<FuturePages />} />
        <Route path="/reflect/imagine-if" element={<ImagineIf />} />
        <Route path="/reflect/overflow" element={<OverflowPractice />} />
        <Route path="/reflect/archive" element={<MyCurrent />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/insights" element={<CurrentInsights />} />
        <Route path="/profile/rituals" element={<MyRituals />} />
        <Route path="/profile/guide" element={premium('the Current Guide', <CurrentGuide />)} />
        <Route path="/profile/patterns" element={<PatternMirror />} />
        <Route path="/profile/notifications" element={<Notifications />} />
        <Route path="/about" element={<About />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/refund" element={<Refund />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/money" element={current('money', <MoneyCurrent />)} />
        <Route path="/money/state" element={current('money', <MoneyState />)} />
        <Route path="/money/deposit" element={current('money', <CurrentDeposit />)} />
        <Route path="/money/openings" element={current('money', <MoneyOpenings />)} />
        <Route path="/money/overflow" element={current('money', <OverflowSpending />)} />
        <Route path="/money/evidence" element={current('money', <EvidenceOfSupport />)} />
        <Route path="/money/resistance" element={current('money', <MoneyResistanceRelease />)} />
        <Route path="/money/payment-shift" element={current('money', <PaymentShift />)} />
        <Route path="/money/gather" element={current('money', <MoneyGatherFlow />)} />
        <Route path="/money/aligned-action" element={current('money', <AlignedAction />)} />
        <Route path="/money/wealth-rhythm" element={current('money', <WealthRhythm />)} />
        <Route path="/money/affirmations" element={current('money', <MoneyAffirmations />)} />
        <Route path="/money/tracker" element={current('money', <AffirmationTracker />)} />
        <Route path="/money/coach" element={premium('the AI Affirmation Coach', <AffirmationCoach />)} />
        <Route path="/money/library" element={current('money', <AffirmationLibrary />)} />
        <Route path="/money/script" element={current('money', <MoneyScriptHub />)} />
        <Route path="/money/script/new" element={current('money', <MoneyScriptNew />)} />
        <Route path="/money/script/library" element={current('money', <MoneyScriptLibrary />)} />
        <Route path="/money/script/:scriptId" element={current('money', <MoneyScriptDetail />)} />
        <Route path="/currents" element={<CurrentsHub />} />
        <Route path="/self" element={current('self', <SelfHub />)} />
        <Route path="/self/state" element={current('self', <SelfState />)} />
        <Route path="/self/affirmations" element={current('self', <SelfAffirmations />)} />
        <Route path="/self/gather" element={current('self', <SelfGather />)} />
        <Route path="/self/resistance" element={current('self', <SelfResistance />)} />
        <Route path="/self/openings" element={current('self', <SelfOpenings />)} />
        <Route path="/self/evidence" element={current('self', <SelfEvidence />)} />
        <Route path="/self/script" element={current('self', <SelfScriptHub />)} />
        <Route path="/self/script/new" element={current('self', <SelfScriptNew />)} />
        <Route path="/self/script/library" element={current('self', <SelfScriptLibrary />)} />
        <Route path="/self/script/:scriptId" element={current('self', <SelfScriptDetail />)} />
        <Route path="/energy" element={current('energy', <EnergyHub />)} />
        <Route path="/energy/state" element={current('energy', <EnergyState />)} />
        <Route path="/energy/affirmations" element={current('energy', <EnergyAffirmations />)} />
        <Route path="/energy/gather" element={current('energy', <EnergyGather />)} />
        <Route path="/energy/resistance" element={current('energy', <EnergyResistance />)} />
        <Route path="/energy/openings" element={current('energy', <EnergyOpenings />)} />
        <Route path="/energy/evidence" element={current('energy', <EnergyEvidence />)} />
        <Route path="/energy/script" element={current('energy', <EnergyScriptHub />)} />
        <Route path="/energy/script/new" element={current('energy', <EnergyScriptNew />)} />
        <Route path="/energy/script/library" element={current('energy', <EnergyScriptLibrary />)} />
        <Route path="/energy/script/:scriptId" element={current('energy', <EnergyScriptDetail />)} />
        <Route path="/relationships" element={current('relationships', <RelationshipsHub />)} />
        <Route path="/relationships/state" element={current('relationships', <RelationshipsState />)} />
        <Route path="/relationships/affirmations" element={current('relationships', <RelationshipsAffirmations />)} />
        <Route path="/relationships/gather" element={current('relationships', <RelationshipsGather />)} />
        <Route path="/relationships/resistance" element={current('relationships', <RelationshipsResistance />)} />
        <Route path="/relationships/openings" element={current('relationships', <RelationshipsOpenings />)} />
        <Route path="/relationships/evidence" element={current('relationships', <RelationshipsEvidence />)} />
        <Route path="/relationships/script" element={current('relationships', <RelationshipsScriptHub />)} />
        <Route path="/relationships/script/new" element={current('relationships', <RelationshipsScriptNew />)} />
        <Route path="/relationships/script/library" element={current('relationships', <RelationshipsScriptLibrary />)} />
        <Route path="/relationships/script/:scriptId" element={current('relationships', <RelationshipsScriptDetail />)} />
        <Route path="/health" element={current('health', <HealthHub />)} />
        <Route path="/health/state" element={current('health', <HealthState />)} />
        <Route path="/health/affirmations" element={current('health', <HealthAffirmations />)} />
        <Route path="/health/gather" element={current('health', <HealthGather />)} />
        <Route path="/health/resistance" element={current('health', <HealthResistance />)} />
        <Route path="/health/openings" element={current('health', <HealthOpenings />)} />
        <Route path="/health/evidence" element={current('health', <HealthEvidence />)} />
        <Route path="/health/script" element={current('health', <HealthScriptHub />)} />
        <Route path="/health/script/new" element={current('health', <HealthScriptNew />)} />
        <Route path="/health/script/library" element={current('health', <HealthScriptLibrary />)} />
        <Route path="/health/script/:scriptId" element={current('health', <HealthScriptDetail />)} />
      </Route>
      <Route path="/welcome" element={<Navigate to="/" replace />} />
      <Route path="/beta" element={<Navigate to="/" replace />} />
      <Route path="/auth" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes></Suspense>
    </RouteErrorBoundary>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <BetaAccessGate>
          <EnvironmentRedirectNotice />
          <AuthProvider>
            <AppProvider>
              <AppRoutes />
            </AppProvider>
          </AuthProvider>
        </BetaAccessGate>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
