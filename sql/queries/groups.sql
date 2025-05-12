-- name: CreateGroup :one
INSERT INTO groups(id, name, created_at, updated_at, admin_id, description, slug)
VALUES (
    gen_random_uuid(),
    $1,
    NOW(),
    NOW(),
    $2,
    $3,
    $4
)
RETURNING *;

-- name: CreateMember :exec
INSERT INTO users_groups(user_id, group_id)
VALUES (
    $1,
    $2
);

-- name: GroupsByUser :many
SELECT g.*
FROM users_groups AS ug
INNER JOIN groups AS g
ON ug.group_id = g.id
WHERE ug.user_id = $1
ORDER BY g.name;

-- name: GroupMembers :many
SELECT u.*
FROM users_groups AS ug
INNER JOIN users AS u
ON ug.user_id = u.id
WHERE ug.group_id = $1
ORDER BY u.first_name;

-- name: GroupsByAdmin :many
SELECT *
FROM groups
WHERE admin_id = $1;

-- name: SearchGroups :many
SELECT *
FROM groups
WHERE name ILIKE '%' || $1 || '%';

-- name: CheckSlugGroup :one
SELECT COUNT(slug) AS slug_count
FROM groups
WHERE slug = $1;

-- name: GetGroupBySlug :one
SELECT *
FROM groups
WHERE slug = $1;

-- name: GetGroupByID :one
SELECT *
FROM groups
WHERE id = $1;

-- name: IsMember :one
SELECT *
FROM users_groups
WHERE user_id = $1 AND group_id = $2;