<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\Request;
use Doctrine\ORM\EntityManagerInterface;
use App\Repository\UserRepository;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use App\Entity\User;

class SecurityController extends AbstractController
{
    #[Route('/api/login', name: 'user_login', methods: ['POST'])]
    public function login(Request $request, UserPasswordHasherInterface $passwordEncoder, UserRepository $userRepository): Response
    {
        $data = json_decode($request->getContent(), true);
        $username = $data['username'] ?? '';
        $password = $data['password'] ?? '';

        $user = $userRepository->findOneBy(['username' => $username]);

        if (!$user || !$passwordEncoder->isPasswordValid($user, $password)) {
            return $this->json(['message' => 'Invalid credentials'], Response::HTTP_UNAUTHORIZED);
        }

        return $this->json([
            'status' => 'success',
            'message' => 'Logged in',
            'user' => [
                'id' => $user->getId(),
                'username' => $user->getUsername(),
                'name' => $user->getName(),
                'avatar' => $user->getAvatar(),
            ]
        ]);
    }

    #[Route('/register', name: 'user_register', methods: ['POST'])]
    public function register(Request $request, UserPasswordHasherInterface $passwordEncoder, EntityManagerInterface $entityManager, UserRepository $userRepository): Response
    {
        
        $username = $request->request->get('username', '');
        $password = $request->request->get('password', '');
        $name = $request->request->get('name', '');
        $email = $request->request->get('email', '');
        $uploadedFile = $request->files->get('avatar');

        if (empty($username)) return $this->json(['message' => 'Username is required'], Response::HTTP_BAD_REQUEST);
        if (empty($password)) return $this->json(['message' => 'Password is required'], Response::HTTP_BAD_REQUEST);
        if (empty($name)) return $this->json(['message' => 'Name is required'], Response::HTTP_BAD_REQUEST);
        if (empty($email)) return $this->json(['message' => 'Email is required'], Response::HTTP_BAD_REQUEST);

        if ($userRepository->findOneBy(['email' => $email])) {
            return $this->json(['message' => 'Email already exists'], Response::HTTP_BAD_REQUEST);
        }

        if ($userRepository->findOneBy(['username' => $username])) {
            return $this->json(['message' => 'Username already exists'], Response::HTTP_BAD_REQUEST);
        }

        $avatar = null;
        if ($uploadedFile instanceof UploadedFile) {
            $uploadsDirectory = $this->getParameter('kernel.project_dir') . '/public/uploads/avatars';
            $newFilename = uniqid() . '.' . $uploadedFile->guessExtension();

            try {
                $uploadedFile->move($uploadsDirectory, $newFilename);
                $avatar = $newFilename;
            } catch (\Exception $e) {
                return $this->json(['message' => 'Failed to upload avatar'], Response::HTTP_INTERNAL_SERVER_ERROR);
            }
        }

        $user = new User();
        $user->setUsername($username);
        $user->setPassword($passwordEncoder->hashPassword($user, $password));
        $user->setName($name);
        $user->setEmail($email);
        $user->setAvatar($avatar);
        $user->setRoles(['ROLE_USER']);
        $user->setVerified(false);
        $user->setVerificationCode(str_pad((string)random_int(0, 999999), 6, '0', STR_PAD_LEFT));

        $entityManager->persist($user);
        $entityManager->flush();

        return $this->json([
            'status' => 'success',
            'message' => 'User created',
            'user' => [
                'id' => $user->getId(),
                'username' => $user->getUsername(),
                'name' => $user->getName(),
                'avatar' => $user->getAvatar(),
            ]
        ], 201);
    }
}