import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider, useAppState } from "@/lib/AppContext";
import AppShell from "@/components/AppShell";
import Home from "@/pages/Home";
import Align from "@/pages/Align";
import Reset from "@/pages/Reset";
import StateLadder from "@/pages/StateLadder";
import ContrastReset from "@/pages/ContrastReset";
import StillnessTimer from "@/pages/StillnessTimer";
import Reflect from "@/pages/Reflect";
import Profile from "@/pages/Profile";
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
        <Route path="/reset" element={<Reset />} />
        <Route path="/reset/ladder" element={<StateLadder />} />
        <Route path="/reset/contrast" element={<ContrastReset />} />
        <Route path="/reset/stillness" element={<StillnessTimer />} />
        <Route path="/reflect" element={<Reflect />} />
        <Route path="/profile" element={<Profile />} />
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
