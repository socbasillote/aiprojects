import { Navigate, Route, Routes } from "react-router-dom";

import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import DashboardPage from "../pages/DashboardPage";
import NewAssessmentPage from "../pages/NewAssessmentPage";

import AssessmentsPage from "../pages/AssessmentsPage";
import QuestionBankPage from "../pages/QuestionBankPage";
import TemplatesPage from "../pages/TemplatesPage";

import AssessmentEditorPage from "../pages/AssessmentEditorPage";

import AssessmentPreviewPage from "../pages/AssessmentPreviewPage";

//import PaperDesignerPage from "../pages/PaperDesignerPage";

import PaperDesigner from "../features/paper/components/PaperDesigner";

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

      <Route
        path="/assessments/:assessmentId/editor"
        element={<AssessmentEditorPage />}
      />

      <Route
        path="/assessments/:assessmentId/paper"
        element={<PaperDesigner />}
      />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
