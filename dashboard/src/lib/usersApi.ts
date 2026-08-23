import { apiClient } from "./apiClient";

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await apiClient.put("/users/change-password", { currentPassword, newPassword });
}
