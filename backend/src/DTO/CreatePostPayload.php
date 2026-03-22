<?php

namespace App\DTO;

use Symfony\Component\Validator\Constraints as Assert;

class CreatePostPayload
{
    #[Assert\NotBlank(message: "Le contenu ne peut pas être vide")]
    #[Assert\Length(
        max: 280,
        maxMessage: "Le contenu ne peut pas dépasser {{ limit }} caractères"
    )]
    private string $content;

    public function __construct(string $content = "")
    {
        $this->content = $content;
    }

    public function getContent(): string
    {
        return $this->content;
    }

    public function setContent(string $content): void
    {
        $this->content = $content;
    }
}
