import { Trash2, X } from 'lucide-react';

const DeleteModal = ({ isOpen, onConfirm, onCancel, skillTitle, loading }) => {
  if (!isOpen) return null;

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
      onClick={onCancel}
    >
      {/* Modal */}
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 animate-in"
        onClick={(e) => e.stopPropagation()} // prevent backdrop click closing
      >
        {/* Icon */}
        <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-red-100">
          <Trash2 size={24} className="text-red-500" />
        </div>

        {/* Text */}
        <div className="text-center mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Delete Skill?
          </h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            Are you sure you want to delete{' '}
            <span className="font-semibold text-gray-700">"{skillTitle}"</span>?
            <br />
            This action cannot be undone.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-3 rounded-2xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-3 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-semibold text-sm transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-red-200"
          >
            {loading ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Deleting...</>
            ) : (
              <><Trash2 size={15} /> Delete</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;