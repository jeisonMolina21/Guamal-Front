import { persistentMap } from '@nanostores/persistent';

export type ReservationState = {
  checkInDate: string;
  checkOutDate: string;
  guestsCount: string;
  selectedPropertyId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
};

// We use persistentMap to keep the state across page navigations and reloads via localStorage
export const reservationStore = persistentMap<ReservationState>(
  'reservationState:',
  {
    checkInDate: '',
    checkOutDate: '',
    guestsCount: '2',
    selectedPropertyId: '',
    guestName: '',
    guestEmail: '',
    guestPhone: '',
  }
);
