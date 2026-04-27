<?php

namespace App\EventListener;

use App\Entity\AccountingMovement;
use App\Entity\Student;
use Doctrine\Bundle\DoctrineBundle\Attribute\AsEntityListener;
use Doctrine\ORM\Event\PostPersistEventArgs;
use Doctrine\ORM\Event\PostUpdateEventArgs;
use Doctrine\ORM\Events;
use Doctrine\ORM\EntityManagerInterface;

#[AsEntityListener(event: Events::postPersist, entity: Student::class)]
#[AsEntityListener(event: Events::postUpdate, entity: Student::class)]
class StudentRegistrationFeeListener
{
    public function __construct(private EntityManagerInterface $entityManager)
    {
    }

    public function postPersist(Student $student, PostPersistEventArgs $event): void
    {
        $this->createOrUpdateRegistrationFeeMovement($student);
    }

    public function postUpdate(Student $student, PostUpdateEventArgs $event): void
    {
        // Seulement si le registrationFee a changé
        $changeSet = $event->getObjectManager()->getUnitOfWork()->getEntityChangeSet($student);

        if (isset($changeSet['registrationFee']) && $changeSet['registrationFee'][0] !== $changeSet['registrationFee'][1]) {
            $this->createOrUpdateRegistrationFeeMovement($student);
        }
    }

    private function createOrUpdateRegistrationFeeMovement(Student $student): void
    {
        $registrationFee = $student->getRegistrationFee();
        $schoolYear = $student->getSchoolYear();

        if ($registrationFee > 0 && $schoolYear) {
            // Chercher un mouvement existant pour ce droit d'entrée et cette année scolaire
            $existingMovement = $this->entityManager->getRepository(AccountingMovement::class)->findOneBy([
                'student' => $student,
                'category' => 'Droit d\'entrée',
                'schoolYear' => $schoolYear,
            ]);

            if ($existingMovement) {
                $existingMovement->setAmount($registrationFee);
            } else {
                $movement = new AccountingMovement();
                $movement->setLabel(sprintf('Droit d\'entrée - %s %s', $student->getFirstName(), $student->getLastName()));
                $movement->setAmount($registrationFee);
                $movement->setType('entry');
                $movement->setCategory('Droit d\'entrée');
                $movement->setDate(new \DateTime());
                $movement->setSchoolYear($schoolYear);
                $movement->setStudent($student); // Lier le mouvement à l'étudiant
                $this->entityManager->persist($movement);
            }
        }
    }
}