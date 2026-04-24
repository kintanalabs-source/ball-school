<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Fee;
use App\Entity\Student;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

class GenerateYearFeesProcessor implements ProcessorInterface
{
    public function __construct(
        private EntityManagerInterface $entityManager
    ) {}

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): Student
    {
        // $data contient automatiquement l'étudiant chargé via l'ID dans l'URL
        if (!$data instanceof Student) {
            return $data;
        }

        $student = $data;
        $classe = $student->getClasse();
        $schoolYear = $student->getSchoolYear();

        if (!$classe) {
            throw new BadRequestHttpException("L'élève doit être affecté à une classe pour générer les frais.");
        }

        if (!$schoolYear) {
            throw new BadRequestHttpException("L'élève doit être lié à une année scolaire.");
        }

        $price = $classe->getTuitionPrice();
        $months = ['Septembre', 'Octobre', 'Novembre', 'Décembre', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin'];
        
        $startYear = (int) $schoolYear->getStartDate()->format('Y');

        foreach ($months as $index => $monthName) {
            $fee = new Fee();
            $fee->setStudent($student);
            $fee->setAmount($price);
            $fee->setMonth($monthName);
            
            // Si c'est après Décembre, on passe à l'année suivante (ex: Janvier 2025)
            $fee->setYear($index > 3 ? $startYear + 1 : $startYear);
            
            $fee->setIsPaid(false);
            $fee->setType('ecolage');
            $fee->setSchoolYear($schoolYear);

            $this->entityManager->persist($fee);
        }

        $this->entityManager->flush();

        // En Processor, renvoyer l'objet suffit, API Platform gère la réponse HTTP
        return $student;
    }
}