import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./components/auth/LoginPage";
import DashboardLayout from "./components/layout/DashboardLayout";
import { DashboardOverview } from "./components/dashboard/DashboardOverview";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import NotFound from "./pages/NotFound";
import SurveyGuide from "./pages/SurveyGuide";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<LoginPage />} />
          
          {/* All authenticated routes with layout */}
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            {/* Dashboard routes */}
            <Route path="/dashboard">
              <Route index element={<DashboardOverview />} />
              <Route path="surveys" element={<div className="p-6">Surveys Page (Coming Soon)</div>} />
              <Route path="analytics" element={<div className="p-6">Analytics Page (Coming Soon)</div>} />
              <Route path="responses" element={<div className="p-6">Responses Page (Coming Soon)</div>} />
              <Route path="audience" element={<div className="p-6">Audience Page (Coming Soon)</div>} />
              <Route path="templates" element={<div className="p-6">Templates Page (Coming Soon)</div>} />
              <Route path="help" element={<div className="p-6">Help & Support Page (Coming Soon)</div>} />
              <Route path="settings" element={<div className="p-6">Settings Page (Coming Soon)</div>} />
            </Route>
            
            {/* Guide route */}
            <Route path="/guide" element={<SurveyGuide />} />
          </Route>
          
          {/* 404 route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
