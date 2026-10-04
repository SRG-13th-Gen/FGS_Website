CREATE TABLE IF NOT EXISTS media_variants (
  media_id INT UNSIGNED PRIMARY KEY,
  FOREIGN KEY (media_id) REFERENCES media(id)
) ENGINE=InnoDB;
