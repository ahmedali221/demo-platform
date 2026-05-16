import api from "../../shared/axios";

export interface ProfileResponse {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  jobTitle: string | null;
  department: string | null;
  bio: string | null;
  profilePhotoUrl: string | null;
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  theme: string;
}

export interface UpdateProfilePayload {
  firstName: string;
  lastName: string;
  phoneNumber?: string | null;
  jobTitle?: string | null;
  department?: string | null;
  bio?: string | null;
  profilePhotoUrl?: string | null;
  language?: string | null;
  timezone?: string | null;
  dateFormat?: string | null;
  timeFormat?: string | null;
  theme?: string | null;
}

export const getProfile = () =>
  api.get<ProfileResponse>("/identity/users/me/profile");

export const updateProfile = (data: UpdateProfilePayload) =>
  api.put<void>("/identity/users/me/profile", data);

export const uploadFile = (file: File) => {
  const form = new FormData();
  form.append("file", file);
  return api.post<{ blobName: string; signedUrl: string }>("/files/upload", form);
};

export const getSignedUrl = (blobName: string) =>
  api.get<{ url: string }>(`/files/signed-url?blobName=${encodeURIComponent(blobName)}`);
