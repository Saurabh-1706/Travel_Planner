# Low-Level Design (LLD)

## 1. Authentication Flow
- Client sends credentials (or OAuth token) to `/api/auth/login`.
- Server validates and issues a signed JWT with a 1-hour expiration and a refresh token (stored as HttpOnly cookie).
- Protected routes use a middleware to verify the JWT signature.

## 2. AI Itinerary Generation Flow
- Client sends trip parameters: `destination`, `dates`, `budget_level`, `interests`.
- `TripController` validates the request and passes it to the `AIService`.
- `AIService` constructs a detailed prompt and calls the LLM API.
- LLM returns a JSON-formatted itinerary.
- `AIService` parses the JSON and passes it to `TripRepository` to save the draft.
- Response is sent back to the client for rendering.

## 3. Booking Module Integration (Strategy Pattern)
The Booking Service will implement the **Strategy Pattern** to handle multiple third-party providers.
- Interface `IBookingProvider`: methods `searchFlights()`, `bookFlight()`, `cancelBooking()`.
- Classes `AmadeusProvider`, `SkyscannerProvider` implement `IBookingProvider`.
- A factory class instantiates the correct provider based on configuration or regional availability.

## 4. Real-time Collaboration (WebSockets)
- Use Socket.io or native WebSockets for the Trip planning room.
- Users connect to a specific `tripId` channel.
- When User A drags an activity to a new time slot, a `trip_updated` event is broadcasted.
- Other clients receive the event and optimistically update their UI.
