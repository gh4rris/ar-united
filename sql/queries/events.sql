INSERT INTO (id, name, location, date, created_at, updated_at, description, group_id, slug)
VALUES (
    gen_random_uuid(),
    $1,
    $2,
    $3,
    NOW(),
    NOW(),
    $5,
    $6,
    $7
)
RETURNING *;