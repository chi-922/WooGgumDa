import { createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import axios from 'axios';
import { SignupForm, SignupResponseData } from './signupTypes';

export const checkUsername = createAsyncThunk(
  'signup/checkUsername',
  async (username: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/auth/check-username/${username}`);

      return response.data.message;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const checkNickname = createAsyncThunk(
  'signup/checkNickname',
  async (nickname: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/auth/check-nickname/${nickname}`);

      return response.data.message;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const signupUser = createAsyncThunk<
  SignupResponseData,
  SignupForm, // 보내는 형식
  { rejectValue: string }
>('signup/signupUser', async (credentials, { rejectWithValue }) => {
  try {
    const response = await axios.post<SignupResponseData>(
      '/api/auth/register',
      credentials
    );

    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    return rejectWithValue(
      axiosError.response?.data?.message ?? '회원가입 실패'
    );
  }
});
