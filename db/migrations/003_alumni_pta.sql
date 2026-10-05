ALTER TABLE articles MODIFY category ENUM('announcements','events','clubs','pta','alumni') NOT NULL;
INSERT IGNORE INTO sections (slug, data) VALUES ('site-alumni', '{"sectionLabel": "Alumni", "heading": "Alumni Achievements", "intro": "Celebrating the accomplishments of Flor de Grace School alumni.", "achievements": []}');
