# API Documentation

## Base URL
`/api/v1`

## 1. Authentication (`/auth`)

### POST `/auth/register`
**Description**: Register a new user.
**Body**:
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "full_name": "John Doe"
}
```
**Response (201 Created)**:
```json
{
  "token": "jwt_token_string",
  "user": { "id": "uuid", "email": "user@example.com" }
}
```

### POST `/auth/login`
**Description**: Login and receive JWT.

## 2. Trips (`/trips`)

### POST `/trips/generate`
**Description**: Trigger AI to generate a trip itinerary.
**Body**:
```json
{
  "destination": "Paris, France",
  "start_date": "2026-09-01",
  "end_date": "2026-09-07",
  "budget": "moderate",
  "interests": ["history", "food", "art"]
}
```
**Response (200 OK)**:
Returns a full JSON representation of the generated itinerary including days, activities, and estimated costs.

### GET `/trips/{id}`
**Description**: Retrieve a specific trip and its details.

### PATCH `/trips/{id}/activities/{activityId}`
**Description**: Update an activity (e.g., drag and drop to a new time).
**Body**:
```json
{
  "start_time": "14:00:00",
  "end_time": "16:00:00"
}
```

## 3. Expenses (`/expenses`)

### POST `/trips/{id}/expenses`
**Description**: Add a new expense to a trip.
**Body**:
```json
{
  "title": "Dinner at Eiffel Tower",
  "amount": 150.00,
  "currency": "EUR",
  "paid_by": "user_uuid",
  "split_type": "equal"
}
```
