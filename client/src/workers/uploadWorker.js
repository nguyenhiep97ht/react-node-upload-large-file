// workers/uploadWorker.js
import * as tus from 'tus-js-client';

const uploads = new Map();

self.onmessage = function (e) {
  console.log('`worker run` :>> ', `worker run`);
  const { type, payload } = e.data;
  console.log(type);
  console.log(payload);

  switch (type) {
    case 'START_UPLOAD':
      console.log('`start upload` :>> ', `start upload`);
      startUpload(payload);
      break;
    case 'PAUSE_UPLOAD':
      pauseUpload(payload.id);
      break;
    case 'RESUME_UPLOAD':
      resumeUpload(payload.id);
      break;
    case 'CANCEL_UPLOAD':
      cancelUpload(payload.id);
      break;
  }
};

function startUpload({ file, id, endpoint, metadata = {} }) {
  const upload = new tus.Upload(file, {
    endpoint: endpoint,
    retryDelays: [0, 3000, 5000, 10000, 20000],
    metadata: {
      filename: file.name,
      filetype: file.type,
      ...metadata
    },
    chunkSize: 5 * 1024 * 1024, // 5MB chunks

    onError: function (error) {
      self.postMessage({
        type: 'UPLOAD_ERROR',
        payload: { id, error: error.message }
      });
    },

    onProgress: function (bytesUploaded, bytesTotal) {
      const progress = Math.round((bytesUploaded / bytesTotal) * 100);
      const speed = calculateSpeed(id, bytesUploaded);
      const remainingTime = calculateRemainingTime(speed, bytesTotal - bytesUploaded);

      self.postMessage({
        type: 'UPLOAD_PROGRESS',
        payload: {
          id,
          progress,
          uploadedBytes: bytesUploaded,
          totalBytes: bytesTotal,
          speed,
          remainingTime
        }
      });
    },

    onSuccess: function () {
      self.postMessage({
        type: 'UPLOAD_COMPLETE',
        payload: {
          id,
          url: upload.url
        }
      });
      uploads.delete(id);
    }
  });

  uploads.set(id, {
    upload,
    startTime: Date.now(),
    lastBytesUploaded: 0,
    lastTime: Date.now()
  });

  upload.start();
}

function pauseUpload(id) {
  const uploadData = uploads.get(id);
  if (uploadData) {
    uploadData.upload.abort();
    self.postMessage({
      type: 'UPLOAD_PAUSED',
      payload: { id }
    });
  }
}

function resumeUpload(id) {
  const uploadData = uploads.get(id);
  if (uploadData) {
    uploadData.upload.start();
    self.postMessage({
      type: 'UPLOAD_RESUMED',
      payload: { id }
    });
  }
}

function cancelUpload(id) {
  const uploadData = uploads.get(id);
  if (uploadData) {
    uploadData.upload.abort(true); // true = shouldTerminate
    uploads.delete(id);
    self.postMessage({
      type: 'UPLOAD_CANCELLED',
      payload: { id }
    });
  }
}

function calculateSpeed(id, currentBytes) {
  const uploadData = uploads.get(id);
  if (!uploadData) return 0;

  const now = Date.now();
  const timeDiff = now - uploadData.lastTime;
  const bytesDiff = currentBytes - uploadData.lastBytesUploaded;

  if (timeDiff > 1000) { // Update every second
    uploadData.lastTime = now;
    uploadData.lastBytesUploaded = currentBytes;
    return bytesDiff / (timeDiff / 1000); // bytes per second
  }

  return 0;
}

function calculateRemainingTime(speed, remainingBytes) {
  if (speed === 0) return 0;
  return Math.round(remainingBytes / speed);
}

// function formatBytes(bytes) {
//   if (bytes === 0) return '0 B';
//   const k = 1024;
//   const sizes = ['B', 'KB', 'MB', 'GB'];
//   const i = Math.floor(Math.log(bytes) / Math.log(k));
//   return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
// }

// function formatTime(seconds) {
//   if (seconds < 60) return `${seconds}s`;
//   if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
//   return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
// }