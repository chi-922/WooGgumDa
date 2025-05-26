import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/apis/apiClient"
import { EmotionDataResponse } from "./dashboardTypes";

// 14일 데이터 api
export const fetchFourteenDaysEmotionStats = createAsyncThunk(

    'dashboard/fetchFourteenDaysEmotionStats',
    async (_, {rejectWithValue}) => {
        try{
            const response = await api.get(`/diaries/emotions/statistics/two-weeks`)
            return response.data as EmotionDataResponse
        }catch(error){
            return rejectWithValue("14일 감정 데이터를 불러오는데 실패했습니다.");
        }
    }
);

// 30일 데이터 api
export const fetchThirtyDaysEmotionStats = createAsyncThunk(
    'dashboard/fetchThirtyDaysEmotionStats',
    async (_, {rejectWithValue}) => {
        try{
            const response = await api.get(`/diaries/emotions/statistics/month`)
            return response.data as EmotionDataResponse;
        }catch(error){
            return rejectWithValue("30일 감정 데이터를 불러오는데 실패했습니다.");
        }
    }
)


