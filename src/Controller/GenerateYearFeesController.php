<?php

namespace App\Controller;

use App\Entity\Fee;
use App\Entity\Student;
use App\Repository\FeeRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\AsController;

#[AsController]
class GenerateYearFeesController extends AbstractController
{
    private array $months = [
        'Septembre', 'Octobre', 'Novembre', 'Décembre', 
        'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin'
    ];

    public function __invoke(Student $student, FeeRepository $feeRepository, EntityManagerInterface $entityManager): Student
    {
        $currentYear = (int) date('Y');
        
        foreach ($this->months as $index => $monthName) {
            // Logic for split year (Sept-Dec vs Jan-Jun)
            $year = ($index < 4) ? $currentYear : $currentYear + 1;

            $existing = $feeRepository->findOneBy([
                'student' => $student,
                'month' => $monthName,
                'year' => $year,
                'type' => 'ecolage'
            ]);

            if (!$existing) {
                $fee = new Fee();
                $fee->setStudent($student);
                $fee->setMonth($monthName);
                $fee->setYear($year);
                
                $price = $student->getClasse() ? $student->getClasse()->getTuitionPrice() : 50000;
                $fee->setAmount($price);
                
                $fee->setIsPaid(false);
                $fee->setType('ecolage');
                $entityManager->persist($fee);
            }
        }

        $entityManager->flush();

        return $student;
    }
}
