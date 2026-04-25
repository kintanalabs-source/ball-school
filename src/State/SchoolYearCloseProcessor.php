<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\SchoolYear;
use App\Entity\AccountingMovement;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

class SchoolYearCloseProcessor implements ProcessorInterface
{
    public function __construct(
        #[Autowire(service: 'api_platform.doctrine.orm.state.persist_processor')]
        private ProcessorInterface $persistProcessor,
        private EntityManagerInterface $entityManager
    ) {}

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): mixed
    {
        if (!$data instanceof SchoolYear) {
            return $this->persistProcessor->process($data, $operation, $uriVariables, $context);
        }

        // Si l'année passe en état clôturé
        if ($data->isClosed()) {
            $this->handleClosing($data);
        }

        return $this->persistProcessor->process($data, $operation, $uriVariables, $context);
    }

    private function handleClosing(SchoolYear $year): void
    {
        $movementRepo = $this->entityManager->getRepository(AccountingMovement::class);

        // 1. Calcul des totaux réels depuis la base de données
        $movements = $movementRepo->findBy(['schoolYear' => $year]);
        $entries = 0;
        $exits = 0;

        foreach ($movements as $m) {
            if ($m->getType() === 'entry') {
                $entries += $m->getAmount();
            } else {
                $exits += $m->getAmount();
            }
        }

        // Enregistrement des statistiques finales (Archives)
        $year->setTotalBudget($entries);
        $finalBalance = $year->getInitialBalance() + $entries - $exits;
        $year->setFinalBalance($finalBalance);

        // 2. Transfert automatique vers l'année scolaire suivante
        $nextYear = $this->entityManager->createQueryBuilder()
            ->select('s')
            ->from(SchoolYear::class, 's')
            ->where('s.startDate > :currentStart')
            ->setParameter('currentStart', $year->getStartDate())
            ->orderBy('s.startDate', 'ASC')
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult();

        if ($nextYear) {
            $nextYear->setInitialBalance($finalBalance);
        }
    }
}