<?php

namespace App\Service;

use App\Entity\Post;
use App\Entity\User;
use App\DTO\CreatePostPayload;
use Doctrine\ORM\EntityManagerInterface;

class PostService
{
    public function __construct(
        private EntityManagerInterface $entityManager
    ) {}

    public function create(User $user, CreatePostPayload $payload): Post
    {
        $post = new Post();
        $post->setContent($payload->getContent());
        $post->setUser($user);
        $post->setCreatedAt(new \DateTimeImmutable());

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
}
