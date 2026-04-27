<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class VersionRegularization extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create PreviousYearRegularization table to manage old debts.';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE previous_year_regularization (id INT AUTO_INCREMENT NOT NULL, student_id INT NOT NULL, unpaid_months LONGTEXT NOT NULL, total_remaining DOUBLE PRECISION NOT NULL, INDEX IDX_REG_STUDENT (student_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE previous_year_regularization ADD CONSTRAINT FK_REG_STUDENT FOREIGN KEY (student_id) REFERENCES student (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE previous_year_regularization DROP FOREIGN KEY FK_REG_STUDENT');
        $this->addSql('DROP TABLE previous_year_regularization');
    }
}