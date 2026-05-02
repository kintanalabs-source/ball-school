<?php

namespace App\Controller\Admin;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/admin')]
class UserController extends AbstractController
{
    #[Route('/users', name: 'api_admin_users_list', methods: ['GET'])]
    public function list(EntityManagerInterface $em): JsonResponse
    {
        dd('Controller hit!'); // Ligne de débogage temporaire
        $users = $em->getRepository(User::class)->findAll();
        $data = [];
        
        foreach ($users as $user) {
            $data[] = [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'roles' => $user->getRoles(),
                'status' => $user->getStatus() ?? 'refused',
            ];
        }

        return new JsonResponse($data);
    }

    #[Route('/users/{id}/status', name: 'api_admin_user_update_status', methods: ['POST'])]
    public function updateStatus(int $id, Request $request, EntityManagerInterface $em): JsonResponse
    {
        $user = $em->getRepository(User::class)->find($id);
        
        if (!$user) {
            return new JsonResponse(['message' => 'Utilisateur introuvable'], 404);
        }

        $data = json_decode($request->getContent(), true);
        $newStatus = $data['status'] ?? null;

        if (!in_array($newStatus, ['accepted', 'refused'])) {
            return new JsonResponse(['message' => 'Statut invalide'], 400);
        }

        $user->setStatus($newStatus);
        $em->flush();

        return new JsonResponse([
            'message' => 'Statut mis à jour avec succès', 
            'id' => $id,
            'status' => $newStatus
        ]);
    }
}