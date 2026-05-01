import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, Trash2 } from 'lucide-react';
import api from '../api/axios';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';

const TYPE_ICONS = {
  swap_request:      '🔄',
  request_accepted:  '✅',
  request_rejected:  '❌',
  request_completed: '🏆',
  new_message:       '💬',
  session_proposed:  '📅',
  session_confirmed: '✅',
  session_rejected:  '❌',
  new_rating:        '⭐',
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/notifications?limit=50')
      .then(({ data }) => setNotifications(data.data.notifications))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  const handleClick = async (notif) => {
    if (!notif.isRead) {
      await api.put(`/notifications/${notif._id}/read`);
      setNotifications(prev =>
        prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n)
      );
    }
    navigate(notif.link);
  };

  const markAllRead = async () => {
    await api.put('/notifications/read-all');
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    toast.success('All marked as read');
  };

  const clearAll = async () => {
    await api.delete('/notifications/clear-all');
    setNotifications([]);
    toast.success('Cleared');
  };

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date);
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (mins > 0) return `${mins} minute${mins > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  const unread = notifications.filter(n => !n.isRead).length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Notifications</h1>
          <p className="text-gray-500 mt-1">
            {unread > 0 ? `${unread} unread` : 'All caught up!'}
          </p>
        </div>
        {notifications.length > 0 && (
          <div className="flex gap-2">
            {unread > 0 && (
              <button onClick={markAllRead}
                className="flex items-center gap-1.5 text-sm text-green-600 font-semibold bg-green-50 hover:bg-green-100 px-3 py-2 rounded-xl transition-colors border border-green-100">
                <Check size={14} /> Mark all read
              </button>
            )}
            <button onClick={clearAll}
              className="flex items-center gap-1.5 text-sm text-red-500 font-semibold bg-red-50 hover:bg-red-100 px-3 py-2 rounded-xl transition-colors border border-red-100">
              <Trash2 size={14} /> Clear all
            </button>
          </div>
        )}
      </div>

      {loading ? <Loader /> : notifications.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200">
          <Bell size={44} className="text-gray-200 mx-auto mb-4" />
          <p className="font-semibold text-gray-600 mb-1">No notifications yet</p>
          <p className="text-sm text-gray-400">
            You'll see updates here when people interact with you
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          {notifications.map((notif, idx) => (
            <button
              key={notif._id}
              onClick={() => handleClick(notif)}
              className={`w-full flex items-start gap-4 p-5 hover:bg-gray-50 transition-colors text-left ${
                idx !== notifications.length - 1 ? 'border-b border-gray-50' : ''
              } ${!notif.isRead ? 'bg-indigo-50/40' : ''}`}
            >
              {/* Icon */}
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 ${
                !notif.isRead ? 'bg-indigo-100' : 'bg-gray-100'
              }`}>
                {TYPE_ICONS[notif.type] || '🔔'}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${!notif.isRead ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                  {notif.title}
                </p>
                <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">
                  {notif.message}
                </p>
                <p className="text-xs text-gray-400 mt-1.5">{timeAgo(notif.createdAt)}</p>
              </div>

              {/* Unread dot */}
              {!notif.isRead && (
                <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full shrink-0 mt-2" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;