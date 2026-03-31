<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260330080326 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE user_blocks (blocker_id INT NOT NULL, blocked_id INT NOT NULL, INDEX IDX_ABBF8E45548D5975 (blocker_id), INDEX IDX_ABBF8E4521FF5136 (blocked_id), PRIMARY KEY (blocker_id, blocked_id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE user_blocks ADD CONSTRAINT FK_ABBF8E45548D5975 FOREIGN KEY (blocker_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE user_blocks ADD CONSTRAINT FK_ABBF8E4521FF5136 FOREIGN KEY (blocked_id) REFERENCES user (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE user_blocks DROP FOREIGN KEY FK_ABBF8E45548D5975');
        $this->addSql('ALTER TABLE user_blocks DROP FOREIGN KEY FK_ABBF8E4521FF5136');
        $this->addSql('DROP TABLE user_blocks');
    }
}
