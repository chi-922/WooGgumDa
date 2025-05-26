import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isShuffle: false,
  isSpecial: false
};

const shuffleSlice = createSlice({
  name: 'shuffle',
  initialState,
  reducers: {
    openShuffleModal: (state) => {
      state.isShuffle = true;
    },
    closeShuffleModal: (state) => {
      state.isShuffle = false;
    },
    getSpecialIcon: (state) => {
      state.isSpecial=true;
    },
    getNormalIcon: (state) => {
        state.isSpecial=false;
    }
  },
});

export const { openShuffleModal, closeShuffleModal,getSpecialIcon,getNormalIcon } = shuffleSlice.actions;
export default shuffleSlice.reducer;
