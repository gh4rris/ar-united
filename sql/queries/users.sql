-- name: CreateUser :one
INSERT INTO users (id, first_name, last_name, dob, created_at, updated_at, email, hased_password)
VALUES (
    gen_random_uuid(),
    $1,
    $2,
    $3,
    NOW(),
    NOW(),
    $4,
    $5
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
SET hased_password = $2, updated_at = NOW()
WHERE id = $1;

-- name: Reset :exec
DELETE FROM users;