import { useState, useEffect } from "react";
import Dropdown from "../ui/Dropdown";
import { FiMoon, FiSun, FiRefreshCw, FiArrowLeft, FiHexagon, FiLock } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useStore } from "../../store/StoreContext";
import { api } from "../../lib/api";

const REFRESH_OPTIONS = [
  { label: "Désactivé", value: "off" },
  { label: "5 minutes", value: "5" },
  { label: "15 minutes", value: "15" },
  { label: "30 minutes", value: "30" },
  { label: "1 heure", value: "60" },
];

export default function Settings() {
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useStore();
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");
  const [refreshInterval, setRefreshInterval] = useState(() => localStorage.getItem("refreshInterval") || "off");
  const [isReadOnly, setIsReadOnly] = useState(currentUser?.isReadOnly || false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.documentElement.setAttribute("data-theme", theme === "dark" ? "theme-dark" : theme === "light" ? "theme-light" : "theme-violet");
    
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("refreshInterval", refreshInterval);
    window.dispatchEvent(new Event('settings-changed'));
  }, [refreshInterval]);

  useEffect(() => {
    if (currentUser?.isReadOnly !== undefined) {
      setIsReadOnly(currentUser.isReadOnly);
    }
  }, [currentUser?.isReadOnly]);

  return (
    <article className="w-full max-w-2xl border-x border-border min-h-screen bg-background flex flex-col font-sf-pro">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border p-4 flex items-center gap-6">
        <button 
          onClick={() => navigate(-1)} 
          className="text-text-primary hover:bg-surface-hover p-2 rounded-full transition-colors"
          aria-label="Retour"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-text-primary m-0">Paramètres</h1>
      </header>

      <section className="p-6 flex flex-col gap-10">
        {/* Theme Section */}
        <section className="flex flex-col gap-5">
          <header className="flex items-center gap-3">
             <div className="p-2 bg-primary/10 rounded-lg text-primary">
                {theme === "dark" ? <FiMoon className="w-5 h-5" /> : theme === "light" ? <FiSun className="w-5 h-5" /> : <FiHexagon className="w-5 h-5" />}
             </div>
             <h2 className="text-lg font-bold text-text-primary m-0">Affichage</h2>
          </header>
          
          <nav className="grid grid-cols-3 bg-surface rounded-2xl p-1.5 border border-border shadow-inner">
            <button
              onClick={() => setTheme("light")}
              className={`flex flex-col items-center gap-1 py-3 rounded-xl transition-all ${theme === "light" ? "bg-background shadow-lg text-primary font-bold scale-[1.02]" : "text-text-secondary hover:text-text-primary hover:bg-surface-hover/50"}`}
            >
              <FiSun className="w-5 h-5" />
              <p className="text-xs m-0">Clair</p>
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`flex flex-col items-center gap-1 py-3 rounded-xl transition-all ${theme === "dark" ? "bg-background shadow-lg text-primary font-bold scale-[1.02]" : "text-text-secondary hover:text-text-primary hover:bg-surface-hover/50"}`}
            >
              <FiMoon className="w-5 h-5" />
              <p className="text-xs m-0">Sombre</p>
            </button>
            <button
              onClick={() => setTheme("violet")}
              className={`flex flex-col items-center gap-1 py-3 rounded-xl transition-all ${theme === "violet" ? "bg-background shadow-lg text-primary font-bold scale-[1.02]" : "text-text-secondary hover:text-text-primary hover:bg-surface-hover/50"}`}
            >
              <FiHexagon className="w-5 h-5" />
              <p className="text-xs m-0">Violet</p>
            </button>
          </nav>
        </section>

        {/* Privacy Section */}
        <section className="flex flex-col gap-5">
          <header className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <FiLock className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-text-primary m-0">Confidentialité</h2>
          </header>
          
          <article className="bg-surface rounded-2xl p-6 border border-border flex flex-col gap-6 shadow-sm">
            <header className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-sm font-bold text-text-primary mb-1">Mode Lecture Seule</h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Empêche les autres utilisateurs de répondre à vos posts. Vos posts restent visibles et "likables".
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={isReadOnly}
                disabled={isUpdating}
                onClick={async () => {
                  const newValue = !isReadOnly;
                  setIsReadOnly(newValue);
                  setIsUpdating(true);
                  try {
                    const formData = new FormData();
                    formData.append('isReadOnly', newValue ? '1' : '0');
                    const updatedUser = await api.updateProfile(formData);
                    setCurrentUser(updatedUser);
                  } catch (err) {
                    console.error("Failed to update read-only setting:", err);
                    setIsReadOnly(!newValue);
                  } finally {
                    setIsUpdating(false);
                  }
                }}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isReadOnly ? 'bg-primary' : 'bg-border'} ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isReadOnly ? 'translate-x-5' : 'translate-x-0'}`}
                />
              </button>
            </header>
          </article>
        </section>

        {/* Refresh Section */}
        <section className="flex flex-col gap-5">
          <header className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <FiRefreshCw className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-text-primary m-0">Contenu</h2>
          </header>
          
          <article className="bg-surface rounded-2xl p-6 border border-border flex flex-col gap-6 shadow-sm">
            <header>
              <h3 className="text-sm font-bold text-text-primary mb-1">Rafraîchissement automatique</h3>
              <p className="text-xs text-text-secondary leading-relaxed">Personnalisez la fréquence d'actualisation de votre fil pour ne rien manquer.</p>
            </header>
            <Dropdown 
              options={REFRESH_OPTIONS} 
              value={refreshInterval} 
              onChange={setRefreshInterval}
              label="Intervalle de mise à jour"
            />
          </article>
        </section>
      </section>
    </article>
  );
}
