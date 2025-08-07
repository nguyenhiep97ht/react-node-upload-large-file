import React, { useCallback, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Upload, X, Play, Pause, RotateCcw, CheckCircle, AlertCircle } from 'lucide-react';
import uploadService from '../services/uploadService';
import { removeUpload, clearCompletedUploads, UPLOAD_STATUS } from '../store/uploadSlice';

const FileUploader = () => {
  const [dragActive, setDragActive] = useState(false);
  const uploads = useSelector(state => state.upload.uploads);
  const totalProgress = useSelector(state => state.upload.totalProgress);
  const isUploading = useSelector(state => state.upload.isUploading);
  const dispatch = useDispatch();

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      uploadService.uploadFiles(files);
    }
  }, []);

  const handleFileSelect = useCallback((e) => {
    if (e.target.files && e.target.files[0]) {
      const files = Array.from(e.target.files);
      uploadService.uploadFiles(files);
    }
  }, []);

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case UPLOAD_STATUS.COMPLETED:
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case UPLOAD_STATUS.ERROR:
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case UPLOAD_STATUS.PAUSED:
        return <Pause className="w-4 h-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case UPLOAD_STATUS.COMPLETED:
        return 'bg-green-500';
      case UPLOAD_STATUS.ERROR:
        return 'bg-red-500';
      case UPLOAD_STATUS.PAUSED:
        return 'bg-yellow-500';
      default:
        return 'bg-blue-500';
    }
  };

  const uploadsArray = Array.from(uploads.values());

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-lg font-medium text-gray-700 mb-2">
          Kéo thả file vào đây hoặc click để chọn
        </p>
        <p className="text-sm text-gray-500 mb-4">
          Hỗ trợ tất cả định dạng file, kích thước tối đa 5GB
        </p>
        <input
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          id="file-input"
        />
        <label
          htmlFor="file-input"
          className="bg-blue-500 text-white px-6 py-2 rounded-lg cursor-pointer hover:bg-blue-600 transition-colors"
        >
          Chọn file
        </label>
      </div>

      {/* Global Progress */}
      {isUploading && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Tổng tiến độ upload
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(totalProgress)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${totalProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Upload List */}
      {uploadsArray.length > 0 && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Danh sách upload ({uploadsArray.length})
            </h3>
            <button
              onClick={() => dispatch(clearCompletedUploads())}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Xóa file đã hoàn thành
            </button>
          </div>

          <div className="space-y-3">
            {uploadsArray.map((upload) => (
              <div
                key={upload.id}
                className="border rounded-lg p-4 bg-gray-50"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(upload.status)}
                    <div>
                      <p className="font-medium text-gray-900 truncate max-w-xs">
                        {upload.file.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatBytes(upload.file.size)}
                        {upload.speed > 0 && (
                          <span className="ml-2">
                            • {formatBytes(upload.speed)}/s
                            {upload.remainingTime > 0 && (
                              <span className="ml-2">
                                • {formatTime(upload.remainingTime)} còn lại
                              </span>
                            )}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {upload.status === UPLOAD_STATUS.UPLOADING && (
                      <button
                        onClick={() => uploadService.pauseUpload(upload.id)}
                        className="p-1 text-gray-500 hover:text-gray-700"
                      >
                        <Pause className="w-4 h-4" />
                      </button>
                    )}

                    {upload.status === UPLOAD_STATUS.PAUSED && (
                      <button
                        onClick={() => uploadService.resumeUpload(upload.id)}
                        className="p-1 text-green-500 hover:text-green-700"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                    )}

                    {upload.status === UPLOAD_STATUS.ERROR && (
                      <button
                        onClick={() => uploadService.resumeUpload(upload.id)}
                        className="p-1 text-blue-500 hover:text-blue-700"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => {
                        if (upload.status === UPLOAD_STATUS.UPLOADING) {
                          uploadService.cancelUpload(upload.id);
                        } else {
                          dispatch(removeUpload({ id: upload.id }));
                        }
                      }}
                      className="p-1 text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                {upload.status !== UPLOAD_STATUS.COMPLETED && upload.status !== UPLOAD_STATUS.CANCELLED && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>
                        {formatBytes(upload.uploadedBytes)} / {formatBytes(upload.totalBytes)}
                      </span>
                      <span>{upload.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-300 ${getStatusColor(upload.status)}`}
                        style={{ width: `${upload.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {upload.status === UPLOAD_STATUS.ERROR && upload.error && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                    Lỗi: {upload.error}
                  </div>
                )}

                {/* Success Message */}
                {upload.status === UPLOAD_STATUS.COMPLETED && upload.url && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                    <p className="text-sm text-green-700 mb-1">
                      Upload thành công!
                    </p>
                    <a
                      href={upload.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800 break-all"
                    >
                      {upload.url}
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploader;