# Travel Planner --- Implementation Plan

## 1. Product Vision

### Working concept

**Turn travel inspiration into actual places and then into real trips.**

A user discovers a hidden gem through an Instagram Reel, YouTube Short,
TikTok, blog, or image. Instead of searching through comments and
manually researching the place, the user shares the content with the
Travel Planner.

The application:

1.  Accepts the shared content/link.
2.  Extracts available metadata and content clues.
3.  Uses AI to identify the likely destination/place.
4.  Verifies the location using maps, places, web, and geographic data.
5.  Saves the place to the user's Bucket List.
6.  Allows the user to plan a trip using one or many saved places.
7.  Dynamically optimizes the itinerary based on time, distance, budget,
    weather, opening hours, and preferences.

### Core product loop

``` text
Travel Inspiration
       ↓
Share / Import
       ↓
AI Location Detection
       ↓
Location Verification
       ↓
Save to Bucket List
       ↓
Select Multiple Places
       ↓
AI Trip Planning
       ↓
Optimized Itinerary
       ↓
Actual Trip
       ↓
Visited / Memories
```

------------------------------------------------------------------------

# 2. Product Modules

## Module A --- Authentication & User Profile

### Features

-   Email/password authentication
-   Google OAuth
-   User profile
-   Home/current city
-   Travel preferences
-   Budget preference
-   Preferred travel style
-   Favorite activities
-   Dietary preferences
-   Preferred transport
-   Travel history

### Suggested data

``` text
User
- id
- name
- email
- avatar
- home_location
- travel_preferences
- budget_preference
- preferred_transport
- created_at
- updated_at
```

------------------------------------------------------------------------

# 3. Module B --- Travel Inspiration Import

This is the primary differentiating feature.

## User flow

``` text
User sees Reel/Short/Post
        ↓
Share
        ↓
Travel Planner
        ↓
Content Import Screen
        ↓
Analyze
```

### Input methods

MVP:

-   Public URL
-   Manually pasted URL
-   Screenshot/image upload
-   Manually entered caption
-   Manual place search

Future:

-   Browser extension
-   Mobile share sheet
-   Official platform integrations
-   Saved social posts integration where permitted

### Supported content

-   Instagram
-   YouTube
-   TikTok
-   Blogs
-   Travel websites
-   Google Maps links
-   Images/screenshots

### Important constraint

Do not build the system around unauthorized scraping or downloading of
social-platform content.

Use official APIs and permitted public metadata where available. For
unsupported/private content, allow the user to provide a screenshot,
caption, or manually entered information.

------------------------------------------------------------------------

# 4. Module C --- AI Content Analyzer

## Goal

Convert unstructured travel content into structured travel information.

### Input

``` text
URL
Caption
Title
Description
Hashtags
Transcript
Screenshot
User-provided text
```

### Output

``` json
{
  "place_candidates": [
    {
      "name": "Devkund Waterfall",
      "region": "Raigad",
      "country": "India",
      "confidence": 0.87,
      "evidence": [
        "caption mentions Raigad",
        "visual landmark similarity",
        "travel context matches"
      ]
    }
  ],
  "activity": ["waterfall", "trekking"],
  "travel_style": ["adventure", "nature"],
  "estimated_duration": "1 day",
  "best_season": null
}
```

### AI pipeline

``` text
Content
   ↓
Content Extraction
   ↓
Text Analysis
   ↓
Image/Vision Analysis
   ↓
Entity Extraction
   ↓
Place Candidate Generation
   ↓
Confidence Scoring
```

------------------------------------------------------------------------

# 5. Module D --- Location Verification

AI should not blindly trust its first prediction.

## Verification pipeline

``` text
AI Candidate
     ↓
Geocoding
     ↓
Places Search
     ↓
Map/Geographic Validation
     ↓
Web Evidence
     ↓
Distance / Landmark Validation
     ↓
Confidence Score
```

### Result states

#### High confidence

``` text
We found this place

Devkund Waterfall
Raigad, Maharashtra

Confidence: 87%

[View Place]
[Save to Bucket List]
[Plan Trip]
```

#### Medium confidence

``` text
Possible locations

1. Devkund Waterfall — 72%
2. Tamhini Ghat — 18%
3. Kundalika Valley — 10%

[Confirm]
```

#### Low confidence

``` text
We couldn't confidently identify this location.

Please provide:
- Screenshot
- Caption
- Nearby city
- Any clue from the creator
```

### Critical product rule

Always distinguish:

-   Confirmed location
-   Likely location
-   Possible location
-   Unknown location

Never present an uncertain AI guess as a fact.

------------------------------------------------------------------------

# 6. Module E --- Place Details

Every identified location should have a normalized place profile.

``` text
Place
- id
- name
- description
- latitude
- longitude
- address
- city
- state
- country
- category
- activities
- estimated_visit_duration
- opening_hours
- entry_fee
- best_time
- best_season
- difficulty
- safety_notes
- source_links
- verification_status
- created_at
- updated_at
```

### Place page

Include:

-   Photos
-   Map
-   Description
-   Activities
-   Opening hours
-   Entry fee
-   Best time
-   Weather
-   Nearby attractions
-   Nearby restaurants
-   Nearby accommodation
-   Travel time from user's location
-   Saved status
-   Source content

------------------------------------------------------------------------

# 7. Module F --- Bucket List

## Main concept

Users can save discovered locations.

### Bucket list categories

-   Want to visit
-   Planned
-   Visited
-   Favorite
-   Maybe later

### Bucket list UI

``` text
My Bucket List

Maharashtra
----------------
📍 Devkund Waterfall
📍 Harishchandragad
📍 Sandhan Valley

Goa
----------------
📍 Butterfly Beach
📍 Cola Beach
📍 Cabo de Rama
```

### Features

-   Save place
-   Remove place
-   Add notes
-   Add priority
-   Add tags
-   Add estimated budget
-   Add source content
-   Mark visited
-   Add personal photos
-   Add rating/review

------------------------------------------------------------------------

# 8. Module G --- Bucket List Map

Display all saved places on an interactive map.

### Marker states

``` text
🟢 Want to visit
🔵 Planned
🟡 Visited
❤️ Favorite
```

### Smart insights

Example:

> You have 7 saved places within 150 km of Pune.

> 4 of your saved places can be combined into a 3-day trip.

> 3 bucket-list places are near your upcoming Goa trip.

------------------------------------------------------------------------

# 9. Module H --- AI Trip Planner

This converts saved places into an itinerary.

## Input

``` text
Start location
Destination
Dates
Number of travelers
Budget
Transport
Bucket-list locations
Travel preferences
```

## Example

``` text
Plan a 4-day trip from Pune using:

- Devkund Waterfall
- Sandhan Valley
- Harishchandragad
- Bhandardara
```

## AI workflow

``` text
User Requirements
       ↓
Candidate Places
       ↓
Geographic Clustering
       ↓
Route Optimization
       ↓
Opening Hours Validation
       ↓
Travel Time Calculation
       ↓
Budget Estimation
       ↓
Weather Check
       ↓
Itinerary Generation
```

------------------------------------------------------------------------

# 10. Module I --- Day-by-Day Itinerary

Each day should contain:

``` text
Day
- date
- location
- activities
- start_time
- end_time
- travel_time
- distance
- estimated_cost
- notes
```

### Example

``` text
Day 2 — Bhandardara

08:00
Breakfast

09:00
Travel to Harishchandragad
1h 30m

10:30
Trek

14:30
Lunch

16:00
Bhandardara Lake

18:30
Sunset

20:00
Dinner
```

------------------------------------------------------------------------

# 11. Module J --- Interactive Route

Show the complete daily route.

``` text
Hotel
  ↓
Attraction A
  ↓
Restaurant
  ↓
Attraction B
  ↓
Sunset Point
  ↓
Hotel
```

### Features

-   Route visualization
-   Distance
-   Travel duration
-   Transport mode
-   Route optimization
-   Reorder stops
-   Add/remove stops
-   Navigation link

------------------------------------------------------------------------

# 12. Module K --- Dynamic Replanning

This should be one of the advanced features.

Users should be able to modify an active trip using natural language.

Examples:

``` text
"I'm running 2 hours late."

"Remove the trek."

"It's raining today."

"I don't want to wake up before 8 AM."

"Add one more waterfall."

"I have only ₹5,000 remaining."
```

The system recalculates the remaining itinerary.

### Replanning pipeline

``` text
Current Trip State
       ↓
User Change
       ↓
Constraint Extraction
       ↓
Available Activities
       ↓
Route Recalculation
       ↓
Budget Recalculation
       ↓
Weather / Opening Hours
       ↓
Updated Itinerary
```

------------------------------------------------------------------------

# 13. Module L --- Weather-Aware Planning

Weather should influence itinerary generation.

Example:

``` text
Weather:
Heavy rain expected 2 PM–6 PM
```

AI can automatically change:

``` text
Original:
Trek → Waterfall → Sunset

Updated:
Museum → Cafe → Restaurant → Sunset if weather improves
```

### Weather data

Store/cache:

-   Temperature
-   Rain probability
-   Weather condition
-   Sunrise
-   Sunset
-   Severe weather alerts

------------------------------------------------------------------------

# 14. Module M --- Budget Planner

## Categories

-   Transportation
-   Accommodation
-   Food
-   Activities
-   Entry fees
-   Shopping
-   Miscellaneous

### Budget calculation

``` text
Estimated trip cost

Transport       ₹5,000
Accommodation   ₹6,000
Food            ₹3,000
Activities      ₹2,000
Miscellaneous   ₹1,000
-----------------------
Total          ₹17,000
```

### Advanced

Show:

-   Planned budget
-   Actual spending
-   Remaining budget
-   Cost per person
-   Cost per day
-   Category breakdown

------------------------------------------------------------------------

# 15. Module N --- Expense Splitting

For group trips:

``` text
Saurabh paid ₹3,000
Rahul paid ₹2,000
Amit paid ₹1,000
```

Calculate:

``` text
Rahul → Saurabh ₹500
Amit → Saurabh ₹1,500
```

Future:

-   Split equally
-   Custom splits
-   Group expenses
-   Settlement tracking

------------------------------------------------------------------------

# 16. Module O --- Restaurant Recommendations

Recommend places based on:

-   Distance
-   Cuisine
-   Budget
-   Rating
-   Opening hours
-   Dietary preferences
-   Current itinerary

Example:

``` text
Find vegetarian restaurants
within 2 km of our next activity
under ₹500 for two people.
```

------------------------------------------------------------------------

# 17. Module P --- Accommodation

MVP:

-   Search
-   Compare
-   Save
-   Show approximate pricing
-   Distance from attractions

Future:

-   Hotel API integration
-   Booking links
-   Price comparison
-   Availability

------------------------------------------------------------------------

# 18. Module Q --- Transportation

Support:

-   Car
-   Bike
-   Train
-   Bus
-   Flight
-   Taxi/local transport

Compare:

``` text
Option       Time      Cost
Train        8h        ₹900
Bus          10h       ₹700
Car          8h        ₹2,500
Flight       1h        ₹4,500
```

Future:

-   Live transport data
-   Ticket booking
-   Delay handling

------------------------------------------------------------------------

# 19. Module R --- Smart Travel Checklist

Generate a checklist from:

-   Destination
-   Weather
-   Trip duration
-   Activities
-   Transport
-   Traveler type

Example:

``` text
Documents
- [ ] ID
- [ ] Tickets
- [ ] Hotel confirmation

Electronics
- [ ] Charger
- [ ] Power bank
- [ ] Camera

Trekking
- [ ] Trekking shoes
- [ ] Water bottle
- [ ] First-aid kit
```

------------------------------------------------------------------------

# 20. Module S --- Group Trip Collaboration

Allow users to invite friends.

Features:

-   Shared itinerary
-   Shared bucket list
-   Activity voting
-   Comments
-   Expense sharing
-   Role/permissions
-   Real-time updates

Example:

``` text
Where should we go?

Beach        4 votes
Trekking     3 votes
Cafe         1 vote
```

------------------------------------------------------------------------

# 21. Module T --- Travel Assistant

Every trip gets a contextual AI assistant.

The assistant should know:

-   Current itinerary
-   Bucket list
-   Budget
-   Travelers
-   Preferences
-   Bookings
-   Weather
-   Current location if user grants permission

Examples:

``` text
"What am I doing tomorrow?"

"Where should we eat tonight?"

"How much have we spent?"

"Can we add another waterfall?"

"It's raining. What should we do?"

"Find something within 30 minutes of our hotel."
```

------------------------------------------------------------------------

# 22. Module U --- Offline Mode

Before the trip, user can download:

-   Itinerary
-   Places
-   Addresses
-   Maps
-   Tickets
-   Hotel details
-   Emergency information
-   Important notes

This is especially important for remote destinations.

------------------------------------------------------------------------

# 23. Module V --- Memories

After visiting a place:

``` text
Mark as visited
      ↓
Upload photos
      ↓
Add notes
      ↓
Rating
      ↓
Travel journal
```

Potential future feature:

> AI automatically creates a travel story from your photos and
> itinerary.

------------------------------------------------------------------------

# 24. Recommended Tech Stack

## Frontend

``` text
Next.js
TypeScript
Tailwind CSS
shadcn/ui
React Query / TanStack Query
Map library
```

## Backend

``` text
Python
FastAPI
Pydantic
Celery / background workers
```

## Database

``` text
MongoDB
```

Use MongoDB for:

-   Users
-   Trips
-   Places
-   Bucket lists
-   Itineraries
-   Expenses
-   Content imports

## Cache

``` text
Redis
```

Use Redis for:

-   API caching
-   Rate limiting
-   Sessions
-   Background job state
-   Frequently accessed place data

## Vector Database

``` text
Qdrant / Chroma
```

Use for:

-   Destination knowledge
-   Travel guides
-   Place descriptions
-   User travel preferences
-   Semantic place discovery

## AI

``` text
LLM
Vision model
Embeddings
LangGraph
```

Use LangGraph only where multi-step/stateful workflows actually benefit
from it.

------------------------------------------------------------------------

# 25. Suggested System Architecture

``` text
                         ┌──────────────────┐
                         │   Next.js App    │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │    FastAPI       │
                         │    API Gateway   │
                         └────────┬─────────┘
                                  │
              ┌───────────────────┼───────────────────┐
              │                   │                   │
              ▼                   ▼                   ▼
        ┌───────────┐       ┌───────────┐       ┌───────────┐
        │ AI Layer  │       │  Trip     │       │  Places   │
        │ LangGraph │       │ Service   │       │ Service   │
        └─────┬─────┘       └─────┬─────┘       └─────┬─────┘
              │                   │                   │
              └───────────────────┼───────────────────┘
                                  │
                  ┌───────────────┼───────────────┐
                  │               │               │
                  ▼               ▼               ▼
              MongoDB          Redis          Vector DB
                  │
                  ▼
          External APIs
       Maps / Weather / Places
```

------------------------------------------------------------------------

# 26. AI Agent Architecture

Do not create dozens of agents immediately.

Start with a small number of well-defined workflows.

## Agent 1 --- Content Analyzer

Responsibilities:

-   Extract travel entities
-   Identify candidate locations
-   Extract activities
-   Extract travel clues

## Agent 2 --- Location Verification

Responsibilities:

-   Search candidates
-   Compare evidence
-   Verify geographic information
-   Calculate confidence

## Agent 3 --- Trip Planner

Responsibilities:

-   Select places
-   Group nearby locations
-   Create itinerary
-   Respect constraints

## Agent 4 --- Replanner

Responsibilities:

-   Read current trip state
-   Apply new constraints
-   Recalculate itinerary

## Agent 5 --- Travel Assistant

Responsibilities:

-   Answer questions using trip context
-   Call appropriate tools
-   Modify trip when explicitly requested

------------------------------------------------------------------------

# 27. Tool Calling

The AI should not directly invent information.

Give it tools such as:

``` text
search_places()
get_place_details()
get_coordinates()
get_route()
get_weather()
get_opening_hours()
calculate_distance()
calculate_trip_cost()
search_restaurants()
search_hotels()
get_user_bucket_list()
update_itinerary()
```

Example:

``` text
User:
"Can we visit another waterfall tomorrow?"

AI
 ↓
search_places()
 ↓
get_coordinates()
 ↓
get_route()
 ↓
get_opening_hours()
 ↓
get_weather()
 ↓
update_itinerary()
```

------------------------------------------------------------------------

# 28. RAG Architecture

RAG should be used where external knowledge is useful.

## Knowledge sources

Potentially index:

-   Official tourism websites
-   Destination guides
-   Government tourism information
-   Park/attraction information
-   User-created notes
-   Your own curated destination database

Pipeline:

``` text
Source
 ↓
Document ingestion
 ↓
Cleaning
 ↓
Chunking
 ↓
Embedding
 ↓
Vector DB
 ↓
Retriever
 ↓
Reranker
 ↓
LLM
```

Do not use RAG as a replacement for live APIs. For current weather,
opening hours, availability, and route information, prefer live data
sources.

------------------------------------------------------------------------

# 29. Database Design

## Users

``` text
users
```

## Places

``` text
places
```

## Content Imports

``` text
content_imports
```

Example:

``` text
- id
- user_id
- source_url
- platform
- caption
- extracted_text
- image_reference
- candidates
- selected_place_id
- confidence
- status
```

## Bucket List

``` text
bucket_list_items
```

## Trips

``` text
trips
```

## Itinerary Items

``` text
itinerary_items
```

## Expenses

``` text
expenses
```

## Group Members

``` text
trip_members
```

## Memories

``` text
memories
```

------------------------------------------------------------------------

# 30. API Structure

Suggested REST API:

``` text
/auth
  POST /register
  POST /login
  POST /refresh

/users
  GET /me
  PATCH /me

/content
  POST /imports
  GET /imports/:id
  POST /imports/:id/analyze
  POST /imports/:id/confirm

/places
  GET /places/search
  GET /places/:id
  GET /places/:id/nearby

/bucket-list
  GET /
  POST /
  PATCH /:id
  DELETE /:id

/trips
  GET /
  POST /
  GET /:id
  PATCH /:id
  DELETE /:id

/trips/:id/plan
  POST /

/trips/:id/replan
  POST /

/trips/:id/itinerary
  GET /
  PATCH /:itemId

/trips/:id/expenses
  GET /
  POST /
  PATCH /:expenseId

/trips/:id/members
  POST /
  DELETE /:memberId

/assistant
  POST /chat

/weather
  GET /

/routes
  POST /calculate
```

------------------------------------------------------------------------

# 31. Background Jobs

Some operations should not block API requests.

Use Celery/RQ/background workers for:

-   Content processing
-   Video/transcript processing where permitted
-   Image analysis
-   Embedding generation
-   RAG ingestion
-   Place enrichment
-   Weather refresh
-   Large itinerary optimization
-   Notifications

Example:

``` text
POST /content/import
        ↓
Create job
        ↓
Return import_id
        ↓
Background worker
        ↓
Analyze
        ↓
Verify
        ↓
Notify frontend
```

------------------------------------------------------------------------

# 32. Caching Strategy

Redis cache examples:

``` text
weather:{lat}:{lon}:{date}
place:{place_id}
route:{origin}:{destination}:{mode}
search:{query}:{location}
```

Use TTLs appropriate to the data.

Avoid caching information that must be real-time for the product
decision.

------------------------------------------------------------------------

# 33. MVP Scope

Do NOT build everything initially.

## MVP Version 1

### Must have

-   Authentication
-   URL/content import
-   Screenshot upload
-   AI content analysis
-   Candidate location detection
-   Location confirmation
-   Place details
-   Bucket list
-   Bucket-list map
-   AI trip generation
-   Day-by-day itinerary
-   Route visualization
-   Basic budget
-   Save/share trip

### MVP user journey

``` text
Login
 ↓
Paste Reel URL
 ↓
Analyze
 ↓
AI suggests location
 ↓
Confirm location
 ↓
Save to Bucket List
 ↓
Add 3 more places
 ↓
Create Trip
 ↓
Select dates + budget
 ↓
AI generates itinerary
 ↓
Edit itinerary
 ↓
View map
```

------------------------------------------------------------------------

# 34. Version 2

Add:

-   Weather
-   Restaurant recommendations
-   Accommodation
-   Transportation comparison
-   Smart packing list
-   Dynamic replanning
-   Trip AI assistant
-   Expense splitting
-   Group collaboration

------------------------------------------------------------------------

# 35. Version 3

Add:

-   Mobile app
-   Share sheet
-   Browser extension
-   Offline maps/data
-   Live travel alerts
-   Booking integrations
-   Travel memories
-   Personalized recommendations
-   Social discovery
-   Public/shared itineraries

------------------------------------------------------------------------

# 36. Recommended Development Order

## Phase 1 --- Foundation

-   [ ] Create monorepo
-   [ ] Set up Next.js
-   [ ] Set up FastAPI
-   [ ] Configure MongoDB
-   [ ] Configure Redis
-   [ ] Authentication
-   [ ] Environment configuration
-   [ ] API error handling
-   [ ] Logging
-   [ ] Basic CI/CD

## Phase 2 --- Places

-   [ ] Place search
-   [ ] Geocoding
-   [ ] Place details
-   [ ] Map integration
-   [ ] Nearby places
-   [ ] Place database schema

## Phase 3 --- Inspiration Import

-   [ ] URL import
-   [ ] Screenshot upload
-   [ ] Metadata extraction where permitted
-   [ ] Content normalization
-   [ ] AI content analyzer
-   [ ] Candidate generation
-   [ ] Confidence scoring
-   [ ] Location verification
-   [ ] User confirmation

## Phase 4 --- Bucket List

-   [ ] Save place
-   [ ] Remove place
-   [ ] Notes
-   [ ] Tags
-   [ ] Favorites
-   [ ] Visited status
-   [ ] Bucket-list map
-   [ ] Nearby bucket-list discovery

## Phase 5 --- Trip Planner

-   [ ] Trip creation
-   [ ] Date selection
-   [ ] Budget
-   [ ] Traveler count
-   [ ] Transport preference
-   [ ] Select bucket-list places
-   [ ] Geographic clustering
-   [ ] Route optimization
-   [ ] Itinerary generation
-   [ ] Itinerary editor

## Phase 6 --- AI Assistant

-   [ ] Trip context
-   [ ] Tool calling
-   [ ] Travel assistant
-   [ ] Dynamic replanning
-   [ ] Constraint handling
-   [ ] Weather-aware planning

## Phase 7 --- Collaboration

-   [ ] Invite members
-   [ ] Shared trip
-   [ ] Voting
-   [ ] Comments
-   [ ] Expenses
-   [ ] Settlement

## Phase 8 --- Production

-   [ ] Monitoring
-   [ ] Rate limiting
-   [ ] API cost tracking
-   [ ] AI usage tracking
-   [ ] Caching
-   [ ] Security audit
-   [ ] Database indexes
-   [ ] Error tracking
-   [ ] Backup strategy
-   [ ] Load testing

------------------------------------------------------------------------

# 37. Important AI Quality Rules

The biggest risk is hallucination.

Never let the model invent:

-   Locations
-   Opening hours
-   Prices
-   Distances
-   Weather
-   Transport schedules
-   Hotel availability

Use:

``` text
AI → generate hypothesis
External source/API → verify
AI → explain verified result
```

For every location candidate, maintain:

``` text
confidence
evidence
sources
verification_status
last_verified_at
```

------------------------------------------------------------------------

# 38. Security

Implement:

-   JWT/session security
-   Input validation
-   Rate limiting
-   API authentication
-   Secure file uploads
-   URL validation
-   SSRF protection for URL imports
-   File type validation
-   Size limits
-   Secret management
-   Encrypted sensitive user data
-   Access control for shared trips

Especially protect URL-import endpoints from SSRF.

------------------------------------------------------------------------

# 39. Observability

Track:

### Product metrics

-   Number of imports
-   Location detection success rate
-   Confirmation rate
-   Bucket-list saves
-   Trips created
-   Trips completed
-   Replanning usage
-   User retention

### AI metrics

-   Location detection confidence
-   Correct/incorrect location confirmations
-   Tool-call failures
-   Token usage
-   Cost per trip
-   Latency

### Technical metrics

-   API latency
-   Error rate
-   Background job failures
-   Cache hit rate
-   Database performance

------------------------------------------------------------------------

# 40. Success Metrics for the MVP

The most important metric should be:

## Inspiration → Saved Place conversion

``` text
Imported content
       ↓
Identified place
       ↓
Confirmed place
       ↓
Saved to bucket list
```

Track the percentage at each stage.

Second important metric:

## Bucket List → Trip conversion

``` text
Saved places
       ↓
Trip created
```

This validates whether the product is actually turning inspiration into
travel.

------------------------------------------------------------------------

# 41. Final Product Architecture

The product should ultimately feel like this:

``` text
                    TRAVEL PLANNER
                         │
        ┌────────────────┼────────────────┐
        │                │                │
     DISCOVER          SAVE             PLAN
        │                │                │
        ▼                ▼                ▼
 Social Content      Bucket List       AI Planner
        │                │                │
        ▼                ▼                ▼
 AI Location         Map View         Itinerary
 Detection              │                │
        │                │                │
        └────────────────┼────────────────┘
                         │
                         ▼
                  TRAVEL ASSISTANT
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
       Weather         Budget          Routes
          │              │              │
          └──────────────┼──────────────┘
                         ▼
                  DYNAMIC TRIP
                     REPLANNING
```

# 42. Portfolio Positioning

This project should not be presented as:

> "I built an AI travel planner."

A stronger description is:

> **"An AI-powered travel intelligence platform that converts travel
> content from social media into verified destinations, personalized
> bucket lists, and dynamically optimized itineraries."**

It demonstrates:

-   Full-stack development
-   AI/LLM integration
-   Vision
-   RAG
-   Agentic workflows
-   Tool calling
-   Geospatial search
-   Route optimization
-   External APIs
-   Background jobs
-   Redis caching
-   MongoDB
-   Authentication
-   Real-time/dynamic replanning
-   Production system design

That combination makes the project substantially stronger than a basic
itinerary-generation chatbot.
