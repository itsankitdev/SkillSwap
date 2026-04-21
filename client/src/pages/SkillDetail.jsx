import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  MapPin, Zap, Tag, BarChart2,
  ArrowLeft, Send, User as UserIcon
} from 'lucide-react';
import api from '../api/axios';
import useAuth from '../hooks/useAuth';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';
import { getCategoryColor, getLevelColor, getInitials, formatDate } from '../utils/helpers';

const SkillDetail = () => {
  const { id } = useParams();
  const { user, fetchMe } = useAuth();
  const navigate = useNavigate();

  const hasFetched = useRef(false);

  const [skill, setSkill] = useState(null);
  const [mySkills, setMySkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestForm, setRequestForm] = useState({ offeredSkill: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {

    if (hasFetched.current) return; // ← skip if already fetched
    hasFetched.current = true;

    const fetchData = async () => {
      try {
        const skillRes = await api.get(`/skills/${id}`);
        setSkill(skillRes.data.data.skill);

        // If logged in, fetch my skills so I can pick one to offer
        if (user) {
          const myRes = await api.get(`/skills/user/${user._id}`);
          // Only my TEACH skills can be offered
          setMySkills(myRes.data.data.skills.filter((s) => s.type === 'teach'));
        }
      } catch {
        toast.error('Skill not found');
        navigate('/skills');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, user]);

  const handleRequest = async (e) => {
    e.preventDefault();

    if (!requestForm.offeredSkill) {
      toast.error('Please select a skill to offer');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/requests', {
        receiver: skill.user._id,
        offeredSkill: requestForm.offeredSkill,
        wantedSkill: skill._id,
        message: requestForm.message,
      });
      toast.success('Swap request sent! 🎉');

      await fetchMe(); 
      setShowRequestForm(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader fullScreen />;
  if (!skill) return null;

  const isOwner = user?._id === skill.user?._id;
  const canRequest = user && !isOwner;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 text-sm mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="grid md:grid-cols-3 gap-6">

        {/* ── Main Content ── */}
        <div className="md:col-span-2 flex flex-col gap-5">

          {/* Header Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getCategoryColor(skill.category)}`}>
                {skill.category}
              </span>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getLevelColor(skill.level)}`}>
                {skill.level}
              </span>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                skill.type === 'teach'
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'bg-amber-50 text-amber-600'
              }`}>
                {skill.type === 'teach' ? '🎓 Teaching' : '📚 Learning'}
              </span>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-3">{skill.title}</h1>
            <p className="text-gray-600 leading-relaxed">{skill.description}</p>

            {/* Tags */}
            {skill.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {skill.tags.map((tag) => (
                  <span key={tag} className="flex items-center gap-1 text-xs bg-gray-50 text-gray-500 px-2.5 py-1 rounded-md">
                    <Tag size={10} /> {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <BarChart2 size={15} /> Activity
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Views', value: skill.stats?.views ?? 0 },
                { label: 'Requests', value: skill.stats?.requestCount ?? 0 },
                { label: 'Completed', value: skill.stats?.completedSwaps ?? 0 },
              ].map(({ label, value }) => (
                <div key={label} className="text-center">
                  <p className="text-2xl font-bold text-indigo-600">{value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Swap Request Form */}
          {canRequest && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              {!showRequestForm ? (
                <div className="text-center">
                  <p className="text-gray-500 text-sm mb-4">
                    Interested in this skill? Send a swap request.
                  </p>
                  <button
                    onClick={() => {
                      if (!user) { navigate('/login'); return; }
                      if (mySkills.length === 0) {
                        toast.error('You need at least one teaching skill to send a request');
                        navigate('/skills/create');
                        return;
                      }
                      setShowRequestForm(true);
                    }}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors mx-auto"
                  >
                    <Send size={16} /> Request Swap · ⚡ {skill.creditCost} credits
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRequest} className="flex flex-col gap-4">
                  <h3 className="font-semibold text-gray-800">Send Swap Request</h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Skill you'll offer in return
                    </label>
                    <select
                      value={requestForm.offeredSkill}
                      onChange={(e) => setRequestForm({ ...requestForm, offeredSkill: e.target.value })}
                      required
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
                    >
                      <option value="">Select one of your skills...</option>
                      {mySkills.map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.title} ({s.category})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Message (optional)
                    </label>
                    <textarea
                      value={requestForm.message}
                      onChange={(e) => setRequestForm({ ...requestForm, message: e.target.value })}
                      rows={3}
                      placeholder="Introduce yourself and explain what you'd like to learn..."
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
                    />
                  </div>

                  {/* Credit warning */}
                  <div className="bg-amber-50 border border-amber-100 rounded-lg px-4 py-3 text-sm text-amber-700">
                    ⚡ This will deduct <strong>{skill.creditCost} credits</strong> from your balance.
                    You currently have <strong>{user.credits} credits</strong>.
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit" disabled={submitting}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl transition-colors"
                    >
                      {submitting ? 'Sending...' : 'Send Request'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowRequestForm(false)}
                      className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:border-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Owner actions */}
          {isOwner && (
            <div className="bg-indigo-50 rounded-2xl border border-indigo-100 p-5 text-center">
              <p className="text-sm text-indigo-700 font-medium mb-3">This is your skill listing</p>
              <Link
                to="/dashboard"
                className="text-sm text-indigo-600 hover:underline font-medium"
              >
                Manage in Dashboard →
              </Link>
            </div>
          )}

          {/* Not logged in CTA */}
          {!user && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
              <p className="text-gray-500 mb-4">Log in to request this skill</p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors"
              >
                Login to Request
              </Link>
            </div>
          )}
        </div>

        {/* ── Sidebar: Owner Info ── */}
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <UserIcon size={15} /> About the User
            </h3>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 font-bold flex items-center justify-center text-lg">
                {skill.user?.avatar
                  ? <img src={skill.user.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
                  : getInitials(skill.user?.name)
                }
              </div>
              <div>
                <p className="font-semibold text-gray-800">{skill.user?.name}</p>
                {skill.user?.location?.city && (
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                    <MapPin size={10} /> {skill.user.location.city}
                  </p>
                )}
              </div>
            </div>

            {skill.user?.bio && (
              <p className="text-sm text-gray-500 leading-relaxed">{skill.user.bio}</p>
            )}

            <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between text-sm">
              <span className="text-gray-400">Credits</span>
              <span className="font-semibold text-indigo-600">⚡ {skill.user?.credits}</span>
            </div>

            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-gray-400">Listed</span>
              <span className="text-gray-600">{formatDate(skill.createdAt)}</span>
            </div>
          </div>

          {/* Cost summary */}
          {skill.type === 'teach' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Swap Cost</span>
              <span className="font-bold text-xl text-indigo-600 flex items-center gap-1">
                <Zap size={16} fill="currentColor" />
                {skill.creditCost}
              </span>
            </div>
            <p className="text-xs text-gray-400">credits will be held when you send the request</p>
          </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SkillDetail;