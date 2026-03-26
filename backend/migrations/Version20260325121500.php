<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260325121500 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create user_follows table for followers/following feature';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE user_follows (follower_id INT NOT NULL, following_id INT NOT NULL, INDEX IDX_user_follows_follower (follower_id), INDEX IDX_user_follows_following (following_id), PRIMARY KEY(follower_id, following_id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE user_follows ADD CONSTRAINT FK_user_follows_follower FOREIGN KEY (follower_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE user_follows ADD CONSTRAINT FK_user_follows_following FOREIGN KEY (following_id) REFERENCES user (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE user_follows DROP FOREIGN KEY FK_user_follows_follower');
        $this->addSql('ALTER TABLE user_follows DROP FOREIGN KEY FK_user_follows_following');
        $this->addSql('DROP TABLE user_follows');
    }
}
