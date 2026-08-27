import { Navigate, Route, Routes } from "react-router-dom";

import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import DashboardPage from "../pages/DashboardPage";
import NewAssessmentPage from "../pages/NewAssessmentPage";

import AssessmentsPage from "../pages/AssessmentsPage";
import QuestionBankPage from "../pages/QuestionBankPage";
import TemplatesPage from "../pages/TemplatesPage";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route path="/dashboard" element={<DashboardPage />} />

      <Route path="/assessments/new" element={<NewAssessmentPage />} />

      <Route path="/assessments" element={<AssessmentsPage />} />
      <Route path="/question-bank" element={<QuestionBankPage />} />
      <Route path="/templates" element={<TemplatesPage />} />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
