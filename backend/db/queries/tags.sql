-- name: GetTagsForArticle :many
SELECT t.name FROM tags t
JOIN article_tags at ON at.tag_id = t.id
WHERE at.article_id = $1;

-- name: UpsertTag :one
INSERT INTO tags (name) VALUES ($1)
ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
RETURNING *;

-- name: AddTagToArticle :exec
INSERT INTO article_tags (article_id, tag_id) VALUES ($1, $2)
ON CONFLICT DO NOTHING;

-- name: GetAllTags :many
SELECT name FROM tags ORDER BY name;
