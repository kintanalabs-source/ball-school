<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use App\Repository\StudentRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Delete;

#[ORM\Entity(repositoryClass: StudentRepository::class)]
#[ApiResource(
    operations: [
        new GetCollection(),
        new Post(),
        new Get(),
        new Put(),
        new Patch(),
        new Delete(),
        new Post(
            uriTemplate: '/students/{id}/generate-year-fees',
            controller: 'App\Controller\GenerateYearFeesController'
        )
    ],
    normalizationContext: ['groups' => ['student:read']],
    denormalizationContext: ['groups' => ['student:write']]
)]
#[ApiFilter(SearchFilter::class, properties: ['classe' => 'exact', 'schoolYear' => 'exact'])]
class Student
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['student:read', 'fee:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['student:read', 'student:write', 'fee:read'])]
    private ?string $firstName = null;

    #[ORM\Column(length: 255)]
    #[Groups(['student:read', 'student:write', 'fee:read'])]
    private ?string $lastName = null;

    #[ORM\Column(type: Types::DATE_MUTABLE)]
    #[Groups(['student:read', 'student:write'])]
    private ?\DateTimeInterface $birthDate = null;

    #[ORM\Column(length: 10)]
    #[Groups(['student:read', 'student:write'])]
    private ?string $gender = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['student:read', 'student:write'])]
    private ?string $address = null;

    #[ORM\Column(length: 20, nullable: true)]
    #[Groups(['student:read', 'student:write'])]
    private ?string $phoneNumber = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['student:read', 'student:write'])]
    private ?string $email = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    #[Groups(['student:read'])]
    private ?\DateTimeInterface $registrationDate = null;

    #[ORM\ManyToOne(targetEntity: Classe::class, inversedBy: 'students')]
    #[Groups(['student:read', 'student:write'])]
    private ?Classe $classe = null;

    /**
     * @var Collection<int, Fee>
     */
    #[ORM\OneToMany(targetEntity: Fee::class, mappedBy: 'student', orphanRemoval: true)]
    #[Groups(['student:read'])]
    private Collection $fees;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['student:read', 'student:write'])]
    private ?string $matricule = null;

    #[ORM\Column(nullable: true)]
    #[Groups(['student:read', 'student:write'])]
    private ?int $registrationFee = null;

    #[ORM\ManyToOne(inversedBy: 'students')]
    #[Groups(['student:read', 'student:write'])]
    private ?SchoolYear $schoolYear = null;

    public function __construct()
    {
        $this->fees = new ArrayCollection();
        $this->registrationDate = new \DateTime();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getFirstName(): ?string
    {
        return $this->firstName;
    }

    public function setFirstName(string $firstName): static
    {
        $this->firstName = $firstName;

        return $this;
    }

    public function getLastName(): ?string
    {
        return $this->lastName;
    }

    public function setLastName(string $lastName): static
    {
        $this->lastName = $lastName;

        return $this;
    }

    public function getBirthDate(): ?\DateTimeInterface
    {
        return $this->birthDate;
    }

    public function setBirthDate(\DateTimeInterface $birthDate): static
    {
        $this->birthDate = $birthDate;

        return $this;
    }

    public function getGender(): ?string
    {
        return $this->gender;
    }

    public function setGender(string $gender): static
    {
        $this->gender = $gender;

        return $this;
    }

    public function getAddress(): ?string
    {
        return $this->address;
    }

    public function setAddress(?string $address): static
    {
        $this->address = $address;

        return $this;
    }

    public function getPhoneNumber(): ?string
    {
        return $this->phoneNumber;
    }

    public function setPhoneNumber(?string $phoneNumber): static
    {
        $this->phoneNumber = $phoneNumber;

        return $this;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(?string $email): static
    {
        $this->email = $email;

        return $this;
    }

    public function getRegistrationDate(): ?\DateTimeInterface
    {
        return $this->registrationDate;
    }

    public function setRegistrationDate(\DateTimeInterface $registrationDate): static
    {
        $this->registrationDate = $registrationDate;

        return $this;
    }

    public function getClasse(): ?Classe
    {
        return $this->classe;
    }

    public function setClasse(?Classe $classe): static
    {
        $this->classe = $classe;

        return $this;
    }

    /**
     * @return Collection<int, Fee>
     */
    public function getFees(): Collection
    {
        return $this->fees;
    }

    public function addFee(Fee $fee): static
    {
        if (!$this->fees->contains($fee)) {
            $this->fees->add($fee);
            $fee->setStudent($this);
        }

        return $this;
    }

    public function removeFee(Fee $fee): static
    {
        if ($this->fees->removeElement($fee)) {
            // set the owning side to null (unless already changed)
            if ($fee->getStudent() === $this) {
                $fee->setStudent(null);
            }
        }

        return $this;
    }

    public function getMatricule(): ?string
    {
        return $this->matricule;
    }

    public function setMatricule(?string $matricule): static
    {
        $this->matricule = $matricule;

        return $this;
    }

    public function getRegistrationFee(): ?int
    {
        return $this->registrationFee;
    }

    public function setRegistrationFee(?int $registrationFee): static
    {
        $this->registrationFee = $registrationFee;

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
