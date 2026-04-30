<div align="center">

# 🐾 PawConnect

### A full-stack, multi-role pet care and adoption platform
#### Connecting pet lovers with adoption centers and professional pet service providers across India

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)](https://www.prisma.io/)
[![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)](https://jwt.io/)

**[View on GitHub](https://github.com/Mehul-Jethwani/pawconnect)** • **[LinkedIn](https://linkedin.com/in/mehul-jethwani)**

</div>

---

## 🌟 What is PawConnect?

The pet care industry in India is completely fragmented.

- Find a pet → OLX
- Book a vet → Practo
- Find a groomer → Instagram DMs
- Ask about boarding → WhatsApp

**Nothing is connected. No verification. No accountability.**

PawConnect fixes this — a single platform that centralizes pet adoption, professional service bookings, and real-time communication between all parties.

---

## 📸 Screenshots

### 🏠 Homepage
![Homepage](screenshots/homepage.png)
*City-based discovery — switch your city, everything updates instantly*

### 🐾 Browse Pets
![Browse Pets](screenshots/browse-pets.png)
*Filter by city, breed and type — vaccination status visible at a glance*

### 🐱 Pet Detail Page
![Pet Detail](screenshots/pet-detail.png)
*Full pet profile with breed, age, weight, adoption fee and direct enquiry system*

### 👤 User Dashboard
![User Dashboard](screenshots/user-dashboard.png)
*Manage pet health profiles and track full appointment history*

### 🏪 Store Owner Dashboard
![Store Dashboard](screenshots/store-dashboard.png)
*Live enquiry inbox, inventory management and real-time adoption tracking*

### 🩺 Vet Service Dashboard
![Vet Dashboard](screenshots/vet-dashboard.png)
*Specialized dashboards per service type — time-slot scheduling for vets and groomers*

### 🔒 Admin Panel
![Admin Panel](screenshots/admin-panel.png)
*Every business verified before going live — zero unauthorized listings*

### 📖 Pet Care Guides
![Pet Care Guides](screenshots/guides.png)
*Built-in resource library — vaccination schedules, nutrition guides, India-specific tips*

---

## 👥 User Roles

PawConnect supports **4 completely separate roles**, each with their own dashboard, logic and experience — all running on one backend:

| Role | What They Can Do |
|------|-----------------|
| **👤 User** | Browse pets city-wise, send adoption enquiries, book services across 4 types, manage pet health profiles |
| **🏪 Store Owner** | List pets for adoption, manage live enquiry inbox, track available vs adopted inventory |
| **🩺 Service Provider** | Set up clinic/center, manage schedule, handle bookings (4 specialized types) |
| **🔒 Admin** | Approve or reject every store owner and service provider registration |

> **Important:** Every store owner and service provider must go through **Admin approval** before accessing the platform. No unauthorized businesses can list pets or services.

---

## 🩺 Service Provider Types

| Type | Specialization |
|------|---------------|
| **Veterinary** | Time-slot based checkups and medical consultations |
| **Grooming** | Session-based bathing, trimming and styling |
| **Training** | Individual pet training session management |
| **Boarding** | Check-in/check-out date ranges with **automatic price calculation** |

---

## ✅ Features

### Fully Working
- 🔐 Role-based authentication with JWT
- 📊 Multi-role dashboards — User, Store, Provider, Admin
- 📅 Dynamic booking engine across all 4 service types
- 💰 Auto-calculated boarding price based on stay duration
- 🐾 Pet adoption listing and discovery with city + breed filters
- 💬 Threaded enquiry/chat system between users and store owners
- 🖼️ Image upload and management for pets and providers
- 🔔 Notification badge system (DB-driven, clears on visit)
- ✅ Admin approval workflow for business registrations
- 🏙️ Multi-city architecture

### In Progress
- 🟡 Real-time chat (WebSocket upgrade)
- 🟡 User reviews and ratings
- 🟡 Advanced search filters
- 🟡 Automated email/SMS alerts

### Planned
- 🚀 Payment gateway integration
- 🚀 In-app video consultations
- 🚀 Mobile app (React Native)
- 🚀 Social feed for pet updates

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React.js, React Router, Axios |
| **Styling** | Vanilla CSS — custom tokens, dark-theme first, glassmorphism |
| **Backend** | Node.js, Express.js |
| **Database** | PostgreSQL |
| **ORM** | Prisma |
| **Auth** | JWT (JSON Web Tokens) |
| **Notifications** | React Toastify |

---

## 🗺️ Pages & Routes

| Route | Page |
|-------|------|
| `/` | Landing page with hero and city selector |
| `/pets` | Browse pets with filters |
| `/pets/:id` | Pet detail + enquiry form |
| `/services` | Service provider directory |
| `/services/:id` | Provider profile + booking |
| `/stores` | Pet store directory |
| `/profile` | User dashboard |
| `/store-dashboard` | Store owner panel |
| `/service-dashboard` | Provider panel |
| `/admin` | Admin approval panel |
| `/login` `/register` | Auth suite with role selection |
| `/care-guides` | Pet care guides library |

---

## 📅 Booking System

```
Vet / Grooming  →  Select Service  →  Pick Date & Time  →  Confirm
Training        →  Select Session Date & Time  →  Confirm
Boarding        →  Check-in Date  →  Check-out Date  →  Auto Price  →  Confirm
```

- ⏱️ 2-hour buffer for rescheduling and cancellation
- 🐾 Pet health profile validation before booking

---

## 🐾 Adoption Flow

```
1. User discovers pet on /pets
2. Sends enquiry from pet detail page
3. Store owner responds via enquiry inbox
4. Both parties chat to arrange in-person visit
5. Owner marks pet as ADOPTED → removed from public listings
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- PostgreSQL
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Mehul-Jethwani/pawconnect.git
cd pawconnect

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Environment Setup

Create a `.env` file in the `backend` directory:

```env
DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/pawconnect"
JWT_SECRET="your_jwt_secret_here"
PORT=5000
```

### Database Setup

```bash
cd backend
npx prisma generate
npx prisma db push
npx prisma db seed
```

### Run the App

```bash
# Terminal 1 — Backend
cd backend
npm start

# Terminal 2 — Frontend
cd frontend
npm start
```

App runs at `http://localhost:3000` 🚀

---

## 📊 Project Status

> **High-Fidelity MVP — ~95% complete**
>
> Core features, multi-role authentication, and all service workflows are fully functional and portfolio/demo ready.

---

## 👨‍💻 Author

<div align="center">

**Mehul Jethwani**

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Mehul-Jethwani)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/mehul-jethwani)

</div>

---

## 📄 License

This project is for portfolio and educational purposes.

---

<div align="center">
Made with ❤️ for pets across India 🐾
</div>
