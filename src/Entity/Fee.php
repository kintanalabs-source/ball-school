<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Doctrine\Orm\Filter\BooleanFilter;
use ApiPlatform\Doctrine\Orm\Filter\DateFilter;
use App\Repository\FeeRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Patch;
use App\Dto\FeePaymentInput;
use App\State\FeePaymentProcessor;
use Symfony\Component\Serializer\Attribute\SerializedName;

#[ORM\Entity(repositoryClass: FeeRepository::class)]
#[ApiResource(
    operations: [
        new GetCollection(),
        new Get(),
        new Post(),
        new Patch(),
        new Post(
            uriTemplate: '/fees/pay',
            status: 202,
            input: FeePaymentInput::class,
            processor: FeePaymentProcessor::class,
            denormalizationContext: ['groups' => ['fee:pay']]
        )
    ],
    normalizationContext: ['groups' => ['fee:read']],
    denormalizationContext: ['groups' => ['fee:write']],
    order: ['year' => 'ASC']
)]
#[ApiFilter(SearchFilter::class, properties: ['student.id' => 'exact', 'month' => 'exact', 'year' => 'exact', 'schoolYear' => 'exact'])]
#[ApiFilter(BooleanFilter::class, properties: ['isPaid'])]
class Fee
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['fee:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'fees')]
    #[ORM\JoinColumn(nullable: true)]
    #[Groups(['fee:read', 'fee:write'])]
    private ?Student $student = null;

    #[ORM\Column]
    #[Groups(['fee:read', 'fee:write', 'student:read'])]
    private ?float $amount = null;

    #[ORM\Column(length: 20)]
    #[Groups(['fee:read', 'fee:write', 'student:read'])]
    private ?string $month = null;

    #[ORM\Column]
    #[Groups(['fee:read', 'fee:write', 'student:read'])]
    private ?int $year = null;

    #[ORM\Column]
    #[Groups(['fee:read', 'fee:write'])]
    private bool $isPaid = false;

    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    #[Groups(['fee:read', 'fee:write'])]
    private ?\DateTimeInterface $paymentDate = null;

    #[ORM\Column(length: 50, nullable: true)]
    #[Groups(['fee:read', 'fee:write'])]
    private ?string $type = 'ecolage'; // ecolage, inscription, reinscription

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: true)] // Changé en true pour débloquer la migration avec des données existantes
    #[Groups(['fee:read', 'fee:write'])]
    private ?SchoolYear $schoolYear = null;

    public function getId(): ?int
    {
        return $this->id;
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

    public function getAmount(): ?float
    {
        return $this->amount;
    }

    public function setAmount(float $amount): static
    {
        $this->amount = $amount;

        return $this;
    }

    public function getMonth(): ?string
    {
        return $this->month;
    }

    public function setMonth(string $month): static
    {
        $this->month = $month;

        return $this;
    }

    public function getYear(): ?int
    {
        return $this->year;
    }

    public function setYear(int $year): static
    {
        $this->year = $year;

        return $this;
    }

    #[Groups(['fee:read'])]
    #[SerializedName('isPaid')]
    public function isPaid(): bool
    {
        return $this->isPaid;
    }

    public function setIsPaid(bool $isPaid): static
    {
        $this->isPaid = $isPaid;

        return $this;
    }

    public function getPaymentDate(): ?\DateTimeInterface
    {
        return $this->paymentDate;
    }

    public function setPaymentDate(?\DateTimeInterface $paymentDate): static
    {
        $this->paymentDate = $paymentDate;

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

    public function getSchoolYear(): ?SchoolYear
    {
        return $this->schoolYear;
    }

    public function setSchoolYear(?SchoolYear $schoolYear): static
    {
        $this->schoolYear = $schoolYear;

        return $this;
    }
}
