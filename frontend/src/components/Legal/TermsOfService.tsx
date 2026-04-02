import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiShield, FiLock, FiEye, FiAlertTriangle, FiFileText, FiServer, FiInfo } from "react-icons/fi";
import { Button } from "../ui/Button/Button";
import { cn } from "../../lib/utils";
import logo from '../../assets/logo_sphere.svg';

const TOC_CONTENT = [
  {
    icon: FiShield,
    title: "1. Acceptation des Conditions",
    text: "En créant un compte ou en accédant à Sphere, vous reconnaissez avoir lu, compris et accepté d'être lié par les présentes CGU. Sphere se réserve le droit de modifier ces termes à tout moment. L'utilisation continue du service après modification constitue une acceptation des nouveaux termes."
  },
  {
    icon: FiAlertTriangle,
    title: "2. Conduite et Interdictions",
    text: "L'utilisateur s'engage à ne pas : harceler, menacer ou intimider d'autres utilisateurs ; publier du contenu pornographique, violent ou incitant à la haine ; utiliser des bots ou scripts automatisés ; usurper l'identité d'autrui ou créer plusieurs comptes pour contourner un bannissement."
  },
  {
    icon: FiEye,
    title: "3. Modération et Sanctions (Ban)",
    text: "Sphere applique une politique de tolérance zéro envers les comportements toxiques. En cas de violation des règles, nous nous réservons le droit de supprimer tout contenu litigieux, de suspendre temporairement votre compte ou de prononcer un bannissement définitif (Ban permanent) sans préavis ni indemnité."
  },
  {
    icon: FiLock,
    title: "4. Données Personnelles (RGPD)",
    text: "Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Nous collectons votre email et votre nom uniquement pour le fonctionnement du service. Vos données ne sont jamais vendues à des régies publicitaires tierces."
  },
  {
    icon: FiFileText,
    title: "5. Propriété Intellectuelle",
    text: "Vous restez propriétaire du contenu que vous publiez sur Sphere. Cependant, en publiant, vous nous accordez une licence mondiale et gratuite pour héberger, stocker et afficher votre contenu pour les besoins du service social."
  }
];

const LEGAL_NOTICE = [
  {
    icon: FiInfo,
    title: "Éditeur du Site",
    text: "Sphere est un projet étudiant réalisé dans le cadre de la SAÉ 4.01 à l'IUT du Limousin, Université de Limoges. Siège social imaginaire : 123 Rue du Web, 87000 Limoges. Directeur de publication : L'étudiant responsable du projet."
  },
  {
    icon: FiServer,
    title: "Hébergement",
    text: "Le site est hébergé sur les serveurs de l'Université de Limoges : mmi.unilim.fr. Adresse : 123 Avenue Albert Thomas, 87000 Limoges, France."
  },
  {
    icon: FiLock,
    title: "Cookies",
    text: "Sphere utilise uniquement des cookies de session strictement nécessaires au fonctionnement de l'authentification. Aucune donnée de traçage publicitaire n'est utilisée."
  }
];

export default function LegalHub() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"cgu" | "legal">("cgu");

  return (
    <main className="min-h-screen w-full bg-background flex flex-col items-center p-4 py-12 font-sf-pro text-text-primary">
      {/* Header */}
      <header className="flex flex-col items-center gap-6 mb-12 text-center max-w-2xl">
        <img src={logo} alt="Sphere Logo" className="h-10 mb-2" />
        <h1 className="text-[2.25rem] font-druk font-black text-primary tracking-tight uppercase leading-none">
          Centre Legal
        </h1>

        {/* Tabs */}
        <div className="flex bg-surface border border-border/50 p-1.5 rounded-2xl mt-8">
          <button
            onClick={() => setActiveTab("cgu")}
            className={cn(
              "px-8 py-2.5 rounded-xl text-[0.875rem] font-bold transition-all duration-300",
              activeTab === "cgu" ? "bg-primary text-black shadow-lg" : "text-text-secondary hover:text-text-primary"
            )}
          >
            CGU
          </button>
          <button
            onClick={() => setActiveTab("legal")}
            className={cn(
              "px-8 py-2.5 rounded-xl text-[0.875rem] font-bold transition-all duration-300",
              activeTab === "legal" ? "bg-primary text-black shadow-lg" : "text-text-secondary hover:text-text-primary"
            )}
          >
            MENTIONS LÉGALES
          </button>
        </div>
      </header>

      {/* Content Card */}
      <section className="bg-surface w-full max-w-3xl rounded-[2rem] p-8 md:p-12 shadow-2xl border border-border/50 relative overflow-hidden flex flex-col gap-10">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary/30 via-primary to-primary/30" />

        <article className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {(activeTab === "cgu" ? TOC_CONTENT : LEGAL_NOTICE).map((item, index) => (
            <section key={index} className="flex gap-6 items-start">
              <div className="bg-primary/10 p-4 rounded-2xl shrink-0">
                <item.icon className="w-6 h-6 text-primary" />
              </div>
              <div className="flex flex-col gap-3">
                <h2 className="text-[1.25rem] font-bold text-text-primary">{item.title}</h2>
                <p className="text-text-secondary leading-relaxed text-[1rem]">
                  {item.text}
                </p>
              </div>
            </section>
          ))}
        </article>

        <footer className="pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-[0.875rem] text-text-secondary italic">
            Dernière mise à jour : 23 Mars 2026
          </p>
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="gap-2 group font-bold tracking-widest"
          >
            <FiArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            RETOUR
          </Button>
        </footer>
      </section>

      {/* Decorative Footer */}
      <footer className="mt-12 text-text-secondary/50 text-[0.875rem] tracking-widest uppercase">
        Sphere Digital Experience © 2026
      </footer>
    </main>
  );
}
