<?php

namespace App\Event;

use App\Entity\Fee;
use Symfony\Contracts\EventDispatcher\Event;

class FeePaidEvent extends Event
{
    public const NAME = 'fee.paid';

    public function __construct(
        private array $fees // Array of Fee entities
    ) {}

    public function getFees(): array
    {
        return $this->fees;
    }
}
