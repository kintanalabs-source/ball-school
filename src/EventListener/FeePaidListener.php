<?php

namespace App\EventListener;

use App\Entity\AccountingMovement;
use App\Event\FeePaidEvent;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\EventDispatcher\Attribute\AsEventListener;

#[AsEventListener(event: FeePaidEvent::NAME, method: 'onFeePaid')]
class FeePaidListener
{
    public function __construct(
        private EntityManagerInterface $entityManager
    ) {}

    public function onFeePaid(FeePaidEvent $event): void
    {
        $fees = $event->getFees();
        
        foreach ($fees as $fee) {
            $movement = new AccountingMovement();
            $student = $fee->getStudent();
            $classeName = $student->getClasse() ? $student->getClasse()->getName() : 'SansClasse';
            
            $label = sprintf(
                'ecolage-%s-%s-%s-%d-%s',
                $student->getFirstName(),
                $student->getLastName(),
                $fee->getMonth(),
                $fee->getYear(),
                $classeName
            );
            
            $movement->setLabel($label);
            $movement->setAmount($fee->getAmount());
            $movement->setType('entry');
            $movement->setCategory('fee');
            $movement->setDate($fee->getPaymentDate() ?? new \DateTime());
            
            $this->entityManager->persist($movement);
        }
        
        $this->entityManager->flush();
    }
}
