-- name: AddGoing :exec
INSERT INTO users_events (user_id, event_id)
VALUES (
    $1,
    $2
);

-- name: RemoveGoing :exec
DELETE FROM users_events
WHERE user_id = $1 AND event_id = $2;

-- name: IsAttending :one
SELECT *
FROM users_events
WHERE user_id = $1 AND event_id = $2;