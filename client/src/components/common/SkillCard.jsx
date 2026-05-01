import { Link, useNavigate } from "react-router-dom";
import { MapPin, Zap, Pencil, Trash2 } from "lucide-react";
import {
  getCategoryColor,
  getLevelColor,
  getInitials,
} from "../../utils/helpers";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { useState } from "react";
import DeleteModal from "./DeleteModal";

const SkillCard = ({ skill, showActions = false, onDeleted }) => {
  const {
    _id,
    title,
    description,
    category,
    type,
    level,
    creditCost,
    user,
    tags,
    isLearned,
  } = skill;
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const navigate = useNavigate();

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      await api.delete(`/skills/${_id}`);
      toast.success("Skill deleted successfully");
      setShowDeleteModal(false);
      onDeleted?.();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/skills/edit/${_id}`);
  };

  return (
    <>
      {/* Delete confirmation modal */}
      <DeleteModal
        isOpen={showDeleteModal}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteModal(false)}
        skillTitle={title}
        loading={deleting}
      />

      <Link to={`/skills/${_id}`} className="block group">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-5 h-full flex flex-col gap-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex gap-2 flex-wrap">
              <span
                className={`text-xs font-medium px-2.5 py-1 rounded-full ${getCategoryColor(category)}`}
              >
                {category}
              </span>
              <span
                className={`text-xs font-medium px-2.5 py-1 rounded-full ${getLevelColor(level)}`}
              >
                {level}
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {isLearned && (
                <span className="text-xs bg-green-100 text-green-700 font-bold px-2.5 py-1 rounded-full">
                  ✅ Learned
                </span>
              )}
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  type === "teach"
                    ? "bg-indigo-50 text-indigo-600"
                    : "bg-amber-50 text-amber-600"
                }`}
              >
                {type === "teach" ? "🎓 Teaching" : "📚 Learning"}
              </span>
            </div>
          </div>

          {/* Title & Description */}
          <div>
            <h3 className="font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors line-clamp-1">
              {title}
            </h3>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
              {description}
            </p>
          </div>

          {/* Tags */}
          {tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-gray-50 text-gray-500 px-2 py-0.5 rounded-md"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-50">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold flex items-center justify-center">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                ) : (
                  getInitials(user?.name)
                )}
              </div>
              <div>
                <Link
                  to={`/user/${user?._id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-xs font-medium text-gray-700 hover:text-indigo-600 transition-colors"
                >
                  {user?.name}
                </Link>
                {user?.location?.city && (
                  <p className="text-xs text-gray-400 flex items-center gap-0.5">
                    <MapPin size={10} /> {user.location.city}
                  </p>
                )}
              </div>
            </div>

            {/* Credit cost OR action buttons */}
            {showActions ? (
              <div
                className="flex items-center gap-1.5"
                onClick={(e) => e.preventDefault()}
              >
                <button
                  onClick={handleEdit}
                  className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                  title="Edit skill"
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowDeleteModal(true); // ← open modal
                  }}
                  className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                  title="Delete skill"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ) : (
              type === "teach" && (
                <div className="flex items-center gap-1 text-indigo-600 font-semibold text-sm">
                  <Zap size={14} />
                  {creditCost} credits
                </div>
              )
            )}
          </div>
        </div>
      </Link>
    </>
  );
};

export default SkillCard;
