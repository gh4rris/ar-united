-- name: CreateUser :one
INSERT INTO users (id, first_name, last_name, dob, created_at, updated_at, email)
VALUES (
    gen_random_uuid(),
    $1,
    $2,
    $3,
    NOW(),
    NOW(),
    $4
)
RETURNING *;

-- name: Reset :exec
DELETE FROM users;