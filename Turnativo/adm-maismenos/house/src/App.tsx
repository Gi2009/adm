import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ProviderRegistration from "./pages/ProviderRegistration";
import Login from "./pages/Login";
import CandidatesDashboard from "./components/CandidatesDashboard";
import ExperiencesAnalysisDashboard from "./components/ExperiencesAnalysisDashboard";
import CandidateRegistration from "./components/CandidatesRegistration";
import AdminRegistration from "./components/AdminRegistration";
import { Home } from "lucide-react";
import Hause from "./pages/Hause";

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
          <Route path="/hause/*" element={<Hause />} />
          
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
