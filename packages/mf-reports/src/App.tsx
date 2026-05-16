import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ReportsPage from "./pages/ReportsPage";
import AddReportPage from "./pages/AddReportPage";

const App: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/reports"     element={<ReportsPage />} />
      <Route path="/reports/add" element={<AddReportPage />} />
      <Route path="*"            element={<Navigate to="/reports" replace />} />
    </Routes>
  </BrowserRouter>
);

export default App;
