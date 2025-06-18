-- Удаляем связи с тегами, которые будут удалены
DELETE FROM "PlaceTags"
WHERE tag_id IN (1, 2, 3, 4);

-- Удаляем сами теги
DELETE FROM "Tags"
WHERE id IN (1, 2, 3, 4);

-- Переименовываем тег "Одному" в "Люди"
UPDATE "Tags"
SET name = 'Люди'
WHERE id = 6; 