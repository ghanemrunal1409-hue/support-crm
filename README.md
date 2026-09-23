# Support CRM

A full-stack Support CRM system built as part of the AI + Tech Intern technical assessment for Datastraw Technologies.

## Live Demo

- Frontend: https://support-crm-snowy.vercel.app/
- Backend API: https://support-crm-owpi.onrender.com/
- API Health Check: https://support-crm-owpi.onrender.com/

## Features

- Create support tickets
- Automatic ticket ID generation
- Automatic ticket timestamp
- View all tickets
- Search tickets by customer name, ticket ID, email, subject, or description
- Filter tickets by status
- View complete ticket details
- Update ticket status
- Add notes/comments to tickets
- Responsive web interface
- REST API integration
- SQLite database

## Tech Stack

### Frontend

- React
- Vite
- Axios
- CSS

### Backend

- Node.js
- Express.js
- REST API
- CORS

### Database

- SQLite
- better-sqlite3

## Project Structure

```text
support-crm/
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── routes/
│   └── ticketRoutes.js
├── database.js
├── server.js
├── package.json
├── .env.example
├── .gitignore
└── README.md