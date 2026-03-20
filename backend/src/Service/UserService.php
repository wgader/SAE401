<?php

namespace App\Service;

use App\Entity\User;
use App\Entity\ApiToken;
use Doctrine\ORM\EntityManagerInterface;

class UserService
{
    public function __construct(private EntityManagerInterface $em)
    {
    }

    public function generateTokenForUser(User $user): string
    {
        $rawToken = bin2hex(random_bytes(32));
        $hashedToken = hash('sha256', $rawToken);

        $apiToken = $user->getApiToken();
        if (!$apiToken) {
            $apiToken = new ApiToken();
            $apiToken->setUser($user);
            $this->em->persist($apiToken);
        }

        $apiToken->setToken($hashedToken);

        // AJOUT : On définit l'expiration à +24 heures à partir de maintenant
        $apiToken->setExpiresAt((new \DateTimeImmutable())->modify('+24 hours'));

        $this->em->flush();

        return $rawToken;
    }
}