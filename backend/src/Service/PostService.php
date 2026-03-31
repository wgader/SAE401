<?php

namespace App\Service;

use App\Entity\Post;
use App\Entity\PostMedia;
use App\Entity\User;
use App\DTO\CreatePostPayload;
use Doctrine\ORM\EntityManagerInterface;

class PostService
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private FileService $fileService
        )
    {
    }

    public function create(User $user, CreatePostPayload $payload, array $mediaFiles = [], ?Post $parent = null): Post
    {
        $post = new Post();
        $post->setContent($payload->getContent());
        $post->setUser($user);
        $post->setParent($parent);
        $post->setCreatedAt(new \DateTimeImmutable());

        foreach ($mediaFiles as $mediaData) {
            $media = new PostMedia();
            $media->setFilePath($mediaData['path']);
            $media->setType($mediaData['type']);
            $post->addMedia($media);
            $this->entityManager->persist($media);
        }

        $this->entityManager->persist($post);
        $this->entityManager->flush();

        return $post;
    }

    public function like(Post $post, User $user): void
    {
        if (!$post->getLikes()->contains($user)) {
            $user->addLikedPost($post);
            $this->entityManager->persist($post);
            $this->entityManager->flush();
        }
    }

    public function unlike(Post $post, User $user): void
    {
        if ($post->getLikes()->contains($user)) {
            $user->removeLikedPost($post);
            $this->entityManager->persist($post);
            $this->entityManager->flush();
        }
    }

    public function delete(Post $post): void
    {
        // Supprimer les fichiers physiques des médias
        foreach ($post->getMedia() as $media) {
            $this->fileService->deleteFile($media->getFilePath(), 'post');
        }

        $this->entityManager->remove($post);
        $this->entityManager->flush();
    }

    public function update(Post $post, string $content, array $newMediaData, array $mediaToRemoveIds): void
    {
        $post->setContent($content);

        // Enlever les médias
        foreach ($post->getMedia() as $media) {
            if (in_array($media->getId(), $mediaToRemoveIds)) {
                $this->fileService->deleteFile($media->getFilePath(), 'post');
                $post->removeMedia($media);
                $this->entityManager->remove($media);
            }
        }

        // Ajouter les nouveaux médias
        foreach ($newMediaData as $mediaData) {
            $media = new PostMedia();
            $media->setFilePath($mediaData['path']);
            $media->setType($mediaData['type']);
            $post->addMedia($media);
            $this->entityManager->persist($media);
        }

        $this->entityManager->flush();
    }
}