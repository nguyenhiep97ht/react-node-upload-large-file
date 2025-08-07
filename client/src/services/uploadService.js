// services/uploadService.js
import { store } from '../store';
import {
  addUpload,
  updateProgress,
  completeUpload,
  pauseUpload,
  resumeUpload,
  errorUpload,
  cancelUpload
} from '../store/uploadSlice';
import Worker from '../workers/uploadWorker.js?worker';

class UploadService {
  constructor() {
    this.worker = null;
    this.initWorker();
  }
  
  initWorker() {
    this.worker = new Worker();
    this.worker.onmessage = (e) => {
      const { type, payload } = e.data;
      
      switch (type) {
        case 'UPLOAD_PROGRESS':
          store.dispatch(updateProgress(payload));
          break;
          
        case 'UPLOAD_COMPLETE':
          store.dispatch(completeUpload(payload));
          break;
          
        case 'UPLOAD_ERROR':
          store.dispatch(errorUpload(payload));
          break;
          
        case 'UPLOAD_PAUSED':
          store.dispatch(pauseUpload(payload));
          break;
          
        case 'UPLOAD_RESUMED':
          store.dispatch(resumeUpload(payload));
          break;
          
        case 'UPLOAD_CANCELLED':
          store.dispatch(cancelUpload(payload));
          break;
      }
    };
    
    this.worker.onerror = (error) => {
      console.error('Upload worker error:', error);
    };
  }
  
  uploadFile(file, options = {}) {
    const id = this.generateId();
    const endpoint = options.endpoint || 'http://localhost:3001/api/uploads';
    const metadata = options.metadata || {};
    // Add to Redux store
    store.dispatch(addUpload({ file, id }));
    
    // Start upload in worker
    this.worker.postMessage({
      type: 'START_UPLOAD',
      payload: {
        file,
        id,
        endpoint,
        metadata
      }
    });
    
    return id;
  }
  
  uploadFiles(files, options = {}) {
    return files.map(file => this.uploadFile(file, options));
  }
  
  pauseUpload(id) {
    this.worker.postMessage({
      type: 'PAUSE_UPLOAD',
      payload: { id }
    });
  }
  
  resumeUpload(id) {
    this.worker.postMessage({
      type: 'RESUME_UPLOAD',
      payload: { id }
    });
  }
  
  cancelUpload(id) {
    this.worker.postMessage({
      type: 'CANCEL_UPLOAD',
      payload: { id }
    });
  }
  
  generateId() {
    return `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  destroy() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }
}

export default new UploadService();