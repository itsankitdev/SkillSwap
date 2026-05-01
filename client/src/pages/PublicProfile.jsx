import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  MapPin, Zap, GraduationCap, BookOpen,
  ArrowLeft, Star, MessageCircle
} from 'lucide-react';
import api from '../api/axios';
import useAuth from '../hooks/useAuth';
import Loader from '../components/common/Loader';
import SkillCard from '../components/common/SkillCard';
import StarRating from '../components/common/StarRating';
import { getInitials, formatDate, getCategoryColor } from '../utils/helpers';
import toast from 'react-hot-toast';

const PublicProfile = () => {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const hasFetched = useRef(false);

  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [conversationLoading, setConversationLoading] = useState(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    // Redirect to own profile page
    if (userId === currentUser?._id) {
      navigate('/profile');
      return;
    }

    api.get(`/users/${userId}`)
      .then(({ data }) => {
        setProfile(data.data.user);
        setSkills(data.data.skills);
        setRatings(data.data.ratings);
      })
      .catch(() => {
        toast.error('User not found');
        navigate('/skills');
      })
      .finally(() => setLoading(false));
  }, [userId]);

  // Open existing conversation or navigate to chat
  const handleMessage = async () => {
    setConversationLoading(true);
    try {
      const { data } = await api.get('/chat');
      const existing = data.data.conversations.find(c =>
        c.participants.some(p => p._id === userId)
      );
      if (existing) {
        navigate(`/chat/${existing._id}`);
      } else {
        toast.error('Accept a swap request first to start chatting');
      }
    } catch {
      toast.error('Failed to open chat');
    } finally {
      setConversationLoading(false);
    }
  };

  if (loading) return <Loader fullScreen />;
  if (!profile) return null;

  const teachSkills = skills.filter(s => s.type === 'teach');
  const learnSkills = skills.filter(s => s.type === 'learn');

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">

      {/* Back button */}
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 text-sm mb-6 transition-colors">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="grid md:grid-cols-3 gap-6">

        {/* ── Sidebar ── */}
        <div className="flex flex-col gap-4">

          {/* Profile Card */}
          <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-100">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-3xl bg-white/20 text-white text-3xl font-black flex items-center justify-center backdrop-blur-sm border border-white/30 mb-4">
                {getInitials(profile.name)}
              </div>
              <h1 className="text-xl font-bold">{profile.name}</h1>
              {profile.location?.city && (
                <p className="text-indigo-200 text-sm flex items-center gap-1 mt-1">
                  <MapPin size={12} /> {profile.location.city}
                  {profile.location.country ? `, ${profile.location.country}` : ''}
                </p>
              )}

              {/* Rating */}
              {profile.ratings?.count > 0 && (
                <div className="flex items-center gap-2 mt-3 bg-white/20 px-3 py-1.5 rounded-xl">
                  <StarRating value={Math.round(profile.ratings.average)} readonly size="sm" />
                  <span className="text-sm font-bold">
                    {profile.ratings.average.toFixed(1)}
                  </span>
                  <span className="text-xs text-indigo-200">
                    ({profile.ratings.count})
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="grid grid-cols-3 divide-x divide-gray-50">
              {[
                { label: 'Teaching', value: teachSkills.length, emoji: '🎓' },
                { label: 'Learning', value: learnSkills.length, emoji: '📚' },
                { label: 'Credits',  value: profile.credits,    emoji: '⚡' },
              ].map(({ label, value, emoji }) => (
                <div key={label} className="p-4 text-center">
                  <p className="text-xs text-gray-400 mb-1">{emoji}</p>
                  <p className="text-xl font-bold text-gray-800">{value}</p>
                  <p className="text-xs text-gray-400">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                About
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">{profile.bio}</p>
            </div>
          )}

          {/* Message Button */}
          <button
            onClick={handleMessage}
            disabled={conversationLoading}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-2xl transition-all shadow-lg shadow-indigo-200 disabled:opacity-60"
          >
            {conversationLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <><MessageCircle size={16} /> Message</>
            )}
          </button>
        </div>

        {/* ── Main Content ── */}
        <div className="md:col-span-2 flex flex-col gap-6">

          {/* Teaching Skills */}
          {teachSkills.length > 0 && (
            <div>
              <h2 className="font-bold text-gray-800 flex items-center gap-2 mb-4">
                <GraduationCap size={18} className="text-green-500" />
                Can Teach
                <span className="text-xs text-gray-400 font-normal">
                  ({teachSkills.length} skill{teachSkills.length !== 1 ? 's' : ''})
                </span>
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {teachSkills.map(skill => (
                  <SkillCard key={skill._id} skill={skill} />
                ))}
              </div>
            </div>
          )}

          {/* Learning Skills */}
          {learnSkills.length > 0 && (
            <div>
              <h2 className="font-bold text-gray-800 flex items-center gap-2 mb-4">
                <BookOpen size={18} className="text-amber-500" />
                Wants to Learn
                <span className="text-xs text-gray-400 font-normal">
                  ({learnSkills.length} skill{learnSkills.length !== 1 ? 's' : ''})
                </span>
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {learnSkills.map(skill => (
                  <SkillCard key={skill._id} skill={skill} />
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {skills.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
              <p className="text-gray-400">No skills listed yet</p>
            </div>
          )}

          {/* Reviews */}
          {ratings.length > 0 && (
            <div>
              <h2 className="font-bold text-gray-800 flex items-center gap-2 mb-4">
                <Star size={18} className="text-amber-400" fill="currentColor" />
                Reviews
                <span className="text-xs text-gray-400 font-normal">
                  ({profile.ratings?.count || ratings.length} total)
                </span>
              </h2>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {ratings.map((r, idx) => (
                  <div key={r._id}
                    className={`p-5 ${idx !== ratings.length - 1 ? 'border-b border-gray-50' : ''}`}>
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-400 to-violet-500 text-white font-bold flex items-center justify-center text-sm shrink-0">
                        {r.reviewer?.name?.[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-sm text-gray-800">
                            {r.reviewer?.name}
                          </p>
                          <span className="text-xs text-gray-400">
                            {formatDate(r.createdAt)}
                          </span>
                        </div>
                        <StarRating value={r.rating} readonly size="sm" />
                        {r.review && (
                          <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">
                            "{r.review}"
                          </p>
                        )}
                        {r.skillContext && (
                          <p className="text-xs text-indigo-500 mt-1">
                            📚 {r.skillContext}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;