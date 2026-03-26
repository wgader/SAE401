<?php

namespace App\Security;

use App\Entity\User;
use Symfony\Component\Security\Core\Exception\LockedException;
use Symfony\Component\Security\Core\User\UserCheckerInterface;
use Symfony\Component\Security\Core\User\UserInterface;

class UserChecker implements UserCheckerInterface
{
    public function checkPreAuth(UserInterface $user): void
    {
        if (!$user instanceof User) {
            return;
        }

        if ($user->isBlocked()) {
            $exception = new LockedException('Oups ! Il semblerait que vous ayez un peu trop forcé sur le piment. Ce compte est désormais suspendu pour non-respect des règles de la Sphère. 🌶️');
            throw $exception;
        }
    }

    public function checkPostAuth(UserInterface $user): void
    {
        if (!$user instanceof User) {
            return;
        }

        if ($user->isBlocked()) {
            $exception = new LockedException('Oups ! Il semblerait que vous ayez un peu trop forcé sur le piment. Ce compte est désormais suspendu pour non-respect des règles de la Sphère. 🌶️');
            throw $exception;
        }
    }
}
