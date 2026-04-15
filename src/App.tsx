import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { AppProvider, useAppState } from "@/lib/AppContext";
import AppShell from "@/components/AppShell";
import Home from "@/pages/Home";
import Align from "@/pages/Align";
import AlignmentWheel from "@/pages/AlignmentWheel";
import ReliefWheel from "@/pages/ReliefWheel";
import GatherFlow from "@/pages/GatherFlow";
import MomentumRing from "@/pages/MomentumRing";
import Reset from "@/pages/Reset";
import StateLadder from "@/pages/StateLadder";
import ContrastReset from "@/pages/ContrastReset";
import StillnessTimer from "@/pages/StillnessTimer";
import Breathwork from "@/pages/Breathwork";
import ResistanceRelease from "@/pages/ResistanceRelease";
import QuietMind from "@/pages/QuietMind";
import PresentMoment from "@/pages/PresentMoment";
import ResistanceScan from "@/pages/ResistanceScan";
import AnalyticalOfframp from "@/pages/AnalyticalOfframp";
import ThoughtShiftLadder from "@/pages/ThoughtShiftLadder";
import MentalClarity from "@/pages/MentalClarity";
import PatternSoftener from "@/pages/PatternSoftener";
import HigherView from "@/pages/HigherView";
import SituationPacks from "@/pages/SituationPacks";
import NoProgressSupport from "@/pages/NoProgressSupport";
import Reflect from "@/pages/Reflect";
import FuturePages from "@/pages/FuturePages";
import ImagineIf from "@/pages/ImagineIf";
import OverflowPractice from "@/pages/OverflowPractice";
import MyCurrent from "@/pages/MyCurrent";
import Profile from "@/pages/Profile";
import CurrentInsights from "@/pages/CurrentInsights";
import MyRituals from "@/pages/MyRituals";
import CurrentGuide from "@/pages/CurrentGuide";
import PatternMirror from "@/pages/PatternMirror";
import Notifications from "@/pages/Notifications";
import Onboarding from "@/pages/Onboarding";
import Auth from "@/pages/Auth";
import About from "@/pages/About";
import AdminDashboard from "@/pages/AdminDashboard";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import ResetPassword from "@/pages/ResetPassword";
import NotFound from "@/pages/NotFound";
import MoneyCurrent from "@/pages/MoneyCurrent";
import MoneyState from "@/pages/MoneyState";
import CurrentDeposit from "@/pages/CurrentDeposit";
import MoneyOpenings from "@/pages/MoneyOpenings";
import OverflowSpending from "@/pages/OverflowSpending";
import EvidenceOfSupport from "@/pages/EvidenceOfSupport";
import MoneyResistanceRelease from "@/pages/MoneyResistanceRelease";
import PaymentShift from "@/pages/PaymentShift";
import MoneyGatherFlow from "@/pages/MoneyGatherFlow";
import AlignedAction from "@/pages/AlignedAction";
import WealthRhythm from "@/pages/WealthRhythm";
import MoneyAffirmations from "@/pages/MoneyAffirmations";

const queryClient = new QueryClient();

function AppRoutes() {
  const { user, loading } = useAuth();
  const { state } = useAppState();

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
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    );
  }

  if (!state.onboarding.completed) {
    return (
      <Routes>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="*" element={<Navigate to="/onboarding" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
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
        <Route path="/profile/guide" element={<CurrentGuide />} />
        <Route path="/profile/patterns" element={<PatternMirror />} />
        <Route path="/profile/notifications" element={<Notifications />} />
        <Route path="/about" element={<About />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/money" element={<MoneyCurrent />} />
        <Route path="/money/state" element={<MoneyState />} />
        <Route path="/money/deposit" element={<CurrentDeposit />} />
        <Route path="/money/openings" element={<MoneyOpenings />} />
        <Route path="/money/overflow" element={<OverflowSpending />} />
        <Route path="/money/evidence" element={<EvidenceOfSupport />} />
        <Route path="/money/resistance" element={<MoneyResistanceRelease />} />
        <Route path="/money/payment-shift" element={<PaymentShift />} />
        <Route path="/money/gather" element={<MoneyGatherFlow />} />
        <Route path="/money/aligned-action" element={<AlignedAction />} />
        <Route path="/money/wealth-rhythm" element={<WealthRhythm />} />
        <Route path="/money/affirmations" element={<MoneyAffirmations />} />
      </Route>
      <Route path="/auth" element={<Navigate to="/" replace />} />
      <Route path="/onboarding" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppProvider>
            <AppRoutes />
          </AppProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
