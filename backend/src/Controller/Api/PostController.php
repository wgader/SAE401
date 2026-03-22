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
    public function index(PostRepository $postRepository): JsonResponse
    {
        $posts = $postRepository->findAllOrderedByLatest();
        
        $data = array_map(function (Post $post) {
            return [
                'id' => $post->getId(),
                'content' => $post->getContent(),
                'createdAt' => $post->getCreatedAt()->format(\DateTime::ATOM),
                'user' => [
                    'id' => $post->getUser()->getId(),
                    'username' => $post->getUser()->getUsername(),
                    'name' => $post->getUser()->getName(),
                    'avatar' => $post->getUser()->getAvatar(),
                ],
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
            return $this->json(['message' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
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
            ],
        ], Response::HTTP_CREATED);
    }
}