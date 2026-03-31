export interface TweetData {
    authorName: string
    username: string
    timeAgo: string
    content: string
    avatarUrl?: string
}
export const TWEETS: TweetData[] = [
    {
        authorName: 'Devon Lane',
        username: 'marcelosalomao',
        timeAgo: '23s',
        content: 'Is this big enough for you?',
        avatarUrl: `${import.meta.env.VITE_MEDIA_URL || ''}/uploads/avatars/default.png`,
    },
    {
        authorName: 'Alexandre Dupont',
        username: 'alexdup',
        timeAgo: '2h',
        content: "Présentation du projet SAE4 : on avance bien !",
        avatarUrl: `${import.meta.env.VITE_MEDIA_URL || ''}/uploads/avatars/default.png`,
    },
    {
        authorName: 'Sofia Martin',
        username: 'sof_m',
        timeAgo: '1d',
        content:
            'Petite démo du composant TweetCard avec Tailwind et variables CSS. On teste aussi différents longueurs de texte pour vérifier le wrapping et le comportement responsive.',
        avatarUrl: `${import.meta.env.VITE_MEDIA_URL || ''}/uploads/avatars/default.png`,
    },
    {
        authorName: 'Léa Bernard',
        username: 'lea_bernard',
        timeAgo: '5m',
        content:
            "J’ai ajouté quelques images pour les avatars. Certaines personnes ont des bios courtes, d'autres des paragraphes plus longs — c'est utile pour tester le rendu.",
        avatarUrl: `${import.meta.env.VITE_MEDIA_URL || ''}/uploads/avatars/default.png`,
    },
    {
        authorName: 'Tom Morel',
        username: 'tom_morel',
        timeAgo: '10m',
        content: 'Qui veut tester l’intégration backend ?',
        avatarUrl: `${import.meta.env.VITE_MEDIA_URL || ''}/uploads/avatars/default.png`,
    },
    {
        authorName: 'Maya Lopez',
        username: 'maya_lopez',
        timeAgo: '30m',
        content: "Design tokens prêts — on peut itérer.",
        avatarUrl: `${import.meta.env.VITE_MEDIA_URL || ''}/uploads/avatars/default.png`,
    },
    {
        authorName: 'Hugo Petit',
        username: 'hugo_petit',
        timeAgo: '45m',
        content:
            "Toujours en train d’améliorer le responsive. J'ai modifié quelques breakpoints et testé sur mobile. Le rendu est plutôt propre, mais il faudra ajuster les tailles de police pour les très petits écrans.",
        avatarUrl: `${import.meta.env.VITE_MEDIA_URL || ''}/uploads/avatars/default.png`,
    },
    {
        authorName: 'Emma Laurent',
        username: 'emma_laurent',
        timeAgo: '1h',
        content: 'Coucou 👋 voici un faux tweet pour la démo.',
        avatarUrl: `${import.meta.env.VITE_MEDIA_URL || ''}/uploads/avatars/default.png`,
    },
    {
        authorName: 'Pauline Moreau',
        username: 'pauline_moreau',
        timeAgo: '2h',
        content: 'Test d’affichage des avatars — devrait fonctionner avec i.pravatar.',
        avatarUrl: `${import.meta.env.VITE_MEDIA_URL || ''}/uploads/avatars/default.png`,
    },
    {
        authorName: 'Julien Caron',
        username: 'julien_c',
        timeAgo: '3h',
        content: 'Ajout des composants UI de base.',
        avatarUrl: `${import.meta.env.VITE_MEDIA_URL || ''}/uploads/avatars/default.png`,
    },
    {
        authorName: 'Nora Diaz',
        username: 'nora_d',
        timeAgo: '4h',
        content:
            'Révision du routing et des pages. J’ai remarqué quelques routes orphelines, je vais les nettoyer et préparer la navigation principale.',
        avatarUrl: `${import.meta.env.VITE_MEDIA_URL || ''}/uploads/avatars/default.png`,
    },
    {
        authorName: 'Lucas Rey',
        username: 'lucas_rey',
        timeAgo: '5h',
        content: 'Préparation des fixtures pour tests.',
        avatarUrl: `${import.meta.env.VITE_MEDIA_URL || ''}/uploads/avatars/default.png`,
    },
    {
        authorName: 'Chloé Garnier',
        username: 'chloe_g',
        timeAgo: '6h',
        content: 'Mise en place du design system.',
        avatarUrl: `${import.meta.env.VITE_MEDIA_URL || ''}/uploads/avatars/default.png`,
    },
    {
        authorName: 'Marc Petit',
        username: 'marc_p',
        timeAgo: '7h',
        content: 'Optimisation des performances.',
        avatarUrl: `${import.meta.env.VITE_MEDIA_URL || ''}/uploads/avatars/default.png`,
    },
    {
        authorName: 'Ana Gomez',
        username: 'ana_g',
        timeAgo: '8h',
        content: 'Tests unitaires et e2e à venir.',
        avatarUrl: `${import.meta.env.VITE_MEDIA_URL || ''}/uploads/avatars/default.png`,
    },
    {
        authorName: 'Olivier Bernard',
        username: 'olivier_b',
        timeAgo: '9h',
        content: 'Intégration continue configurée.',
        avatarUrl: `${import.meta.env.VITE_MEDIA_URL || ''}/uploads/avatars/default.png`,
    },
    {
        authorName: 'Marie Dubois',
        username: 'marie_d',
        timeAgo: '10h',
        content: 'Ajout d’un mode preview pour composants.',
        avatarUrl: `${import.meta.env.VITE_MEDIA_URL || ''}/uploads/avatars/default.png`,
    },
    {
        authorName: 'Pierre Martin',
        username: 'pierre_m',
        timeAgo: '11h',
        content: 'Refactorisation des composants partagés.',
        avatarUrl: `${import.meta.env.VITE_MEDIA_URL || ''}/uploads/avatars/default.png`,
    },
    {
        authorName: 'Sara Vidal',
        username: 'sara_v',
        timeAgo: '12h',
        content: 'Amélioration de l’accessibilité.',
        avatarUrl: `${import.meta.env.VITE_MEDIA_URL || ''}/uploads/avatars/default.png`,
    },
    {
        authorName: 'Romain Leclerc',
        username: 'romain_l',
        timeAgo: '1d',
        content: 'Ajout d’exemples pour la doc.',
        avatarUrl: `${import.meta.env.VITE_MEDIA_URL || ''}/uploads/avatars/default.png`,
    },
    {
        authorName: 'Lina Rossi',
        username: 'lina_r',
        timeAgo: '2d',
        content: 'Prototype mobile ready.',
        avatarUrl: `${import.meta.env.VITE_MEDIA_URL || ''}/uploads/avatars/default.png`,
    },
    {
        authorName: 'Yannick Moreau',
        username: 'yannick_m',
        timeAgo: '3d',
        content: 'Session de revue prévue demain.',
        avatarUrl: `${import.meta.env.VITE_MEDIA_URL || ''}/uploads/avatars/default.png`,
    },
    {
        authorName: 'Camille Roy',
        username: 'camille_roy',
        timeAgo: '1w',
        content: 'Déploiement en staging réussi.',
        avatarUrl: `${import.meta.env.VITE_MEDIA_URL || ''}/uploads/avatars/default.png`,
    },
]