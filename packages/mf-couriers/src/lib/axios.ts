import axios from "axios";
import i18n from "./i18n";
import { attachAuthInterceptor } from "@ops-brain/shared";

export const api = axios.create({
  baseURL: process.env.BASEURL,
  withCredentials: true,
  headers: {
    "Accept-Language": i18n.language || "ar",
  },
});

attachAuthInterceptor(api);
