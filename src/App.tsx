import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
// import { GoogleOAuthProvider } from '@react-oauth/google';
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import UpgradePlan from "./pages/UpgradePlan";
import ResumeBuildPage from "./pages/resueme-build-page";
import { AuthProvider } from "@/context/AuthProvider";
import ProtectedRoute from "@/components/ProtectedRoute";
import PaymentSuccess from './pages/PaymentSuccess';

//  legal action pages
import Terms from "@/pages/legal/Terms";
import Privacy from "@/pages/legal/Privacy";
import Cookies from "@/pages/legal/Cookies";
import Refund from "@/pages/legal/Refund";
import Disclaimer from "@/pages/legal/Disclaimer";
import Copyright from "@/pages/legal/Copyright";
import Contact from "@/pages/legal/Contact";


const queryClient = new QueryClient();

// Replace with your actual Google OAuth Client ID
// const GOOGLE_CLIENT_ID = "529151627099-peoj2151c7o5m86tfifs8sdc96bv2gan.apps.googleusercontent.com";

const App = () => (
  // <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider> 
        <BrowserRouter>
          <Routes>
            <Route path="/legal/terms" element={<Terms />} />
            <Route path="/legal/privacy" element={<Privacy />} />
            <Route path="/legal/cookies" element={<Cookies />} />
            <Route path="/legal/refund" element={<Refund />} />
            <Route path="/legal/disclaimer" element={<Disclaimer />} />
            <Route path="/legal/copyright" element={<Copyright />} />
            <Route path="/legal/contact" element={<Contact />} />
            <Route path="/upgrade" element={<UpgradePlan />} />
            <Route path="/" element={<Index />} />
            <Route path="/buildresume" element={
              <ProtectedRoute>
                <ResumeBuildPage />
              </ProtectedRoute>} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  //  </GoogleOAuthProvider>
);


export default App;
