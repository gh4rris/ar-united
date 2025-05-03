-- +goose Up
CREATE TABLE allies (
    requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    requestee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    requested TIMESTAMP NOT NULL,
    confirmed TIMESTAMP,
    UNIQUE(requester_id, requestee_id)
);

-- +goose Down
DROP TABLE allies;