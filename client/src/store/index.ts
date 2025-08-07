// store/index.js
import { configureStore } from '@reduxjs/toolkit';
import uploadReducer from './uploadSlice';

export const store = configureStore({
  reducer: {
    upload: uploadReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['upload/addUpload', 'upload/updateProgress'],
        ignoredPaths: ['upload.uploads'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;