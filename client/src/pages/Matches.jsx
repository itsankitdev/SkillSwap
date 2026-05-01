import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  MapPin,
  Zap,
  Users,
  GraduationCap,
  BookOpen,
} from "lucide-react";
import api from "../api/axios";
import Loader from "../components/common/Loader";
import { getInitials } from "../utils/helpers";

const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/match")
      .then(({ data }) => setMatches(data.data.matches))
      .catch((err) =>
        setError(err.response?.data?.message || "Failed to load matches"),
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          Your Matches
        </h1>
        <p className="text-gray-500 mt-1">
          People whose skills are compatible with yours
        </p>
      </div>

      {/* Error state */}
      {error ? (
        <div className="text-center py-20 bg-amber-50 rounded-3xl border border-amber-100">
          <p className="text-3xl mb-3">⚠️</p>
          <p className="text-amber-700 font-medium mb-1">{error}</p>
          <Link
            to="/skills/create"
            className="text-indigo-600 font-semibold text-sm hover:underline mt-2 inline-block"
          >
            Add skills to get matches →
          </Link>
        </div>
      ) : matches.length === 0 ? (
        /* Empty state */
        <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200">
          <Users size={44} className="text-gray-200 mx-auto mb-4" />
          <p className="font-semibold text-gray-700 mb-1">
            No matches found yet
          </p>
          <p className="text-sm text-gray-400 mb-6 max-w-xs mx-auto">
            Add learning skills so we can find people who can teach you
          </p>
          <Link
            to="/skills/create"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            + Add a Skill
          </Link>
        </div>
      ) : (
        /* Match list */
        <div className="flex flex-col gap-4">
          {matches.map(
            (
              {
                user,
                score,
                isMutual,
                theirTeachSkills = [],
                theirLearnSkills = [],
              },
              idx,
            ) => (
              <div
                key={user._id}
                className={`bg-white rounded-2xl border shadow-sm p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ${
                  isMutual ? "border-green-200" : "border-gray-100"
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Rank badge */}
                  <div className="hidden sm:flex shrink-0 pt-1">
                    <span
                      className={`text-sm font-black ${
                        idx === 0
                          ? "text-amber-500"
                          : idx === 1
                            ? "text-gray-400"
                            : idx === 2
                              ? "text-amber-700"
                              : "text-gray-300"
                      }`}
                    >
                      #{idx + 1}
                    </span>
                  </div>

                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-400 to-violet-500 text-white font-bold flex items-center justify-center text-base shrink-0 shadow-sm">
                    {getInitials(user.name)}
                  </div>

                  {/* Main info */}
                  <div className="flex-1 min-w-0">
                    {/* Name + badges */}
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-bold text-gray-800">
                        <Link
                          to={`/user/${user._id}`}
                          className="hover:text-indigo-600 transition-colors"
                        >
                          {user.name}
                        </Link>
                      </h3>
                      {isMutual && (
                        <span className="text-xs bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full font-semibold border border-green-200">
                          🔄 Mutual Match
                        </span>
                      )}
                    </div>

                    {/* Location */}
                    {user.location?.city && (
                      <p className="text-xs text-gray-400 flex items-center gap-1 mb-3">
                        <MapPin size={10} /> {user.location.city}
                        {user.location.country
                          ? `, ${user.location.country}`
                          : ""}
                      </p>
                    )}

                    {/* Their teach skills — what I can learn from them */}
                    {theirTeachSkills.length > 0 && (
                      <div className="mb-2">
                        <p className="text-xs text-gray-400 flex items-center gap-1 mb-1.5">
                          <GraduationCap
                            size={11}
                            className="text-indigo-400"
                          />
                          Can teach you
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {theirTeachSkills.slice(0, 3).map((skill) => (
                            <Link
                              key={skill._id}
                              to={`/skills/${skill._id}`}
                              className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg font-medium hover:bg-indigo-100 transition-colors border border-indigo-100"
                            >
                              {skill.title}
                            </Link>
                          ))}
                          {theirTeachSkills.length > 3 && (
                            <span className="text-xs text-gray-400 px-2 py-1">
                              +{theirTeachSkills.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Their learn skills — what they want to learn from me */}
                    {theirLearnSkills.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-400 flex items-center gap-1 mb-1.5">
                          <BookOpen size={11} className="text-amber-400" />
                          Wants to learn
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {theirLearnSkills.slice(0, 3).map((skill) => (
                            <span
                              key={skill._id}
                              className="text-xs bg-amber-50 text-amber-700 px-2.5 py-1 rounded-lg font-medium border border-amber-100"
                            >
                              {skill.title}
                            </span>
                          ))}
                          {theirLearnSkills.length > 3 && (
                            <span className="text-xs text-gray-400 px-2 py-1">
                              +{theirLearnSkills.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Score + CTA */}
                  <div className="flex flex-col items-end gap-3 shrink-0">
                    <div className="flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2.5 py-1.5 rounded-xl border border-indigo-100">
                      <Zap size={11} fill="currentColor" />
                      <span className="text-xs font-bold">{score} pts</span>
                    </div>
                    {/* Link to first teach skill directly */}
                    {theirTeachSkills.length > 0 ? (
                      <Link
                        to={`/skills/${theirTeachSkills[0]._id}`}
                        className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-semibold transition-colors"
                      >
                        View Skill <ArrowRight size={12} />
                      </Link>
                    ) : (
                      <Link
                        to="/skills"
                        className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-semibold transition-colors"
                      >
                        Browse Skills <ArrowRight size={12} />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ),
          )}
        </div>
      )}
    </div>
  );
};

export default Matches;
