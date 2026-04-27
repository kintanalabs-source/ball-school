<?php

namespace App\Controller;

use App\Entity\AccountingMovement;
use App\Entity\Fee;
use App\Entity\PreviousYearRegularization;
use App\Entity\SchoolYear;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class RegularizationController extends AbstractController
{
    #[Route('/api/regularizations/sync', name: 'api_regularization_sync', methods: ['POST'])]
    public function sync(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $currentYearIri = $data['currentYear'] ?? null;

        if (!$currentYearIri) {
            return new JsonResponse(['message' => 'Année scolaire actuelle manquante'], 400);
        }

        // 1. Trouver l'année actuelle et l'année précédente
        $currentYearId = (int) filter_var($currentYearIri, FILTER_SANITIZE_NUMBER_INT);
        $currentYear = $em->getRepository(SchoolYear::class)->find($currentYearId);
        
        if (!$currentYear) {
            return new JsonResponse(['message' => 'Année scolaire introuvable'], 404);
        }

        // On cherche l'année qui s'est terminée juste avant le début de l'actuelle
        $previousYear = $em->getRepository(SchoolYear::class)->createQueryBuilder('s')
            ->where('s.startDate < :start')
            ->setParameter('start', $currentYear->getStartDate())
            ->orderBy('s.startDate', 'DESC')
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult();

        // 2. Supprimer uniquement les régularisations liées à l'année actuelle 
        // pour ne pas toucher aux données des autres années scolaires
        $em->createQuery('DELETE FROM App\Entity\PreviousYearRegularization p WHERE p.schoolYear = :year')
           ->setParameter('year', $currentYear)
           ->execute();

        if (!$previousYear) {
            return new JsonResponse(['message' => 'Aucune année précédente trouvée. La liste a été vidée.'], 200);
        }

        // 3. Chercher tous les écolages (type ecolage) impayés de l'année précédente
        $unpaidFees = $em->getRepository(Fee::class)->findBy([
            'schoolYear' => $previousYear,
            'isPaid' => false,
            'type' => 'ecolage'
        ]);

        // 4. Regrouper par élève
        $debtsByStudent = [];
        foreach ($unpaidFees as $fee) {
            $studentId = $fee->getStudent()->getId();
            if (!isset($debtsByStudent[$studentId])) {
                $debtsByStudent[$studentId] = [
                    'student' => $fee->getStudent(),
                    'months' => [],
                    'total' => 0
                ];
            }
            $debtsByStudent[$studentId]['months'][] = $fee->getMonth();
            $debtsByStudent[$studentId]['total'] += $fee->getAmount();
        }

        foreach ($debtsByStudent as $debt) {
            $reg = new PreviousYearRegularization();
            $reg->setStudent($debt['student']);
            $reg->setUnpaidMonths(implode(', ', $debt['months']));
            $reg->setTotalRemaining($debt['total']);
            $reg->setSchoolYear($currentYear); // On lie la dette à l'année active
            $em->persist($reg);
        }

        $em->flush();

        return new JsonResponse(['message' => count($debtsByStudent) . ' dossiers d\'impayés trouvés pour l\'année ' . $previousYear->getLabel()]);
    }

    #[Route('/api/regularizations/{id}/pay', name: 'api_regularization_pay', methods: ['POST'])]
    public function pay(
        int $id,
        Request $request,
        EntityManagerInterface $em
    ): JsonResponse {
        $regularization = $em->getRepository(PreviousYearRegularization::class)->find($id);
        if (!$regularization) {
            return new JsonResponse(['message' => 'Régularisation introuvable'], 404);
        }

        $data = json_decode($request->getContent(), true);
        $amount = (float) ($data['amount'] ?? 0);
        $schoolYearIri = $data['schoolYear'] ?? null;

        if ($amount <= 0 || $amount > $regularization->getTotalRemaining() + 0.01) {
            return new JsonResponse(['message' => 'Montant invalide ou supérieur au reste à payer'], 400);
        }

        // 1. Mise à jour du solde restant (recalcul automatique)
        $regularization->setTotalRemaining($regularization->getTotalRemaining() - $amount);

        // 2. Création de l'entrée comptable avec le libellé imposé
        $movement = new AccountingMovement();
        $movement->setLabel("Régularisation d’écolage de l’année précédente");
        $movement->setAmount($amount);
        $movement->setType('entry');
        $movement->setCategory('Régularisation écolage');
        $movement->setDate(new \DateTime());
        $movement->setStudent($regularization->getStudent());
        
        if ($schoolYearIri) {
            $idYear = (int) filter_var($schoolYearIri, FILTER_SANITIZE_NUMBER_INT);
            $schoolYear = $em->getRepository(SchoolYear::class)->find($idYear);
            $movement->setSchoolYear($schoolYear);
        }

        $em->persist($movement);
        $em->flush();

        return new JsonResponse([
            'message' => 'Paiement enregistré avec succès',
            'newTotal' => $regularization->getTotalRemaining()
        ]);
    }
}