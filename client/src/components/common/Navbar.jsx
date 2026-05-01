import { Link, useNavigate, useLocation } from "react-router-dom";
import { LogOut, PlusCircle, Zap, Menu, X } from "lucide-react";
import { useState } from "react";
import useAuth from "../../hooks/useAuth";
import { getInitials } from "../../utils/helpers";
import toast from "react-hot-toast";
import NotificationBell from "./NotificationBell";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success("Logged out");
    navigate("/login");
  };

  const navLinks = [
    { to: "/skills", label: "Browse" },
    { to: "/matches", label: "Matches" },
    { to: "/chat", label: "Messages" },
    { to: "/sessions", label: "Sessions" },
    { to: "/requests", label: "Requests" },
    { to: "/dashboard", label: "Dashboard" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 font-bold text-lg shrink-0"
        >
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
            <Zap size={16} fill="white" className="text-white" />
          </div>
          <span className="text-gray-900">
            Skill<span className="text-indigo-600">Swap</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        {user && (
          <div className="hidden md:flex items-center gap-0.5">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive(to)
                    ? "bg-indigo-50 text-indigo-600 font-semibold"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        )}

        {/* Right side */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              {/* 1. Credits */}
              <Link
                to="/credits"
                className="hidden sm:flex items-center gap-1.5 bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-2 rounded-xl hover:bg-indigo-100 transition-colors"
              >
                <Zap size={12} fill="currentColor" /> {user.credits}
              </Link>

              {/* 2. Add Skill Button */}
              <Link
                to="/skills/create"
                className="hidden sm:flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-all shadow-sm shadow-indigo-200"
              >
                <PlusCircle size={13} /> Add Skill
              </Link>

              {/* 3. Notification Bell */}
              <NotificationBell />

              {/* 4. Profile Icon */}
              <Link to="/profile">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-xs font-bold flex items-center justify-center cursor-pointer hover:shadow-md hover:shadow-indigo-200 transition-all">
                  {getInitials(user.name)}
                </div>
              </Link>

              {/* 5. Logout Button */}
              <button
                onClick={handleLogout}
                className="hidden sm:flex text-gray-400 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-50"
              >
                <LogOut size={16} />
              </button>

              {/* 6. Mobile Menu Toggle */}
              <button
                className="md:hidden p-1.5 text-gray-600"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-sm font-medium text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-xl hover:bg-gray-50 transition-all"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl transition-all shadow-sm shadow-indigo-200"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && user && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 flex flex-col gap-1 shadow-lg">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium ${
                isActive(to) ? "bg-indigo-50 text-indigo-600" : "text-gray-600"
              }`}
            >
              {label}
            </Link>
          ))}
          <Link
            to="/skills/create"
            onClick={() => setMenuOpen(false)}
            className="px-4 py-2.5 text-sm text-indigo-600 font-semibold"
          >
            + Add Skill
          </Link>
          <button
            onClick={handleLogout}
            className="px-4 py-2.5 text-sm text-red-500 font-medium text-left"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
