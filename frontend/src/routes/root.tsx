import { Outlet } from "react-router-dom";
import Navigation from "../components/ui/Navigation";

export default function RootLayout() {
  return (
    <div className="bg-background min-h-screen w-full text-text-primary flex">
      <Navigation />
      <main className="w-full flex justify-center md:pl-[250px] pt-14 pb-16 md:pt-0 md:pb-0">
        <Outlet />
      </main>
    </div>
  );
}
