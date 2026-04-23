<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Fee;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class FeePaymentProcessor implements ProcessorInterface
{
    public function __construct(
        private EntityManagerInterface $entityManager
    ) {}

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): void
    {
        // $data contient le corps de la requête JSON : { "feeIds": [7, 9] }
        if (!isset($data['feeIds']) || !is_array($data['feeIds'])) {
            throw new BadRequestHttpException("La liste des identifiants (feeIds) est manquante.");
        }

        $feeRepository = $this->entityManager->getRepository(Fee::class);

        foreach ($data['feeIds'] as $id) {
            // On force la conversion en entier pour éviter l'erreur "ID 0"
            $numericId = (int) $id;
            
            if ($numericId <= 0) {
                continue;
            }

            // IMPORTANT : On cherche uniquement l'écolage par son ID précis
            // C'est ce "find" qui garantit qu'on ne touche pas aux autres étudiants
            $fee = $feeRepository->find($numericId);

            if (!$fee) {
                throw new NotFoundHttpException("L'écolage avec l'ID $numericId n'existe pas.");
            }

            // On ne met à jour QUE cette ligne
            $fee->setIsPaid(true);
            $fee->setPaymentDate(new \DateTime()); // Optionnel: enregistrer la date du jour
            
            // Si vous avez une table de comptabilité, vous pourriez aussi créer un mouvement ici
        }

        // On enregistre les modifications uniquement pour les objets modifiés ci-dessus
        $this->entityManager->flush();
    }
}