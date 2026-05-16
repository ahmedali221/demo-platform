export type UserStore = {
  email: string;
  role: string;
  userId: string;
  isActive: boolean;

  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | string | null;
  initAuth: () => Promise<void>;
  login: (userData: loginCredentials) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (email: string, otp: string, newPassword: string) => Promise<void>;
};

export interface loginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}
