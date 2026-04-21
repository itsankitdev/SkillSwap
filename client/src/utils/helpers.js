export const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

export const getInitials = (name = '') =>
  name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

export const getCategoryColor = (category) => {
  const map = {
    Technology: 'bg-blue-100 text-blue-700',
    Design: 'bg-purple-100 text-purple-700',
    Music: 'bg-pink-100 text-pink-700',
    Language: 'bg-yellow-100 text-yellow-700',
    Cooking: 'bg-orange-100 text-orange-700',
    Fitness: 'bg-green-100 text-green-700',
    Business: 'bg-indigo-100 text-indigo-700',
    'Arts & Crafts': 'bg-rose-100 text-rose-700',
    Academic: 'bg-teal-100 text-teal-700',
    Other: 'bg-gray-100 text-gray-700',
  };
  return map[category] || map.Other;
};

export const getLevelColor = (level) => {
  const map = {
    Beginner: 'bg-emerald-100 text-emerald-700',
    Intermediate: 'bg-amber-100 text-amber-700',
    Advanced: 'bg-red-100 text-red-700',
  };
  return map[level] || '';
};