import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { loginUser, logoutUser, updateToken } from './authThunks';
import { AuthState } from './authTypes';
import { toast } from 'react-toastify';

const initialState: AuthState = {
  user: JSON.parse(localStorage.getItem('User') || 'null'),
  accessToken: localStorage.getItem('accessToken') || null,
  isAuthenticated: !!localStorage.getItem('accessToken'),
  alarmExistence: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // 🔹 사용자 자기소개 업데이트
    setIntro: (state, action: PayloadAction<string>) => {
      if (state.user) {
        state.user.introduction = action.payload;
      }
    },

    // ✅ accessToken만 따로 갱신하고 싶은 경우 (예: 인터셉터에서)
    setAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
      state.isAuthenticated = true;
    },

    // ✅ 전체 상태 초기화하고 싶을 때
    clearAuth: (state) => {
      state.accessToken = null;
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('User');
    },

    changeIcon: (state, action) => {
      if (state.user) {
        state.user.iconSeq = action.payload;
      }
    },

    setAlarmTrue: (state) => {
      state.alarmExistence = true;
    },
    setAlarmFalse: (state) => {
      state.alarmExistence = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // 로그인 성공
      .addCase(loginUser.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
        state.user = action.payload.user;
      })
      .addCase(loginUser.rejected, () => {
        toast.error(
          '로그인에 실패하였습니다. 아이디나 비밀번호를 잘 확인해주세요.',
          {
            // position: 'top-right',
            autoClose: 3000,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: 'dark',
          }
        );
      })
      // 토큰 갱신 성공
      .addCase(updateToken.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken;
      })
      // 로그아웃 성공
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        localStorage.removeItem('accessToken'); // ✅ 추가
        localStorage.removeItem('User');
        localStorage.removeItem('musicSettings');
      });
  },
});

export const {
  setIntro,
  setAccessToken,
  clearAuth,
  changeIcon,
  setAlarmTrue,
  setAlarmFalse,
} = authSlice.actions;
export default authSlice.reducer;
