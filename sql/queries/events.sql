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

-- name: EventsByAdmin :many
SELECT *
FROM events AS e
INNER JOIN groups AS g
ON e.group_id = g.id
WHERE g.admin_id = $1
ORDER BY e.date ASC;

-- name: EventsByUser :many
SELECT *
FROM events AS e
INNER JOIN users_events AS ue
ON e.id = ue.event_id
WHERE ue.user_id = $1
ORDER BY e.date ASC;

-- name: CheckSlugEvent :one
SELECT COUNT(slug) AS slug_count
FROM events
WHERE slug = $1;

-- name: GetEventBySlug :one
SELECT *
FROM events
WHERE slug = $1;

-- name: SearchEvents :many
SELECT *
FROM events
WHERE name ILIKE '%' || $1 || '%'
ORDER BY date ASC;

-- name: EventGroup :one
SELECT g.*
FROM events AS e
INNER JOIN groups AS g
ON e.group_id = g.id
WHERE e.group_id = $1;