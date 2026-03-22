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
        // On hache le token brut envoyé par le front-end
        // car il est stocké sous forme hachée dans la base de données.
        $hashedAccessToken = hash('sha256', $accessToken);

        // On cherche ce token haché dans la table ApiToken
        $apiToken = $this->repository->findOneBy(['token' => $hashedAccessToken]);

        // Si le token n'existe pas ou s'il n'est lié à aucun utilisateur
        if (null === $apiToken || null === $apiToken->getUser()) {
            throw new BadCredentialsException('Invalid token.');
        }

        // On vérifie si la date d'expiration est dépassée
        if ($apiToken->getExpiresAt() < new \DateTimeImmutable()) {
            throw new BadCredentialsException('Token expired. Please log in again.');
        }

        // getUserIdentifier() renverra automatiquement ton username ou email
        return new UserBadge($apiToken->getUser()->getUserIdentifier());
    }
}