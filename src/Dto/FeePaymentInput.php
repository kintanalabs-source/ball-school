<?php

namespace App\Dto;

use Symfony\Component\Serializer\Annotation\Groups;

class FeePaymentInput
{
    #[Groups(['fee:pay'])]
    private array $feeIds = [];

    #[Groups(['fee:pay'])]
    private ?string $paymentDate = null;

    /**
     * @return int[]
     */
    public function getFeeIds(): array
    {
        return $this->feeIds;
    }

    /**
     * @param int[] $feeIds
     */
    public function setFeeIds(array $feeIds): void
    {
        $this->feeIds = $feeIds;
    }

    public function getPaymentDate(): ?string
    {
        return $this->paymentDate;
    }

    public function setPaymentDate(?string $paymentDate): void
    {
        $this->paymentDate = $paymentDate;
    }
}
