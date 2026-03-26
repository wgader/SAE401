import { Outlet, useNavigate } from "react-router-dom";
import Navigation from "../components/ui/Navigation";
import { api } from "../lib/api";
import { useEffect, useState } from "react";
import { BlockedModal } from "../components/ui/BlockedModal";
import { useStore } from "../store/StoreContext";

export default function RootLayout() {
  const navigate = useNavigate();
  const { setCurrentUser } = useStore();
  const [blockedMessage, setBlockedMessage] = useState<string | null>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    document.documentElement.setAttribute("data-theme", savedTheme === "dark" ? "theme-dark" : savedTheme === "light" ? "theme-light" : "theme-violet");
    
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  useEffect(() => {
      if (api.isAuthenticated()) {
          api.getMe().then(setCurrentUser).catch(() => {
              localStorage.removeItem("token");
              navigate("/login");
          });
      } else {
          navigate("/login");
      }
  }, [navigate, setCurrentUser]);

  useEffect(() => {
    const handleBlocked = (e: any) => {
      setBlockedMessage(e.detail.message);
    };
    window.addEventListener('user-blocked' as any, handleBlocked);
    return () => window.removeEventListener('user-blocked' as any, handleBlocked);
  }, []);

  return (
    <div className="bg-background min-h-screen w-full text-text-primary flex relative">
      <Navigation />
      <main className="w-full flex justify-center md:pl-[250px] pt-14 pb-16 md:pt-0 md:pb-0">
        <Outlet />
      </main>

      {blockedMessage && (
        <BlockedModal 
            message={blockedMessage} 
            onClose={() => setBlockedMessage(null)} 
        />
      )}
    </div>
  );
}
