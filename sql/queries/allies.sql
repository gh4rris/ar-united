-- name: GetUserAllies :many
SELECT u.*
FROM users AS u
INNER JOIN allies AS a
ON (u.id = a.requester_id AND a.requestee_id = $1)
OR (u.id = a.requestee_id AND a.requester_id = $1)
WHERE confirmed IS NOT NULL
ORDER BY u.first_name ASC;

-- name: AddAlly :exec
INSERT INTO allies (requester_id, requestee_id, requested)
VALUES (
    $1,
    $2,
    NOW()
);

-- name: ConfirmAlly :exec
UPDATE allies
SET confirmed = NOW()
WHERE requester_id = $2 AND requestee_id = $1;

-- name: GetAllyRequests :many
SELECT u.*
FROM users AS u
INNER JOIN allies AS a
ON u.id = a.requester_id
AND a.requestee_id = $1
WHERE confirmed IS NULL
ORDER BY requested DESC;

-- name: IsAlly :one
SELECT requester_id, requested, confirmed
FROM allies
WHERE (requester_id = $1 AND requestee_id = $2)
OR (requestee_id = $1 AND requester_id = $2);