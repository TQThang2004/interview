import { apiFetch, jsonOrThrow } from './apiClient';

export const uploadApi = {
  uploadImage: async (imageFile) => {
    const formData = new FormData();
    formData.append('file', imageFile);
    const res = await apiFetch('/upload', { method: 'POST', body: formData });
    return jsonOrThrow(res);
  },
};
