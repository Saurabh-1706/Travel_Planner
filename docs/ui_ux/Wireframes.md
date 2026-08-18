# Wireframes & Screen Specifications

## 1. Landing Page
**Purpose**: Introduce the AI Travel Planner and drive user registration.
- **Hero Section**: Large search bar with "Where do you want to go?". Background features high-quality travel video or image carousel.
- **Features Section**: Grid layout highlighting "AI Itinerary Generation", "Smart Budgeting", "Group Collaboration".
- **Social Proof**: Testimonials and "Trusted by" badges.
- **Call to Action (CTA)**: "Start Planning for Free" button.

## 2. Dashboard (Logged In)
**Purpose**: Overview of upcoming trips, past trips, and quick actions.
- **Top Navigation**: Logo, Search Trips, Notifications (Bell icon), User Profile Avatar.
- **Hero/Greeting**: "Welcome back, [Name]! Ready for your next adventure?"
- **Upcoming Trip Card**: Displays next trip destination, dates, weather preview, and "Continue Planning" button.
- **Discover Carousel**: AI-suggested destinations based on user preferences.

## 3. AI Trip Planner (Creation Flow)
**Purpose**: Collect user inputs for the AI engine.
- **Step 1 (Destination)**: "Where to?" (Autocomplete search).
- **Step 2 (Dates)**: Date picker (Start to End).
- **Step 3 (Budget & Preferences)**: Select buttons for Budget (Budget, Moderate, Luxury) and Interests (Culture, Food, Adventure).
- **Loading State**: Entertaining travel facts while the AI generates the itinerary.

## 4. Itinerary View (The Core Planner)
**Purpose**: Display and edit the generated trip.
- **Left Sidebar (Days)**: Vertical tabs for Day 1, Day 2, etc.
- **Main Area (Timeline)**: Vertical timeline showing activities (e.g., 09:00 - Breakfast, 10:30 - Museum).
  - Drag-and-drop enabled to reorder activities.
- **Right Sidebar (Map & Suggestions)**:
  - Top half: Interactive map showing pins for the current day's activities.
  - Bottom half: AI suggestions ("Add a nearby coffee shop").
- **Floating Action Button (FAB)**: AI Chat assistant for quick questions ("What's the weather like today?").

## 5. Budget Splitter (Within Trip)
**Purpose**: Track and split expenses.
- **Header**: Total Trip Cost vs Budget limit progress bar.
- **List View**: Expense items with title, amount, and payer avatar.
- **Add Expense Modal**: Inputs for Amount, Description, Category, and "Split By" (Equal, Custom percentages).
- **Settle Up Tab**: Summary of who owes whom, with payment integration options (e.g., Venmo links).
