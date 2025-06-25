# vHack

vHack is a world-class, full-stack virtual hackathon platform designed for seamless online competitions, team collaboration, project submissions, real-time judging, and AI-powered analytics. Built for participants, judges, and organizers, vHack brings together everything you need to run and join hackathons at scale.

---

## 🚀 Features

- **User Authentication & Roles:** Secure Firebase Auth with roles (participant, judge, organizer, admin)
- **Hackathon Management:** Create, edit, publish, and manage hackathons with multi-stage rounds and custom judging criteria
- **Team Management:** Team creation, join via code, invitations, and member management
- **Project Submission:** Rich project builder/editor, file uploads (images, PDFs), tagging, and submission workflow
- **Judging & Scoring:** Judge assignment, multi-criteria scoring, feedback, multi-round evaluation, and AI-powered analysis
- **Leaderboards & Analytics:** Real-time leaderboards, dashboards, and advanced analytics for all roles
- **Announcements & Notifications:** Real-time announcements and notifications for participants and judges
- **Chat & Collaboration:** Real-time chat for teams and hackathons (Socket.io)
- **Achievements:** Unlockable achievements and gamification for user engagement
- **Admin Controls:** Approve/reject hackathons, manage users, and view platform-wide stats
- **AI Project Analysis:** Groq AI + GitHub API for deep code/project analysis and automated feedback
- **Responsive UI:** Modern, accessible, and mobile-friendly design (React 19 + Tailwind CSS)
- **File Uploads:** Secure image and PDF uploads via Cloudinary

---

## 🏗️ Tech Stack

**Backend:**
- Node.js, Express.js (REST API)
- MongoDB (Mongoose ODM)
- Firebase Admin SDK (Authentication)
- Socket.io (Real-time chat/notifications)
- Cloudinary (File uploads)
- Groq SDK & GitHub API (AI-powered project analysis)

**Frontend:**
- React 19 (Vite, functional components, hooks)
- Tailwind CSS (Styling)
- Radix UI primitives, custom UI components
- React Context (State management)
- React Router DOM (Routing)
- Socket.io-client (Realtime)
- Firebase Authentication

---

## 📦 Folder Structure

```
/backend
  ├── config/
  ├── controllers/
  ├── middlewares/
  ├── models/
  ├── routes/
  ├── services/
  ├── utils/
  ├── app.js
  ├── server.js
  └── .env

/frontend
  ├── public/
  ├── src/
  │   ├── components/
  │   ├── contexts/
  │   ├── pages/
  │   ├── config/
  │   ├── hooks/
  │   ├── lib/
  │   ├── index.css
  │   ├── main.jsx
  │   └── App.jsx
  ├── index.html
  ├── package.json
  └── README.md
```

---

## 🗄️ Database Models

- **User:** Firebase UID, displayName, email, role, profile (bio, skills, education, social links, achievements, expertise, etc.)
- **Hackathon:** Title, organizer, description, problem statements, theme, timelines, team settings, prizes, judging criteria, status, judges, announcements, rounds
- **Team:** Name, description, hackathon, leader, members, invitations, skillsNeeded, isOpen, project, joinCode
- **Project:** Title, description, problemStatement, challenges, technologies, links, images, hackathon, team, creator, builders, status, isPublic, submittedAt, scores, finalScore, aiAnalysis, rank
- **ChatMessage:** hackathonId, sender, message, createdAt
- **Achievement/UserAchievement:** For gamification and engagement

See [`documentation.txt`](./documentation.txt) for full schema details.

---

## ⚡ Quick Start

1. **Clone the repo**
   ```sh
   git clone https://github.com/your-org/vhack.git
   cd vhack
   ```

2. **Backend Setup**
   ```sh
   cd backend
   npm install
   # Copy .env.example to .env and fill in MongoDB, Firebase, Cloudinary, Groq, GitHub API keys
   npm run dev
   ```

3. **Frontend Setup**
   ```sh
   cd frontend
   npm install
   # Copy .env.example to .env and set VITE_API_URL, Firebase config, etc.
   npm run dev
   ```

4. **Access the app**
   - Frontend: [http://localhost:5173](http://localhost:5173)
   - Backend API: [http://localhost:5000](http://localhost:5000)

---

## 📝 Documentation

- **API Reference:** See [`documentation.txt`](./documentation.txt) for all endpoints, request/response formats, and DB schema.
- **Architecture:** Modern microservices-inspired, scalable, and real-time ready.
- **Deployment:** Easily deployable to Vercel/Netlify (frontend) and Render/Heroku/AWS (backend).

---

## 🌍 Why vHack?

- **World-class judging:** Multi-criteria, multi-round, and AI-powered scoring
- **Seamless collaboration:** Real-time chat, team management, and notifications
- **Scalable:** Built for hackathons of any size, from campus events to global competitions
- **Secure:** Robust authentication, role-based access, and secure file handling
- **Modern UI:** Beautiful, accessible, and responsive design





