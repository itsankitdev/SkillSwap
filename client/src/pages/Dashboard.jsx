import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, ArrowRight, BookOpen, GraduationCap, CheckCircle } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import api from '../api/axios';
import SkillCard from '../components/common/SkillCard';
import Loader from '../components/common/Loader';

const Dashboard = () => {
  const { user } = useAuth();
  const [mySkills, setMySkills] = useState([]);
  const [credits, setCredits] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [skillsRes, creditsRes] = await Promise.all([
        api.get(`/skills/user/${user._id}`),
        api.get('/credits/balance'),
      ]);
      setMySkills(skillsRes.data.data.skills);
      setCredits(creditsRes.data.data.credits);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user._id]);

  // Refresh after delete
  const refreshSkills = async () => {
    const [skillsRes, creditsRes] = await Promise.all([
      api.get(`/skills/user/${user._id}`),
      api.get('/credits/balance'),
    ]);
    setMySkills(skillsRes.data.data.skills);
    setCredits(creditsRes.data.data.credits);
  };

  if (loading) return <Loader />;

  const teachSkills   = mySkills.filter((s) => s.type === 'teach' && s.isActive && !s.isLearned);
  const learnSkills   = mySkills.filter((s) => s.type === 'learn' && s.isActive && !s.isLearned);
  const learnedSkills = mySkills.filter((s) => s.isLearned === true);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">

      {/* Welcome */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Hey, {user.name.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-500 mt-1">Here's your SkillSwap overview</p>
        </div>
        <Link
          to="/skills/create"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
        >
          <PlusCircle size={16} /> Add Skill
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Credits',  value: credits ?? user.credits, icon: '⚡', color: 'text-indigo-600 bg-indigo-50'  },
          { label: 'Teaching', value: teachSkills.length,      icon: '🎓', color: 'text-green-600 bg-green-50'    },
          { label: 'Learning', value: learnSkills.length,      icon: '📚', color: 'text-amber-600 bg-amber-50'    },
          { label: 'Learned',  value: learnedSkills.length,    icon: '✅', color: 'text-purple-600 bg-purple-50'  },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center text-lg mb-3`}>
              {icon}
            </div>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid md:grid-cols-2 gap-4 mb-10">
        <Link
          to="/matches"
          className="flex items-center justify-between bg-indigo-600 text-white rounded-2xl p-5 hover:bg-indigo-700 transition-colors"
        >
          <div>
            <p className="font-semibold text-lg">Find Matches</p>
            <p className="text-indigo-200 text-sm mt-1">See who you can swap with</p>
          </div>
          <ArrowRight size={22} />
        </Link>
        <Link
          to="/requests"
          className="flex items-center justify-between bg-white border border-gray-100 shadow-sm rounded-2xl p-5 hover:border-indigo-200 transition-colors"
        >
          <div>
            <p className="font-semibold text-lg text-gray-800">My Requests</p>
            <p className="text-gray-500 text-sm mt-1">View sent & received swaps</p>
          </div>
          <ArrowRight size={22} className="text-gray-400" />
        </Link>
      </div>

      {/* Empty state */}
      {mySkills.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
          <p className="text-gray-400 mb-4">No skills listed yet</p>
          <Link to="/skills/create" className="text-indigo-600 font-medium hover:underline">
            + Add your first skill
          </Link>
        </div>
      )}

      {/* Teaching Skills */}
      {teachSkills.length > 0 && (
        <div className="mb-8">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
            <GraduationCap size={18} className="text-green-600" />
            Skills I'm Teaching
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {teachSkills.map((skill) => (
              <SkillCard
                key={skill._id}
                skill={skill}
                showActions={true}       
                onDeleted={refreshSkills} 
              />
            ))}
          </div>
        </div>
      )}

      {/* Learning Skills */}
      {learnSkills.length > 0 && (
        <div className="mb-8">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
            <BookOpen size={18} className="text-amber-600" />
            Skills I Want to Learn
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {learnSkills.map((skill) => (
              <SkillCard
                key={skill._id}
                skill={skill}
                showActions={true}      
                onDeleted={refreshSkills} 
              />
            ))}
          </div>
        </div>
      )}

      {/* Learned Skills — no actions, already completed */}
      {learnedSkills.length > 0 && (
        <div className="mb-8">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
            <CheckCircle size={18} className="text-purple-600" />
            Skills I've Learned 🏆
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {learnedSkills.map((skill) => (
              <SkillCard
                key={skill._id}
                skill={skill}
                showActions={false}  
              />
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;