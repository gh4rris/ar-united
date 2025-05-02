-- name: GetUserFriends :many
SELECT u.*
FROM users AS u
INNER JOIN friends AS f
ON (u.id = f.user_id_a AND f.user_id_b = $1)
OR (u.id = f.user_id_b AND f.user_id_a = $1)
ORDER BY u.first_name ASC;