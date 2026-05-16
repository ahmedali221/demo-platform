import axios from "axios";
import { attachAuthInterceptor } from "@ops-brain/shared";

const api = axios.create({
  baseURL: process.env.BASEURL || "http://localhost:3000/api/v1",
  withCredentials: true,
});

attachAuthInterceptor(api);

export default api;
