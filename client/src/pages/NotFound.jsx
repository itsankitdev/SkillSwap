import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';

const NotFound = () => (
  <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
    <p className="text-8xl font-black text-indigo-100 mb-2">404</p>
    <h1 className="text-2xl font-bold text-gray-800 mb-2">Page not found</h1>
    <p className="text-gray-500 mb-8">The page you're looking for doesn't exist.</p>
    <Link
      to="/"
      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
    >
      <Zap size={16} fill="currentColor" /> Back to SkillSwap
    </Link>
  </div>
);

export default NotFound;