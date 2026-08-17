import { configureStore } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";

// redux-persist/lib/storage doesn't resolve in Vite ESM — use localStorage directly
const storage = {
  getItem: (key: string) => Promise.resolve(localStorage.getItem(key)),
  setItem: (key: string, value: string) => Promise.resolve(localStorage.setItem(key, value)),
  removeItem: (key: string) => Promise.resolve(localStorage.removeItem(key)),
};
import authReducer from "./slices/authSlice";
import itemsReducer from "./slices/itemsSlice";

const authPersistConfig = {
  key: "auth",
  storage,
  whitelist: ["isAuthenticated", "user"],
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const persistedAuthReducer = persistReducer(authPersistConfig, authReducer) as any;

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    items: itemsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

// Manually type RootState so auth keeps its shape despite the persist cast
type AuthState = ReturnType<typeof authReducer>;
export type RootState = { auth: AuthState; items: ReturnType<typeof itemsReducer> };
export type AppDispatch = typeof store.dispatch;
