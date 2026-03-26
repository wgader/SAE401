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
                'bio' => $user->getBio(),
                'location' => $user->getLocation(),
                'website' => $user->getWebsite(),
                'banner' => $user->getBanner(),
                'isVerified' => $user->isVerified(),
                'isBlocked' => $user->isBlocked(),
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
            'bio' => $user->getBio(),
            'location' => $user->getLocation(),
            'website' => $user->getWebsite(),
            'banner' => $user->getBanner(),
            'isVerified' => $user->isVerified(),
            'isBlocked' => $user->isBlocked(),
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

        $currentUser = $this->getUser();
        $isFollowing = false;
        if ($currentUser) {
            $isFollowing = $user->getFollowers()->contains($currentUser);
        }

        return $this->json([
            'id' => $user->getId(),
            'username' => $user->getUsername(),
            'name' => $user->getName(),
            'avatar' => $user->getAvatar(),
            'bio' => $user->getBio(),
            'location' => $user->getLocation(),
            'website' => $user->getWebsite(),
            'banner' => $user->getBanner(),
            'isVerified' => $user->isVerified(),
            'isBlocked' => $user->isBlocked(),
            'createdAt' => $user->getCreatedAt()?->format(\DateTimeInterface::ATOM),
            'isFollowing' => $isFollowing,
            'followersCount' => $user->getFollowers()->count(),
            'followingCount' => $user->getFollowing()->count(),
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
            'bio' => $user->getBio(),
            'location' => $user->getLocation(),
            'website' => $user->getWebsite(),
            'banner' => $user->getBanner(),
            'isVerified' => $user->isVerified(),
            'isBlocked' => $user->isBlocked(),
            'createdAt' => $user->getCreatedAt()?->format(\DateTimeInterface::ATOM),
            'followersCount' => $user->getFollowers()->count(),
            'followingCount' => $user->getFollowing()->count(),
        ]);
    }

    #[Route('/api/me/update', methods: ['POST'])]
    public function updateMe(\Symfony\Component\HttpFoundation\Request $request, \App\Service\FileService $fileService, \Doctrine\ORM\EntityManagerInterface $em): JsonResponse
    {
        $user = $this->getUser();

        if (!$user) {
            return $this->json(['message' => 'Non autorisé'], Response::HTTP_UNAUTHORIZED);
        }

        // Handle texts
        if ($request->request->has('name')) {
            $user->setName($request->request->get('name'));
        }
        if ($request->request->has('bio')) {
            $user->setBio($request->request->get('bio'));
        }
        if ($request->request->has('location')) {
            $user->setLocation($request->request->get('location'));
        }
        if ($request->request->has('website')) {
            $user->setWebsite($request->request->get('website'));
        }

        // Handle files
        $avatarFile = $request->files->get('avatar');
        if ($avatarFile) {
            $avatarFilename = $fileService->uploadAvatar($avatarFile);
            if ($avatarFilename) {
                // Ignore old file deletion for simplicity, or add it if needed
                $user->setAvatar($avatarFilename);
            }
        }

        $bannerFile = $request->files->get('banner');
        if ($bannerFile) {
            $bannerFilename = $fileService->uploadBanner($bannerFile);
            if ($bannerFilename) {
                $user->setBanner($bannerFilename);
            }
        }

        $em->flush();

        return $this->json([
            'id' => $user->getId(),
            'username' => $user->getUsername(),
            'name' => $user->getName(),
            'avatar' => $user->getAvatar(),
            'bio' => $user->getBio(),
            'location' => $user->getLocation(),
            'website' => $user->getWebsite(),
            'banner' => $user->getBanner(),
            'isVerified' => $user->isVerified(),
            'isBlocked' => $user->isBlocked(),
            'createdAt' => $user->getCreatedAt()?->format(\DateTimeInterface::ATOM),
            'followersCount' => $user->getFollowers()->count(),
            'followingCount' => $user->getFollowing()->count(),
        ]);
    }

    #[Route('/api/users/{username}/follow', methods: ['POST'])]
    public function follow(string $username, UserRepository $userRepository, \Doctrine\ORM\EntityManagerInterface $em): JsonResponse
    {
        $currentUser = $this->getUser();
        if (!$currentUser) {
            return $this->json(['message' => 'Non autorisé'], Response::HTTP_UNAUTHORIZED);
        }

        $targetUser = $userRepository->findOneBy(['username' => $username]);
        if (!$targetUser) {
            return $this->json(['message' => 'Utilisateur introuvable'], Response::HTTP_NOT_FOUND);
        }

        if ($currentUser === $targetUser) {
            return $this->json(['message' => 'Vous ne pouvez pas vous suivre vous-même'], Response::HTTP_BAD_REQUEST);
        }

        if ($targetUser->getFollowers()->contains($currentUser)) {
            $targetUser->removeFollower($currentUser);
            $isFollowing = false;
        } else {
            $targetUser->addFollower($currentUser);
            $isFollowing = true;
        }

        $em->flush();

        return $this->json([
            'isFollowing' => $isFollowing,
            'followersCount' => $targetUser->getFollowers()->count(),
            'followingCount' => $targetUser->getFollowing()->count(),
        ]);
    }
}