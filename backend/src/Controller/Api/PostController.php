<?php

namespace App\Controller\Api;

use App\Entity\Post;
use App\Entity\PostMedia;
use App\Entity\User;
use App\DTO\CreatePostPayload;
use App\Repository\PostRepository;
use App\Repository\UserRepository;
use App\Service\PostService;
use App\Service\FileService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Doctrine\ORM\EntityManagerInterface;

class PostController extends AbstractController
{
    #[Route('/api/posts/{id}', name: 'post_show', methods: ['GET'])]
    public function show(Post $post): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            $user = null;
        }

        $media = array_map(function (PostMedia $m) {
            return [
                'id' => $m->getId(),
                'url' => $m->getFilePath(),
                'type' => $m->getType()
            ];
        }, $post->getMedia()->toArray());

        return $this->json([
            'id' => $post->getId(),
            'content' => $post->getContent(),
            'createdAt' => $post->getCreatedAt()->format(\DateTime::ATOM),
            'user' => [
                'id' => $post->getUser()->getId(),
                'username' => $post->getUser()->getUsername(),
                'name' => $post->getUser()->getName(),
                'avatar' => $post->getUser()->getAvatar(),
                'isBlocked' => (bool) $post->getUser()->isBlocked(),
                'isBlockedByMe' => $user instanceof User ? $user->isBlocking($post->getUser()) : false,
                'hasBlockedMe' => $user instanceof User ? $post->getUser()->isBlocking($user) : false,
            ],
            'likesCount' => $post->getLikes()->count(),
            'isLiked' => $user ? $post->getLikes()->contains($user) : false,
            'repliesCount' => $post->getReplies()->count(),
            'parentId' => $post->getParent()?->getId(),
            'media' => $media,
            'isCensored' => $post->isCensored(),
        ]);
    }

    #[Route('/api/posts', name: 'post_index', methods: ['GET'])]
    public function index(Request $request, PostRepository $postRepository): JsonResponse
    {
        $feed = $request->query->get('feed');
        $user = $this->getUser();
        if ($user instanceof User && $feed === 'following') {
            $following = $user->getFollowing()->toArray();
            if (empty($following)) {
                $posts = [];
            } else {
                $posts = $postRepository->findBy(['user' => $following, 'parent' => null], ['createdAt' => 'DESC']);
            }
        } else {
            $posts = $postRepository->findBy(['parent' => null], ['createdAt' => 'DESC']);
        }

        $data = array_map(function (Post $post) use ($user) {
            $author = $post->getUser();

            $media = array_map(function (PostMedia $m) {
                return [
                    'id' => $m->getId(),
                    'url' => $m->getFilePath(),
                    'type' => $m->getType()
                ];
            }, $post->getMedia()->toArray());

            return [
                'id' => $post->getId(),
                'content' => $post->getContent(),
                'createdAt' => $post->getCreatedAt()->format(\DateTime::ATOM),
                'user' => [
                    'id' => $author->getId(),
                    'username' => $author->getUsername(),
                    'name' => $author->getName(),
                    'avatar' => $author->getAvatar(),
                    'isBlocked' => (bool) $author->isBlocked(),
                    'isBlockedByMe' => $user instanceof User ? $user->isBlocking($author) : false,
                    'hasBlockedMe' => $user instanceof User ? $author->isBlocking($user) : false,
                ],
                'likesCount' => $post->getLikes()->count(),
                'isLiked' => $user ? $post->getLikes()->contains($user) : false,
                'repliesCount' => $post->getReplies()->count(),
                'parentId' => $post->getParent()?->getId(),
                'media' => $media,
                'isCensored' => $post->isCensored(),
            ];
        }, $posts);

        return $this->json($data);
    }

    #[Route('/api/posts', name: 'post_create', methods: ['POST'])]
    public function create(
        Request $request,
        PostService $postService,
        FileService $fileService,
        ValidatorInterface $validator,
        PostRepository $postRepository
    ): JsonResponse {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json(['message' => 'Non autorisé'], Response::HTTP_UNAUTHORIZED);
        }

        $content = $request->request->get('content');
        if (!$content) {
            $data = json_decode($request->getContent(), true);
            $content = $data['content'] ?? "";
        }

        $payload = new CreatePostPayload($content);
        $errors = $validator->validate($payload);
        if (count($errors) > 0) {
            return $this->json(['message' => $errors[0]->getMessage()], Response::HTTP_BAD_REQUEST);
        }

        $mediaData = [];
        $filesFromRequest = $request->files->all();
        $files = $filesFromRequest['media'] ?? $request->files->get('media');

        if (!$content && empty($files)) {
            return $this->json(['message' => 'Le contenu ne peut pas être vide'], Response::HTTP_BAD_REQUEST);
        }

        if ($files && is_array($files)) {
            // Respecte la limite de 4 fichiers
            $files = array_slice($files, 0, 4);
            foreach ($files as $file) {
                if ($file instanceof UploadedFile) {
                    if (!$file->isValid()) {
                        $errorMsg = match ($file->getError()) {
                            UPLOAD_ERR_INI_SIZE => "Le fichier \"" . $file->getClientOriginalName() . "\" est trop lourd pour le serveur (max 2Mo).",
                            UPLOAD_ERR_FORM_SIZE => "Le fichier est trop lourd pour le formulaire.",
                            UPLOAD_ERR_PARTIAL => "L'envoi du fichier a été interrompu.",
                            UPLOAD_ERR_NO_FILE => "Aucun fichier n'a été reçu.",
                            default => "Erreur d'upload : " . $file->getErrorMessage()
                        };
                        return $this->json(['message' => $errorMsg], Response::HTTP_BAD_REQUEST);
                    }
                    
                    try {
                        $mimeType = $file->getMimeType();
                        $type = str_contains($mimeType, 'video') ? 'video' : 'image';
                        $path = $fileService->uploadPostMedia($file);
                        if ($path) {
                            $mediaData[] = ['path' => $path, 'type' => $type];
                        }
                    } catch (\Exception $e) {
                        return $this->json(['message' => "Erreur lors du traitement du fichier \"" . $file->getClientOriginalName() . "\" : " . $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
                    }
                }
            }
        }

        $parentId = $request->request->get('parentId');
        $parent = $parentId ? $postRepository->find($parentId) : null;

        if ($parent && $parent->getUser()->isBlocked()) {
            return $this->json(['message' => 'Impossible de répondre à un utilisateur suspendu'], Response::HTTP_FORBIDDEN);
        }

        $post = $postService->create($user, $payload, $mediaData, $parent);

        $mediaResponse = array_map(function (PostMedia $m) {
            return [
                'id' => $m->getId(),
                'url' => $m->getFilePath(),
                'type' => $m->getType()
            ];
        }, $post->getMedia()->toArray());

        return $this->json([
            'id' => $post->getId(),
            'content' => $post->getContent(),
            'createdAt' => $post->getCreatedAt()->format(\DateTime::ATOM),
            'user' => [
                'id' => $user->getId(),
                'username' => $user->getUsername(),
                'name' => $user->getName(),
                'avatar' => $user->getAvatar(),
                'isBlocked' => (bool) $user->isBlocked(),
                'isBlockedByMe' => false,
                'hasBlockedMe' => false,
            ],
            'likesCount' => 0,
            'isLiked' => false,
            'repliesCount' => 0,
            'parentId' => $post->getParent()?->getId(),
            'media' => $mediaResponse,
            'isCensored' => $post->isCensored(),
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
    public function userPosts(string $username, UserRepository $userRepository, PostRepository $postRepository): JsonResponse
    {
        $targetUser = $userRepository->findOneBy(['username' => $username]);
        if (!$targetUser) {
            return $this->json(['message' => 'Utilisateur introuvable'], Response::HTTP_NOT_FOUND);
        }

        $posts = $postRepository->findBy(['user' => $targetUser, 'parent' => null], ['createdAt' => 'DESC']);
        $currentUser = $this->getUser();

        $data = array_map(function (Post $post) use ($currentUser) {
            $author = $post->getUser();

            $media = array_map(function (PostMedia $m) {
                return [
                    'id' => $m->getId(),
                    'url' => $m->getFilePath(),
                    'type' => $m->getType()
                ];
            }, $post->getMedia()->toArray());

            return [
                'id' => $post->getId(),
                'content' => $post->getContent(),
                'createdAt' => $post->getCreatedAt()->format(\DateTime::ATOM),
                'user' => [
                    'id' => $author->getId(),
                    'username' => $author->getUsername(),
                    'name' => $author->getName(),
                    'avatar' => $author->getAvatar(),
                    'isBlocked' => (bool) $author->isBlocked(),
                    'isBlockedByMe' => $currentUser instanceof User ? $currentUser->isBlocking($author) : false,
                    'hasBlockedMe' => $currentUser instanceof User ? $author->isBlocking($currentUser) : false,
                ],
                'likesCount' => $post->getLikes()->count(),
                'isLiked' => $currentUser ? $post->getLikes()->contains($currentUser) : false,
                'repliesCount' => $post->getReplies()->count(),
                'parentId' => $post->getParent()?->getId(),
                'media' => $media,
                'isCensored' => $post->isCensored(),
            ];
        }, $posts);

        return $this->json($data);
    }

    #[Route('/api/posts/{id}', name: 'post_delete', methods: ['DELETE'])]
    public function delete(Post $post, PostService $postService): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['message' => 'Non autorisé'], Response::HTTP_UNAUTHORIZED);
        }

        if ($post->getUser() !== $user) {
            return $this->json(['message' => 'Vous n\'êtes pas l\'auteur de ce post'], Response::HTTP_FORBIDDEN);
        }

        $postService->delete($post);

        return $this->json(['message' => 'Post supprimé avec succès']);
    }

    #[Route('/api/posts/{id}', name: 'post_update', methods: ['POST'])]
    public function update(
        Post $post,
        Request $request,
        PostService $postService,
        FileService $fileService,
        ValidatorInterface $validator
    ): JsonResponse {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json(['message' => 'Non autorisé'], Response::HTTP_UNAUTHORIZED);
        }

        if ($post->getUser() !== $user) {
            return $this->json(['message' => 'Vous n\'êtes pas l\'auteur de ce post'], Response::HTTP_FORBIDDEN);
        }

        $content = $request->request->get('content', $post->getContent());
        $payload = new CreatePostPayload($content);
        $errors = $validator->validate($payload);
        if (count($errors) > 0) {
            return $this->json(['message' => $errors[0]->getMessage()], Response::HTTP_BAD_REQUEST);
        }

        $removeMediaIds = $request->request->all('removeMedia') ?? [];

        $newMediaData = [];
        $files = $request->files->get('media'); // Tableau de fichiers
        if ($files && is_array($files)) {
            // Respecte la limite de 4 médias au total
            $currentCount = $post->getMedia()->count();
            $removedCount = 0;
            foreach ($post->getMedia() as $m) {
                if (in_array((string) $m->getId(), $removeMediaIds)) {
                    $removedCount++;
                }
            }

            $filesFromRequest = $request->files->all();
            $files = $filesFromRequest['media'] ?? $request->files->get('media');

            $availableSlots = 4 - ($currentCount - $removedCount);
            if ($availableSlots > 0 && $files && is_array($files)) {
                $filesToAdd = array_slice($files, 0, $availableSlots);
                foreach ($filesToAdd as $file) {
                    if ($file instanceof \Symfony\Component\HttpFoundation\File\UploadedFile && $file->isValid()) {
                        try {
                            $mimeType = $file->getMimeType();
                            $type = str_contains($mimeType, 'video') ? 'video' : 'image';
                            $path = $fileService->uploadPostMedia($file);
                            if ($path) {
                                $newMediaData[] = ['path' => $path, 'type' => $type];
                            }
                        } catch (\Exception $e) {
                            continue;
                        }
                    }
                }
            }
        }

        $postService->update($post, $content, $newMediaData, array_map('intval', $removeMediaIds));

        $mediaResponse = array_map(function (PostMedia $m) {
            return [
                'id' => $m->getId(),
                'url' => $m->getFilePath(),
                'type' => $m->getType()
            ];
        }, $post->getMedia()->toArray());

        return $this->json([
            'id' => $post->getId(),
            'content' => $post->getContent(),
            'createdAt' => $post->getCreatedAt()->format(\DateTime::ATOM),
            'user' => [
                'id' => $user->getId(),
                'username' => $user->getUsername(),
                'name' => $user->getName(),
                'avatar' => $user->getAvatar(),
                'isBlocked' => (bool) $user->isBlocked(),
                'isBlockedByMe' => false,
                'hasBlockedMe' => false,
            ],
            'likesCount' => $post->getLikes()->count(),
            'isLiked' => $post->getLikes()->contains($user),
            'repliesCount' => $post->getReplies()->count(),
            'parentId' => $post->getParent()?->getId(),
            'media' => $mediaResponse,
            'isCensored' => $post->isCensored(),
        ]);
    }

    #[Route('/api/posts/{id}/replies', name: 'post_replies', methods: ['GET'])]
    public function replies(Post $post): JsonResponse
    {
        $user = $this->getUser();
        $replies = $post->getReplies();

        $data = array_map(function (Post $reply) use ($user) {
            $author = $reply->getUser();

            $media = array_map(function (PostMedia $m) {
                return [
                    'id' => $m->getId(),
                    'url' => $m->getFilePath(),
                    'type' => $m->getType()
                ];
            }, $reply->getMedia()->toArray());

            return [
                'id' => $reply->getId(),
                'content' => $reply->getContent(),
                'createdAt' => $reply->getCreatedAt()->format(\DateTime::ATOM),
                'user' => [
                    'id' => $author->getId(),
                    'username' => $author->getUsername(),
                    'name' => $author->getName(),
                    'avatar' => $author->getAvatar(),
                    'isBlocked' => (bool) $author->isBlocked(),
                    'isBlockedByMe' => $user instanceof User ? $user->isBlocking($author) : false,
                    'hasBlockedMe' => $user instanceof User ? $author->isBlocking($user) : false,
                ],
                'likesCount' => $reply->getLikes()->count(),
                'isLiked' => $user instanceof User ? $reply->getLikes()->contains($user) : false,
                'repliesCount' => $reply->getReplies()->count(),
                'parentId' => $reply->getParent()?->getId(),
                'media' => $media,
                'isCensored' => $reply->isCensored(),
            ];
        }, $replies->toArray());

        return $this->json($data);
    }
}