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
        // Extraction robuste de l'ID depuis l'IRI (/api/school_years/12 -> 12)
        $currentYearId = (int) (str_contains($currentYearIri, '/') ? basename($currentYearIri) : $currentYearIri);
        
        $currentYear = $em->getRepository(SchoolYear::class)->find($currentYearId);
        
        if (!$currentYear) {
            return new JsonResponse(['message' => 'Année scolaire introuvable'], 404);
        }

        // Identification de l'année précédente basée sur la date de début
        $previousYear = $em->getRepository(SchoolYear::class)->createQueryBuilder('s')
            ->where('s.startDate < :start')
            ->setParameter('start', $currentYear->getStartDate())
            ->orderBy('s.startDate', 'DESC')
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult();

        // 2. NETTOYAGE : On supprime tout ce qui n'appartient pas à l'année précédente identifiée
        $allExisting = $em->getRepository(PreviousYearRegularization::class)->findAll();
        $regsByStudent = [];
        foreach ($allExisting as $r) {
            if (!$previousYear || !$r->getSchoolYear() || $r->getSchoolYear()->getId() !== $previousYear->getId()) {
                $em->remove($r);
            } else {
                $regsByStudent[$r->getStudent()->getId()] = $r;
            }
        }
        $em->flush(); // On valide le nettoyage avant de recréer

        if (!$previousYear) {
            // Retourner une structure complète pour que React puisse mettre à jour son état (count: 0)
            return new JsonResponse([
                'message' => 'Première année scolaire (ID ' . $currentYearId . ') : aucune dette précédente possible.',
                'count' => 0,
                'currentYearId' => $currentYear->getId(),
                'previousYearId' => null
            ], 200);
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

        $processedStudentIds = [];
        foreach ($debtsByStudent as $debt) {
            $studentId = $debt['student']->getId();
            $processedStudentIds[] = $studentId;
            
            $reg = $regsByStudent[$studentId] ?? new PreviousYearRegularization();
            
            $reg->setStudent($debt['student']);
            $reg->setUnpaidMonths(implode(', ', $debt['months']));
            $reg->setSchoolYear($previousYear); // FIX: On lie à l'ID de l'année précédente !
            
            // On ne met à jour le montant que si c'est une nouvelle fiche 
            // ou si la dette calculée est inférieure (ex: un écolage a été supprimé)
            if (!$reg->getId() || $debt['total'] < $reg->getTotalRemaining()) {
                $reg->setTotalRemaining($debt['total']);
            }

            $em->persist($reg);
        }

        $em->flush();

        return new JsonResponse([
            'message' => count($debtsByStudent) . ' dossiers d\'impayés trouvés pour l\'année ' . $previousYear->getLabel(),
            'count' => count($debtsByStudent),
            'currentYearId' => $currentYear->getId(),
            'previousYearId' => $previousYear->getId() // C'est ici qu'on retourne l'ID de l'année précédente
        ]);
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
        $newRemaining = $regularization->getTotalRemaining() - $amount;
        $regularization->setTotalRemaining($newRemaining);

        // Si la dette est totalement payée, on supprime la fiche de régularisation
        if ($newRemaining <= 0.01) {
            $em->remove($regularization);
        }

        // 2. IMPORTANT : Marquer les écolages originaux comme payés dans la table Fee
        // On cherche les écolages impayés de cet élève pour cette année-là
        $unpaidFees = $em->getRepository(Fee::class)->findBy([
            'student' => $regularization->getStudent(),
            'schoolYear' => $regularization->getSchoolYear(),
            'isPaid' => false,
            'type' => 'ecolage'
        ], ['id' => 'ASC']); // On commence par les plus anciens

        $amountToApply = $amount;
        foreach ($unpaidFees as $fee) {
            if ($amountToApply >= $fee->getAmount() - 0.01) {
                $fee->setIsPaid(true);
                $fee->setPaymentDate(new \DateTime());
                $amountToApply -= $fee->getAmount();
            } else {
                // Montant restant insuffisant pour couvrir le mois suivant en entier
                break;
            }
        }

        // 3. Création de l'entrée comptable avec le libellé imposé
        $movement = new AccountingMovement();
        $movement->setLabel("Régularisation d’écolage de l’année précédente");
        $movement->setAmount($amount);
        $movement->setType('entry');
        $movement->setCategory('Régularisation écolage');
        $movement->setDate(new \DateTime());
        $movement->setStudent($regularization->getStudent());
        
        if ($schoolYearIri && str_contains($schoolYearIri, '/')) {
            $idYear = (int) basename($schoolYearIri);
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