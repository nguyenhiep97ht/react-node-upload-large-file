import { Provider } from 'react-redux';
import { store } from './store';
import FileUploader from './components/FileUploader';

const App = () => {
  return (
    <Provider store={store}>
      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">
                  Upload Manager
                </h1>
                <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Powered by Tus.js
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h2 className="text-lg font-medium text-gray-900 mb-2">
                Upload File Lớn với Resumable Upload
              </h2>
              <p className="text-gray-600">
                Hệ thống upload file mạnh mẽ hỗ trợ pause/resume, tương tự Google Drive. 
                Sử dụng Tus protocol để đảm bảo upload ổn định và có thể tiếp tục khi gián đoạn.
              </p>
            </div>
            
            <FileUploader />
            
            {/* Features */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Resumable Upload
                </h3>
                <p className="text-gray-600 text-sm">
                  Upload có thể pause/resume và tự động tiếp tục khi mất kết nối
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Background Processing
                </h3>
                <p className="text-gray-600 text-sm">
                  Sử dụng Web Worker để upload không block UI thread
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Real-time Progress
                </h3>
                <p className="text-gray-600 text-sm">
                  Hiển thị tiến độ, tốc độ và thời gian còn lại real-time
                </p>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="text-center text-gray-500 text-sm">
              <p>© 2025 Upload Manager - Tích hợp React.js, Tus.js, Redux & Web Workers</p>
              <p className="mt-1">
                Hỗ trợ upload file lớn với khả năng pause/resume tương tự Google Drive
              </p>
            </div>
          </div>
        </footer>
      </div>
    </Provider>
  );
};

export default App;