
# VHack: Virtual Hackathon Platform Documentation

---

## Problem Statement

Organizing virtual hackathons requires a robust platform to manage team registration, project submissions, judge evaluation, real-time announcements, and leaderboard rankings. The platform must support multiple user roles (participant, judge, organizer/admin), file uploads, scoring workflows, and a seamless user experience from registration to final results. Judges should be able to provide feedback and manage multiple evaluation rounds.

---

## Feature List

- **User Authentication & Roles:** Firebase-based authentication with roles: participant, judge, organizer, admin.
- **Hackathon Management:** Create, edit, publish, and manage hackathons (organizer/admin).
- **Team Management:** Team creation, join via code, member management, and team listing.
- **Project Submission:** Project builder/editor, file uploads (images, PDFs), tagging, and submission workflow.
- **Judging & Scoring:** Judge assignment, project scoring, feedback, multiple evaluation rounds, and AI-powered analysis.
- **Leaderboards & Analytics:** Real-time leaderboard rankings, dashboards for all roles, and analytics.
- **Announcements & Notifications:** Real-time announcements and notifications for participants and judges.
- **Chat & Collaboration:** Real-time chat for teams and hackathons.
- **Achievements:** Unlockable achievements for user engagement.
- **Admin Controls:** Approve/reject hackathons, manage users, and view platform-wide stats.
- **Responsive UI:** Fully responsive and accessible design.
- **File Uploads:** Secure image and PDF uploads via Cloudinary.

---

## Screenshots
![Screenshot 2025-06-25 104010](screenshots/Screenshot%202025-06-25%20104010.png)

![Screenshot 2025-06-25 103023](screenshots/Screenshot%202025-06-25%20103023.png)

![Screenshot 2025-06-25 103045](screenshots/Screenshot%202025-06-25%20103045.png)

![Screenshot 2025-06-25 103111](screenshots/Screenshot%202025-06-25%20103111.png)

![Screenshot 2025-06-25 103152](screenshots/Screenshot%202025-06-25%20103152.png)

![Screenshot 2025-06-25 103216](screenshots/Screenshot%202025-06-25%20103216.png)

![Screenshot 2025-06-25 103245](screenshots/Screenshot%202025-06-25%20103245.png)

![Screenshot 2025-06-25 103301](screenshots/Screenshot%202025-06-25%20103301.png)

---

## Technologies Used

- **Backend:**
  - Node.js, Express.js (REST API)
  - MongoDB (Mongoose ODM)
  - Firebase Admin SDK (Authentication)
  - Socket.io (Real-time chat/notifications)
  - Cloudinary (File uploads)
  - Groq SDK & GitHub API (AI-powered project analysis)

- **Frontend:**
  - React 19 (Vite, functional components, hooks)
  - Tailwind CSS (Styling)
  - Radix UI primitives, custom UI components
  - React Context (State management)
  - React Router DOM (Routing)
  - Socket.io-client (Realtime)
  - Firebase Authentication

---

## Architecture & Database Design

### System Architecture

- **Frontend:** React app communicates with backend via REST API and Socket.io for real-time features.
- **Backend:** Node.js/Express server handles API requests, authentication, business logic, and real-time events.
- **Database:** MongoDB stores users, hackathons, teams, projects, achievements, and chat messages.
- **File Storage:** Cloudinary for images and PDFs.
- **AI Integration:** Groq SDK and GitHub API for project analysis.

### Folder Structure

#### Backend

```
/backend
├── config/          # Configuration files
├── controllers/     # Route controllers
├── middlewares/     # Express middleware
├── models/          # Mongoose models
├── routes/          # Express routes
├── services/        # Business logic
├── utils/           # Helpers
├── app.js           # Main app
├── server.js        # Server entry
└── .env             # Environment variables
```

#### Frontend

```
/frontend
├── public/
├── src/
│   ├── components/
│   │   ├── dashboards/
│   │   ├── landing/
│   │   └── ui/
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

### Database Models (Mongoose)

- **User**
  ```js
  // backend/models/User.js
  const userSchema = new mongoose.Schema(
    {
      firebaseUid: { type: String, required: true, unique: true },
      displayName: { type: String, required: true },
      email: { type: String, required: true, unique: true },
      role: {
        type: String,
        enum: ["participant", "judge", "organizer"],
        required: false,
        default: null,
      },
      profileCompleted: { type: Boolean, default: false },
      profile: {
        firstName: String,
        lastName: String,
        bio: String,
        location: String,
        company: String,
        jobTitle: String,
        experience: String,
        skills: [String],
        education: [
          {
            institution: String,
            degree: String,
            field: String,
            startYear: String,
            endYear: String,
            current: Boolean,
            id: Number,
          },
        ],
        socialLinks: {
          github: String,
          linkedin: String,
          portfolio: String,
          twitter: String,
        },
        achievements: [
          {
            title: String,
            description: String,
            type: String,
            date: String,
            id: Number,
          }
        ],
        expertise: [String],
        organization: String,
        about: String,
        yearsOfExperience: String,
        website: String,
        position: String,
      },
      isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
  );
  ```
- **Achievement**
  ```js
  // backend/models/Achievement.js
  const achievementSchema = new mongoose.Schema(
    {
      id: { type: String, required: true, unique: true },
      name: { type: String, required: true },
      description: { type: String, required: true },
      icon: { type: String, required: true },
      category: {
        type: String,
        enum: [
          "beginner",
          "participation",
          "submission",
          "collaboration",
          "expertise",
          "milestone",
          "special",
        ],
        required: true,
      },
      points: { type: Number, default: 0 },
      rarity: {
        type: String,
        enum: ["common", "rare", "epic", "legendary"],
        default: "common",
      },
      requirements: { type: Object, required: true },
    },
    { timestamps: true }
  );
  ```

- **UserAchievement**
  ```js
  // backend/models/UserAchievement.js
  const userAchievementSchema = new mongoose.Schema(
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      achievement: { type: String, required: true },
      unlockedAt: { type: Date, default: Date.now },
      progress: { type: Number, default: 0 },
      total: { type: Number, required: true },
    },
    { timestamps: true }
  );
  // Compound index to prevent duplicate achievements
  userAchievementSchema.index({ user: 1, achievement: 1 }, { unique: true });
  ```

- **Hackathon**
  ```js
  // backend/models/Hackathon.js
  const hackathonSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    organizerName: { type: String, required: true, trim: true },
    organizerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    description: { type: String, required: true },
    problemStatements: { type: String, required: true },
    theme: {
      type: String,
      enum: ["AI", "Fintech", "Healthcare", "Education", "Sustainability", "Other"],
      default: "Other",
    },
    bannerImageUrl: { type: String },
    timelines: {
      registrationStart: { type: Date, required: true },
      registrationEnd: { type: Date, required: true },
      hackathonStart: { type: Date, required: true },
      hackathonEnd: { type: Date, required: true },
      resultsDate: { type: Date },
    },
    teamSettings: {
      minTeamSize: { type: Number, required: true, min: 1 },
      maxTeamSize: { type: Number, required: true, min: 1 },
      allowSolo: { type: Boolean, default: false },
    },
    prizes: {
      firstPrize: { type: String, required: true },
      secondPrize: { type: String, required: true },
      thirdPrize: { type: String, required: true },
      participantPrize: { type: String, required: true },
    },
    judgingCriteria: [
      {
        title: { type: String, required: true },
        description: { type: String },
        weight: { type: Number, default: 1 },
        maxScore: { type: Number, default: 10 },
      },
    ],
    status: {
      type: String,
      enum: [
        "draft",
        "pending_approval",
        "published",
        "upcoming",
        "ongoing",
        "completed",
        "cancelled",
      ],
      default: "draft",
    },
    invitedJudges: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    judges: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    resultsPublished: { type: Boolean, default: false },
    resultsPublishedAt: { type: Date },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    approvedAt: { type: Date },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    rejectedAt: { type: Date },
    rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    rejectionReason: { type: String },
    announcements: [
      {
        message: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
        author: { type: String, default: 'Organizer' },
      }
    ],
    multiStage: { type: Boolean, default: false },
    rounds: [
      {
        name: { type: String, required: true },
        description: { type: String },
        teamsToShortlist: { type: Number, required: true },
        startTime: { type: Date },
        endTime: { type: Date },
        resultTime: { type: Date },
      },
    ],
  });
  ```

- **Team**
  ```js
  // backend/models/Team.js
  const teamSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    hackathon: { type: mongoose.Schema.Types.ObjectId, ref: "Hackathon", required: true },
    leader: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    members: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        role: { type: String, default: "member" },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
    invitations: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        status: { type: String, enum: ["pending", "accepted", "declined"], default: "pending" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    skillsNeeded: [String],
    isOpen: { type: Boolean, default: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
    joinCode: { type: String, unique: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  });
  ```

- **Project**
  ```js
  // backend/models/Project.js
  const projectSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    problemStatement: { type: String, trim: true },
    challenges: { type: String, trim: true },
    technologies: [{ type: String, trim: true }],
    links: {
      github: { type: String, trim: true },
      live: { type: String, trim: true },
      video: { type: String, trim: true },
      presentation: { type: String, trim: true }
    },
    images: [
      { url: { type: String, required: true }, caption: { type: String, default: '' } }
    ],
    hackathon: { type: mongoose.Schema.Types.ObjectId, ref: 'Hackathon', default: null },
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', default: null },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    builders: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        role: { type: String, enum: ['creator', 'collaborator'], default: 'collaborator' },
        joinedAt: { type: Date, default: Date.now }
      }
    ],
    status: { type: String, enum: ['draft', 'submitted', 'judging', 'judged'], default: 'draft' },
    isPublic: { type: Boolean, default: true },
    submittedAt: { type: Date, default: null },
    scores: [
      {
        judge: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        criteria: [
          { title: String, score: Number, maxScore: { type: Number, default: 10 } }
        ],
        totalScore: Number,
        feedback: String,
        submittedAt: { type: Date, default: Date.now }
      }
    ],
    finalScore: { type: Number, default: 0, min: 0 },
    aiAnalysis: {
      overallScore: { type: Number, min: 0, max: 100 },
      criteriaScores: [
        { title: String, score: Number, maxScore: Number, feedback: String }
      ],
      strengths: [String],
      improvements: [String],
      technicalHighlights: [String],
      innovationFactors: [String],
      codeQualityMetrics: {
        structureQuality: { type: Number, min: 0, max: 10 },
        documentationQuality: { type: Number, min: 0, max: 10 },
        testingCoverage: { type: Number, min: 0, max: 10 },
        architectureDesign: { type: Number, min: 0, max: 10 }
      },
      recommendation: String,
      confidenceLevel: { type: Number, min: 0, max: 100 },
      analyzedAt: { type: Date, default: Date.now },
      repository: {
        name: String,
        description: String,
        language: String,
        stars: Number,
        forks: Number
      }
    },
    rank: { type: Number, default: null }
  }, { timestamps: true });
  ```

- **ChatMessage**
  ```js
  // backend/models/ChatMessage.js
  const ChatMessageSchema = new mongoose.Schema({
    hackathonId: { type: mongoose.Schema.Types.Mixed, required: true },
    sender: {
      userId: { type: String, required: true },
      name: { type: String, required: true },
      role: { type: String, enum: ['organizer', 'judge'], required: true },
    },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  });
  ```


## API Endpoints (Detailed)

### Authentication (`/auth`)
- **POST /auth/register**  
  Register a new user using Firebase Auth. Requires `email`, `password`, and `displayName` in the body.

- **POST /auth/login**  
  Login with a Firebase ID token. Returns user info if token is valid.

- **POST /auth/authenticate**  
  Checks if the provided Firebase token is valid and returns user info.

- **POST /auth/role**  
  Update the user's role (`participant`, `judge`, or `organizer`). Requires `role` in the body.

- **POST /auth/profile**  
  Update the user's profile during onboarding. Requires `profile` object in the body.

- **POST /auth/verify-token**  
  Verifies a Firebase token and returns a backend JWT and user info.

- **GET /auth/mongo-id**  
  Returns the MongoDB `_id` for the authenticated user.

---

### Profile (`/profile`)
- **GET /profile**  
  Get the authenticated user's profile.

- **PUT /profile**  
  Update the authenticated user's profile. Accepts all profile fields.

---

### Hackathons (`/hackathons`)
- **GET /hackathons**  
  List all hackathons (excluding drafts).

- **GET /hackathons/published**  
  List all published hackathons (requires auth).

- **GET /hackathons/:hackathonId**  
  Get details for a specific hackathon by ID.

- **POST /hackathons/create**  
  Create a new hackathon (organizer only). Requires hackathon details in body.

- **GET /hackathons/my/hackathons**  
  Get all hackathons created by the authenticated organizer.

- **PUT /hackathons/:hackathonId**  
  Update a hackathon (organizer only).

- **DELETE /hackathons/:hackathonId**  
  Delete a hackathon (organizer only).

- **GET /hackathons/judge/assigned**  
  Get all hackathons assigned to the authenticated judge.

- **GET /hackathons/:hackathonId/chat-messages**  
  Get all chat messages for a hackathon.

- **GET /hackathons/:hackathonId/announcements**  
  Get all announcements for a hackathon.

- **POST /hackathons/:hackathonId/announcements**  
  Add an announcement to a hackathon (organizer only).

---

### Teams (`/teams`)
- **POST /teams**  
  Create a new team for a hackathon. Requires `name`, `description`, and `hackathonId` in body.

- **POST /teams/join**  
  Join a team using a join code. Requires `code` in body.

- **GET /teams/hackathon/:hackathonId**  
  Get all teams for a specific hackathon.

- **GET /teams/hackathon/:hackathonId/my**  
  Get the authenticated user's team for a specific hackathon.

- **GET /teams/my**  
  Get all teams the authenticated user is a member of.

- **GET /teams/:hackathonId/project**  
  Get the project for the authenticated user's team in a hackathon.

---

### Projects (`/projects`)
- **GET /projects**  
  List all projects for the authenticated user, or all public projects if `showPublic=true`.

- **GET /projects/:projectId**  
  Get details for a specific project.

- **POST /projects**  
  Create a new project. Requires project details in body.

- **PUT /projects/:projectId**  
  Update a project (must be creator or builder).

- **DELETE /projects/:projectId**  
  Delete a project (creator only, only if not submitted).

- **POST /projects/:projectId/submit**  
  Submit a project for judging (must be builder or creator).

- **POST /projects/:projectId/unsubmit**  
  Unsubmit a project (if judging hasn't started).

- **POST /projects/:projectId/images**  
  Add an image to a project. Requires `imageUrl` and optional `caption` in body.

- **DELETE /projects/:projectId/images/:imageId**  
  Remove an image from a project.

- **GET /projects/hackathon/:hackathonId/submitted**  
  Get all submitted projects for a hackathon (judges/organizer only).

- **POST /projects/:projectId/score**  
  Submit a judge's score for a project. Requires `scores` array and optional `feedback` in body.

- **POST /projects/:projectId/ai-analyze**  
  Run AI-powered analysis on a project's GitHub repo. Returns AI feedback and scores.

---

### Achievements (`/achievements`)
- **GET /achievements**  
  Get all achievements and the user's unlocked status.

- **POST /achievements/check**  
  Check for and unlock new achievements for the user.

---

### File Upload (`/api/upload`)
- **POST /api/upload/image**  
  Upload an image file (JPEG, PNG, GIF, WebP). Returns Cloudinary URL.

- **POST /api/upload/pdf**  
  Upload a PDF file. Returns Cloudinary URL.

---

### Admin (`/api/admin`)
- **GET /api/admin/dashboard**  
  Get platform-wide stats for admins.

- **GET /api/admin/pending-hackathons**  
  Get all hackathons pending approval.

- **PUT /api/admin/hackathons/:id/approve**  
  Approve a hackathon for publishing.

- **PUT /api/admin/hackathons/:id/reject**  
  Reject a hackathon with a reason.

---

### Participant Dashboard (`/participant`)
- **GET /participant/dashboard**  
  Get dashboard data for the participant (stats, recent activity, deadlines).

- **GET /participant/analytics**  
  Get analytics and charts for the participant's activity.

---

### Organizer Dashboard (`/organizer`)
- **GET /organizer/dashboard**  
  Get dashboard data for the organizer (stats, recent activity, insights).

- **GET /organizer/analytics**  
  Get analytics and charts for the organizer's hackathons.

---

### Judge Dashboard (`/judge`)
- **GET /judge/dashboard**  
  Get dashboard data for the judge (assigned hackathons, stats).

- **GET /judge/analytics**  
  Get analytics and charts for the judge's activity.

---

### Skills (`/skills`)
- **GET /skills**  
  Get a list of all available skills for user profiles and team formation.



