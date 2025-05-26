import api from '@/apis/apiClient';
import { DreamSolveRequest } from '@/domains/diary/Types/diary.types';

export const dreamApi = {
  // 꿈해몽 생성
  createDreamMeaning: async (diarySeq: number, content: string) => {

    const requestData: DreamSolveRequest = {
      inputContent: content,
    };
    return await api.post(`/dream-meaning/${diarySeq}`, requestData);
  },

  // 꿈해몽조회
  getDreamMeaningById: async (diarySeq: number) => {
    return await api.get(`/dream-meaning/${diarySeq}`);
  },
};
