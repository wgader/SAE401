import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { FiX, FiCheck } from "react-icons/fi";
import { Button } from "../ui/Button/Button";
import { Input } from "../ui/Input/Input";
import { cn } from "../../lib/utils";
import { api } from "../../lib/api";
import logo from '../../assets/logo_sphere.svg';

export default function Signup() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [tosAccepted, setTosAccepted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  useEffect(() => {
    if (api.isAuthenticated()) {
      navigate("/home");
    }
  }, [navigate]);

  // Password constraint checks
  const constraints = {
    length: password.length >= 12,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const metCount = Object.values(constraints).filter(Boolean).length;
  const strengthPercentage = (metCount / 5) * 100;

  const getStrengthLabel = () => {
    if (metCount === 0) return "";
    if (metCount <= 2) return "Faible";
    if (metCount <= 4) return "Moyen";
    return "Sécurisé";
  };

  const getStrengthColor = () => {
    if (metCount <= 2) return "bg-red-500";
    if (metCount <= 4) return "bg-orange-500";
    return "bg-primary";
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGeneralError(null);

    const newErrors: Record<string, string> = {};

    // Basic frontend validation
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas.";
    }

    if (metCount < 5) {
      newErrors.password = "Veuillez respecter toutes les règles de mot de passe.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("password", password);
      formData.append("name", `${firstName} ${lastName}`);
      formData.append("email", email);
      // avatar is optional, not handled here yet but could be added

      await api.register(formData);
      navigate("/home");
    } catch (err: any) {
      setGeneralError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderConstraint = (met: boolean, text: string) => (
    <li className={cn("flex items-center gap-2 text-xs font-sf-pro transition-colors", met ? "text-primary" : "text-text-secondary")}>
      {met ? <FiCheck className="w-3.5 h-3.5" /> : <FiX className="w-3.5 h-3.5" />} {text}
    </li>
  );

  return (
    <main className="min-h-screen w-full bg-background flex flex-col items-center justify-center p-4 py-12">
      {/* Header */}
      <header className="flex flex-col items-center gap-6 mb-8">
        <img src={logo} alt="Sphere Logo" className="h-8" />
        <h1 className="text-2xl font-sf-pro font-bold text-text-primary">Créer un compte</h1>
        {generalError && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-xl text-sm font-sf-pro animate-in fade-in slide-in-from-top-1 w-full max-w-[480px]">
            {generalError}
          </div>
        )}
      </header>

      {/* Main Form Card */}
      <section className="bg-surface w-full max-w-[480px] rounded-3xl p-8 shadow-xl border border-border/50">
        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          {/* Name Row */}
          <div className="flex gap-4 w-full">
            <Input label="Prénom" type="text" placeholder="Jean" value={firstName} onChange={(e) => setFirstName(e.target.value)} error={errors.firstName} required />
            <Input label="Nom" type="text" placeholder="Dupont" value={lastName} onChange={(e) => setLastName(e.target.value)} error={errors.lastName} required />
          </div>

          <Input label="Nom d'utilisateur" type="text" placeholder="votreusername" value={username} onChange={(e) => setUsername(e.target.value)} error={errors.username} required />

          <Input label="Email" type="email" placeholder="exemple@email.com" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} required />

          <div className="flex flex-col gap-2">
            <Input
              label="Mot de passe"
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setIsPasswordFocused(true)}
              error={errors.password}
              required
            />

            {(isPasswordFocused || password.length > 0) && (
              <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[10px] uppercase font-sf-pro font-bold text-text-secondary tracking-wider">Sécurité</span>
                    <span className={cn("text-xs font-bold font-sf-pro", metCount <= 2 ? "text-red-500" : metCount <= 4 ? "text-orange-500" : "text-primary")}>
                      {getStrengthLabel()}
                    </span>
                  </div>
                  <div className="h-1 w-full bg-border rounded-full overflow-hidden">
                    <div
                      className={cn("h-full transition-all duration-500", getStrengthColor())}
                      style={{ width: `${strengthPercentage}%` }}
                    />
                  </div>
                </div>

                <div className="bg-background/50 rounded-xl p-4 border border-border">
                  <h3 className="text-sm font-sf-pro font-bold text-text-primary mb-3">Votre mot de passe doit contenir :</h3>
                  <ul className="flex flex-col gap-2">
                    {renderConstraint(constraints.length, "Au moins 12 caractères")}
                    {renderConstraint(constraints.uppercase, "Au moins une lettre majuscule (A-Z)")}
                    {renderConstraint(constraints.lowercase, "Au moins une lettre minuscule (a-z)")}
                    {renderConstraint(constraints.number, "Au moins un chiffre (0-9)")}
                    {renderConstraint(constraints.special, "Au moins un caractère spécial (!@#$%^&*...)")}
                  </ul>
                </div>
              </div>
            )}
          </div>

          <Input label="Confirmer le mot de passe" type="password" placeholder="••••••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} error={errors.confirmPassword} required />

          {/* TOS Checkbox (semantic label wrapping input) */}
          <label className="flex items-start gap-3 mt-2 cursor-pointer group">
            <div className={cn(
              "flex items-center justify-center w-5 h-5 rounded border bg-background mt-0.5 transition flex-shrink-0 relative",
              tosAccepted ? "border-primary bg-primary" : "border-border group-hover:border-primary"
            )}>
              <input type="checkbox" className="opacity-0 absolute w-0 h-0" checked={tosAccepted} onChange={(e) => setTosAccepted(e.target.checked)} required />
              {tosAccepted && <FiCheck className="w-3.5 h-3.5 text-black absolute" />}
            </div>
            <span className="text-sm font-sf-pro text-text-secondary leading-tight">
              J'accepte les <a href="#" className="text-primary hover:text-primary-hover transition">conditions d'utilisation</a> et la <a href="#" className="text-primary hover:text-primary-hover transition">politique de confidentialité</a>
            </span>
          </label>

          <Button type="submit" variant="primary" size="lg" fullWidth className="mt-4 text-black tracking-normal" disabled={isLoading}>
            {isLoading ? "CHARGEMENT..." : "S'INSCRIRE"}
          </Button>
        </form>

        <div className="w-full h-px bg-border my-8 rounded-full"></div>

        {/* OAuth Buttons */}
        <div className="flex flex-col gap-4">
          <Button variant="outline" fullWidth className="gap-3">
            <FcGoogle className="w-5 h-5" />
            Continuer avec Google
          </Button>

          <Button variant="outline" fullWidth className="gap-3">
            <FaFacebook className="w-5 h-5 text-[#1877F2]" />
            Continuer avec Facebook
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-8 flex flex-col items-center gap-4">
        <p className="font-sf-pro text-text-secondary">
          Vous avez déjà un compte ? <a href="/login" className="text-primary hover:text-primary-hover font-bold ml-1 transition">Connectez-vous</a>
        </p>
        <div className="flex items-center gap-4 text-xs text-text-secondary/70 font-sf-pro">
          <a href="#" className="hover:text-text-primary transition">Mentions légales</a>
          <a href="#" className="hover:text-text-primary transition">Politique de confidentialité</a>
        </div>
      </footer>
    </main>
  );
}
