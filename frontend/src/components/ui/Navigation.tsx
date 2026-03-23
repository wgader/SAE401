import { FiHome, FiPlus, FiLogOut } from 'react-icons/fi';
import logo from '../../assets/logo_sphere.svg';
import { api, BASE_URL } from '../../lib/api';
import type { User } from '../../lib/api';
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const AVATAR_BASE_URL = `${BASE_URL}/uploads/avatars/`;

export default function Navigation() {
  const [user, setUser] = useState<User | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (api.isAuthenticated()) {
      api.getMe().then(setUser).catch(() => {
        api.logout();
      });
    }
  }, []);

  const handleLogout = () => {
    api.logout();
    navigate("/login");
  };

  return (
    <>
      {/* Mobile Header */}
      <nav className="hidden md:flex flex-col w-[250px] h-screen fixed left-0 top-0 border-r border-border p-6 bg-background">
        <div className="flex items-center gap-2 mb-10 pl-2">
          {/* Sphere Logo */}
          <img src={logo} alt="Sphere Logo" className="h-8 pl-2" />
        </div>

        <ul className="flex flex-col gap-2 flex-1">
          <li>
            <Link to="/home" className="flex items-center gap-3 text-primary font-bold text-lg px-4 py-3 rounded-full hover:bg-surface-hover transition font-sf-pro">
              <FiHome className="w-6 h-6" />
              Accueil
            </Link>
          </li>

          <li>
            <button 
              onClick={() => navigate("/post")}
              className="bg-[image:var(--color-linear-gradient)] text-background font-extrabold text-lg rounded-full py-3.5 mt-4 w-full hover:opacity-90 transition shadow-lg font-druk"
            >
              ECRIRE
            </button>
          </li>
        </ul>

        {/* Profile Card */}
        <div className="flex flex-col gap-2 mt-auto">
          {user && (
            <div className="flex items-center justify-between px-2 py-3 rounded-xl hover:bg-surface-hover transition group">
              <div className="flex items-center gap-3">
                <img
                  src={`${AVATAR_BASE_URL}${user.avatar}`}
                  alt="Profile"
                  className="w-10 h-10 rounded-full bg-surface border border-border"
                />
                <div className="flex flex-col font-sf-pro text-left overflow-hidden">
                  <span className="font-bold text-sm text-text-primary whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]">
                    {user.name}
                  </span>
                  <span className="text-text-secondary text-xs mt-0.5">@{user.username}</span>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-full text-red-500 hover:bg-red-500/10 transition font-sf-pro font-bold mt-auto"
          >
            <FiLogOut className="w-5 h-5" />
            Déconnexion
          </button>
        </div>
      </nav>

      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-center h-14 w-full fixed top-0 left-0 bg-background p-4 border-b border-border z-50">
        <div className="flex items-center gap-2">
          <img src={logo} alt="Sphere Logo" className="h-6" />
        </div>
      </header>

      {/* Mobile Bottom Bar */}
      <nav className="md:hidden flex items-center justify-center h-16 w-full fixed bottom-0 left-0 bg-background/90 backdrop-blur-md z-50 border-t border-border">
        <ul className="flex justify-center flex-1 w-full">
          <li>
            <button 
              onClick={() => navigate("/post")}
              className="text-primary hover:text-primary-hover transition p-2"
            >
              <FiPlus className="w-10 h-10 pointer-events-none stroke-[3]" />
            </button>
          </li>
        </ul>
      </nav>
    </>
  );
}
