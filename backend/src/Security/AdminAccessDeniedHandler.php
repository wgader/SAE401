<?php

namespace App\Security;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Symfony\Component\Security\Http\Authorization\AccessDeniedHandlerInterface;

class AdminAccessDeniedHandler implements AccessDeniedHandlerInterface
{
    private $urlGenerator;

    public function __construct(UrlGeneratorInterface $urlGenerator)
    {
        $this->urlGenerator = $urlGenerator;
    }

    public function handle(Request $request, AccessDeniedException $accessDeniedException): ?Response
    {
        // On redirige vers la page de login avec un message 
        $request->getSession()->getFlashBag()->add('error', 'Vous n\'avez pas les droits nécessaires pour accéder à l\'administration.');

        return new RedirectResponse($this->urlGenerator->generate('app_login'));
    }
}