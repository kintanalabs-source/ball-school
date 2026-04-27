<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260427065340 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE previous_year_regularization (id INT AUTO_INCREMENT NOT NULL, unpaid_months LONGTEXT NOT NULL, total_remaining DOUBLE PRECISION NOT NULL, student_id INT NOT NULL, INDEX IDX_CE5DF8DCCB944F1A (student_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE previous_year_regularization ADD CONSTRAINT FK_CE5DF8DCCB944F1A FOREIGN KEY (student_id) REFERENCES student (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE previous_year_regularization DROP FOREIGN KEY FK_CE5DF8DCCB944F1A');
        $this->addSql('DROP TABLE previous_year_regularization');
    }
}
