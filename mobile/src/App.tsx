import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Search from "./pages/Search";
import Profile from "./pages/Profile";
import Favorites from "./pages/Favorites";
import ManageExperiences from "./pages/ManageExperiences";
import ProviderApplication from "./pages/ProviderApplication";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import BottomNavbar from "./components/layout/BottomNavbar";
import EditProfile from "./pages/EditProfile";
import OnboardingFlow from "./pages/OnboardingFlow";
import ResetPassword from "./pages/ResetPassword";
import PurchasesPage from "./pages/Purchase";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<OnboardingFlow />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Index />
                <BottomNavbar />
              </ProtectedRoute>
            } />
            <Route path="/search" element={
              <ProtectedRoute>
                <Search />
                <BottomNavbar />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
                <BottomNavbar />
              </ProtectedRoute>
            } />
            <Route path="/favorites" element={
              <ProtectedRoute>
                <Favorites />
                <BottomNavbar />
              </ProtectedRoute>
            } />
            <Route path="/purchases" element={
              <ProtectedRoute>
                <PurchasesPage/>
                <BottomNavbar />
              </ProtectedRoute>
            } />
            <Route path="/manage-experiences" element={
              <ProtectedRoute>
                <ManageExperiences />
                <BottomNavbar />
              </ProtectedRoute>
            } />
            <Route path="/provider-application" element={
              <ProtectedRoute>
                <ProviderApplication />
                <BottomNavbar />
              </ProtectedRoute>
            } />
             <Route path="/reset-password" element={<ResetPassword />} />
             <Route path="/editprofile" element={<EditProfile />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
