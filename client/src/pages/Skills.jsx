import { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import useSkills from '../hooks/useSkills';
import SkillCard from '../components/common/SkillCard';
import Loader from '../components/common/Loader';

const CATEGORIES = ['Technology','Design','Music','Language','Cooking','Fitness','Business','Arts & Crafts','Academic','Other'];
const CATEGORY_EMOJIS = { Technology:'💻', Design:'🎨', Music:'🎵', Language:'🌍', Cooking:'🍳', Fitness:'💪', Business:'💼', 'Arts & Crafts':'✂️', Academic:'📖', Other:'🌟' };

const Skills = () => {
  const [filters, setFilters] = useState({ type: '', category: '', level: '', search: '', page: 1 });
  const [searchInput, setSearchInput] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const { skills, pagination, loading } = useSkills(filters);

  const update = (key, val) => setFilters((f) => ({ ...f, [key]: val, page: 1 }));
  const hasActiveFilters = filters.type || filters.category || filters.level || filters.search;

  const clearAll = () => {
    setFilters({ type: '', category: '', level: '', search: '', page: 1 });
    setSearchInput('');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Browse Skills</h1>
        <p className="text-gray-500 mt-1">Discover what the community can teach and learn</p>
      </div>

      {/* Search bar */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && update('search', searchInput)}
            placeholder="Search skills, topics, or tags..."
            className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition-all bg-white shadow-sm"
          />
          {searchInput && (
            <button onClick={() => { setSearchInput(''); update('search', ''); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={15} />
            </button>
          )}
        </div>
        <button onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-3 rounded-2xl border text-sm font-medium transition-all shadow-sm ${
            showFilters || hasActiveFilters
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
          }`}>
          <SlidersHorizontal size={15} />
          Filters
          {hasActiveFilters && <span className="bg-white text-indigo-600 text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">!</span>}
        </button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
          <div className="flex flex-col gap-5">

            {/* Type */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Type</p>
              <div className="flex gap-2">
                {[
                  { val: '', label: 'All' },
                  { val: 'teach', label: '🎓 Teaching' },
                  { val: 'learn', label: '📚 Learning' },
                ].map(({ val, label }) => (
                  <button key={val} onClick={() => update('type', val)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      filters.type === val
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Category</p>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <button key={c} onClick={() => update('category', filters.category === c ? '' : c)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      filters.category === c
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}>
                    {CATEGORY_EMOJIS[c]} {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Level */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Level</p>
              <div className="flex gap-2">
                {['Beginner', 'Intermediate', 'Advanced'].map((l) => (
                  <button key={l} onClick={() => update('level', filters.level === l ? '' : l)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      filters.level === l
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {hasActiveFilters && (
              <button onClick={clearAll}
                className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 font-medium w-fit">
                <X size={14} /> Clear all filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Results count */}
      {!loading && (
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-gray-500">
            {pagination?.total ?? 0} skill{pagination?.total !== 1 ? 's' : ''} found
            {filters.search && <span className="text-indigo-600 font-medium"> for "{filters.search}"</span>}
          </p>
        </div>
      )}

      {/* Grid */}
      {loading ? <Loader /> : (
        <>
          {skills.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200">
              <p className="text-4xl mb-4">🔍</p>
              <p className="font-semibold text-gray-600 mb-1">No skills found</p>
              <p className="text-sm text-gray-400">Try adjusting your filters or search term</p>
              {hasActiveFilters && (
                <button onClick={clearAll} className="mt-4 text-sm text-indigo-600 hover:underline font-medium">
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {skills.map((skill) => <SkillCard key={skill._id} skill={skill} />)}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                disabled={filters.page === 1}
                onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
                className="px-5 py-2.5 text-sm border border-gray-200 rounded-xl disabled:opacity-40 hover:border-indigo-300 hover:text-indigo-600 font-medium transition-all">
                ← Previous
              </button>
              <span className="text-sm text-gray-500 px-2">
                {filters.page} / {pagination.totalPages}
              </span>
              <button
                disabled={filters.page === pagination.totalPages}
                onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
                className="px-5 py-2.5 text-sm border border-gray-200 rounded-xl disabled:opacity-40 hover:border-indigo-300 hover:text-indigo-600 font-medium transition-all">
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Skills;