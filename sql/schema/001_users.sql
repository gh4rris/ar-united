-- +goose Up
CREATE TABLE users (
    id UUID PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT,
    dob TIMESTAMP,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    email TEXT NOT NULL UNIQUE,
    bio TEXT,
    slug TEXT NOT NULL UNIQUE,
    profile_pic_url TEXT,
    hashed_password TEXT NOT NULL
);

-- +goose Down
DROP TABLE users;