<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260427120231 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        // 1. On s'assure que la colonne est nullable pour éviter les erreurs de contrainte
        $this->addSql('ALTER TABLE previous_year_regularization CHANGE school_year_id school_year_id INT DEFAULT NULL');

        // 2. VIDAGE DE LA TABLE : On supprime les anciennes données pour repartir sur une base propre indexée par année
        $this->addSql('DELETE FROM previous_year_regularization');

        // Nettoyer les données existantes: définir à NULL les school_year_id qui ne correspondent pas à une année scolaire existante
        $this->addSql('UPDATE previous_year_regularization SET school_year_id = NULL WHERE school_year_id IS NOT NULL AND school_year_id NOT IN (SELECT id FROM school_year)');

        $this->addSql('ALTER TABLE previous_year_regularization ADD CONSTRAINT FK_CE5DF8DCD2EECC3F FOREIGN KEY (school_year_id) REFERENCES school_year (id)');
        $this->addSql('CREATE INDEX IDX_CE5DF8DCD2EECC3F ON previous_year_regularization (school_year_id)');
        $this->addSql('ALTER TABLE previous_year_regularization RENAME INDEX idx_reg_student TO IDX_CE5DF8DCCB944F1A');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE previous_year_regularization DROP FOREIGN KEY FK_CE5DF8DCD2EECC3F');
        $this->addSql('DROP INDEX IDX_CE5DF8DCD2EECC3F ON previous_year_regularization');
        $this->addSql('ALTER TABLE previous_year_regularization DROP school_year_id'); // Supprimer la colonne
        $this->addSql('ALTER TABLE previous_year_regularization RENAME INDEX idx_ce5df8dccb944f1a TO IDX_REG_STUDENT');
    }
}
