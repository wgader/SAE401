export default function NotFound() {
  return (
    <div className="bg-background flex flex-col items-center justify-center gap-4 w-full h-full">
      <h1 className="text-6xl font-druk text-primary">404</h1>
      <h2 className="text-2xl font-sf-pro text-text-primary">Oops! Page not found.</h2>
      <p className="text-text-secondary mt-2 text-center max-w-md">
        La page que vous essayez d'accéder n'existe pas.
      </p>
      <a
        href="/home"
        className="mt-6 font-sf-pro bg-primary text-background font-bold py-3 px-8 rounded-full hover:bg-primary-hover transition"
      >
        Retour à l'accueil
      </a>
    </div>
  );
}
