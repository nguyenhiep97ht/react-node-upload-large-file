// store/uploadSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { enableMapSet } from 'immer';

enableMapSet();

export const UPLOAD_STATUS = {
  PENDING: 'pending',
  UPLOADING: 'uploading',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  ERROR: 'error',
  CANCELLED: 'cancelled'
};

const uploadSlice = createSlice({
  name: 'upload',
  initialState: {
    uploads: new Map(), // Map<fileId, UploadItem>
    totalProgress: 0,
    isUploading: false,
  },
  reducers: {
    addUpload: (state, action) => {
      const { file, id } = action.payload;
      state.uploads.set(id, {
        id,
        file,
        progress: 0,
        status: UPLOAD_STATUS.PENDING,
        speed: 0,
        remainingTime: 0,
        error: null,
        startTime: Date.now(),
        uploadedBytes: 0,
        totalBytes: file.size,
        url: null
      });
      state.isUploading = true;
    },
    
    updateProgress: (state, action) => {
      const { id, progress, uploadedBytes, speed, remainingTime } = action.payload;
      const upload = state.uploads.get(id);
      if (upload) {
        upload.progress = progress;
        upload.uploadedBytes = uploadedBytes;
        upload.speed = speed;
        upload.remainingTime = remainingTime;
        upload.status = UPLOAD_STATUS.UPLOADING;
      }
      
      // Calculate total progress
      let totalProgress = 0;
      let activeUploads = 0;
      state.uploads.forEach(upload => {
        if (upload.status !== UPLOAD_STATUS.CANCELLED) {
          totalProgress += upload.progress;
          activeUploads++;
        }
      });
      state.totalProgress = activeUploads > 0 ? totalProgress / activeUploads : 0;
    },
    
    completeUpload: (state, action) => {
      const { id, url } = action.payload;
      const upload = state.uploads.get(id);
      if (upload) {
        upload.status = UPLOAD_STATUS.COMPLETED;
        upload.progress = 100;
        upload.url = url;
      }
      
      // Check if all uploads are complete
      const hasActiveUploads = Array.from(state.uploads.values())
        .some(upload => upload.status === UPLOAD_STATUS.UPLOADING || upload.status === UPLOAD_STATUS.PENDING);
      state.isUploading = hasActiveUploads;
    },
    
    pauseUpload: (state, action) => {
      const { id } = action.payload;
      const upload = state.uploads.get(id);
      if (upload) {
        upload.status = UPLOAD_STATUS.PAUSED;
      }
    },
    
    resumeUpload: (state, action) => {
      const { id } = action.payload;
      const upload = state.uploads.get(id);
      if (upload) {
        upload.status = UPLOAD_STATUS.UPLOADING;
      }
      state.isUploading = true;
    },
    
    errorUpload: (state, action) => {
      const { id, error } = action.payload;
      const upload = state.uploads.get(id);
      if (upload) {
        upload.status = UPLOAD_STATUS.ERROR;
        upload.error = error;
      }
    },
    
    cancelUpload: (state, action) => {
      const { id } = action.payload;
      const upload = state.uploads.get(id);
      if (upload) {
        upload.status = UPLOAD_STATUS.CANCELLED;
      }
      
      // Check if all uploads are cancelled or complete
      const hasActiveUploads = Array.from(state.uploads.values())
        .some(upload => upload.status === UPLOAD_STATUS.UPLOADING || upload.status === UPLOAD_STATUS.PENDING);
      state.isUploading = hasActiveUploads;
    },
    
    removeUpload: (state, action) => {
      const { id } = action.payload;
      state.uploads.delete(id);
    },
    
    clearCompletedUploads: (state) => {
      state.uploads.forEach((upload, id) => {
        if (upload.status === UPLOAD_STATUS.COMPLETED) {
          state.uploads.delete(id);
        }
      });
    }
  }
});

export const {
  addUpload,
  updateProgress,
  completeUpload,
  pauseUpload,
  resumeUpload,
  errorUpload,
  cancelUpload,
  removeUpload,
  clearCompletedUploads
} = uploadSlice.actions;

export default uploadSlice.reducer;