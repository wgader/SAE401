<?php

namespace App\Controller\Api;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\Request;
use Doctrine\ORM\EntityManagerInterface;
use App\Repository\UserRepository;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use App\Entity\User;
use App\Service\UserService;
use App\Service\EmailService;
use App\Service\FileService;

class SecurityController extends AbstractController
{
    #[Route('/api/login', name: 'user_login', methods: ['POST'])]
    public function login(Request $request, UserPasswordHasherInterface $passwordEncoder, UserRepository $userRepository, UserService $userService): JsonResponse
    {
        // On gère le format JSON et Form-Data
        $data = json_decode($request->getContent(), true);
        if ($data) {
            $identifier = $data['username'] ?? $data['email'] ?? '';
            $password = $data['password'] ?? '';
        } else {
            $identifier = $request->request->get('username') ?? $request->request->get('email') ?? '';
            $password = $request->request->get('password', '');
        }

        if (empty($identifier)) return $this->json(['message' => 'L\'identifiant (pseudo ou email) est requis'], Response::HTTP_BAD_REQUEST);
        if (empty($password)) return $this->json(['message' => 'Le mot de passe est requis'], Response::HTTP_BAD_REQUEST);

        // Recherche par pseudo, puis par email
        $user = $userRepository->findOneBy(['username' => $identifier]);
        if (!$user) {
            $user = $userRepository->findOneBy(['email' => $identifier]);
        }

        if (!$user || !$passwordEncoder->isPasswordValid($user, $password)) {
            return $this->json(['message' => 'Identifiants ou mot de passe incorrects'], Response::HTTP_UNAUTHORIZED);
        }

        if ($user->isBlocked()) {
            return $this->json(['message' => 'Ce compte a été bloqué pour non respect des conditions d\'utilisation'], Response::HTTP_FORBIDDEN);
        }

        if (!$user->isVerified()) {
            return $this->json([
                'status' => 'unverified',
                'message' => 'Votre compte n\'est pas encore vérifié. Veuillez consulter vos e-mails.',
                'email' => $user->getEmail()
            ], Response::HTTP_FORBIDDEN);
        }

        // On génère le token une fois qu'on est sûr que tout est bon
        $token = $userService->generateTokenForUser($user);

        return $this->json([
            'status' => 'success',
            'message' => 'Connexion réussie',
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

    #[Route('/api/resend-code', name: 'user_resend_code', methods: ['POST'])]
    public function resendCode(Request $request, UserRepository $userRepository, EntityManagerInterface $entityManager, EmailService $emailService): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $email = $data['email'] ?? ($request->request->get('email') ?? '');

        if (empty($email)) {
            return $this->json(['message' => 'L\'e-mail est requis'], Response::HTTP_BAD_REQUEST);
        }

        $user = $userRepository->findOneBy(['email' => $email]);

        if (!$user) {
            return $this->json(['message' => 'Utilisateur non trouvé'], Response::HTTP_NOT_FOUND);
        }

        if ($user->isVerified()) {
            return $this->json(['message' => 'Compte déjà vérifié'], Response::HTTP_BAD_REQUEST);
        }

        $user->setVerificationCode(str_pad((string)random_int(0, 999999), 6, '0', STR_PAD_LEFT));
        $user->setVerificationCodeExpiresAt(new \DateTimeImmutable('+15 minutes'));
        $entityManager->flush();

        $emailService->sendVerificationEmail($user);

        return $this->json([
            'status' => 'success',
            'message' => 'Nouveau code de vérification envoyé'
        ]);
    }

    #[Route('/api/check-availability', name: 'user_check_availability', methods: ['GET'])]
    public function checkAvailability(Request $request, UserRepository $userRepository): JsonResponse
    {
        $username = $request->query->get('username');
        $email = $request->query->get('email');

        if (empty($username) && empty($email)) {
            return $this->json(['message' => 'Pseudo ou email requis'], Response::HTTP_BAD_REQUEST);
        }

        $isUsernameTaken = false;
        $isEmailTaken = false;

        if (!empty($username)) {
            $isUsernameTaken = (bool)$userRepository->findOneBy(['username' => $username]);
        }

        if (!empty($email)) {
            $isEmailTaken = (bool)$userRepository->findOneBy(['email' => $email]);
        }

        return $this->json([
            'isUsernameTaken' => $isUsernameTaken,
            'isEmailTaken' => $isEmailTaken,
        ]);
    }

    #[Route('/api/register', name: 'user_register', methods: ['POST'])]
    public function register(
        Request $request, 
        UserPasswordHasherInterface $passwordEncoder, 
        EntityManagerInterface $entityManager, 
        UserRepository $userRepository, 
        UserService $userService,
        EmailService $emailService, 
        FileService $fileService
    ): JsonResponse {
        try {
            error_log("Registering user: " . $request->request->get('username'));
            $username = $request->request->get('username', '');
            $password = $request->request->get('password', '');
            $name = $request->request->get('name', '');
            $email = $request->request->get('email', '');
            $uploadedFile = $request->files->get('avatar');

            if (empty($username)) return $this->json(['message' => 'Le pseudo est requis'], Response::HTTP_BAD_REQUEST);
            if (empty($password)) return $this->json(['message' => 'Le mot de passe est requis'], Response::HTTP_BAD_REQUEST);
            if (empty($name)) return $this->json(['message' => 'Le nom est requis'], Response::HTTP_BAD_REQUEST);
            if (empty($email)) return $this->json(['message' => 'L\'e-mail est requis'], Response::HTTP_BAD_REQUEST);

            if ($userRepository->findOneBy(['email' => $email])) {
                return $this->json(['message' => 'Cet e-mail est déjà utilisé'], Response::HTTP_BAD_REQUEST);
            }

            if ($userRepository->findOneBy(['username' => $username])) {
                return $this->json(['message' => 'Ce pseudo est déjà utilisé'], Response::HTTP_BAD_REQUEST);
            }

            $avatar = null;
            if ($uploadedFile instanceof UploadedFile) {
                $avatar = $fileService->uploadAvatar($uploadedFile);
            }

            $user = new User();
            $user->setUsername($username);
            $user->setPassword($passwordEncoder->hashPassword($user, $password));
            $user->setName($name);
            $user->setEmail($email);
            $user->setAvatar($avatar);
            $user->setRoles(['ROLE_USER']);
            $user->setIsVerified(false);
            $user->setVerificationCode(str_pad((string)random_int(0, 999999), 6, '0', STR_PAD_LEFT));
            $user->setVerificationCodeExpiresAt(new \DateTimeImmutable('+15 minutes'));

            $entityManager->persist($user);
            $entityManager->flush();

            // Envoi du mail de vérification
            $emailService->sendVerificationEmail($user);

            return $this->json([
                'status' => 'success',
                'message' => 'Utilisateur créé, veuillez vérifier vos e-mails',
                'email' => $email
            ], Response::HTTP_CREATED);
        } catch (\Throwable $e) {
            error_log("Registration error: " . $e->getMessage());
            return $this->json([
                'status' => 'error',
                'message' => 'Erreur lors de l\'inscription : ' . $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/api/verify-code', name: 'user_verify_code', methods: ['POST'])]
    public function verifyCode(Request $request, UserRepository $userRepository, EntityManagerInterface $entityManager, UserService $userService, EmailService $emailService): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $email = $data['email'] ?? ($request->request->get('email') ?? '');
        $code = $data['code'] ?? ($request->request->get('code') ?? '');

        if (empty($email) || empty($code)) {
            return $this->json(['message' => 'L\'e-mail et le code sont requis'], Response::HTTP_BAD_REQUEST);
        }

        $user = $userRepository->findOneBy(['email' => $email, 'verificationCode' => $code]);

        if (!$user) {
            return $this->json(['message' => 'Code de vérification ou e-mail invalide'], Response::HTTP_BAD_REQUEST);
        }

        if ($user->getVerificationCodeExpiresAt() < new \DateTimeImmutable()) {
            return $this->json(['message' => 'Le code de vérification a expiré'], Response::HTTP_BAD_REQUEST);
        }

        $user->setIsVerified(true);
        $user->setVerificationCode(null);
        $entityManager->flush();

        // Envoi du mail de succès 
        $emailService->sendSuccessEmail($user);

        $token = $userService->generateTokenForUser($user);

        return $this->json([
            'status' => 'success',
            'message' => 'Compte vérifié avec succès',
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
}