// server/server.js
const express = require('express');
const cors = require('cors');
const tus = require('@tus/server');
const { FileStore } = require('@tus/file-store');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Tạo thư mục uploads nếu chưa tồn tại
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3001'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'tus-resumable', 'upload-length', 'upload-offset', 'upload-metadata'],
  credentials: true
}));

// Tus server configuration
const tusServer = new tus.Server({
  path: '/api/uploads',
  datastore: new FileStore({
    directory: uploadsDir,
  }),
  namingFunction: (req, metadata) => {
    // Tạo tên file unique
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const originalName = metadata.filename || 'unknown';
    const ext = path.extname(originalName);
    const name = path.basename(originalName, ext);
    return `${timestamp}_${random}_${name}${ext}`;
  },
  onUploadCreate: (req, res, upload) => {
    console.log('Upload created:', upload.id);
    console.log('Metadata:', upload.metadata);
    return res;
  },
  onUploadProgress: (req, res, upload) => {
    console.log(`Upload progress: ${upload.id} - ${upload.offset}/${upload.size} bytes`);
    return res;
  },
  onUploadFinish: (req, res, upload) => {
    console.log('Upload finished:', upload.id);
    console.log('Final size:', upload.size, 'bytes');
    
    // Có thể thêm logic xử lý file sau khi upload xong
    // Ví dụ: scan virus, resize image, backup to cloud, etc.
    processUploadedFile(upload);
    
    return res;
  },
});

// Middleware để handle Tus requests
app.all('/api/uploads', tusServer.handle.bind(tusServer));
app.all('/api/uploads/*', tusServer.handle.bind(tusServer));

// API để lấy thông tin uploads
app.get('/api/uploads-info', (req, res) => {
  try {
    const files = fs.readdirSync(uploadsDir);
    const uploadInfo = files.map(filename => {
      const filePath = path.join(uploadsDir, filename);
      const stats = fs.statSync(filePath);
      return {
        filename,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        url: `/api/download/${filename}`
      };
    });
    
    res.json(uploadInfo);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get upload info' });
  }
});

// API để download file
app.get('/api/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(uploadsDir, filename);
  
  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uploadsDir: uploadsDir
  });
});

// Function to process uploaded files
async function processUploadedFile(upload) {
  try {
    const filePath = path.join(uploadsDir, upload.id);
    
    // Ví dụ: Log thông tin file
    console.log(`Processing file: ${upload.metadata?.filename || 'unknown'}`);
    console.log(`File size: ${upload.size} bytes`);
    console.log(`File type: ${upload.metadata?.filetype || 'unknown'}`);
    
    // Có thể thêm các xử lý khác:
    // - Scan virus
    // - Resize/optimize images
    // - Extract metadata
    // - Backup to cloud storage
    // - Send notification
    
  } catch (error) {
    console.error('Error processing uploaded file:', error);
  }
}

app.listen(PORT, () => {
  console.log(`🚀 Tus server is running on http://localhost:${PORT}`);
  console.log(`📁 Uploads directory: ${uploadsDir}`);
  console.log(`📋 Upload endpoint: http://localhost:${PORT}/api/uploads`);
  console.log(`💻 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;