import { useState } from "react";
import { X, Calendar, Clock, Link, FileText, Zap } from "lucide-react";
import api from "../../api/axios";
import toast from "react-hot-toast";

const DURATIONS = [
  { label: "30 min", value: 30 },
  { label: "1 hour", value: 60 },
  { label: "1.5 hrs", value: 90 },
  { label: "2 hours", value: 120 },
];

const ScheduleModal = ({
  isOpen,
  onClose,
  conversationId,
  swapRequest,
  onScheduled,
}) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    scheduledAt: "",
    duration: 60,
    meetingLink: "",
    notes: "",
  });

  if (!isOpen) return null;

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.scheduledAt) {
      toast.error("Title and date/time are required");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post("/sessions", {
        ...form,
        conversationId,
        skillBeingTaught: swapRequest?.offeredSkill?._id || null,
      });
      toast.success("Session proposed! 📅");
      onScheduled?.(data.data.session);
      onClose();
      setForm({
        title: "",
        scheduledAt: "",
        duration: 60,
        meetingLink: "",
        notes: "",
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to propose session");
    } finally {
      setLoading(false);
    }
  };

  // Min datetime — now
  const minDateTime = new Date(Date.now() + 30 * 60 * 1000)
    .toISOString()
    .slice(0, 16);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
      style={{
        backgroundColor: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md flex flex-col"
        style={{ maxHeight: "90vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header — fixed, doesn't scroll */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Schedule a Session
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">
              Propose a time to meet
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form — scrollable */}
        <form
          onSubmit={handleSubmit}
          className="p-6 flex flex-col gap-4 overflow-y-auto"
        >
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Session Title <span className="text-red-400">*</span>
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              placeholder="e.g. React Basics - Session 1"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition-all"
            />
          </div>

          {/* Date & Time */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Calendar size={13} /> Date & Time{" "}
                <span className="text-red-400">*</span>
              </span>
            </label>
            <input
              type="datetime-local"
              name="scheduledAt"
              value={form.scheduledAt}
              onChange={handleChange}
              required
              min={minDateTime}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition-all"
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <span className="flex items-center gap-1.5">
                <Clock size={13} /> Duration
              </span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {DURATIONS.map(({ label, value }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setForm({ ...form, duration: value })}
                  className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                    form.duration === value
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                      : "bg-gray-50 text-gray-600 border-gray-100 hover:bg-gray-100"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Meeting Link */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Link size={13} /> Meeting Link
                <span className="text-gray-400 font-normal text-xs">
                  (Zoom/Meet)
                </span>
              </span>
            </label>
            <input
              name="meetingLink"
              value={form.meetingLink}
              onChange={handleChange}
              placeholder="https://zoom.us/j/..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition-all"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              <span className="flex items-center gap-1.5">
                <FileText size={13} /> Notes
                <span className="text-gray-400 font-normal text-xs">
                  (optional)
                </span>
              </span>
            </label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={2}
              placeholder="Topics to cover, prerequisites, etc."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition-all resize-none"
            />
          </div>

          {/* Buttons — sticky at bottom */}
          <div className="flex gap-3 pt-2 sticky bottom-0 bg-white pb-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-200 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{" "}
                  Proposing...
                </>
              ) : (
                <>
                  <Calendar size={15} /> Propose Session
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleModal;
