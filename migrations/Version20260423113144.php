<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260423113144 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE accounting_movement ADD school_year_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE accounting_movement ADD CONSTRAINT FK_4C59B805D2EECC3F FOREIGN KEY (school_year_id) REFERENCES school_year (id)');
        $this->addSql('CREATE INDEX IDX_4C59B805D2EECC3F ON accounting_movement (school_year_id)');
        $this->addSql('ALTER TABLE fee ADD school_year_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE fee ADD CONSTRAINT FK_964964B5D2EECC3F FOREIGN KEY (school_year_id) REFERENCES school_year (id)');
        $this->addSql('CREATE INDEX IDX_964964B5D2EECC3F ON fee (school_year_id)');
        $this->addSql('ALTER TABLE student ADD school_year_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE student ADD CONSTRAINT FK_B723AF33D2EECC3F FOREIGN KEY (school_year_id) REFERENCES school_year (id)');
        $this->addSql('CREATE INDEX IDX_B723AF33D2EECC3F ON student (school_year_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE accounting_movement DROP FOREIGN KEY FK_4C59B805D2EECC3F');
        $this->addSql('DROP INDEX IDX_4C59B805D2EECC3F ON accounting_movement');
        $this->addSql('ALTER TABLE accounting_movement DROP school_year_id');
        $this->addSql('ALTER TABLE fee DROP FOREIGN KEY FK_964964B5D2EECC3F');
        $this->addSql('DROP INDEX IDX_964964B5D2EECC3F ON fee');
        $this->addSql('ALTER TABLE fee DROP school_year_id');
        $this->addSql('ALTER TABLE student DROP FOREIGN KEY FK_B723AF33D2EECC3F');
        $this->addSql('DROP INDEX IDX_B723AF33D2EECC3F ON student');
        $this->addSql('ALTER TABLE student DROP school_year_id');
    }
}
