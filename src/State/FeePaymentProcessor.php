<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Dto\FeePaymentInput;
use App\Entity\Fee;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException as ExceptionBadRequestHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class FeePaymentProcessor implements ProcessorInterface
{
    public function __construct(
        private EntityManagerInterface $entityManager
    ) {}

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): void
    {
        if ( !($data instanceof FeePaymentInput)) {
            throw new ExceptionBadRequestHttpException("La liste des identifiants (feeIds) est manquante.");
        }

        if (empty($data->getFeeIds())) {
            throw new ExceptionBadRequestHttpException("La liste des identifiants (feeIds) est vide.");
        }

        $feeRepository = $this->entityManager->getRepository(Fee::class);

        $feeIds = $data->getFeeIds();
        foreach ($feeIds as $id) {
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