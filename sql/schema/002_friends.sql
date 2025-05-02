-- +goose Up
CREATE TABLE friends (
    user_id_a UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_id_b UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    CHECK(user_id_a < user_id_b),
    UNIQUE(user_id_a, user_id_b)
);

-- +goose Down
DROP TABLE friends;