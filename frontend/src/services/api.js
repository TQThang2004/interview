import { adminApi } from './adminApi';
import { communityApi } from './communityApi';
import { cvApi } from './cvApi';
import { interviewApi } from './interviewApi';
import { practiceApi } from './practiceApi';
import { profileApi } from './profileApi';
import { uploadApi } from './uploadApi';

export { adminApi, communityApi, cvApi, interviewApi, practiceApi, profileApi, uploadApi };

export const api = {
  ...interviewApi,
  ...cvApi,
  ...adminApi,
  ...communityApi,
  ...uploadApi,
  ...profileApi,
  ...practiceApi,
};
