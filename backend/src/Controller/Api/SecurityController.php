<?php

namespace App\Controller\Api;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\Request;
use Doctrine\ORM\EntityManagerInterface;
use App\Repository\UserRepository;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use App\Entity\User;
use App\Service\UserService;

class SecurityController extends AbstractController
{
    #[Route('/api/login', name: 'user_login', methods: ['POST'])]
    public function login(Request $request, UserPasswordHasherInterface $passwordEncoder, UserRepository $userRepository, UserService $userService): Response
    {
        // On gère le format JSON (Postman raw) et Form-Data
        $data = json_decode($request->getContent(), true);
        if ($data) {
            $identifier = $data['username'] ?? $data['email'] ?? '';
            $password = $data['password'] ?? '';
        } else {
            $identifier = $request->request->get('username') ?? $request->request->get('email') ?? '';
            $password = $request->request->get('password', '');
        }

        if (empty($identifier)) return $this->json(['message' => 'Identifier (username or email) is required'], Response::HTTP_BAD_REQUEST);
        if (empty($password)) return $this->json(['message' => 'Password is required'], Response::HTTP_BAD_REQUEST);

        // Recherche par pseudo, puis par email
        $user = $userRepository->findOneBy(['username' => $identifier]);
        if (!$user) {
            $user = $userRepository->findOneBy(['email' => $identifier]);
        }

        if (!$user) {
            return $this->json(['message' => 'User not found'], Response::HTTP_UNAUTHORIZED);
        }

        if (!$passwordEncoder->isPasswordValid($user, $password)) {
            return $this->json(['message' => 'Invalid password'], Response::HTTP_UNAUTHORIZED);
        }

        // On génère le token une fois qu'on est sûr que tout est bon
        $token = $userService->generateTokenForUser($user);

        return $this->json([
            'status' => 'success',
            'message' => 'Logged in',
            'token' => $token,
            'user' => [
                'id' => $user->getId(),
                'username' => $user->getUsername(),
                'name' => $user->getName(),
                'avatar' => $user->getAvatar(),
                'isVerified' => $user->isVerified(),
                'createdAt' => $user->getCreatedAt()?->format(\DateTimeInterface::ATOM),
            ]
        ]);
    }

    #[Route('/api/register', name: 'user_register', methods: ['POST'])]
    public function register(Request $request, UserPasswordHasherInterface $passwordEncoder, EntityManagerInterface $entityManager, UserRepository $userRepository, UserService $userService): Response
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

            if (!is_dir($uploadsDirectory)) {
                mkdir($uploadsDirectory, 0777, true);
                chmod($this->getParameter('kernel.project_dir') . '/public/uploads', 0777);
                chmod($uploadsDirectory, 0777);
            }

            try {
                $uploadedFile->move($uploadsDirectory, $newFilename);
                $avatar = $newFilename;
            } catch (\Exception $e) {
                return $this->json(['message' => 'Failed to upload avatar: ' . $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
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

        // Le token est généré pour connecter directement l'utilisateur après son inscription
        $token = $userService->generateTokenForUser($user);

        return $this->json([
            'status' => 'success',
            'message' => 'User created',
            'token' => $token,
            'user' => [
                'id' => $user->getId(),
                'username' => $user->getUsername(),
                'name' => $user->getName(),
                'avatar' => $user->getAvatar(),
                'isVerified' => $user->isVerified(),
                'createdAt' => $user->getCreatedAt()?->format(\DateTimeInterface::ATOM),
            ]
        ], 201);
    }
}