import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SiteLayout } from "@/components/SiteLayout";
import Index from "./pages/Index.tsx";
import About from "./pages/About.tsx";
import Apply from "./pages/Apply.tsx";
import Status from "./pages/Status.tsx";
import Documents from "./pages/Documents.tsx";
import FAQs from "./pages/FAQs.tsx";
import Express from "./pages/Express.tsx";
import Payment from "./pages/Payment.tsx";
import PaymentReturn from "./pages/PaymentReturn.tsx";
import Terms from "./pages/Terms.tsx";
import Privacy from "./pages/Privacy.tsx";
import Refund from "./pages/Refund.tsx";
import VisaCountry from "./pages/VisaCountry.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SiteLayout>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/apply" element={<Index />} />
            <Route path="/apply/start" element={<Apply />} />
            <Route path="/express" element={<Express />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/payment/return" element={<PaymentReturn />} />
            <Route path="/status" element={<Status />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/faqs" element={<FAQs />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/refund" element={<Refund />} />
            <Route path="/visa/:country" element={<VisaCountry />} />
            <Route path="/application" element={<Navigate to="/apply" replace />} />
            <Route path="/application_status" element={<Navigate to="/status" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SiteLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </HelmetProvider>
);

export default App;
