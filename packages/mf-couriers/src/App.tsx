import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import CouriersPage from "./pages/CouriersPage";
import "./lib/i18n";
import CourierProfile from "./pages/CouriersProfile";
import AddCourierPage from "./pages/AddCourierPage";
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/couriers" element={<CouriersPage />} />
        <Route path="/couriers/add" element={<AddCourierPage />} />
        <Route path="/couriers/:id" element={<CourierProfile />} />
      </Routes>
    </BrowserRouter>
  );
}
