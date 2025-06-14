# ar-united

A full-stack web application hub for animal rights groups and activists to network. Built with Go, PostgreSQL, and a lightweight HTML/CSS/Javascript frontend. The app is hosted on Render, and the database and filesystem on Supabase.

Create an account, search my profile George Harris and add me as an ally!

Live Site: [https://https://ar-united.onrender.com/](https://ar-united.onrender.com/)

![home](images/image-1.png)

## Features

- User authentication with JWT
- Profile creation with image upload
- Add allies and confirm requests
- Create Groups and host events
- Search and filtering
- Responsive design for Mobile and Desktop

![profile](images/image-2.png)

## Tech Stack

**Frontend** HTML, CSS, Javascript
**Backend** Go (net/http), Postgresql
**Database/Storage** Supabase
**Deployment** Render, Docker

## API Instructions

### user resource

```json
{
  "id": "1",
  "first_name": "George",
  "last_name": "Harris",
  "dob": "1990-06-11T00:00:00Z",
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-01T00:00:00Z",
  "email": "george@gmail.com",
  "bio": "hello",
  "slug": "george-harris-123",
  "profile_pic_url": "/assets/image.jpg"
}
```

### post resource

```json
{
  "id": "1",
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-01T00:00:00Z",
  "body": "my post",
  "user_id": "1",
  "group_id": "",
  "event_id": ""
}
```

### group resource

```json
{
  "id": "1",
  "name": "George",
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-01T00:00:00Z",
  "admin_id": "1",
  "description": "my group",
  "slug": "123"
}
```

### event resource

```json
{
  "id": "1",
  "name": "George",
  "location": "London",
  "date": "2025-02-01T00:00:00Z",
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-01T00:00:00Z",
  "description": "my event",
  "group_id": "1",
  "slug": "123"
}
```

### GET /api/users/{slugID}

Rturns a specific user by the slug in their URL

### GET /api/users/{userID}/allies

Returns a list of the users allies (users)

### GET /api/users/{userID}/posts

Returns a list of the users posts

### GET /api/users/{userID}/groups

Returns a list of the groups the user is a member of

### GET /api/users/{userID}/events

Returns a list of the events the user is attending/has attended

### GET /api/users/{userID}/groups/admin

Returns a list of the groups the user created and is admin of

### GET /api/users/{userID}/events/admin

Returns a list of the events the user is hosting and is admin of

### GET /api/posts

Returns a list of all posts

### GET /api/posts/{postID}

Returns a specific post by its ID

### GET /api/groups/{groupID}

Returns a specific group by its ID

### GET /api/groups/{groupID}/posts

Returns a list of a groups posts

### GET /api/groups/{groupID}/users

Returns a list of the members (users) of a specific group

### GET /api/groups/{userID}/admin

Returns the admin (user) of a specific group

### GET /api/groups/{groupID}/events

Returns a list of the events hosted by a specific group

### GET /api/events/{slugID}

Returns a specific event by the slug in its URL

### GET /api/events/{eventID}/users

Returns a list of the attendees (users) of a specific event

### GET /api/events/{eventID}/posts

Returns a list of an events posts
