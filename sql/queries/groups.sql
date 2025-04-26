-- name: CreateGroup :one
INSERT INTO groups(id, name, created_at, updated_at, admin_id, description)
VALUES (
    gen_random_uuid(),
    $1,
    NOW(),
    NOW(),
    $2,
    $3
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