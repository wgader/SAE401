<?php

namespace App\Controller\Api;

use App\Entity\User;
use App\Repository\UserRepository;
use App\Service\FileService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Doctrine\ORM\EntityManagerInterface;

class UserController extends AbstractController
{
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
        $isBlockedByMe = false;
        $hasBlockedMe = false;

        $isFollower = false;
        if ($currentUser instanceof User) {
            $isFollowing = $user->getFollowers()->contains($currentUser);
            $isFollower = $currentUser->getFollowers()->contains($user);
            $isBlockedByMe = $currentUser->isBlocking($user);
            $hasBlockedMe = $user->isBlocking($currentUser);
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
            'isBlockedByMe' => $isBlockedByMe,
            'hasBlockedMe' => $hasBlockedMe,
            'createdAt' => $user->getCreatedAt()?->format(\DateTimeInterface::ATOM),
            'isFollowing' => $isFollowing,
            'isFollower' => $isFollower,
            'isReadOnly' => $user->isReadOnly(),
            'followersCount' => $user->getFollowers()->count(),
            'followingCount' => $user->getFollowing()->count(),
        ]);
    }

    #[Route('/api/me', methods: ['GET'])]
    public function me(): JsonResponse
    {
        $user = $this->getUser();

        if (!$user instanceof User) {
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
            'isReadOnly' => $user->isReadOnly(),
            'createdAt' => $user->getCreatedAt()?->format(\DateTimeInterface::ATOM),
            'followersCount' => $user->getFollowers()->count(),
            'followingCount' => $user->getFollowing()->count(),
            'blockedCount' => $user->getBlockedUsers()->count(),
        ]);
    }

    #[Route('/api/me/update', methods: ['POST'])]
    public function updateMe(
        Request $request,
        FileService $fileService,
        EntityManagerInterface $em
    ): JsonResponse {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json(['message' => 'Non autorisé'], Response::HTTP_UNAUTHORIZED);
        }

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
        if ($request->request->has('isReadOnly')) {
            $user->setIsReadOnly($request->request->getBoolean('isReadOnly'));
        }

        try {
            $avatarFile = $request->files->get('avatar');
            if ($avatarFile) {
                $avatarFilename = $fileService->uploadAvatar($avatarFile);
                if ($avatarFilename) {
                    if ($user->getAvatar() && $user->getAvatar() !== 'default.png') {
                        $fileService->deleteFile($user->getAvatar(), 'avatar');
                    }
                    $user->setAvatar($avatarFilename);
                }
            }

            $bannerFile = $request->files->get('banner');
            if ($bannerFile) {
                $bannerFilename = $fileService->uploadBanner($bannerFile);
                if ($bannerFilename) {
                    if ($user->getBanner() && $user->getBanner() !== 'default_banniere.png') {
                        $fileService->deleteFile($user->getBanner(), 'banner');
                    }
                    $user->setBanner($bannerFilename);
                }
            }
        } catch (\Exception $e) {
            return $this->json(['message' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }

        $em->flush();

        return $this->me();
    }

    #[Route('/api/users/{username}/follow', methods: ['POST'])]
    public function follow(string $username, UserRepository $userRepository, EntityManagerInterface $em): JsonResponse
    {
        $currentUser = $this->getUser();
        if (!$currentUser instanceof User) {
            return $this->json(['message' => 'Non autorisé'], Response::HTTP_UNAUTHORIZED);
        }

        $targetUser = $userRepository->findOneBy(['username' => $username]);
        if (!$targetUser) {
            return $this->json(['message' => 'Utilisateur introuvable'], Response::HTTP_NOT_FOUND);
        }

        if ($currentUser === $targetUser) {
            return $this->json(['message' => 'Vous ne pouvez pas vous suivre vous-même'], Response::HTTP_BAD_REQUEST);
        }

        if ($currentUser->isBlocking($targetUser)) {
            return $this->json(['message' => "Vous avez bloqué @" . $targetUser->getUsername()], Response::HTTP_FORBIDDEN);
        }
        if ($targetUser->isBlocking($currentUser)) {
            return $this->json(['message' => "@" . $targetUser->getUsername() . " vous a bloqué"], Response::HTTP_FORBIDDEN);
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

    #[Route('/api/users/{username}/block', methods: ['POST'])]
    public function block(string $username, UserRepository $userRepository, EntityManagerInterface $em): JsonResponse
    {
        $currentUser = $this->getUser();
        if (!$currentUser instanceof User) {
            return $this->json(['message' => 'Non autorisé'], Response::HTTP_UNAUTHORIZED);
        }

        $targetUser = $userRepository->findOneBy(['username' => $username]);
        if (!$targetUser) {
            return $this->json(['message' => 'Utilisateur introuvable'], Response::HTTP_NOT_FOUND);
        }

        if ($currentUser === $targetUser) {
            return $this->json(['message' => 'Vous ne pouvez pas vous bloquer vous-même'], Response::HTTP_BAD_REQUEST);
        }

        if ($currentUser->isBlocking($targetUser)) {
            $currentUser->unblock($targetUser);
            $isBlocked = false;
        } else {
            $currentUser->block($targetUser);
            $isBlocked = true;
        }

        $em->flush();

        return $this->json([
            'isBlockedByMe' => $isBlocked,
            'followersCount' => $targetUser->getFollowers()->count(),
            'followingCount' => $targetUser->getFollowing()->count(),
        ]);
    }

    #[Route('/api/me/blocked', methods: ['GET'])]
    public function getBlockedUsers(): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json(['message' => 'Non autorisé'], Response::HTTP_UNAUTHORIZED);
        }

        $blocked = array_map(function (User $u) {
            return [
                'id' => $u->getId(),
                'username' => $u->getUsername(),
                'name' => $u->getName(),
                'avatar' => $u->getAvatar(),
            ];
        }, $user->getBlockedUsers()->toArray());

        return $this->json($blocked);
    }

    #[Route('/api/users/{username}/followers', methods: ['GET'])]
    public function getFollowers(string $username, UserRepository $userRepository): JsonResponse
    {
        $user = $userRepository->findOneBy(['username' => $username]);
        if (!$user) {
            return $this->json(['message' => 'Utilisateur introuvable'], Response::HTTP_NOT_FOUND);
        }

        $currentUser = $this->getUser();
        $followers = array_map(function (User $u) use ($currentUser) {
            return [
                'id' => $u->getId(),
                'username' => $u->getUsername(),
                'name' => $u->getName(),
                'avatar' => $u->getAvatar(),
                'bio' => $u->getBio(),
                'isFollowing' => $currentUser instanceof User ? $u->getFollowers()->contains($currentUser) : false,
                'isFollower' => $currentUser instanceof User ? $currentUser->getFollowers()->contains($u) : false,
                'isBlockedByMe' => $currentUser instanceof User ? $currentUser->isBlocking($u) : false,
                'followersCount' => $u->getFollowers()->count(),
                'followingCount' => $u->getFollowing()->count(),
            ];
        }, $user->getFollowers()->toArray());

        return $this->json($followers);
    }

    #[Route('/api/users/{username}/following', methods: ['GET'])]
    public function getFollowing(string $username, UserRepository $userRepository): JsonResponse
    {
        $user = $userRepository->findOneBy(['username' => $username]);
        if (!$user) {
            return $this->json(['message' => 'Utilisateur introuvable'], Response::HTTP_NOT_FOUND);
        }

        $currentUser = $this->getUser();
        $following = array_map(function (User $u) use ($currentUser) {
            return [
                'id' => $u->getId(),
                'username' => $u->getUsername(),
                'name' => $u->getName(),
                'avatar' => $u->getAvatar(),
                'bio' => $u->getBio(),
                'isFollowing' => $currentUser instanceof User ? $u->getFollowers()->contains($currentUser) : false,
                'isFollower' => $currentUser instanceof User ? $currentUser->getFollowers()->contains($u) : false,
                'isBlockedByMe' => $currentUser instanceof User ? $currentUser->isBlocking($u) : false,
                'followersCount' => $u->getFollowers()->count(),
                'followingCount' => $u->getFollowing()->count(),
            ];
        }, $user->getFollowing()->toArray());

        return $this->json($following);
    }
}