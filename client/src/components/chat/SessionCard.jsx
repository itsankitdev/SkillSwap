import { Calendar, Clock, Link as LinkIcon, ExternalLink, Check, X } from 'lucide-react'; // Renamed Link to LinkIcon
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { useState } from 'react';
import useAuth from '../../hooks/useAuth';

const STATUS_CONFIG = {
  proposed:  { color: 'bg-amber-50 border-amber-200 text-amber-700',  label: '⏳ Pending'   },
  confirmed: { color: 'bg-green-50 border-green-200 text-green-700',  label: '✅ Confirmed'  },
  rejected:  { color: 'bg-red-50 border-red-200 text-red-600',        label: '❌ Rejected'   },
  completed: { color: 'bg-blue-50 border-blue-200 text-blue-700',     label: '🏆 Completed'  },
  cancelled: { color: 'bg-gray-50 border-gray-200 text-gray-500',     label: '🚫 Cancelled'  },
};

const SessionCard = ({ session, onUpdated }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(null);

  // Safeguard against missing proposedBy object
  const isProposer = session.proposedBy?._id === user?._id ||
                     session.proposedBy === user?._id;
  
  const cfg = STATUS_CONFIG[session.status] || STATUS_CONFIG.proposed;

  const formattedDate = new Date(session.scheduledAt).toLocaleString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long',
    hour: '2-digit', minute: '2-digit',
  });

  const handleAction = async (status) => {
    setLoading(status);
    try {
      const { data } = await api.put(`/sessions/${session._id}`, { status });
      toast.success(`Session ${status}!`);
      onUpdated?.(data.data.session);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 my-2">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-bold text-gray-800 text-sm">{session.title}</h4>
          <p className="text-xs text-gray-400 mt-0.5">
            Proposed by {session.proposedBy?.name || 'User'}
          </p>
        </div>
        <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border uppercase tracking-tight ${cfg.color}`}>
          {cfg.label}
        </span>
      </div>

      {/* Details */}
      <div className="flex flex-col gap-2 mb-3">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Calendar size={13} className="text-indigo-400" />
          {formattedDate}
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Clock size={13} className="text-indigo-400" />
          {session.duration} minutes
        </div>
        
        {/* FIXED: Added missing <a> tag opening */}
        {session.meetingLink && (
          <a
            href={session.meetingLink.startsWith('http') ? session.meetingLink : `https://${session.meetingLink}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs text-indigo-600 hover:text-indigo-700 font-medium w-fit"
          >
            <LinkIcon size={13} />
            Join Meeting
            <ExternalLink size={11} />
          </a>
        )}
        
        {session.notes && (
          <p className="text-xs text-gray-500 italic bg-gray-50 px-3 py-2 rounded-lg">
            📝 {session.notes}
          </p>
        )}
      </div>

      {/* Actions */}
      {session.status === 'proposed' && (
        <div className="flex gap-2 pt-3 border-t border-gray-50">
          {!isProposer ? (
            <>
              <button
                onClick={() => handleAction('confirmed')}
                disabled={loading === 'confirmed'}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-xl transition-colors disabled:opacity-60"
              >
                {loading === 'confirmed'
                  ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><Check size={13} /> Confirm</>
                }
              </button>
              <button
                onClick={() => handleAction('rejected')}
                disabled={loading === 'rejected'}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-xl transition-colors disabled:opacity-60 border border-red-100"
              >
                {loading === 'rejected'
                  ? <div className="w-3 h-3 border-2 border-red-200 border-t-red-500 rounded-full animate-spin" />
                  : <><X size={13} /> Decline</>
                }
              </button>
            </>
          ) : (
            <button
              onClick={() => handleAction('cancelled')}
              disabled={loading === 'cancelled'}
              className="flex-1 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs font-semibold rounded-xl transition-colors border border-gray-200"
            >
              {loading === 'cancelled' ? 'Cancelling...' : 'Cancel Session'}
            </button>
          )}
        </div>
      )}

      {/* Mark complete */}
      {session.status === 'confirmed' && (
        <div className="pt-3 border-t border-gray-50">
          <button
            onClick={() => handleAction('completed')}
            disabled={loading === 'completed'}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
          >
            {loading === 'completed'
              ? 'Marking...'
              : '🏆 Mark as Completed'
            }
          </button>
        </div>
      )}
    </div>
  );
};

export default SessionCard;
