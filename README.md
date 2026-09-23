# Support CRM

A full-stack Customer Support Ticket Management System built as a technical assessment for Datastraw Technologies.

## Features

- Create customer support tickets
- Automatically generate unique ticket IDs
- Automatically record ticket creation timestamps
- View all support tickets
- Search tickets by:
  - Ticket ID
  - Customer name
  - Customer email
  - Subject
  - Description
- Filter tickets by status:
  - Open
  - In Progress
  - Closed
- View complete ticket details
- Update ticket status
- Add notes/comments to tickets
- Responsive and clean user interface
- SQLite database persistence
- REST API backend

## Tech Stack

### Frontend

- React
- Vite
- Axios
- CSS

### Backend

- Node.js
- Express.js
- CORS
- better-sqlite3

### Database

- SQLite

## Project Structure

```text
support-crm/
├── routes/
│   └── ticketRoutes.js
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── package.json
│   └── package-lock.json
├── database.js
├── server.js
├── package.json
├── package-lock.json
├── .env.example
├── .gitignore
└── README.md