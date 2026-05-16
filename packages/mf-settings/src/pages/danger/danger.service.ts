import api from "../../shared/axios";

export const deactivateAccount = () =>
  api.post("/me/deactivate");

export const deleteAccount = () =>
  api.delete("/me");
