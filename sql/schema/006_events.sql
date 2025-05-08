-- +goose Up
CREATE TABLE events (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT,
    date TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    description TEXT,
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    slug TEXT NOT NULL UNIQUE
);

-- +goose Down
DROP TABLE events;