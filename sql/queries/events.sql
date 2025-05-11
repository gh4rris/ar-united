-- name: CreateEvent :one
INSERT INTO events (id, name, location, date, created_at, updated_at, description, group_id, slug)
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