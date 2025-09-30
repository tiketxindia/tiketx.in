import React from "react";

interface UploadDocsModalProps {
  open: boolean;
  onClose: () => void;
  onUpload: (file: File) => void;
}

const UploadDocsModal: React.FC<UploadDocsModalProps> = ({ open, onClose, onUpload }) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Upload Required Documents</h2>
        <input
          type="file"
          ref={fileInputRef}
          className="mb-6 w-full border border-gray-300 rounded-lg px-4 py-2"
          onChange={e => {
            if (e.target.files && e.target.files[0]) {
              onUpload(e.target.files[0]);
            }
          }}
        />
        <button
          className="w-full px-4 py-2 bg-gradient-to-r from-tiketx-blue to-tiketx-violet rounded-xl font-semibold text-white transition-all duration-200 hover:scale-105 shadow-lg"
          onClick={() => {
            if (fileInputRef.current && fileInputRef.current.files && fileInputRef.current.files[0]) {
              onUpload(fileInputRef.current.files[0]);
            }
          }}
        >
          Upload
        </button>
      </div>
    </div>
  );
};

export default UploadDocsModal;
