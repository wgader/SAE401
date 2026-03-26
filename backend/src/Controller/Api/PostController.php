<?php

namespace App\Controller\Api;

use App\Entity\Post;
use App\DTO\CreatePostPayload;
use App\Repository\PostRepository;
use App\Service\PostService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class PostController extends AbstractController
{
    #[Route('/api/posts', name: 'post_index', methods: ['GET'])]
    public function index(Request $request, PostRepository $postRepository): JsonResponse
    {
        $feed = $request->query->get('feed');
        $user = $this->getUser();
        
        if ($feed === 'following' && $user) {
            $following = $user->getFollowing()->toArray();
            if (empty($following)) {
                $posts = [];
            } else {
                $posts = $postRepository->findBy(['user' => $following], ['createdAt' => 'DESC']);
            }
        } else {
            $posts = $postRepository->findAllOrderedByLatest();
        }

        $data = array_map(function (Post $post) use ($user) {
            /** @var \App\Entity\User $author */
            $author = $post->getUser();
            return [
                'id' => $post->getId(),
                'content' => $post->getContent(),
                'createdAt' => $post->getCreatedAt()->format(\DateTime::ATOM),
                'user' => [
                    'id' => $author->getId(),
                    'username' => $author->getUsername(),
                    'name' => $author->getName(),
                    'avatar' => $author->getAvatar(),
                    'isBlocked' => $author->isBlocked(),
                ],
                'likesCount' => $post->getLikes()->count(),
                'isLiked' => $user ? $post->getLikes()->contains($user) : false,
            ];
        }, $posts);

        return $this->json($data);
    }

    #[Route('/api/posts', name: 'post_create', methods: ['POST'])]
    public function create(
        Request $request,
        PostService $postService,
        ValidatorInterface $validator
    ): JsonResponse {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['message' => 'Nonautorisé'], Response::HTTP_UNAUTHORIZED);
        }

        $data = json_decode($request->getContent(), true);
        $payload = new CreatePostPayload($data['content'] ?? "");

        $errors = $validator->validate($payload);
        if (count($errors) > 0) {
            return $this->json(['message' => $errors[0]->getMessage()], Response::HTTP_BAD_REQUEST);
        }

        $post = $postService->create($user, $payload);

        return $this->json([
            'id' => $post->getId(),
            'content' => $post->getContent(),
            'createdAt' => $post->getCreatedAt()->format(\DateTime::ATOM),
            'user' => [
                'id' => $user->getId(),
                'username' => $user->getUsername(),
                'name' => $user->getName(),
                'avatar' => $user->getAvatar(),
                'isBlocked' => $user->isBlocked(),
            ],
            'likesCount' => 0,
            'isLiked' => false,
        ], Response::HTTP_CREATED);
    }

    #[Route('/api/posts/{id}/like', name: 'post_like', methods: ['POST'])]
    public function like(Post $post, PostService $postService): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['message' => 'Non autorisé'], Response::HTTP_UNAUTHORIZED);
        }

        try {
            $postService->like($post, $user);
            return $this->json([
                'likesCount' => $post->getLikes()->count(),
                'isLiked' => true,
            ]);
        } catch (\Exception $e) {
            return $this->json(['message' => 'Erreur lors de l\'ajout du like'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/api/posts/{id}/like', name: 'post_unlike', methods: ['DELETE'])]
    public function unlike(Post $post, PostService $postService): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['message' => 'Non autorisé'], Response::HTTP_UNAUTHORIZED);
        }

        try {
            $postService->unlike($post, $user);
            return $this->json([
                'likesCount' => $post->getLikes()->count(),
                'isLiked' => false,
            ]);
        } catch (\Exception $e) {
            return $this->json(['message' => 'Erreur lors de la suppression du like'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/api/users/{username}/posts', name: 'post_by_user', methods: ['GET'])]
    public function userPosts(string $username, \App\Repository\UserRepository $userRepository, PostRepository $postRepository): JsonResponse
    {
        $targetUser = $userRepository->findOneBy(['username' => $username]);
        if (!$targetUser) {
            return $this->json(['message' => 'Utilisateur introuvable'], Response::HTTP_NOT_FOUND);
        }

        $posts = $postRepository->findBy(['user' => $targetUser], ['createdAt' => 'DESC']);
        $currentUser = $this->getUser();
        
        $data = array_map(function (Post $post) use ($currentUser) {
            /** @var \App\Entity\User $author */
            $author = $post->getUser();
            return [
                'id' => $post->getId(),
                'content' => $post->getContent(),
                'createdAt' => $post->getCreatedAt()->format(\DateTime::ATOM),
                'user' => [
                    'id' => $author->getId(),
                    'username' => $author->getUsername(),
                    'name' => $author->getName(),
                    'avatar' => $author->getAvatar(),
                    'isBlocked' => $author->isBlocked(),
                ],
                'likesCount' => $post->getLikes()->count(),
                'isLiked' => $currentUser ? $post->getLikes()->contains($currentUser) : false,
            ];
        }, $posts);

        return $this->json($data);
    }

    #[Route('/api/posts/{id}', name: 'post_delete', methods: ['DELETE'])]
    public function delete(Post $post, \Doctrine\ORM\EntityManagerInterface $em): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['message' => 'Non autorisé'], Response::HTTP_UNAUTHORIZED);
        }

        if ($post->getUser() !== $user) {
            return $this->json(['message' => 'Vous n\'êtes pas l\'auteur de ce post'], Response::HTTP_FORBIDDEN);
        }

        $em->remove($post);
        $em->flush();

        return $this->json(['message' => 'Post supprimé avec succès']);
    }
}