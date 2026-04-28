# 🐾 PawConnect

A full-stack, multi-role pet care and adoption platform — connecting pet lovers with adoption centers and professional pet service providers across India.

## What is PawConnect?
PawConnect simplifies the fragmented pet care industry by centralizing adoption discovery, professional service bookings, and real-time communication into a single platform. Whether you're looking to adopt a pet, book a vet appointment, or manage your pet store — PawConnect handles it all.

## Live Demo
*Coming soon* / `http://localhost:3000` (local)

## Screenshots
*Add screenshots here after deployment*

## User Roles
PawConnect supports 4 distinct roles, each with their own dashboard and permissions:

| Role | What They Can Do |
| :--- | :--- |
| **User** | Browse pets, send enquiries, book services, manage pet profiles |
| **Store Owner** | List pets for adoption, manage enquiry inbox, update inventory |
| **Service Provider** | Set up clinic/center, manage schedule, handle bookings |
| **Admin** | Approve or reject store owner and service provider registrations |

> **Note:** Store owners and all service provider types must submit a registration request that goes through Admin approval before they can access the platform. No unauthorized businesses can list pets or services.

## Service Provider Types
There are 4 types of service providers, each with specialized dashboard views:
*   **Veterinary** — Monthly checkups and medical consultations
*   **Grooming** — Bathing, trimming, and styling sessions
*   **Training** — Individual pet training sessions
*   **Boarding** — Pet hotel stays with check-in/check-out date ranges and auto-calculated pricing

## Features
### Fully Working
*   ✅ Role-based authentication with JWT
*   ✅ Multi-role dashboards (User, Store, Provider, Admin)
*   ✅ Dynamic booking engine across all 4 service types
*   ✅ Auto-calculated boarding price based on stay duration
*   ✅ Pet adoption listing and discovery with city + breed filters
*   ✅ Real-time enquiry/chat system between users and store owners
*   ✅ Image upload and management for pets and providers
*   ✅ Notification badge system (DB-driven, clears on visit)
*   ✅ Admin approval workflow for business registrations
*   ✅ Multi-city architecture

### Partially Working / In Progress
*   🟡 Real-time chat (WebSocket upgrade in progress)
*   🟡 User reviews and ratings
*   🟡 Advanced search filters
*   🟡 Automated email/SMS alerts

### Planned
*   🚀 Payment gateway integration
*   🚀 In-app video consultations
*   🚀 Mobile app (React Native)
*   🚀 Social feed for pet updates

## Tech Stack
| Layer | Technology |
| :--- | :--- |
| **Frontend** | React.js, React Router, Axios |
| **Styling** | Vanilla CSS (custom tokens, dark-theme first, glassmorphism) |
| **Backend** | Node.js, Express.js |
| **Database** | PostgreSQL |
| **ORM** | Prisma |
| **Auth** | JWT (JSON Web Tokens) |
| **Notifications** | React Toastify |

## Pages & Routes
| Route | Page / Function |
| :--- | :--- |
| `/` | Landing page with hero and city selector |
| `/pets` | Browse pets with category filters |
| `/pets/:id` | Pet detail page with enquiry form |
| `/services` | Service provider directory |
| `/services/:id` | Provider profile + booking manager |
| `/stores` | Pet store directory |
| `/profile` | User dashboard (pets, bookings, settings) |
| `/store-dashboard` | Store owner panel (inventory + enquiries) |
| `/service-dashboard` | Provider panel (schedule + appointments) |
| `/admin` | Admin approval panel |
| `/login` / `/register` | Auth suite with role selection |
| `/care-guides` | Pet care guides resource page |

## Booking System
The booking engine covers 4 service types with a unified flow:
1.  **Vet / Grooming** → Select service → Pick date & time slot → Confirm
2.  **Training** → Select session date & time → Confirm
3.  **Boarding** → Select check-in to check-out dates → Auto-calculate total price → Confirm

*Includes a 2-hour buffer for rescheduling and cancellation, and pet health profile validation before booking.*

## Adoption Flow
1.  User discovers a pet on `/pets`
2.  User sends an enquiry from the pet's detail page
3.  Store owner responds via the enquiry inbox
4.  Both parties communicate to arrange an in-person visit
5.  Store owner marks the pet as **Adopted** — it's removed from public listings

## Getting Started

### Prerequisites
*   Node.js v18+
*   PostgreSQL database
*   npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/pawconnect.git
cd pawconnect

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Setup
1.  **Environment Variables:** Create a `.env` file in the `backend` directory:
    ```env
    DATABASE_URL="postgresql://user:password@localhost:5432/pawconnect"
    JWT_SECRET="your_jwt_secret_here"
    PORT=5000
    ```
2.  **Database:** Run migrations to set up your schema:
    ```bash
    cd backend
    npx prisma generate
    npx prisma db push
    ```

### Running the App
```bash
# Start the backend (from /backend)
npm start

# Start the frontend (from /frontend in a new terminal)
npm start
```
The app will be running at `http://localhost:3000`.

## Project Status
**High-Fidelity MVP — ~95% complete**
Core features, multi-role authentication, and all service workflows are fully functional. The platform is portfolio/demo ready.

## Author

**Mehul Jethwani**
- GitHub: [@Mehul-Jethwani](https://github.com/Mehul-Jethwani)
- LinkedIn: [Mehul Jethwani](https://linkedin.com/in/mehul-jethwani)

## License
This project is for portfolio and educational purposes.
