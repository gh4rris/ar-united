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
    requester_id = $1,
    requestee_id = $2,
    requested = NOW()
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