import { createSlice } from '@reduxjs/toolkit';

interface GuestbookState {
  guestbookModal: boolean;
}

const initialState: GuestbookState = {
  guestbookModal: false,
};

const guestbookSlice = createSlice({
  name: 'guestbook',
  initialState,
  reducers: {
    showGuestbookModal: (state) => {
      state.guestbookModal = !state.guestbookModal;
    },
  },
});

export const { showGuestbookModal } = guestbookSlice.actions;

export default guestbookSlice.reducer;
