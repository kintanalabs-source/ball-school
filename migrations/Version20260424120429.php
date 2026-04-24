<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260424120429 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE accounting_movement ADD student_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE accounting_movement ADD CONSTRAINT FK_4C59B805CB944F1A FOREIGN KEY (student_id) REFERENCES student (id)');
        $this->addSql('CREATE INDEX IDX_4C59B805CB944F1A ON accounting_movement (student_id)');
        $this->addSql('ALTER TABLE fee CHANGE school_year_id school_year_id INT NOT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE accounting_movement DROP FOREIGN KEY FK_4C59B805CB944F1A');
        $this->addSql('DROP INDEX IDX_4C59B805CB944F1A ON accounting_movement');
        $this->addSql('ALTER TABLE accounting_movement DROP student_id');
        $this->addSql('ALTER TABLE fee CHANGE school_year_id school_year_id INT DEFAULT NULL');
    }
}
