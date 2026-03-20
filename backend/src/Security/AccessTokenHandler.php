<?php

namespace App\Security;

use App\Repository\ApiTokenRepository;
use Symfony\Component\Security\Core\Exception\BadCredentialsException;
use Symfony\Component\Security\Http\AccessToken\AccessTokenHandlerInterface;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge;

class AccessTokenHandler implements AccessTokenHandlerInterface
{
    public function __construct(
        private ApiTokenRepository $repository
        )
    {
    }

    public function getUserBadgeFrom(string $accessToken): UserBadge
    {
        // 1. On hache le token brut envoyé par le front-end
        // car il est stocké sous forme hachée dans la base de données.
        $hashedAccessToken = hash('sha256', $accessToken);

        // 2. On cherche ce token haché dans la table ApiToken
        $apiToken = $this->repository->findOneBy(['token' => $hashedAccessToken]);

        // 3. Si le token n'existe pas ou s'il n'est lié à aucun utilisateur
        if (null === $apiToken || null === $apiToken->getUser()) {
            throw new BadCredentialsException('Invalid token.');
        }

        // 4. On vérifie si la date d'expiration est dépassée
        if ($apiToken->getExpiresAt() < new \DateTimeImmutable()) {
            throw new BadCredentialsException('Token expired. Please log in again.');
        }

        // 5. Tout est bon, on indique à Symfony qui est l'utilisateur !
        // getUserIdentifier() renverra automatiquement ton username ou email
        return new UserBadge($apiToken->getUser()->getUserIdentifier());
    }
}