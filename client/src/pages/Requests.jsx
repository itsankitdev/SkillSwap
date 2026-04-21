import { useEffect, useState } from 'react';
import api from '../api/axios';
import Loader from '../components/common/Loader';
import useAuth from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { formatDate } from '../utils/helpers';
import { ArrowLeftRight, Clock, CheckCircle, XCircle, Ban, Trophy } from 'lucide-react';

const STATUS_CONFIG = {
  pending:   { color: 'bg-amber-50 text-amber-700 border-amber-200',   icon: <Clock size={11} />,        label: 'Pending'   },
  accepted:  { color: 'bg-blue-50 text-blue-700 border-blue-200',      icon: <CheckCircle size={11} />,  label: 'Accepted'  },
  rejected:  { color: 'bg-red-50 text-red-600 border-red-200',         icon: <XCircle size={11} />,      label: 'Rejected'  },
  completed: { color: 'bg-green-50 text-green-700 border-green-200',   icon: <Trophy size={11} />,       label: 'Completed' },
  cancelled: { color: 'bg-gray-50 text-gray-500 border-gray-200',      icon: <Ban size={11} />,          label: 'Cancelled' },
};

const Requests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [actionLoading, setActionLoading] = useState(null);
  const { user, fetchMe } = useAuth();

  const fetchRequests = async () => {
    try {
      const role = tab === 'all' ? '' : tab;
      const { data } = await api.get(`/requests${role ? `?role=${role}` : ''}`);
      setRequests(data.data.requests);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { setLoading(true); fetchRequests(); }, [tab]);

  const handleAction = async (id, status) => {
    setActionLoading(id + status);
    try {
      await api.put(`/requests/${id}`, { status });
      toast.success(`Request ${status} successfully`);
      await fetchMe();
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  const tabs = [
    { val: 'all', label: 'All Requests' },
    { val: 'received', label: 'Received' },
    { val: 'sent', label: 'Sent' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Swap Requests</h1>
        <p className="text-gray-500 mt-1">Manage your skill exchange requests</p>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-100 rounded-2xl p-1.5 w-fit mb-8 gap-1">
        {tabs.map(({ val, label }) => (
          <button key={val} onClick={() => setTab(val)}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
              tab === val
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {loading ? <Loader /> : requests.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
          <ArrowLeftRight size={36} className="text-gray-200 mx-auto mb-4" />
          <p className="font-semibold text-gray-600 mb-1">No requests yet</p>
          <p className="text-sm text-gray-400">Browse skills and send your first swap request</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {requests.map((req) => {
            const cfg = STATUS_CONFIG[req.status];
            const isMyReceived = req.receiver?._id === user._id;
            const isMySent = req.sender?._id === user._id;

            return (
              <div key={req._id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-all duration-200">

                {/* Top row */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border ${cfg.color}`}>
                      {cfg.icon} {cfg.label}
                    </span>
                    <span className="text-xs text-gray-400">{formatDate(req.createdAt)}</span>
                  </div>
                  <span className="flex items-center gap-1 text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg shrink-0">
                    ⚡ {req.creditAmount} credits
                  </span>
                </div>

                {/* Skill swap visual */}
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  <div className="bg-green-50 text-green-700 text-sm font-semibold px-3 py-1.5 rounded-xl border border-green-100">
                    🎓 {req.offeredSkill?.title}
                  </div>
                  <ArrowLeftRight size={14} className="text-gray-400 shrink-0" />
                  <div className="bg-amber-50 text-amber-700 text-sm font-semibold px-3 py-1.5 rounded-xl border border-amber-100">
                    📚 {req.wantedSkill?.title}
                  </div>
                </div>

                {/* Users */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="font-medium text-gray-700">{req.sender?.name}</span>
                    <span>→</span>
                    <span className="font-medium text-gray-700">{req.receiver?.name}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-wrap">
                    {req.status === 'pending' && isMyReceived && (
                      <>
                        <button
                          onClick={() => handleAction(req._id, 'accepted')}
                          disabled={actionLoading === req._id + 'accepted'}
                          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-xs rounded-xl font-semibold transition-colors disabled:opacity-60 shadow-sm">
                          {actionLoading === req._id + 'accepted' ? '...' : '✓ Accept'}
                        </button>
                        <button
                          onClick={() => handleAction(req._id, 'rejected')}
                          disabled={actionLoading === req._id + 'rejected'}
                          className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs rounded-xl font-semibold transition-colors disabled:opacity-60 border border-red-100">
                          {actionLoading === req._id + 'rejected' ? '...' : '✕ Reject'}
                        </button>
                      </>
                    )}
                    {req.status === 'accepted' && isMyReceived && (
                      <button
                        onClick={() => handleAction(req._id, 'completed')}
                        disabled={actionLoading === req._id + 'completed'}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs rounded-xl font-semibold transition-colors disabled:opacity-60 shadow-sm">
                        {actionLoading === req._id + 'completed' ? '...' : '🏆 Mark Complete'}
                      </button>
                    )}
                    {req.status === 'pending' && isMySent && (
                      <button
                        onClick={() => handleAction(req._id, 'cancelled')}
                        disabled={actionLoading === req._id + 'cancelled'}
                        className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs rounded-xl font-semibold transition-colors disabled:opacity-60 border border-gray-200">
                        {actionLoading === req._id + 'cancelled' ? '...' : 'Cancel'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Message */}
                {req.message && (
                  <div className="mt-3 pt-3 border-t border-gray-50">
                    <p className="text-xs text-gray-400 italic">"{req.message}"</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Requests;