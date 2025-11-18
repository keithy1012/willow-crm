import React from "react";

interface SuccessModalProps {
  message: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function SuccessModal({
  message,
  isOpen,
  onClose,
}: SuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>

        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 flex items-center justify-center bg-green-100 text-green-600 rounded-full text-2xl">
            ✓
          </div>
        </div>

        <h2 className="text-lg font-semibold text-gray-900 text-center mb-2">
          Success
        </h2>

        <p className="text-sm text-gray-700 text-center mb-6">{message}</p>

        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition"
        >
          Close
        </button>
      </div>
    </div>
  );
}
