import axios from "axios";
import { api } from "../lib/axios";
import { loginCredentials } from "../types/auth";

export class ApiError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

export const login = async (userData: loginCredentials) => {
  try {
    const response = await api.post("/auth/login", userData);
    if (!response.status) {
      throw new Error("login.invalid-credentials");
    }

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(
          error.response.data?.message || "login.invalid-credentials",
        );
      }

      if (error.request) {
        throw new Error("Network or CORS error");
      }
    }

    throw error instanceof Error ? error : new Error("Login failed");
  }
};

export const getMe = async () => {
  try {
    const response = await api.get("/me");
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(error.response.data?.message || "Unauthorized");
      }
      if (error.request) {
        throw new Error("Network or CORS error");
      }
    }
    throw error instanceof Error ? error : new Error("Unauthorized");
  }
};

export const logout = async () => {
  const response = await api.post("/auth/logout");
  console.log(response);
};

export const resetPassword = async (
  email: string,
  otp: string,
  newPassword: string,
): Promise<void> => {
  try {
    await api.post("/auth/reset-password", { email, otp, newPassword });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        const code = error.response.data?.code ?? "resetPassword.error";
        const message = error.response.data?.message ?? "resetPassword.error";
        throw new ApiError(code, message);
      }
      if (error.request) {
        throw new ApiError("Network", "Network or CORS error");
      }
    }
    throw error instanceof Error ? error : new ApiError("resetPassword.error", "resetPassword.error");
  }
};

export const forgotPassword = async (email: string): Promise<void> => {
  try {
    await api.post("/auth/forgot-password", { email });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        const code = error.response.data?.code ?? "forgotPassword.error";
        const message = error.response.data?.message ?? "forgotPassword.error";
        throw new ApiError(code, message);
      }
      if (error.request) {
        throw new ApiError("Network", "Network or CORS error");
      }
    }
    throw error instanceof Error ? error : new ApiError("forgotPassword.error", "forgotPassword.error");
  }
};
