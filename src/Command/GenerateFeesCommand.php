<?php

namespace App\Command;

use App\Entity\Fee;
use App\Entity\Student;
use App\Repository\FeeRepository;
use App\Repository\StudentRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:generate-fees',
    description: 'Generates unpaid fees for students for a specific month and year.',
)]
class GenerateFeesCommand extends Command
{
    public function __construct(
        private StudentRepository $studentRepository,
        private FeeRepository $feeRepository,
        private EntityManagerInterface $entityManager
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this
            ->addOption('month', 'm', InputOption::VALUE_REQUIRED, 'The month (e.g. Avril)')
            ->addOption('year', 'y', InputOption::VALUE_REQUIRED, 'The year (e.g. 2026)')
            ->addOption('amount', 'a', InputOption::VALUE_REQUIRED, 'Default amount', 50000)
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        
        $monthsFr = [
            1 => 'Janvier', 2 => 'Février', 3 => 'Mars', 4 => 'Avril', 
            5 => 'Mai', 6 => 'Juin', 7 => 'Juillet', 8 => 'Août', 
            9 => 'Septembre', 10 => 'Octobre', 11 => 'Novembre', 12 => 'Décembre'
        ];

        $month = $input->getOption('month') ?? $monthsFr[(int)date('n')]; 
        $year = (int) ($input->getOption('year') ?? date('Y'));
        $amount = (float) $input->getOption('amount');

        $students = $this->studentRepository->findAll();
        $count = 0;

        foreach ($students as $student) {
            // Check if fee already exists
            $existing = $this->feeRepository->findOneBy([
                'student' => $student,
                'month' => $month,
                'year' => $year,
                'type' => 'ecolage'
            ]);

            if (!$existing) {
                $fee = new Fee();
                $fee->setStudent($student);
                $fee->setMonth($month);
                $fee->setYear($year);
                
                // Use class price if available, otherwise fallback to option
                $studentPrice = $student->getClasse() ? $student->getClasse()->getTuitionPrice() : $amount;
                $fee->setAmount($studentPrice ?? $amount);
                
                $fee->setIsPaid(false);
                $fee->setType('ecolage');
                
                $this->entityManager->persist($fee);
                $count++;
            }
        }

        $this->entityManager->flush();

        $io->success(sprintf('Generated %d unpaid fees for %s %d.', $count, $month, $year));

        return Command::SUCCESS;
    }
}
