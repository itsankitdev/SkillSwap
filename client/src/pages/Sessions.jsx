import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, ExternalLink, CheckCircle } from 'lucide-react';
import api from '../api/axios';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';
import useAuth from '../hooks/useAuth';
import RateModal from '../components/common/RateModal';

const STATUS_CONFIG = {
  proposed:  { color: 'bg-amber-50 text-amber-700 border-amber-200',  label: '⏳ Pending'   },
  confirmed: { color: 'bg-green-50 text-green-700 border-green-200',  label: '✅ Confirmed'  },
  rejected:  { color: 'bg-red-50 text-red-600 border-red-200',        label: '❌ Rejected'   },
  completed: { color: 'bg-blue-50 text-blue-700 border-blue-200',     label: '🏆 Completed'  },
  cancelled: { color: 'bg-gray-50 text-gray-500 border-gray-200',     label: '🚫 Cancelled'  },
};

const Sessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('upcoming');
  const [ratedSessions, setRatedSessions] = useState(new Set());
  const [rateModal, setRateModal] = useState({
    open: false,
    session: null,
    revieweeId: null,
    revieweeName: '',
  });

  const { user } = useAuth();

  useEffect(() => {
    const statusMap = {
      upcoming:  'confirmed',
      pending:   'proposed',
      completed: 'completed',
    };

    const fetchSessions = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(
          `/sessions${statusMap[tab] ? `?status=${statusMap[tab]}` : ''}`
        );
        const fetchedSessions = data.data.sessions || [];
        setSessions(fetchedSessions);

        if (tab === 'completed') {
          const ratedSet = new Set();
          await Promise.all(
            fetchedSessions.map(async (s) => {
              try {
                const res = await api.get(`/ratings/session/${s._id}`);
                if (res.data.data.hasRated) ratedSet.add(s._id);
              } catch { /* ignore */ }
            })
          );
          setRatedSessions(ratedSet);
        } else {
          setRatedSessions(new Set());
        }
      } catch {
        toast.error('Failed to load sessions');
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [tab]);

  const handleComplete = async (sessionId) => {
    try {
      await api.put(`/sessions/${sessionId}`, { status: 'completed' });
      toast.success('Session marked complete! 🏆');
      setSessions(prev => prev.filter(s => s._id !== sessionId));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const isUpcoming = (session) => new Date(session.scheduledAt) > new Date();

  const timeUntil = (date) => {
    const diff = new Date(date) - new Date();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    if (days > 0) return `in ${days} day${days > 1 ? 's' : ''}`;
    if (hours > 0) return `in ${hours} hour${hours > 1 ? 's' : ''}`;
    return 'starting soon!';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Sessions</h1>
        <p className="text-gray-500 mt-1">Track your scheduled learning sessions</p>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-100 rounded-2xl p-1.5 w-fit mb-8 gap-1">
        {[
          { val: 'upcoming',  label: '📅 Upcoming' },
          { val: 'pending',   label: '⏳ Pending'  },
          { val: 'completed', label: '🏆 Done'     },
        ].map(({ val, label }) => (
          <button key={val} onClick={() => setTab(val)}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
              tab === val ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {loading ? <Loader /> : sessions.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
          <Calendar size={40} className="text-gray-200 mx-auto mb-4" />
          <p className="font-semibold text-gray-600 mb-1">No sessions found</p>
          <p className="text-sm text-gray-400 mb-4">Go to your chats and schedule a session</p>
          <Link to="/chat"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors">
            Go to Messages
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {sessions.map((session) => {
            const cfg = STATUS_CONFIG[session.status] || STATUS_CONFIG.proposed;
            const upcoming = isUpcoming(session);
            const formattedDate = new Date(session.scheduledAt).toLocaleString('en-IN', {
              weekday: 'long', day: 'numeric', month: 'long',
              hour: '2-digit', minute: '2-digit',
            });

            return (
              <div key={session._id}
                className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all">

                {/* Top */}
                <div className="flex justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-gray-800">{session.title}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      with {session.participants
                        ?.filter(p => p._id !== user._id)
                        ?.map(p => p.name)
                        ?.join(', ') || 'Partner'}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-xs px-2.5 py-1 rounded-lg border font-semibold ${cfg.color}`}>
                      {cfg.label}
                    </span>
                    {upcoming && session.status === 'confirmed' && (
                      <span className="text-xs text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg font-medium">
                        🔔 {timeUntil(session.scheduledAt)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Meta */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-indigo-400" /> {formattedDate}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} className="text-indigo-400" /> {session.duration} mins
                  </div>
                </div>

                {/* Notes */}
                {session.notes && (
                  <p className="text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-xl mb-4 italic">
                    📝 {session.notes}
                  </p>
                )}

                {/* Actions */}
                <div className="flex gap-3 flex-wrap items-center">
                  {session.meetingLink && (
                    <a href={session.meetingLink} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
                      Join Meeting <ExternalLink size={13} />
                    </a>
                  )}

                  {session.status === 'confirmed' && (
                    <button onClick={() => handleComplete(session._id)}
                      className="flex items-center gap-1.5 bg-green-50 hover:bg-green-100 text-green-700 text-sm font-semibold px-4 py-2 rounded-xl transition-colors border border-green-100">
                      <CheckCircle size={14} /> Mark Complete
                    </button>
                  )}

                  {/* Rate button — with onClick wired up */}
                  {session.status === 'completed' && !ratedSessions.has(session._id) && (
                    <button
                      onClick={() => {
                        const reviewee = session.participants
                          ?.find(p => p._id !== user._id);
                        setRateModal({
                          open: true,
                          session,
                          revieweeId: reviewee?._id,
                          revieweeName: reviewee?.name,
                        });
                      }}
                      className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 text-sm font-semibold px-4 py-2 rounded-xl transition-colors border border-amber-100">
                      ⭐ Rate Session
                    </button>
                  )}

                  {session.status === 'completed' && ratedSessions.has(session._id) && (
                    <span className="text-xs text-green-600 font-medium bg-green-50 px-3 py-1.5 rounded-lg border border-green-100">
                      ✅ Rated
                    </span>
                  )}

                  <Link
                    to={`/chat/${session.conversation?._id || session.conversation}`}
                    className="text-sm text-indigo-600 hover:underline font-medium">
                    Open Chat →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Rate Modal */}
      <RateModal
        isOpen={rateModal.open}
        onClose={() => setRateModal({ open: false, session: null, revieweeId: null, revieweeName: '' })}
        session={rateModal.session}
        revieweeId={rateModal.revieweeId}
        revieweeName={rateModal.revieweeName}
        onRated={() => {
          setRatedSessions(prev => new Set([...prev, rateModal.session._id]));
        }}
      />
    </div>
  );
};

export default Sessions;