-- name: GetArticleBySlug :one
SELECT a.*, u.username AS author_username, u.bio AS author_bio, u.image AS author_image
FROM articles a
JOIN users u ON u.id = a.author_id
WHERE a.slug = $1;

-- name: ListArticles :many
SELECT a.*, u.username AS author_username, u.bio AS author_bio, u.image AS author_image
FROM articles a
JOIN users u ON u.id = a.author_id
ORDER BY a.created_at DESC
LIMIT $1 OFFSET $2;

-- name: ListArticlesByTag :many
SELECT a.*, u.username AS author_username, u.bio AS author_bio, u.image AS author_image
FROM articles a
JOIN users u ON u.id = a.author_id
JOIN article_tags at ON at.article_id = a.id
JOIN tags t ON t.id = at.tag_id
WHERE t.name = $1
ORDER BY a.created_at DESC
LIMIT $2 OFFSET $3;

-- name: CreateArticle :one
INSERT INTO articles (slug, title, description, body, author_id)
VALUES ($1, $2, $3, $4, $5)
RETURNING *;

-- name: UpdateArticle :one
UPDATE articles
SET
  slug        = COALESCE(sqlc.narg(slug),        slug),
  title       = COALESCE(sqlc.narg(title),       title),
  description = COALESCE(sqlc.narg(description), description),
  body        = COALESCE(sqlc.narg(body),         body),
  updated_at  = NOW()
WHERE id = $1
RETURNING *;

-- name: DeleteArticle :exec
DELETE FROM articles WHERE slug = $1 AND author_id = $2;

-- name: FavoriteArticle :exec
INSERT INTO favorites (user_id, article_id)
SELECT $1, id FROM articles WHERE slug = $2
ON CONFLICT DO NOTHING;

-- name: UnfavoriteArticle :exec
DELETE FROM favorites
WHERE user_id = $1
  AND article_id = (SELECT id FROM articles WHERE slug = $2);

-- name: GetFavoritesCount :one
SELECT COUNT(*) FROM favorites WHERE article_id = (SELECT id FROM articles WHERE slug = $1);

-- name: IsFavorited :one
SELECT EXISTS(
  SELECT 1 FROM favorites
  WHERE user_id = $1
    AND article_id = (SELECT id FROM articles WHERE slug = $2)
);
