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

CREATE TABLE users_events (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    UNIQUE(user_id, event_id)
);

-- +goose Down
DROP TABLE users_events;
DROP TABLE events;