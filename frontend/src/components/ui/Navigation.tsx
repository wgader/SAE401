import { FiHome, FiPlus } from 'react-icons/fi';
import logo from '../../assets/logo_sphere.svg';
import { CURRENT_USER } from '../../data/user';

export default function Navigation() {
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
            <a href="#" className="flex items-center gap-3 text-primary font-bold text-lg px-4 py-3 rounded-full hover:bg-surface-hover transition font-sf-pro">
              <FiHome className="w-6 h-6" />
              Accueil
            </a>
          </li>

          <li>
            <button className="bg-[image:var(--color-linear-gradient)] text-background font-extrabold text-lg rounded-full py-3.5 mt-4 w-full hover:opacity-90 transition shadow-lg font-druk">
              ECRIRE
            </button>
          </li>
        </ul>

        {/* Profile Card */}
        <div className="flex items-center justify-between mt-auto px-2 py-3 rounded-xl hover:bg-surface-hover cursor-pointer transition">
          <div className="flex items-center gap-3">
            <img
              src={CURRENT_USER.avatar}
              alt="Profile"
              className="w-10 h-10 rounded-full"
            />
            <div className="flex flex-col font-sf-pro text-left">
              <span className="font-bold text-sm text-text-primary whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]">
                {CURRENT_USER.firstName} {CURRENT_USER.lastName}
              </span>
              <span className="text-text-secondary text-sm mt-0.5">@{CURRENT_USER.username}</span>
            </div>
          </div>
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
            <button className="text-primary hover:text-primary-hover transition p-2">
              <FiPlus className="w-8 h-8 pointer-events-none" />
            </button>
          </li>
        </ul>
      </nav>
    </>
  );
}
