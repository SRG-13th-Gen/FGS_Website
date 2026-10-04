CREATE TABLE IF NOT EXISTS sections (
  slug VARCHAR(64) PRIMARY KEY, data JSON NOT NULL,
  revision INT UNSIGNED NOT NULL DEFAULT 1,
  modified_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS media (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, source_key VARCHAR(255) UNIQUE,
  path VARCHAR(512) NOT NULL UNIQUE, filename VARCHAR(255) NOT NULL,
  mime_type VARCHAR(128) NOT NULL, size_bytes BIGINT UNSIGNED NOT NULL,
  checksum CHAR(64) NOT NULL, alt TEXT NOT NULL, caption TEXT NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX media_checksum (checksum), INDEX media_date (created_at, id)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS articles (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, source_key VARCHAR(255) UNIQUE,
  mutation_key CHAR(36) UNIQUE, slug VARCHAR(200) NOT NULL UNIQUE,
  title VARCHAR(200) NOT NULL, category ENUM('announcements','events','clubs') NOT NULL,
  body MEDIUMTEXT NOT NULL, status ENUM('publish','draft','trash') NOT NULL DEFAULT 'publish',
  published_at DATETIME(3), modified_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  revision INT UNSIGNED NOT NULL DEFAULT 1, INDEX articles_public (status, published_at, id)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS article_images (
  article_id INT UNSIGNED NOT NULL, position INT UNSIGNED NOT NULL,
  media_id INT UNSIGNED NOT NULL, alt TEXT NOT NULL, caption TEXT NOT NULL,
  PRIMARY KEY (article_id, position),
  FOREIGN KEY (article_id) REFERENCES articles(id), FOREIGN KEY (media_id) REFERENCES media(id)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS legacy_urls (
  path VARCHAR(512) PRIMARY KEY, target VARCHAR(512) NOT NULL
) ENGINE=InnoDB;

