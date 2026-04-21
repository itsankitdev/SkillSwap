import { useState } from 'react';
import useAuth from '../hooks/useAuth';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { getInitials } from '../utils/helpers';
import { User, MapPin, FileText, Zap, Save } from 'lucide-react';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user.name || '',
    bio: user.bio || '',
    city: user.location?.city || '',
    state: user.location?.state || '',
    country: user.location?.country || '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.put(`/users/${user._id}`, {
        name: form.name,
        bio: form.bio,
        location: { city: form.city, state: form.state, country: form.country },
      });
      updateUser(data.data.user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Profile</h1>
        <p className="text-gray-500 mt-1">Manage your public profile and preferences</p>
      </div>

      {/* Profile card */}
      <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-3xl p-6 mb-6 text-white shadow-xl shadow-indigo-200">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 text-white text-2xl font-bold flex items-center justify-center backdrop-blur-sm border border-white/30">
            {getInitials(user.name)}
          </div>
          <div>
            <h2 className="text-xl font-bold">{user.name}</h2>
            <p className="text-indigo-200 text-sm">{user.email}</p>
            <div className="flex items-center gap-1.5 mt-2 bg-white/20 w-fit px-3 py-1 rounded-lg backdrop-blur-sm">
              <Zap size={13} fill="white" />
              <span className="text-sm font-bold">{user.credits} credits</span>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">

        {/* Section: Personal */}
        <div className="p-6 border-b border-gray-50">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-4">
            <User size={15} className="text-indigo-500" />
            Personal Info
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Full Name</label>
              <input
                name="name" value={form.name} onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <FileText size={12} className="text-gray-400" />
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Bio</label>
              </div>
              <textarea
                name="bio" value={form.bio} onChange={handleChange}
                rows={3} maxLength={300}
                placeholder="Tell the community about yourself, your expertise, and what you love teaching..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition-all resize-none"
              />
              <p className="text-xs text-gray-400 text-right mt-1">{form.bio.length}/300</p>
            </div>

            {/* Location */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <MapPin size={12} className="text-gray-400" />
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Location</label>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { name: 'city', placeholder: 'City' },
                  { name: 'state', placeholder: 'State' },
                  { name: 'country', placeholder: 'Country' },
                ].map(({ name, placeholder }) => (
                  <input
                    key={name} name={name} value={form[name]}
                    onChange={handleChange} placeholder={placeholder}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition-all"
                  />
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button type="submit" disabled={loading}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-indigo-200">
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                ) : (
                  <><Save size={16} /> Save Changes</>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 divide-x divide-gray-50">
          {[
            { label: 'Credits', value: user.credits, emoji: '⚡' },
            { label: 'Teaching', value: user.teachTags?.length ?? 0, emoji: '🎓' },
            { label: 'Learning', value: user.learnTags?.length ?? 0, emoji: '📚' },
          ].map(({ label, value, emoji }) => (
            <div key={label} className="p-5 text-center">
              <p className="text-xs text-gray-400 mb-1">{emoji} {label}</p>
              <p className="text-2xl font-bold text-gray-800">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;