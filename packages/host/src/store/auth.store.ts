import { login as loginRequest, logout, forgotPassword as forgotPasswordRequest, resetPassword as resetPasswordRequest, refreshSession } from "../api/auth.service";
import { applyUserPreferences } from "../api/preferences.service";
import { loginCredentials, UserStore } from "src/types/auth";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      email: "",
      role: "",
      userId: "",
      isAuthenticated: false,
      isActive: false,
      isLoading: true,
      error: null,

      initAuth: async () => {
        set({ isLoading: true });
        try {
          await refreshSession();
          set({
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          applyUserPreferences();
        } catch {
          set({
            email: "",
            role: "",
            userId: "",
            isActive: false,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      login: async (userData: loginCredentials) => {
        try {
          set({ error: null });

          if (userData.rememberMe !== undefined) {
            localStorage.setItem("auth-remember-me", userData.rememberMe.toString());
          }

          const data = await loginRequest(userData);

          set({
            email: data.email,
            role: data.role,
            userId: data.userId,
            isActive: data.isActive,
            isAuthenticated: true,
            error: null,
          });
          applyUserPreferences();
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Login failed";

          set({
            email: "",
            role: "",
            userId: "",
            isActive: false,
            isAuthenticated: false,
            error: errorMessage,
          });

          throw new Error(errorMessage);
        }
      },

      resetPassword: async (email: string, otp: string, newPassword: string) => {
        try {
          set({ error: null });
          await resetPasswordRequest(email, otp, newPassword);
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "resetPassword.error";
          set({ error: errorMessage });
          throw new Error(errorMessage);
        }
      },

      forgotPassword: async (email: string) => {
        try {
          set({ error: null });
          await forgotPasswordRequest(email);
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "forgotPassword.error";
          set({ error: errorMessage });
          throw new Error(errorMessage);
        }
      },

      logout: async () => {
        try {
          set({ error: null });

          set({
            email: "",
            role: "",
            userId: "",
            isActive: false,
            isAuthenticated: false,
            error: null,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Login failed";

          throw new Error(errorMessage);
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => 
        localStorage.getItem("auth-remember-me") === "true" ? localStorage : sessionStorage
      ),
      partialize: (state) => ({
        email: state.email,
        role: state.role,
        userId: state.userId,
        isActive: state.isActive,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
