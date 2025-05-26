import { createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import api from '@/apis/apiClient';
import { UserpageState, visitResponse } from './userTypes';

// 방문하는 우주의 주인장 정보 탐색
export const visitUserpage = createAsyncThunk<
  UserpageState, // 반환타입
  { username: string },
  { rejectValue: string }
>('userpage/visit', async (credentials, { rejectWithValue }) => {
  try {
    const response = await api.get<visitResponse>(
      `/users/name/${credentials.username}`
    );

    if (response) {
      await api.post(`/diaries/relayout/${response.data.data.userSeq}`);
    }

    return response.data.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    // slice에서 실패하면 내 페이지로 이동

    return rejectWithValue(
      axiosError.response?.data?.message || '방문 정보 조회 실패'
    );
  }
});

// 블랙홀 클릭 시 다른 사람 정보 불러오기
export const visitOtherUserpage = createAsyncThunk<
  UserpageState, // 반환타입
  void, // 파라미터 없음
  { rejectValue: string }
>('userpage/visitOther', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get<visitResponse>('/users/random');

    return response.data.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    return rejectWithValue(
      axiosError.response?.data?.message || '랜덤 유저 조회 실패'
    );
  }
});
