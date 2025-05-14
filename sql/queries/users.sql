-- name: CreateUser :one
INSERT INTO users (id, first_name, last_name, dob, created_at, updated_at, email, slug, hashed_password)
VALUES (
    gen_random_uuid(),
    $1,
    $2,
    $3,
    NOW(),
    NOW(),
    $4,
    $5,
    $6
)
RETURNING *;

-- name: GetUserByEmail :one
SELECT *
FROM users
WHERE email = $1;

-- name: UpdateUser :one
UPDATE users
SET first_name = $2, last_name = $3, email = $4,
updated_at = NOW()
WHERE id = $1
RETURNING *;

-- name: UpdatePassword :exec
UPDATE users
SET hashed_password = $2, updated_at = NOW()
WHERE id = $1;

-- name: SearchUsers :many
SELECT *
FROM users
WHERE first_name ILIKE '%' || $1 || '%'
OR last_name ILIKE '%' || $1 || '%'
OR email ILIKE '%' || $1 || '%';

-- name: CheckSlugUser :one
SELECT COUNT(slug) AS slug_count
FROM users
WHERE slug = $1;

-- name: GetUserBySlug :one
SELECT id, first_name, last_name, email, slug
FROM users
WHERE slug = $1;

-- name: GetUserByID :one
SELECT *
FROM users
WHERE id = $1;

-- name: DeleteUser :exec
DELETE FROM users
WHERE id = $1;

-- name: CheckUsers :one
SELECT COUNT(id) AS entries
FROM users;

-- name: Reset :exec
DELETE FROM users;