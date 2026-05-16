import api from "../../shared/axios";

export interface Role {
  id: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string | null;
  descriptionEn: string | null;
  isSystem: boolean;
  isActive: boolean;
  permissionKeys: string[];
}

export interface TeamMember {
  id: string;
  email: string;
  roleId: string;
  roleName: string;
  firstName: string | null;
  lastName: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface CreateUserPayload {
  email: string;
  password: string;
  roleId: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}

export interface EditUserPayload {
  roleId: string;
}

export const getUsers = () => api.get<TeamMember[]>("/identity/users");

export const getRoles = () => api.get<Role[]>("/identity/roles");

export const createUser = (data: CreateUserPayload) =>
  api.post<{ id: string }>("/identity/users", data);

export const editUser = (id: string, data: EditUserPayload) =>
  api.put(`/identity/users/${id}/role`, data);

export const deactivateUser = (id: string) =>
  api.put(`/identity/users/${id}/deactivate`);

export const activateUser = (id: string) =>
  api.put(`/identity/users/${id}/activate`);
