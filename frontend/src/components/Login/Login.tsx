import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { Button } from "../ui/Button/Button";
import { Input } from "../ui/Input/Input";
import { api } from "../../lib/api";
import logo from '../../assets/logo_sphere.svg';

export default function Login() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (api.isAuthenticated()) {
      navigate("/home");
    }
  }, [navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await api.login({ username: identifier, password });
      navigate("/home");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full bg-background flex flex-col items-center justify-center p-4">
      {/* Header */}
      <header className="flex flex-col items-center gap-6 mb-8">
        <img src={logo} alt="Sphere Logo" className="h-8" />
        <h1 className="text-2xl font-sf-pro font-bold text-text-primary">Connectez-vous</h1>
        {error && (
          <aside className="bg-danger/10 border border-danger/50 text-danger p-3 rounded-xl text-sm font-sf-pro mb-6 animate-in fade-in slide-in-from-top-1" role="alert">
            {error}
          </aside>
        )}
      </header>

      {/* Main Form Card */}
      <section className="bg-surface w-full max-w-[27.5rem] rounded-3xl p-8 shadow-xl border border-border/50">
        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          <Input
            label="Email ou Nom d'utilisateur"
            type="text"
            placeholder="votrepseudo ou exemple@email.com"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />

          <section className="flex flex-col gap-2">
            <Input
              label="Mot de passe"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <p className="flex justify-end">
              <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10 h-auto py-1 px-2">
                Mot de passe oublié ?
              </Button>
            </p>
          </section>

          <Button type="submit" variant="primary" size="lg" fullWidth className="mt-2 text-black tracking-normal" disabled={isLoading}>
            {isLoading ? "CHARGEMENT..." : "SE CONNECTER"}
          </Button>
        </form>

        <hr className="w-full h-[1px] bg-border my-8 border-none" />

        {/* OAuth Buttons */}
        <nav className="flex flex-col gap-4" aria-label="Connexion via réseaux sociaux">
          <Button variant="outline" fullWidth className="gap-3">
            <FcGoogle className="w-5 h-5" />
            Continuer avec Google
          </Button>

          <Button variant="outline" fullWidth className="gap-3">
            <FaFacebook className="w-5 h-5 text-[#1877F2]" />
            Continuer avec Facebook
          </Button>
        </nav>
      </section>

      {/* Footer */}
      <footer className="mt-8 flex flex-col items-center gap-4">
        <p className="font-sf-pro text-text-secondary text-base">
          Vous n'avez pas de compte ? <Link to="/signup" className="text-primary hover:text-primary-hover font-bold ml-1 transition text-base">Inscrivez-vous</Link>
        </p>
        <nav className="flex items-center gap-4 text-sm text-text-secondary/70 font-sf-pro" aria-label="Liens légaux">
          <Link to="/terms" className="hover:text-text-primary transition text-sm">Mentions légales</Link>
          <Link to="/terms" className="hover:text-text-primary transition text-sm">Politique de confidentialité</Link>
        </nav>
      </footer>
    </main>
  );
}
