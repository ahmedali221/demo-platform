import React from "react";
import { Navigate } from "react-router-dom";
import { useUserStore } from "../store/auth.store";
type Props = {
  children: React.ReactNode;
};

export default function GuestRoute({ children }: Props) {
  const { isAuthenticated } = useUserStore();

  return !isAuthenticated ? (
    <>{children}</>
  ) : (
    // Redirect authenticated users to dashboard or home page
    <Navigate to="/dashboard" replace />
  );
}
