import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { FiX, FiCheck, FiCamera, FiMail, FiArrowRight, FiArrowLeft, FiUpload } from "react-icons/fi";
import { Button } from "../ui/Button/Button";
import { Input } from "../ui/Input/Input";
import { cn } from "../../lib/utils";
import { api } from "../../lib/api";
import logo from '../../assets/logo_sphere.svg';

export default function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [tosAccepted, setTosAccepted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [availabilityErrors, setAvailabilityErrors] = useState<{ username?: string, email?: string }>({});

  useEffect(() => {
    if (api.isAuthenticated()) {
      navigate("/home");
    }
  }, [navigate]);

  useEffect(() => {
    if (verificationCode.length === 6 && step === 3) {
      handleVerificationSubmit(new Event('submit') as any);
    }
  }, [verificationCode]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (username.length >= 3) {
        const res = await api.checkAvailability({ username });
        setAvailabilityErrors(prev => ({ ...prev, username: res.isUsernameTaken ? "Ce nom d'utilisateur est déjà pris" : undefined }));
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [username]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (email.includes('@') && email.includes('.')) {
        const res = await api.checkAvailability({ email });
        setAvailabilityErrors(prev => ({ ...prev, email: res.isEmailTaken ? "Cet email est déjà utilisé" : undefined }));
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [email]);

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

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas.";
    }

    if (metCount < 5) {
      newErrors.password = "Veuillez respecter toutes les règles de mot de passe.";
    }

    if (Object.keys(newErrors).length > 0 || availabilityErrors.username || availabilityErrors.email) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(false);
    setStep(2);
  };

  const handleAvatarSubmit = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setGeneralError(null);

    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("password", password);
      formData.append("name", name);
      formData.append("email", email);
      if (avatar) {
        formData.append("avatar", avatar);
      }

      await api.register(formData);
      setStep(3);
    } catch (err: any) {
      setGeneralError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVerificationSubmit = async (e: FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setGeneralError(null);

    try {
      const response = await api.verifyCode(email, verificationCode);
      if (response.status === "success") {
        navigate("/home");
      }
    } catch (err: any) {
      setGeneralError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    setGeneralError(null);
    setResendSuccess(false);
    try {
      await api.resendCode(email);
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (err: any) {
      setGeneralError(err.message);
    } finally {
      setIsResending(false);
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
      <header className="flex flex-col items-center gap-6 mb-8 text-center">
        <img src={logo} alt="Sphere Logo" className="h-8" />
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-sf-pro font-black text-text-primary tracking-tight">
            {step === 1 && "Créer un compte"}
            {step === 2 && "Photo de profil"}
            {step === 3 && "Vérification"}
          </h1>
          <p className="text-text-secondary font-sf-pro text-sm">
            {step === 1 && "Rejoignez la communauté Sphere"}
            {step === 2 && "Personnalisez votre profil"}
            {step === 3 && `Nous avons envoyé un code à ${email}`}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="flex gap-2 w-32 mt-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={cn(
                "h-1 flex-1 rounded-full transition-all duration-500",
                s <= step ? "bg-primary" : "bg-border"
              )}
            />
          ))}
        </div>

        {generalError && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-xl text-sm font-sf-pro animate-in fade-in slide-in-from-top-1 w-full max-w-[480px]">
            {generalError}
          </div>
        )}
      </header>

      {/* Main Form Card */}
      <section className="bg-surface w-full max-w-[480px] rounded-3xl p-8 shadow-2xl border border-border/50 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50 opacity-20" />

        {step === 1 && (
          <form className="flex flex-col gap-5 animate-in fade-in slide-in-from-right-4 duration-500" onSubmit={handleSubmit}>
            <Input label="Nom complet" type="text" placeholder="Jean Dupont" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} required />

            <Input label="Nom d'utilisateur" type="text" placeholder="votreusername" value={username} onChange={(e) => setUsername(e.target.value)} error={errors.username || availabilityErrors.username} required />

            <Input label="Email" type="email" placeholder="exemple@email.com" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email || availabilityErrors.email} required />

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

            <label className="flex items-start gap-3 mt-2 cursor-pointer group">
              <div className={cn(
                "flex items-center justify-center w-5 h-5 rounded border bg-background mt-0.5 transition flex-shrink-0 relative",
                tosAccepted ? "border-primary bg-primary" : "border-border group-hover:border-primary"
              )}>
                <input type="checkbox" className="opacity-0 absolute w-0 h-0" checked={tosAccepted} onChange={(e) => setTosAccepted(e.target.checked)} required />
                {tosAccepted && <FiCheck className="w-3.5 h-3.5 text-black absolute" />}
              </div>
              <span className="text-sm font-sf-pro text-text-secondary leading-tight">
                J'accepte les <a href="#" className="text-primary hover:text-primary-hover transition">conditions d'utilisation</a>
              </span>
            </label>

            <Button type="submit" variant="primary" size="lg" fullWidth className="mt-4 text-black font-black" disabled={isLoading}>
              {isLoading ? "CHARGEMENT..." : "CONTINUER"}
              {!isLoading && <FiArrowRight className="ml-2 w-5 h-5" />}
            </Button>
          </form>
        )}

        {step === 2 && (
          <div className="flex flex-col items-center gap-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="relative group/avatar">
              <div className="w-32 h-32 rounded-full bg-background border-4 border-border overflow-hidden flex items-center justify-center relative">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <FiCamera className="w-12 h-12 text-text-secondary" />
                )}
                <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition cursor-pointer">
                  <FiUpload className="text-white w-8 h-8" />
                  <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                </label>
              </div>
              {avatarPreview && (
                <button
                  onClick={() => { setAvatar(null); setAvatarPreview(null); }}
                  className="absolute -top-1 -right-1 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition shadow-lg"
                >
                  <FiX className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex flex-col gap-4 w-full">
              <Button onClick={() => handleAvatarSubmit()} variant="primary" size="lg" fullWidth className="text-black font-black" disabled={isLoading}>
                {isLoading ? "CHARGEMENT..." : (avatar ? "CONTINUER" : "PASSER CETTE ETAPE")}
                {!isLoading && <FiArrowRight className="ml-2 w-5 h-5" />}
              </Button>
              <button
                onClick={() => setStep(1)}
                className="flex items-center justify-center gap-2 text-text-secondary hover:text-text-primary transition font-sf-pro text-sm font-bold"
              >
                <FiArrowLeft className="w-4 h-4" /> Retour aux infos
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <form className="flex flex-col items-center gap-8 animate-in fade-in slide-in-from-right-4 duration-500" onSubmit={handleVerificationSubmit}>
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
              <FiMail className="w-10 h-10 text-primary" />
            </div>

            <div className="w-full flex flex-col gap-4">
              <Input
                label="Code de vérification"
                type="text"
                placeholder="000000"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="text-center text-2xl tracking-[0.5em] font-black"
                maxLength={6}
                required
                autoFocus
              />
              <p className="text-center text-xs text-text-secondary font-sf-pro">
                {resendSuccess ? (
                  <span className="text-primary font-bold animate-pulse">Nouveau code envoyé !</span>
                ) : (
                  <>
                    Vous n'avez pas reçu de code ?{" "}
                    <button
                      type="button"
                      onClick={handleResendCode}
                      className="text-primary hover:underline font-bold disabled:opacity-50"
                      disabled={isResending}
                    >
                      {isResending ? "Envoi..." : "Renvoyer"}
                    </button>
                  </>
                )}
              </p>
            </div>

            <div className="flex flex-col gap-4 w-full">
              <Button type="submit" variant="primary" size="lg" fullWidth className="text-black font-black" disabled={isLoading}>
                {isLoading ? "VÉRIFICATION..." : "S'INSCRIRE"}
                {!isLoading && <FiCheck className="ml-2 w-5 h-5" />}
              </Button>
              <button
                onClick={() => setStep(2)}
                className="flex items-center justify-center gap-2 text-text-secondary hover:text-text-primary transition font-sf-pro text-sm font-bold"
              >
                <FiArrowLeft className="w-4 h-4" /> Modifier la photo
              </button>
            </div>
          </form>
        )}

        {step === 1 && (
          <>
            <div className="w-full h-px bg-border my-8 rounded-full"></div>
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
          </>
        )}
      </section>

      {/* Footer */}
      <footer className="mt-8 flex flex-col items-center gap-4">
        <p className="font-sf-pro text-text-secondary">
          Vous avez déjà un compte ? <a href="/login" className="text-primary hover:text-primary-hover font-bold ml-1 transition">Connectez-vous</a>
        </p>
      </footer>
    </main>
  );
}
