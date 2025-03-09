## Blintr Database Schema

This file describes the database schema for Blintr, a dating website where users cannot see each other's photos until 5 messages have been exchanged. The database is structured using MongoDB with Mongoose models for easy interaction.

### 1. Users Collection (`users`)
Stores user details, preferences, and profile visibility status.

- `username`: Unique username of the user.
- `email`: User’s email address.
- `passwordHash`: Encrypted password.
- `bio`: Short user bio.
- `interests`: List of user interests.
- `profile_photo`: URL of the user's profile picture.
- `photo_visibility`: Boolean flag to determine if the profile picture is visible.
- `gender`: User's gender.
- `looking_for`: Gender preference for matches.
- `dob`: Date of birth.
- `location`: City and country of the user.
- `last_active`: Timestamp of the last activity.
- `matches`: List of matched user IDs.
- `blocked_users`: List of blocked user IDs.
- `created_at`: Account creation timestamp.

### 2. Matches Collection (`matches`)
Stores mutual matches between users.

- `user1`: First user in the match.
- `user2`: Second user in the match.
- `matched_at`: Timestamp of the match.
- `chat_started`: Boolean flag to indicate if chat has started.
- `photos_unlocked`: Boolean flag to indicate if profile pictures are visible.

### 3. Messages Collection (`messages`)
Stores messages exchanged between matched users.

- `match_id`: ID of the associated match.
- `sender_id`: User ID of the sender.
- `receiver_id`: User ID of the receiver.
- `message`: Text message content.
- `sent_at`: Timestamp when the message was sent.
- `seen`: Boolean flag to indicate if the message has been read.

### 4. Notifications Collection (`notifications`)
Stores user notifications for various activities.

- `user_id`: ID of the user receiving the notification.
- `type`: Type of notification (`match_request`, `message_received`, `photo_unlocked`).
- `message`: Notification message content.
- `created_at`: Timestamp of notification creation.
- `read`: Boolean flag to indicate if the notification has been read.

### 5. Reports Collection (`reports`)
Stores user reports for inappropriate behavior.

- `reported_by`: ID of the user who reported.
- `reported_user`: ID of the user being reported.
- `reason`: Reason for reporting.
- `created_at`: Timestamp of the report.
- `status`: Status of the report (`pending`, `resolved`).

This schema ensures secure and structured data management for Blintr. Let me know if you need any modifications or additions!
