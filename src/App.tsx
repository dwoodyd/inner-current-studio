import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
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
import Reflect from "@/pages/Reflect";
import FuturePages from "@/pages/FuturePages";
import ImagineIf from "@/pages/ImagineIf";
import OverflowPractice from "@/pages/OverflowPractice";
import MyCurrent from "@/pages/MyCurrent";
import Profile from "@/pages/Profile";
import CurrentInsights from "@/pages/CurrentInsights";
import MyRituals from "@/pages/MyRituals";
import Onboarding from "@/pages/Onboarding";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  const { state } = useAppState();

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
        <Route path="/reflect" element={<Reflect />} />
        <Route path="/reflect/future-pages" element={<FuturePages />} />
        <Route path="/reflect/imagine-if" element={<ImagineIf />} />
        <Route path="/reflect/overflow" element={<OverflowPractice />} />
        <Route path="/reflect/archive" element={<MyCurrent />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/insights" element={<CurrentInsights />} />
        <Route path="/profile/rituals" element={<MyRituals />} />
      </Route>
      <Route path="/onboarding" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <AppProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
