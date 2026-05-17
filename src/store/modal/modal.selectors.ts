import type { RootState } from '@/store';

export const selectActiveModal = (state: RootState) => state.modal.activeModal;
export const selectModalProps = (state: RootState) => state.modal.modalProps;
