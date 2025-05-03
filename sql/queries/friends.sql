-- name: GetUserFriends :many
SELECT u.*
FROM users AS u
INNER JOIN friends AS f
ON (u.id = f.requester_id AND f.requestee_id = $1)
OR (u.id = f.requestee_id AND f.requester_id = $1)
WHERE confirmed IS NOT NULL
ORDER BY u.first_name ASC;

-- name: AddFriend :exec
INSERT INTO friends (requester_id, requestee_id, requested)
VALUES (
    requester_id = $1,
    requestee_id = $2,
    requested = NOW()
);

-- name: ConfirmFriend :exec
UPDATE friends
SET confirmed = NOW()
WHERE requester_id = $2 AND requestee_id = $1;

-- GetFriendRequests
SELECT u.*
FROM users AS u
INNER JOIN friends AS f
ON u.id = f.requester_id
WHERE confirmed IS NULL
ORDER BY requested DESC;