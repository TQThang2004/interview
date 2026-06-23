import { apiFetch, jsonOrThrow } from './apiClient';

export const profileApi = {
  updateProfile: async (profileData) => {
    const res = await apiFetch('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
    return jsonOrThrow(res);
  },
};
