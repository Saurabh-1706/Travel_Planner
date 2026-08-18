# Database Design & Schema

We will use PostgreSQL for structured transactional data (users, trips, expenses) and optionally MongoDB or a JSONB column in PostgreSQL for flexible, AI-generated itinerary data. Below is the detailed schema for PostgreSQL.

## Table: `users`
| Column Name | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | Primary Key | Unique user identifier |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | User's email address |
| `password_hash`| VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| `full_name` | VARCHAR(100) | NOT NULL | User's full name |
| `preferences`| JSONB | | Travel preferences (budget, diet, etc.) |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Registration date |

## Table: `trips`
| Column Name | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | Primary Key | Unique trip identifier |
| `creator_id` | UUID | Foreign Key (users.id) | User who created the trip |
| `title` | VARCHAR(255) | NOT NULL | Custom trip name |
| `destination` | VARCHAR(255) | NOT NULL | City/Country |
| `start_date` | DATE | NOT NULL | Start of trip |
| `end_date` | DATE | NOT NULL | End of trip |
| `status` | VARCHAR(50) | DEFAULT 'planning' | e.g., planning, booked, completed |

## Table: `itinerary_days`
| Column Name | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | Primary Key | Unique day identifier |
| `trip_id` | UUID | Foreign Key (trips.id) | Associated trip |
| `day_date` | DATE | NOT NULL | Specific calendar date |
| `day_index` | INT | NOT NULL | e.g., Day 1, Day 2 |

## Table: `activities`
| Column Name | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | Primary Key | Unique activity identifier |
| `itinerary_day_id`| UUID | Foreign Key (itinerary_days.id)| Associated day |
| `title` | VARCHAR(255) | NOT NULL | Name of activity |
| `start_time` | TIME | | Start time |
| `end_time` | TIME | | End time |
| `type` | VARCHAR(50) | | e.g., flight, hotel, sightseeing, dining |
| `cost_estimate`| DECIMAL | | Estimated cost from AI |

## Indexes
- `CREATE INDEX idx_trips_creator ON trips(creator_id);`
- `CREATE INDEX idx_itinerary_days_trip ON itinerary_days(trip_id);`
