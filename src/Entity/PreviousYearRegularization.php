<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity]
#[ApiResource(
    operations: [
        new GetCollection(),
        new Get()
    ],
    normalizationContext: ['groups' => ['reg:read']]
)]
class PreviousYearRegularization
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['reg:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['reg:read'])]
    private ?Student $student = null;

    #[ORM\Column(type: 'text')]
    #[Groups(['reg:read'])]
    private ?string $unpaidMonths = null;

    #[ORM\Column]
    #[Groups(['reg:read'])]
    private ?float $totalRemaining = null;

    public function getId(): ?int { return $this->id; }

    public function getStudent(): ?Student { return $this->student; }

    public function setStudent(?Student $student): self { $this->student = $student; return $this; }

    public function getUnpaidMonths(): ?string { return $this->unpaidMonths; }

    public function setUnpaidMonths(string $unpaidMonths): self { $this->unpaidMonths = $unpaidMonths; return $this; }

    public function getTotalRemaining(): ?float { return $this->totalRemaining; }

    public function setTotalRemaining(float $totalRemaining): self { $this->totalRemaining = $totalRemaining; return $this; }
}