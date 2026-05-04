<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Metadata\ApiResource;
use App\Repository\ClasseRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;

#[ORM\Entity(repositoryClass: ClasseRepository::class)]
#[ApiResource(
    normalizationContext: ['groups' => ['classe:read']],
    denormalizationContext: ['groups' => ['classe:write']]
)]
#[ApiFilter(SearchFilter::class, properties: ['schoolYear' => 'exact'])]
class Classe
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['classe:read', 'student:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['classe:read', 'classe:write', 'student:read'])]
    private ?string $name = null;

    #[ORM\Column(nullable: true)]
    #[Groups(['classe:read', 'classe:write', 'student:read'])]
    private ?float $tuitionPrice = 50000.0;

    /**
     * @var Collection<int, Student>
     */
    #[ORM\OneToMany(targetEntity: Student::class, mappedBy: 'classe')]
    private Collection $students;

    #[ORM\ManyToOne(inversedBy: 'classes')]
    #[Groups(['classe:read', 'classe:write'])]
    private ?SchoolYear $schoolYear = null;

    public function __construct()
    {
        $this->students = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        $this->name = $name;

        return $this;
    }

    public function getTuitionPrice(): ?float
    {
        return $this->tuitionPrice;
    }

    public function setTuitionPrice(?float $tuitionPrice): static
    {
        $this->tuitionPrice = $tuitionPrice;

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
            $student->setClasse($this);
        }

        return $this;
    }

    public function removeStudent(Student $student): static
    {
        if ($this->students->removeElement($student)) {
            // set the owning side to null (unless already changed)
            if ($student->getClasse() === $this) {
                $student->setClasse(null);
            }
        }

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
