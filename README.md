# TripLedger — Group Travel & Expense Management System

**TripLedger** is a full-stack DBMS project designed to manage group travel itineraries, track shared expenses, compute fair splits, and automatically simplify net member debts to minimize peer-to-peer settlement transactions.

![Project Status](https://img.shields.io/badge/Status-DBMS%20Project-5b8af5)
![Stack](https://img.shields.io/badge/Stack-HTML5%20%7C%20CSS3%20%7C%20JS%20%7C%20PostgreSQL-3ecf8e)

---

Overview & Features

- **User & Trip Management:** Register travelers and organize trips with primary coordinators, custom start/end dates, and multi-currency support.
- **Itinerary Tracking:** Schedule daily activities, sightseeing stops, and stay arrangements mapped to trip days.
- **Shared Expense Logging:** Log bills with designated payers, foreign currencies, and optional links to itinerary events.
- **Custom Expense Splits:** Split expenses using equal, exact, or percentage-based rules.
- **Automated Balance Triggers:** Real-time balance updates powered by relational database triggers.
- **Debt Simplification (`simplify_trip_debts`):** Stored procedure to reduce complex multi-person debts into the minimum number of transactions needed for full settlement.

---

 Database Architecture & Entities

1. Entities & Attributes

* **`users`** (Primary user record)
  * `user_id` (PK): Unique user identifier
  * `full_name`: User's full name
  * `email`: Email address
  * `phone_number`: Contact phone number
  * `password_hash`: Encrypted password
  * `created_at`: Account creation timestamp

* **`trips`** (Trip details & configuration)
  * `trip_id` (PK): Unique trip identifier
  * `trip_name`: Title of the trip
  * `description`: Overview or details of the trip
  * `start_date`: Trip start date
  * `end_date`: Trip end date
  * `base_currency`: Primary currency for expense settlement (e.g., INR, USD, EUR)
  * `coordinator_id` (FK): References `users(user_id)`

* **`trip_members`** (Travelers assigned to trips)
  * `trip_id` (PK, FK): References `trips(trip_id)`
  * `user_id` (PK, FK): References `users(user_id)`
  * `role`: User role (`Coordinator` or `Member`)
  * `joined_at`: Date and time the user joined the trip

* **`itinerary_items`** (Daily schedule entries)
  * `item_id` (PK): Unique itinerary item identifier
  * `trip_id` (FK): References `trips(trip_id)`
  * `location`: Place or location name
  * `activity_type`: Category (`Sightseeing`, `Transit`, `Accommodation`, `Dining`, `Adventure`, `Rest`, `Other`)
  * `day_number`: Sequence day of the trip
  * `start_time`: Activity start timestamp
  * `end_time`: Activity end timestamp
  * `notes`: Booking references or details

* **`expenses`** (Shared bills & payments)
  * `expense_id` (PK): Unique expense identifier
  * `trip_id` (FK): References `trips(trip_id)`
  * `description`: Short summary of expense
  * `total_amount`: Total amount paid
  * `currency`: Paid currency
  * `paid_by` (FK): References `users(user_id)`
  * `category`: Expense category (`Accommodation`, `Food & Drinks`, `Transport`, `Activities`, `Shopping`, `Miscellaneous`)
  * `expense_date`: Date of transaction
  * `itinerary_item_id` (FK, Optional): References `itinerary_items(item_id)`

* **`expense_splits`** (Granular member shares)
  * `expense_id` (PK, FK): References `expenses(expense_id)`
  * `user_id` (PK, FK): References `users(user_id)`
  * `split_amount`: Individual calculated owe amount
  * *Constraint:* Enforces `SUM(split_amount) == total_amount` per expense.

* **`member_balances`** (Real-time standings)
  * `trip_id` (PK, FK): References `trips(trip_id)`
  * `user_id` (PK, FK): References `users(user_id)`
  * `net_balance`: Calculated balance (+ = owed money, - = owes money)
  * *Constraint:* Auto-updated via PostgreSQL database triggers.

---
