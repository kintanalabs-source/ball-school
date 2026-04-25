<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Patch;
use App\State\SchoolYearCloseProcessor;
use App\Repository\SchoolYearRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: SchoolYearRepository::class)]
#[ApiResource(
    operations: [
        new GetCollection(),
        new Post(),
        new Get(),
        new Patch(processor: SchoolYearCloseProcessor::class),
    ],
    normalizationContext: ['groups' => ['year:read']],
    denormalizationContext: ['groups' => ['year:write']],
)]
class SchoolYear
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['year:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['year:read', 'year:write'])]
    private ?string $label = null;

    #[ORM\Column(type: 'boolean', options: ['default' => false])]
    #[Groups(['year:read', 'year:write'])]
    private bool $isClosed = false;

    #[ORM\Column(type: 'float', nullable: true)]
    #[Groups(['year:read', 'year:write'])]
    private ?float $initialBalance = 0;

    #[ORM\Column(type: 'float', nullable: true)]
    #[Groups(['year:read', 'year:write'])]
    private ?float $finalBalance = null;

    #[ORM\Column(type: 'float', nullable: true)]
    #[Groups(['year:read', 'year:write'])]
    private ?float $totalBudget = null;

    #[ORM\Column(type: 'datetime')]
    #[Groups(['year:read', 'year:write'])]
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

    public function getId(): ?int { return $this->id; }

    public function getLabel(): ?string { return $this->label; }
    public function setLabel(string $label): self { $this->label = $label; return $this; }

    public function isClosed(): bool { return $this->isClosed; }
    public function setIsClosed(bool $isClosed): self { $this->isClosed = $isClosed; return $this; }

    public function getInitialBalance(): ?float { return $this->initialBalance; }
    public function setInitialBalance(?float $initialBalance): self { $this->initialBalance = $initialBalance; return $this; }

    public function getFinalBalance(): ?float { return $this->finalBalance; }
    public function setFinalBalance(?float $finalBalance): self { $this->finalBalance = $finalBalance; return $this; }

    public function getTotalBudget(): ?float { return $this->totalBudget; }
    public function setTotalBudget(?float $totalBudget): self { $this->totalBudget = $totalBudget; return $this; }

    public function getStartDate(): ?\DateTimeInterface { return $this->startDate; }
    public function setStartDate(\DateTimeInterface $startDate): self { $this->startDate = $startDate; return $this; }

    /**
     * @return Collection<int, Student>
     */
    public function getStudents(): Collection
    {
        return $this->students;
    }

    public function addStudent(Student $student): self
    {
        if (!$this->students->contains($student)) {
            $this->students->add($student);
            $student->setSchoolYear($this);
        }

        return $this;
    }

    public function removeStudent(Student $student): self
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