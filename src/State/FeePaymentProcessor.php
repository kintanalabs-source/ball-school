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
        if (!isset($data['feeIds']) || !is_array($data['feeIds'])) {
            throw new BadRequestHttpException("La liste des identifiants (feeIds) est manquante.");
        }

        $feeRepository = $this->entityManager->getRepository(Fee::class);

        foreach ($data['feeIds'] as $id) {
            $numericId = (int) $id;
            
            if ($numericId <= 0) {
                continue;
            }

            $fee = $feeRepository->find($numericId);

            if (!$fee) {
                throw new NotFoundHttpException("L'écolage avec l'ID $numericId n'existe pas.");
            }

            $fee->setIsPaid(true);
            $fee->setPaymentDate(new \DateTime());
        }

        $this->entityManager->flush();
    }
}