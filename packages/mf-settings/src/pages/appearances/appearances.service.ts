import { getProfile, updateProfile } from "../profile/profile.service";

export type Theme = "light" | "dark" | "system";

export const getTheme = () =>
  getProfile().then((res) => ({
    ...res,
    data: { theme: (res.data.theme ?? "system") as Theme },
  }));

export const updateTheme = async (theme: Theme): Promise<void> => {
  const { data: profile } = await getProfile();
  await updateProfile({
    firstName: profile.firstName ?? "",
    lastName: profile.lastName ?? "",
    theme,
  });
};
