import axios from "axios";
import { attachAuthInterceptor } from "@ops-brain/shared";

export const api = axios.create({
  baseURL: process.env.BASEURL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const lang = localStorage.getItem('language');
  if (lang) config.headers['Accept-Language'] = lang;
  return config;
});

attachAuthInterceptor(api);
