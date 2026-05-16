import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import DataImportPage from "./pages/DataImportPage";
import ImportLogsPage from "./pages/ImportLogsPage";
import "./index.css";
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/data-import" element={<DataImportPage />} />
        <Route path="/import-logs" element={<ImportLogsPage />} />
        <Route path="/" element={<Navigate to="/data-import" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
