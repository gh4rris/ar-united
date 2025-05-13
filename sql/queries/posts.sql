-- name: CreateUserPost :one
INSERT INTO posts(id, created_at, updated_at, body, user_id)
VALUES (
    gen_random_uuid(),
    NOW(),
    NOW(),
    $1,
    $2
)
RETURNING *;

-- name: CreateGroupPost :one
INSERT INTO posts(id, created_at, updated_at, body, group_id)
VALUES (
    gen_random_uuid(),
    NOW(),
    NOW(),
    $1,
    $2
)
RETURNING *;

-- name: CreateEventPost :one
INSERT INTO posts(id, created_at, updated_at, body, event_id)
VALUES (
    gen_random_uuid(),
    NOW(),
    NOW(),
    $1,
    $2
)
RETURNING *;

-- name: GetPosts :many
SELECT *
FROM posts
ORDER BY created_at DESC;

-- name: GetPost :one
SELECT *
FROM posts
WHERE id = $1;

-- name: GetUserPosts :many
SELECT *
FROM posts
WHERE user_id = $1
ORDER BY created_at DESC;

-- name: GetGroupPosts :many
SELECT *
FROM posts
WHERE group_id = $1
ORDER BY created_at DESC;

-- name: GetEventPosts :many
SELECT *
FROM posts
WHERE event_id = $1
ORDER BY created_at DESC;

-- name: DeletePost :exec
DELETE FROM posts
WHERE id = $1;