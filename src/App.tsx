import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { StudentProvider } from "@/context/StudentContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { AdminLayout } from "@/components/layout/AdminLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import OverallPerformance from "./pages/OverallPerformance";
import AttendanceInsight from "./pages/insights/AttendanceInsight";
import AssignmentInsight from "./pages/insights/AssignmentInsight";
import QuizInsight from "./pages/insights/QuizInsight";
import StressInsight from "./pages/insights/StressInsight";
import Recommendations from "./pages/Recommendations";
import Settings from "./pages/Settings";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AllStudents from "./pages/admin/AllStudents";
import StudentDetail from "./pages/admin/StudentDetail";
import AdminSettings from "./pages/admin/AdminSettings";
import UserManagement from "./pages/admin/UserManagement";
import AllFaculty from "./pages/admin/AllFaculty";
import UpdateStudentData from "./pages/admin/UpdateStudentData";
import SyncData from "./pages/admin/SyncData";
import Messages from "./pages/Messages";
import FacultyMessages from "./pages/admin/FacultyMessages";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Simple cache helper for auth user stored in localStorage by Login.tsx
const getCachedUser = () => {
  try {
    const stored = localStorage.getItem("currentUser");
    return stored ? JSON.parse(stored) : null;
  } catch (err) {
    console.error("Failed to parse cached user", err);
    return null;
  }
};

// Redirect away from login if already authenticated
const RedirectIfAuthenticated: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = getCachedUser();

  if (user?.role === "admin" || user?.role === "faculty") {
    const target = user.role === "admin" ? "/admin/users" : "/admin/dashboard";
    return <Navigate to={target} replace />;
  }

  if (user?.role === "student") {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Protected route wrapper for students
const StudentRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = getCachedUser();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (user.role !== "student") {
    // If not student, reroute based on role
    if (user.role === "admin" || user.role === "faculty") {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Protected route wrapper for faculty/admin
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = getCachedUser();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (user.role === "admin" || user.role === "faculty") {
    return <>{children}</>;
  }

  // Students trying to access admin area go back to dashboard
  return <Navigate to="/dashboard" replace />;
};

const AppRoutes = () => (
  <Routes>
    <Route
      path="/"
      element={(
        <RedirectIfAuthenticated>
          <Login />
        </RedirectIfAuthenticated>
      )}
    />
    
    {/* Student Routes */}
    <Route element={<StudentRoute><AppLayout /></StudentRoute>}>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/overall-performance" element={<OverallPerformance />} />
      <Route path="/insights/attendance" element={<AttendanceInsight />} />
      <Route path="/insights/assignments" element={<AssignmentInsight />} />
      <Route path="/insights/quizzes" element={<QuizInsight />} />
      <Route path="/insights/stress" element={<StressInsight />} />
      <Route path="/recommendations" element={<Recommendations />} />
      <Route path="/messages" element={<Messages />} />
      <Route path="/settings" element={<Settings />} />
    </Route>

    {/* Admin/Faculty Routes */}
    <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/users" element={<UserManagement />} />
      <Route path="/admin/faculty" element={<AllFaculty />} />
      <Route path="/admin/students" element={<AllStudents />} />
      <Route path="/admin/student/:student_id" element={<StudentDetail />} />
      <Route path="/admin/update-student" element={<UpdateStudentData />} />
      <Route path="/admin/sync-data" element={<SyncData />} />
      <Route path="/admin/messages" element={<FacultyMessages />} />
      <Route path="/admin/settings" element={<AdminSettings />} />
    </Route>

    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <StudentProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </StudentProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
