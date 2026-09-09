import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import bookingReducer from "../features/booking/bookingSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    booking: bookingReducer,
  },
});

store.subscribe(() => {
  const data = store.getState().booking;
  localStorage.setItem("sidebooking_services", JSON.stringify(data.services));
  localStorage.setItem("sidebooking_bookings", JSON.stringify(data.bookings));
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
