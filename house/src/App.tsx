import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ProviderRegistration from "./pages/ProviderRegistration";
import Login from "./pages/Login";
import CandidatesDashboard from "./pages/CandidatesDashboard";
import ExperiencesAnalysisDashboard from "./pages/ExperiencesAnalysisDashboard";
import CandidateRegistration from "./pages/CandidatesRegistration";
import AdminRegistration from "./pages/AdminRegistration";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/provider-registration" element={<ProviderRegistration />} />
          <Route path="/login" element={<Login />} />
          <Route path="/candidates-dashboard" element={<CandidatesDashboard />} />
          <Route path="/experiences-analysis" element={<ExperiencesAnalysisDashboard />} />
           <Route path="/candidate-registration" element={<CandidateRegistration />} />
          <Route path="/admin-registration" element={<AdminRegistration />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
