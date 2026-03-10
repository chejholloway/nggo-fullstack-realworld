-- name: GetCommentsByArticle :many
SELECT c.*, u.username AS author_username, u.bio AS author_bio, u.image AS author_image
FROM comments c
JOIN users u ON u.id = c.author_id
WHERE c.article_id = (SELECT id FROM articles WHERE slug = $1)
ORDER BY c.created_at DESC;

-- name: CreateComment :one
INSERT INTO comments (body, author_id, article_id)
SELECT $1, $2, id FROM articles WHERE slug = $3
RETURNING *;

-- name: DeleteComment :exec
DELETE FROM comments WHERE id = $1 AND author_id = $2;
