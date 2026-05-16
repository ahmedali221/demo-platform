import axios from "axios";
import { attachAuthInterceptor } from "@ops-brain/shared";

export const api = axios.create({
  baseURL: process.env.BASEURL,
  withCredentials: true,
});

attachAuthInterceptor(api);
