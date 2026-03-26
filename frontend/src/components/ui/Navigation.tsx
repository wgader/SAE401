import { FiHome, FiPlus, FiLogOut, FiUser, FiSettings } from 'react-icons/fi';
import logo from '../../assets/logo_sphere.svg';
import { BASE_URL } from '../../lib/api';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useScrollDirection } from '../../hooks/useScrollDirection';
import { cn } from '../../lib/utils';
import { useStore } from '../../store/StoreContext';

const AVATAR_BASE_URL = `${BASE_URL}/uploads/avatars/`;

export default function Navigation() {
  const { currentUser: user, logout } = useStore();
  const { isVisible } = useScrollDirection();

  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleHomeClick = (e: React.MouseEvent) => {
    if (location.pathname === '/home') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getDesktopLinkClass = (path: string) => {
    const isActive = location.pathname.startsWith(path);
    return `flex items-center gap-3 font-bold text-lg px-4 py-3 rounded-full hover:bg-surface-hover transition font-sf-pro ${isActive ? 'text-primary' : 'text-text-primary'
      }`;
  };

  const getMobileLinkClass = (path: string) => {
    const isActive = location.pathname.startsWith(path);
    return `transition p-2 flex items-center justify-center ${isActive ? 'text-primary' : 'text-text-secondary hover:text-primary'
      }`;
  };

  return (
    <>
      <nav className="hidden md:flex flex-col w-[250px] h-screen fixed left-0 top-0 border-r border-border p-6 bg-background">
        <header className="flex items-center gap-2 mb-10 pl-2">
          <img src={logo} alt="Sphere Logo" className="h-8 pl-2" />
        </header>

        <ul className="flex flex-col gap-2 flex-1">
          <li>
            <Link to="/home" className={getDesktopLinkClass("/home")}>
              <FiHome className="w-6 h-6" />
              Accueil
            </Link>
          </li>

          <li>
            <Link to={user ? `/profile/${user.username}` : "#"} className={getDesktopLinkClass(user ? `/profile/${user.username}` : "/profile")}>
              <FiUser className="w-6 h-6" />
              Profil
            </Link>
          </li>

          <li>
            <Link to="/settings" className={getDesktopLinkClass("/settings")}>
              <FiSettings className="w-6 h-6" />
              Paramètres
            </Link>
          </li>

          <li>
            <button
              onClick={() => navigate("/post")}
              className="bg-[image:var(--color-linear-gradient)] text-black font-extrabold text-lg rounded-full py-3.5 mt-4 w-full hover:opacity-90 transition shadow-lg font-druk"
            >
              ECRIRE
            </button>
          </li>
        </ul>

        <footer className="flex flex-col gap-2 mt-auto pb-4">
          {user && (
            <section className="flex items-center justify-between px-2 py-3 rounded-xl hover:bg-surface-hover transition group">
              <div className="flex items-center gap-3">
                <img
                  src={`${AVATAR_BASE_URL}${user.avatar}`}
                  alt="Profile"
                  className="w-10 h-10 rounded-full bg-surface border border-border"
                />
                <article className="flex flex-col font-sf-pro text-left overflow-hidden">
                  <p className="m-0 font-bold text-sm text-text-primary whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]">
                    {user.name}
                  </p>
                  <p className="m-0 text-text-secondary text-xs mt-0.5">@{user.username}</p>
                </article>
              </div>
            </section>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-full text-text-secondary hover:text-text-primary hover:bg-surface-hover transition font-sf-pro font-bold mt-auto"
          >
            <FiLogOut className="w-5 h-5" />
            Déconnexion
          </button>
        </footer>
      </nav>

      <header className={cn(
        "md:hidden flex items-center justify-between h-14 w-full fixed top-0 left-0 bg-background px-4 border-b border-border z-50 transition-transform duration-300 ease-in-out",
        !isVisible && "-translate-y-full"
      )}>
        <section className="w-8 h-8 flex-shrink-0">
          {user ? (
            <img
              src={`${AVATAR_BASE_URL}${user.avatar}`}
              alt="Profile"
              className="w-full h-full rounded-full object-cover border border-border bg-surface"
            />
          ) : (
            <div className="w-full h-full rounded-full bg-surface-hover" />
          )}
        </section>

        <div className="absolute left-1/2 -translate-x-1/2 flex items-center">
          <img src={logo} alt="Sphere Logo" className="h-6" />
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Link
            to="/settings"
            className="w-8 h-8 flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
            aria-label="Paramètres"
          >
            <FiSettings className="w-5 h-5" />
          </Link>
          <button
            onClick={handleLogout}
            className="w-8 h-8 flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
            aria-label="Déconnexion"
          >
            <FiLogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <nav className={cn(
        "md:hidden flex items-center justify-center h-16 w-full fixed bottom-0 left-0 bg-background/90 backdrop-blur-md z-50 border-t border-border pb-1 transition-transform duration-300 ease-in-out",
        !isVisible && "translate-y-full"
      )}>
        <ul className="flex items-center justify-center gap-8 w-full flex-1">
          <li>
            <Link to="/home" onClick={handleHomeClick} className={getMobileLinkClass("/home")}>
              <FiHome className="w-6 h-6" />
            </Link>
          </li>
          <li>
            <button
              onClick={() => navigate("/post")}
              className="relative -top-1"
              aria-label="Nouveau post"
            >
              <div className="w-12 h-12 bg-[image:var(--color-linear-gradient)] rounded-full flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-transform">
                <FiPlus className="w-7 h-7 text-background stroke-[3]" />
              </div>
            </button>
          </li>

          <li>
            <Link to={user ? `/profile/${user.username}` : "#"} className={getMobileLinkClass(user ? `/profile/${user.username}` : "/profile")}>
              <FiUser className="w-6 h-6" />
            </Link>
          </li>
        </ul>
      </nav>
    </>
  );
}
