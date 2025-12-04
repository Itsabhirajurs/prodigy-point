import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { StudentProvider } from "@/context/StudentContext";
import { AppLayout } from "@/components/layout/AppLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import OverallPerformance from "./pages/OverallPerformance";
import AttendanceInsight from "./pages/insights/AttendanceInsight";
import AssignmentInsight from "./pages/insights/AssignmentInsight";
import QuizInsight from "./pages/insights/QuizInsight";
import StressInsight from "./pages/insights/StressInsight";
import Recommendations from "./pages/Recommendations";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <StudentProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/overall-performance" element={<OverallPerformance />} />
              <Route path="/insights/attendance" element={<AttendanceInsight />} />
              <Route path="/insights/assignments" element={<AssignmentInsight />} />
              <Route path="/insights/quizzes" element={<QuizInsight />} />
              <Route path="/insights/stress" element={<StressInsight />} />
              <Route path="/recommendations" element={<Recommendations />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </StudentProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
