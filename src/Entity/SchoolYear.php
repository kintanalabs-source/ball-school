<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use App\Repository\SchoolYearRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity(repositoryClass: SchoolYearRepository::class)]
#[ApiResource(
    operations: [
        new GetCollection(),
        new Post(),
        new Get(),
    ],
    normalizationContext: ['groups' => ['schoolyear:read']],
    denormalizationContext: ['groups' => ['schoolyear:write']]
)]
class SchoolYear
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['schoolyear:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['schoolyear:read', 'schoolyear:write'])]
    private ?string $label = null;

    #[ORM\Column]
    #[Groups(['schoolyear:read', 'schoolyear:write'])]
    private ?float $initialBalance = 0.0;

    #[ORM\Column(nullable: true)]
    #[Groups(['schoolyear:read', 'schoolyear:write'])]
    private ?float $totalBudget = 0.0;

    #[ORM\Column(nullable: true)]
    #[Groups(['schoolyear:read', 'schoolyear:write'])]
    private ?float $finalBalance = 0.0;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    #[Groups(['schoolyear:read', 'schoolyear:write'])]
    private ?\DateTimeInterface $startDate = null;

    /**
     * @var Collection<int, Student>
     */
    #[ORM\OneToMany(targetEntity: Student::class, mappedBy: 'schoolYear')]
    private Collection $students;

    public function __construct()
    {
        $this->startDate = new \DateTime();
        $this->students = new ArrayCollection();
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

    public function getInitialBalance(): ?float
    {
        return $this->initialBalance;
    }

    public function setInitialBalance(float $initialBalance): static
    {
        $this->initialBalance = $initialBalance;
        return $this;
    }

    public function getTotalBudget(): ?float
    {
        return $this->totalBudget;
    }

    public function setTotalBudget(?float $totalBudget): static
    {
        $this->totalBudget = $totalBudget;
        return $this;
    }

    public function getFinalBalance(): ?float
    {
        return $this->finalBalance;
    }

    public function setFinalBalance(?float $finalBalance): static
    {
        $this->finalBalance = $finalBalance;
        return $this;
    }

    public function getStartDate(): ?\DateTimeInterface
    {
        return $this->startDate;
    }

    public function setStartDate(\DateTimeInterface $startDate): static
    {
        $this->startDate = $startDate;
        return $this;
    }

    /**
     * @return Collection<int, Student>
     */
    public function getStudents(): Collection
    {
        return $this->students;
    }

    public function addStudent(Student $student): static
    {
        if (!$this->students->contains($student)) {
            $this->students->add($student);
            $student->setSchoolYear($this);
        }

        return $this;
    }

    public function removeStudent(Student $student): static
    {
        if ($this->students->removeElement($student)) {
            // set the owning side to null (unless already changed)
            if ($student->getSchoolYear() === $this) {
                $student->setSchoolYear(null);
            }
        }

        return $this;
    }
}