<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Authentication\AuthenticationUtils;
use Doctrine\ORM\EntityManagerInterface;
use App\Entity\User;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class LoginController extends AbstractController
{
    // Page de login Twig (fallback)
    #[Route('/login', name: 'app_login')]
    public function twigLogin(AuthenticationUtils $authenticationUtils): Response
    {
        if ($this->getUser()) {
            return $this->redirectToRoute('app_dashboard');
        }

        $error = $authenticationUtils->getLastAuthenticationError();
        $lastUsername = $authenticationUtils->getLastUsername();

        return $this->render('login/index.html.twig', [
            'last_username' => $lastUsername,
            'error' => $error,
        ]);
    }

    #[Route('/logout', name: 'app_logout')]
    public function logout(): void
    {
        throw new \Exception('This method can be blank - it will be intercepted by the logout key on your firewall.');
    }

    // Route temporaire pour corriger l'erreur 404 sur les utilisateurs
    #[Route('/api/admin/users', name: 'api_admin_users_list', methods: ['GET'])]
    public function getUsers(EntityManagerInterface $entityManager): Response
    {
        $users = $entityManager->getRepository(User::class)->findAll();
        
        // On retourne la liste en JSON (attention aux références circulaires si l'entité est complexe)
        return $this->json($users, 200, [], ['groups' => 'user:read']);
    }

    // Route pour créer un utilisateur manuellement par l'admin (identique au register)
    #[Route('/api/admin/users', name: 'api_admin_users_create', methods: ['POST'])]
    public function createUser(
        Request $request, 
        UserPasswordHasherInterface $passwordHasher, 
        EntityManagerInterface $em
    ): Response {
        $data = json_decode($request->getContent(), true);

        if (!isset($data['email']) || !isset($data['password'])) {
            return $this->json(['message' => 'Données incomplètes'], 400);
        }

        $existingUser = $em->getRepository(User::class)->findOneBy(['email' => $data['email']]);
        if ($existingUser) {
            return $this->json(['message' => 'Cet email est déjà utilisé par un autre compte.'], 400);
        }

        $user = new User();
        $user->setEmail($data['email']);
        $user->setRoles(['ROLE_USER']);
        $user->setStatus('refused'); // On garde 'refused' comme dans AuthController
        
        $user->setPassword($passwordHasher->hashPassword($user, $data['password']));

        $em->persist($user);
        $em->flush();

        return $this->json([
            'message' => 'Utilisateur créé avec succès',
            'user' => $user
        ], 201, [], ['groups' => 'user:read']);
    }

    // Route pour mettre à jour le statut d'un utilisateur (Accepter/Refuser)
    #[Route('/api/admin/users/{id}/status', name: 'api_admin_users_update_status', methods: ['POST'])]
    public function updateUserStatus(User $user, Request $request, EntityManagerInterface $entityManager): Response
    {
        $data = json_decode($request->getContent(), true);
        $newStatus = $data['status'] ?? null;

        if (!$newStatus) {
            return $this->json(['message' => 'Statut manquant dans la requête'], 400);
        }

        $user->setStatus($newStatus);
        $entityManager->flush();

        return $this->json([
            'message' => 'Statut mis à jour avec succès',
            'user' => $user
        ], 200, [], ['groups' => 'user:read']);
    }

    #[Route('/api/admin/users/{id}', name: 'api_admin_users_delete', methods: ['DELETE'])]
    public function deleteUser(User $user, EntityManagerInterface $entityManager): Response
    {
        $entityManager->remove($user);
        $entityManager->flush();

        return $this->json(['message' => 'Utilisateur supprimé avec succès'], 200);
    }
}