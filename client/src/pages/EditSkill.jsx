import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { GraduationCap, BookOpen, Zap, Tag, Sparkles } from 'lucide-react';

const CATEGORIES = [
  { label: 'Technology', emoji: '💻' },
  { label: 'Design', emoji: '🎨' },
  { label: 'Music', emoji: '🎵' },
  { label: 'Language', emoji: '🌍' },
  { label: 'Cooking', emoji: '🍳' },
  { label: 'Fitness', emoji: '💪' },
  { label: 'Business', emoji: '💼' },
  { label: 'Arts & Crafts', emoji: '✂️' },
  { label: 'Academic', emoji: '📖' },
  { label: 'Other', emoji: '🌟' },
];

const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

const LEVEL_INFO = {
  Beginner:     { color: 'bg-emerald-50 border-emerald-200 text-emerald-700', dot: 'bg-emerald-400' },
  Intermediate: { color: 'bg-amber-50 border-amber-200 text-amber-700',       dot: 'bg-amber-400'   },
  Advanced:     { color: 'bg-red-50 border-red-200 text-red-700',             dot: 'bg-red-400'     },
};

const EditSkill = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [form, setForm] = useState({
    title: '', description: '', category: '',
    type: 'teach', level: 'Beginner', creditCost: 3, tags: '',
  });

  // Load existing skill data
  useEffect(() => {
    const fetchSkill = async () => {
      try {
        const { data } = await api.get(`/skills/${id}`);
        const s = data.data.skill;
        setForm({
          title: s.title || '',
          description: s.description || '',
          category: s.category || '',
          type: s.type || 'teach',
          level: s.level || 'Beginner',
          creditCost: s.creditCost || 3,
          tags: s.tags?.join(', ') || '',
        });
      } catch {
        toast.error('Skill not found');
        navigate('/dashboard');
      } finally {
        setFetching(false);
      }
    };
    fetchSkill();
  }, [id]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.category) { toast.error('Please select a category'); return; }
    setLoading(true);
    try {
      await api.put(`/skills/${id}`, {
        ...form,
        creditCost: form.type === 'learn' ? 0 : Number(form.creditCost),
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      });
      toast.success('Skill updated successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update skill');
    } finally {
      setLoading(false);
    }
  };

  const isTeach = form.type === 'teach';

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 py-10 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-indigo-600 font-medium text-sm mb-3">
            <Sparkles size={14} /> Edit Skill
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Update your skill
          </h1>
          <p className="text-gray-500 mt-2">Make changes to your listing</p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">

          {/* Type Toggle — locked, can't change type on edit */}
          <div className="p-6 pb-0">
            <div className="grid grid-cols-2 gap-3 p-1.5 bg-gray-50 rounded-2xl">
              {[
                { val: 'teach', icon: <GraduationCap size={18} />, label: 'I want to Teach', sub: 'Earn credits' },
                { val: 'learn', icon: <BookOpen size={18} />,      label: 'I want to Learn', sub: 'Spend credits' },
              ].map(({ val, icon, label, sub }) => (
                <button
                  key={val} type="button"
                  onClick={() => setForm({ ...form, type: val })}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                    form.type === val
                      ? val === 'teach'
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                        : 'bg-amber-500 text-white shadow-lg shadow-amber-200'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <span className={`p-1.5 rounded-lg ${
                    form.type === val ? 'bg-white/20' : 'bg-gray-100'
                  }`}>
                    {icon}
                  </span>
                  <div className="text-left">
                    <p className="font-semibold text-sm leading-none">{label}</p>
                    <p className={`text-xs mt-0.5 ${
                      form.type === val ? 'text-white/70' : 'text-gray-400'
                    }`}>{sub}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Skill Title <span className="text-red-400">*</span>
              </label>
              <input
                name="title" value={form.title}
                onChange={handleChange} required
                placeholder={isTeach ? 'e.g. React for Beginners' : 'e.g. Want to learn Guitar'}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition-all"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Description <span className="text-red-400">*</span>
              </label>
              <textarea
                name="description" value={form.description}
                onChange={handleChange} required rows={4}
                placeholder="Describe the skill..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition-all resize-none"
              />
              <p className="text-xs text-gray-400 mt-1 text-right">
                {form.description.length}/500
              </p>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-5 gap-2">
                {CATEGORIES.map(({ label, emoji }) => (
                  <button
                    key={label} type="button"
                    onClick={() => setForm({ ...form, category: label })}
                    title={label}
                    className={`flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl border text-xs font-medium transition-all duration-150 ${
                      form.category === label
                        ? 'border-indigo-400 bg-indigo-50 text-indigo-700 shadow-sm'
                        : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-xl">{emoji}</span>
                    <span className="leading-tight text-center" style={{ fontSize: '10px' }}>
                      {label.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>
              {form.category && (
                <p className="text-xs text-indigo-600 mt-2 font-medium">
                  ✓ {form.category} selected
                </p>
              )}
            </div>

            {/* Level */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {isTeach ? 'Your Level' : 'Your Current Level'}
              </label>
              <div className="flex gap-2">
                {LEVELS.map((lvl) => {
                  const info = LEVEL_INFO[lvl];
                  return (
                    <button
                      key={lvl} type="button"
                      onClick={() => setForm({ ...form, level: lvl })}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-sm font-medium transition-all ${
                        form.level === lvl
                          ? info.color + ' shadow-sm'
                          : 'border-gray-100 bg-gray-50 text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${
                        form.level === lvl ? info.dot : 'bg-gray-300'
                      }`} />
                      {lvl}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Credit Cost — only for teach */}
            {isTeach && (
              <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-100">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <label className="text-sm font-semibold text-indigo-800">Credit Cost</label>
                    <p className="text-xs text-indigo-500 mt-0.5">How many credits per session</p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-1.5 rounded-lg">
                    <Zap size={14} fill="currentColor" />
                    <span className="font-bold text-lg leading-none">{form.creditCost}</span>
                  </div>
                </div>
                <input
                  type="range" name="creditCost"
                  min="1" max="20" value={form.creditCost}
                  onChange={handleChange}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex justify-between text-xs text-indigo-400 mt-1.5">
                  <span>1 credit · casual</span>
                  <span>20 credits · expert</span>
                </div>
              </div>
            )}

            {/* Tags */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Tag size={13} /> Tags
                  <span className="text-gray-400 font-normal text-xs">(comma separated, optional)</span>
                </span>
              </label>
              <input
                name="tags" value={form.tags}
                onChange={handleChange}
                placeholder="react, javascript, frontend"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition-all"
              />
              {form.tags && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {form.tags.split(',').map(t => t.trim()).filter(Boolean).map((tag) => (
                    <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-gray-100" />

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="flex-1 py-3.5 rounded-2xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit" disabled={loading}
                className={`flex-1 flex items-center justify-center gap-2 font-semibold py-3.5 rounded-2xl transition-all duration-200 text-white shadow-lg disabled:opacity-60 ${
                  isTeach
                    ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
                    : 'bg-amber-500 hover:bg-amber-600 shadow-amber-200'
                }`}
              >
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                ) : (
                  <>{isTeach ? <GraduationCap size={18} /> : <BookOpen size={18} />} Save Changes</>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default EditSkill;