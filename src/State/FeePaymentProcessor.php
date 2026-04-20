<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Dto\FeePaymentInput;
use App\Entity\Fee;
use App\Event\FeePaidEvent;
use App\Repository\FeeRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class FeePaymentProcessor implements ProcessorInterface
{
    public function __construct(
        private FeeRepository $feeRepository,
        private EntityManagerInterface $entityManager,
        private EventDispatcherInterface $eventDispatcher
    ) {}

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): mixed
    {
        if (!$data instanceof FeePaymentInput) {
            return $data;
        }

        $fees = [];
        $paymentDate = $data->getPaymentDate() ? new \DateTime($data->getPaymentDate()) : new \DateTime();

        foreach ($data->getFeeIds() as $id) {
            $fee = $this->feeRepository->find($id);
            if (!$fee) {
                throw new NotFoundHttpException(sprintf('Fee with ID %d not found', $id));
            }

            if (!$fee->isPaid()) {
                $fee->setIsPaid(true);
                $fee->setPaymentDate($paymentDate);
                $fees[] = $fee;
            }
        }

        if (!empty($fees)) {
            $this->entityManager->flush();
            $this->eventDispatcher->dispatch(new FeePaidEvent($fees), FeePaidEvent::NAME);
        }

        return $data;
    }
}
