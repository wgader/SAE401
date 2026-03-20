import { Outlet, useNavigate } from "react-router-dom";
import Navigation from "../components/ui/Navigation";
import { api } from "../lib/api";
import { useEffect } from "react";

export default function RootLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!api.isAuthenticated()) {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div className="bg-background min-h-screen w-full text-text-primary flex">
      <Navigation />
      <main className="w-full flex justify-center md:pl-[250px] pt-14 pb-16 md:pt-0 md:pb-0">
        <Outlet />
      </main>
    </div>
  );
}
