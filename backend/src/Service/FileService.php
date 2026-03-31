<?php

namespace App\Service;

use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;

class FileService
{
    private string $avatarsDirectory;
    private string $bannersDirectory;
    private string $postsDirectory;

    public function __construct(ParameterBagInterface $params)
    {
        $this->avatarsDirectory = $params->get('avatars_directory');
        $this->bannersDirectory = $params->get('banners_directory');
        $this->postsDirectory = $params->get('posts_directory');
    }

    public function uploadAvatar(UploadedFile $file): ?string
    {
        if (!is_dir($this->avatarsDirectory)) {
            mkdir($this->avatarsDirectory, 0777, true);
        }

        $newFilename = uniqid() . '.' . $file->guessExtension();

        try {
            $file->move($this->avatarsDirectory, $newFilename);
            return $newFilename;
        } catch (\Exception $e) {
            return null;
        }
    }

    public function uploadBanner(UploadedFile $file): ?string
    {
        if (!is_dir($this->bannersDirectory)) {
            mkdir($this->bannersDirectory, 0777, true);
        }

        $newFilename = uniqid() . '.' . $file->guessExtension();

        try {
            $file->move($this->bannersDirectory, $newFilename);
            return $newFilename;
        } catch (\Exception $e) {
            throw new \Exception("Impossible d'enregistrer la bannière : " . $e->getMessage());
        }
    }

    public function uploadPostMedia(UploadedFile $file): ?string
    {
        if (!is_dir($this->postsDirectory)) {
            mkdir($this->postsDirectory, 0777, true);
        }

        $extension = $file->guessExtension();
        if (!$extension) {
            $mimeType = $file->getMimeType();
            $extension = str_contains($mimeType, 'video') ? 'mp4' : 'jpg';
        }

        $newFilename = uniqid() . '.' . $extension;

        try {
            $file->move($this->postsDirectory, $newFilename);
            return $newFilename;
        } catch (\Exception $e) {
            return null;
        }
    }

    public function deleteFile(string $filename, string $folder): bool
    {
        $directory = match ($folder) {
            'avatar' => $this->avatarsDirectory,
            'banner' => $this->bannersDirectory,
            'post' => $this->postsDirectory,
            default => null
        };

        if (!$directory || !$filename || $filename === 'default.png' || $filename === 'default_banniere.png') {
            return false;
        }

        $path = $directory . '/' . $filename;
        if (file_exists($path)) {
            return unlink($path);
        }

        return false;
    }
}
