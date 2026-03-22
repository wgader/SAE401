<?php

namespace App\Controller\Api;

use App\Repository\UserRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

class UserController extends AbstractController
{
    // Get all users
    #[Route('/api/user', methods: ['GET'])]
    public function list(UserRepository $userRepository): JsonResponse
    {
        $users = $userRepository->findAll();
        $data = [];

        foreach ($users as $user) {
            $data[] = [
                'id' => $user->getId(),
                'username' => $user->getUsername(),
                'name' => $user->getName(),
                'avatar' => $user->getAvatar(),
                'isVerified' => $user->isVerified(),
                'createdAt' => $user->getCreatedAt()?->format(\DateTimeInterface::ATOM),
            ];
        }

        return $this->json($data);
    }

    // Get one user by id
    #[Route('/users/{id}', methods: ['GET'])]
    public function show(UserRepository $userRepository, int $id): JsonResponse
    {
        $user = $userRepository->findOneById($id);

        if (!$user) {
            throw $this->createNotFoundException('L\'utilisateur n\'existe pas');
        }

        return $this->json([
            'id' => $user->getId(),
            'username' => $user->getUsername(),
            'name' => $user->getName(),
            'avatar' => $user->getAvatar(),
            'isVerified' => $user->isVerified(),
            'createdAt' => $user->getCreatedAt()?->format(\DateTimeInterface::ATOM),
        ]);
    }

    // Get one user by username
    #[Route('/api/users/{username}', methods: ['GET'])]
    public function showByUsername(UserRepository $userRepository, string $username): JsonResponse
    {
        $user = $userRepository->findOneBy(['username' => $username]);

        if (!$user) {
            throw $this->createNotFoundException('The user does not exist');
        }

        return $this->json([
            'id' => $user->getId(),
            'username' => $user->getUsername(),
            'name' => $user->getName(),
            'avatar' => $user->getAvatar(),
            'isVerified' => $user->isVerified(),
            'createdAt' => $user->getCreatedAt()?->format(\DateTimeInterface::ATOM),
        ]);
    }

    #[Route('/api/me', methods: ['GET'])]
    public function me(): JsonResponse
    {
        $user = $this->getUser();

        if (!$user) {
            return $this->json(['message' => 'Non autorisé'], Response::HTTP_UNAUTHORIZED);
        }

        return $this->json([
            'id' => $user->getId(),
            'username' => $user->getUsername(),
            'name' => $user->getName(),
            'avatar' => $user->getAvatar(),
            'isVerified' => $user->isVerified(),
            'createdAt' => $user->getCreatedAt()?->format(\DateTimeInterface::ATOM),
        ]);
    }
}