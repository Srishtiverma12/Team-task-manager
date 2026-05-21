# Team Task Manager 🚀
**by Ethara**

A full-stack team collaboration tool for managing projects, tasks, and attendance with role-based access control.

## 🌐 Live Demo
👉 [https://team-task-manager-production-c614.up.railway.app](https://team-task-manager-production-c614.up.railway.app)

## ✨ Features
- 🔐 Authentication — Signup & Login with JWT
- 📁 Project Management — Create, view, delete projects
- ✅ Task Management — Kanban board (To Do / In Progress / Done)
- 👥 Team Collaboration — Add members, role-based access (Admin/Member)
- 📊 Dashboard — Task stats, completion rate, overdue tracking
- 🗓️ Attendance Tracking — Daily attendance with Present/Absent/Late status
- 🎨 Beautiful UI — Navy blue & beige dark theme

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, Vite, React Router |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| Auth | JWT, bcryptjs |
| Deployment | Vercel (Frontend), Render (Backend) |
| Styling | Custom CSS (no framework) |

## 🚀 Getting Started Locally

### Prerequisites
- Node.js v18+
- PostgreSQL

### Backend Setup
```bash
cd server
npm install
```

Create `.env` file in `/server`:
```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/taskmanager
JWT_SECRET=supersecretkey123
PORT=5000
```

Create database tables:
```bash
psql -U postgres -d taskmanager
```
Then run the SQL from `server/schema.sql`

Start server:
```bash
node index.js
```

### Frontend Setup
```bash
cd client
npm install
```

Create `.env` file in `/client`:
```env
VITE_API_URL=http://localhost:5000/api
```

Start frontend:
```bash
npm run dev
```

## 📁 Project Structure
Team-task-manager/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/          # Login, Signup, Dashboard, Projects, Attendance
│   │   ├── components/     # Shell (layout)
│   │   ├── api.js          # Axios instance
│   │   └── authContext.jsx # Auth state management
│   └── vercel.json
├── server/                 # Node.js backend
│   ├── routes/             # auth, projects, tasks, attendance
│   ├── middleware/         # JWT auth middleware
│   ├── db.js               # PostgreSQL connection
│   └── index.js            # Express server
└── README.md

## 🔐 Role-Based Access

| Feature | Admin | Member |
|---------|-------|--------|
| Create Project | ✅ | ❌ |
| Delete Project | ✅ | ❌ |
| Add Members | ✅ | ❌ |
| Create Tasks | ✅ | ✅ |
| Delete Tasks | ✅ | ❌ |
| Update Task Status | ✅ | ✅ |
| Mark Attendance | ✅ | ❌ |
| View Attendance | ✅ | ✅ |

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/projects` | Get all projects |
| POST | `/api/projects` | Create project |
| POST | `/api/projects/:id/members` | Add member |
| DELETE | `/api/projects/:id` | Delete project |
| GET | `/api/projects/:id` | Get project details |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |
| GET | `/api/tasks/stats` | Dashboard stats |
| POST | `/api/attendance` | Mark attendance |
| GET | `/api/attendance/project/:id` | Get project attendance |

## 👩‍💻 Developer
**Srishti Verma**  
<<<<<<< HEAD
GitHub: [@Srishtiverma12](https://github.com/Srishtiverma12)
=======
GitHub: [@Srishtiverma12](https://github.com/Srishtiverma12)
>>>>>>> 9b1d10e19c5095be271f6cba1c3c5335bad8b90d
