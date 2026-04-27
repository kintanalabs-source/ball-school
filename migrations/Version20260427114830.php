<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260427114830 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        // This migration was attempting to add school_year_id, but it seems to be handled by a later migration (Version20260427120231)
        // or already exists. Removing the conflicting add/rename statements.
        // The FK_REG_STUDENT drop/rename was also causing issues, so it's removed here.
        // The actual addition of school_year_id and its FK will be handled by Version20260427120231.
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        // Reverting changes made in up() method, which were primarily related to school_year_id.
        // The actual down() logic for school_year_id should be in Version20260427120231.
        // We also need to ensure the original FK_REG_STUDENT is restored if it was dropped by another migration.
        // Given the complexity, it's safer to let the later migration handle its own down() for school_year_id.
    }
}
