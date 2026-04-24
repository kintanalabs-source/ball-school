<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use App\Repository\AccountingMovementRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity(repositoryClass: AccountingMovementRepository::class)]
#[ApiResource(
    normalizationContext: ['groups' => ['accounting:read']],
    denormalizationContext: ['groups' => ['accounting:write']]
)]
#[ApiFilter(SearchFilter::class, properties: ['schoolYear' => 'exact'])]
class AccountingMovement
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['accounting:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['accounting:read', 'accounting:write'])]
    private ?string $label = null;

    #[ORM\Column]
    #[Groups(['accounting:read', 'accounting:write'])]
    private ?float $amount = null;

    #[ORM\Column(length: 10)]
    #[Groups(['accounting:read', 'accounting:write'])]
    private ?string $type = null; // entry or exit

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    #[Groups(['accounting:read', 'accounting:write'])]
    private ?\DateTimeInterface $date = null;

    #[ORM\Column(length: 100)]
    #[Groups(['accounting:read', 'accounting:write'])]
    private ?string $category = null; // salary, material, construction, fee, etc.

    #[ORM\ManyToOne]
    #[Groups(['accounting:read', 'accounting:write'])]
    private ?SchoolYear $schoolYear = null;

    #[ORM\ManyToOne(inversedBy: 'accountingMovements')]
    #[Groups(['accounting:read', 'accounting:write'])]
    private ?Student $student = null;

    public function __construct()
    {
        $this->date = new \DateTime();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getLabel(): ?string
    {
        return $this->label;
    }

    public function setLabel(string $label): static
    {
        $this->label = $label;

        return $this;
    }

    public function getAmount(): ?float
    {
        return $this->amount;
    }

    public function setAmount(float $amount): static
    {
        $this->amount = $amount;

        return $this;
    }

    public function getType(): ?string
    {
        return $this->type;
    }

    public function setType(string $type): static
    {
        $this->type = $type;

        return $this;
    }

    public function getDate(): ?\DateTimeInterface
    {
        return $this->date;
    }

    public function setDate(\DateTimeInterface $date): static
    {
        $this->date = $date;

        return $this;
    }

    public function getCategory(): ?string
    {
        return $this->category;
    }

    public function setCategory(string $category): static
    {
        $this->category = $category;

        return $this;
    }

    public function getSchoolYear(): ?SchoolYear
    {
        return $this->schoolYear;
    }

    public function setSchoolYear(?SchoolYear $schoolYear): static
    {
        $this->schoolYear = $schoolYear;

        return $this;
    }

    public function getStudent(): ?Student
    {
        return $this->student;
    }

    public function setStudent(?Student $student): static
    {
        $this->student = $student;

        return $this;
    }
}
