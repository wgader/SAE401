<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260319125036 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE user ADD api_token VARCHAR(255) DEFAULT NULL, ADD is_verified TINYINT NOT NULL, ADD verification_code INT DEFAULT NULL, ADD bio LONGTEXT DEFAULT NULL, ADD website VARCHAR(255) DEFAULT NULL, ADD banner VARCHAR(255) DEFAULT NULL, ADD location VARCHAR(255) DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE user DROP api_token, DROP is_verified, DROP verification_code, DROP bio, DROP website, DROP banner, DROP location');
    }
}
