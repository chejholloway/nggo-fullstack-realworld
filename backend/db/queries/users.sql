-- name: GetUserByEmail :one
SELECT * FROM users WHERE email = $1;

-- name: GetUserByUsername :one
SELECT * FROM users WHERE username = $1;

-- name: GetUserByID :one
SELECT * FROM users WHERE id = $1;

-- name: CreateUser :one
INSERT INTO users (email, username, password)
VALUES ($1, $2, $3)
RETURNING *;

-- name: UpdateUser :one
UPDATE users
SET
  email      = COALESCE(sqlc.narg(email),    email),
  username   = COALESCE(sqlc.narg(username), username),
  password   = COALESCE(sqlc.narg(password), password),
  bio        = COALESCE(sqlc.narg(bio),       bio),
  image      = COALESCE(sqlc.narg(image),     image),
  updated_at = NOW()
WHERE id = $1
RETURNING *;
