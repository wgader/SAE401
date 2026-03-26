<?php

namespace App\Service;

use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;

class FileService
{
    private string $avatarsDirectory;
    private string $bannersDirectory;

    public function __construct(ParameterBagInterface $params)
    {
        $this->avatarsDirectory = $params->get('avatars_directory');
        $this->bannersDirectory = $params->get('banners_directory');
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
            return null;
        }
    }
}
