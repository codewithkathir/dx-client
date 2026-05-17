import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface ModalState {
  activeModal: string | null;
  modalProps: Record<string, unknown>;
}

const initialState: ModalState = {
  activeModal: null,
  modalProps: {},
};

const modalSlice = createSlice({
  name: 'modal',
  initialState,
  reducers: {
    openModal: (
      state,
      action: PayloadAction<{ id: string; props?: Record<string, unknown> }>,
    ) => {
      state.activeModal = action.payload.id;
      state.modalProps = action.payload.props ?? {};
    },
    closeModal: (state) => {
      state.activeModal = null;
      state.modalProps = {};
    },
  },
});

export const { openModal, closeModal } = modalSlice.actions;
export const modalReducer = modalSlice.reducer;
