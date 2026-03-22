import { useNavigate } from "react-router-dom";
import { Button } from "../ui/Button/Button";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <section className="bg-background flex flex-col items-center justify-center gap-4 w-full min-h-screen p-4">
      <h1 className="text-8xl font-druk text-primary animate-in zoom-in duration-500">404</h1>
      <h2 className="text-2xl font-sf-pro font-bold text-text-primary">Oops! Page not found.</h2>
      <p className="text-text-secondary mt-2 text-center max-w-md font-sf-pro">
        La page que vous essayez d'accéder n'existe pas ou a été déplacée.
      </p>
      <Button
        variant="primary"
        size="lg"
        onClick={() => navigate("/home")}
        className="mt-8 px-10"
      >
        RETOUR A L'ACCUEIL
      </Button>
    </section>
  );
}
