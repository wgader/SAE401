<?php

namespace App\Service;

use App\Entity\User;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Address;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Psr\Log\LoggerInterface;

class EmailService
{
    private string $adminEmail;
    private string $frontUrl;
    private string $projectRoot;

    public function __construct(
        private MailerInterface $mailer,
        private LoggerInterface $logger,
        ParameterBagInterface $params
    ) {
        $this->adminEmail = $params->get('admin_email');
        $this->frontUrl = $params->get('front_url');
        $this->projectRoot = $params->get('kernel.project_dir');
    }

    public function sendVerificationEmail(User $user): void
    {
        $email = (new TemplatedEmail())
            ->from(new Address($this->adminEmail, 'Sphere'))
            ->to($user->getEmail())
            ->subject('Sphere - Votre code de vérification')
            ->htmlTemplate('emails/verification_code.html.twig')
            ->context([
                'name' => $user->getName(),
                'code' => $user->getVerificationCode(),
            ]);

        $logoPath = $this->projectRoot . '/public/images/logo_sphere.svg';
        if (file_exists($logoPath)) {
            $email->embedFromPath($logoPath, 'logo', 'image/svg+xml');
        }

        $this->trySend($email);
    }

    public function sendSuccessEmail(User $user): void
    {
        $email = (new TemplatedEmail())
            ->from(new Address($this->adminEmail, 'Sphere'))
            ->to($user->getEmail())
            ->subject('Bienvenue sur Sphere !')
            ->htmlTemplate('emails/registration_success.html.twig')
            ->context([
                'name' => $user->getName(),
                'app_url' => $this->frontUrl,
            ]);

        $logoPath = $this->projectRoot . '/public/images/logo_sphere.svg';
        if (file_exists($logoPath)) {
            $email->embedFromPath($logoPath, 'logo', 'image/svg+xml');
        }

        $this->trySend($email);
    }

    private function trySend(TemplatedEmail $email): void
    {
        try {
            error_log("Attempting to send email via mailer...");
            $this->mailer->send($email);
            error_log("Email sent successfully according to mailer.");
        } catch (\Exception $e) {
            error_log("Email sending failed: " . $e->getMessage());
            $this->logger->error('Email sending failed: ' . $e->getMessage());
        }
    }
}