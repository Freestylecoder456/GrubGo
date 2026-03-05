# GrubGo - Food Delivery Application

A modern food delivery web application built with React, React Router, Firebase, and Tailwind CSS.

## Features

- 🍔 Browse menu with categories and search
- 🛒 Add items to cart and place orders
- 👤 User authentication (sign in/sign up)
- ⭐ Reviews and ratings for menu items
- ❤️ Favorites management
- 📦 Order tracking
- 📱 Responsive design
- 🏪 Admin dashboard for managing orders and menu

## Tech Stack

- **Frontend:** React, React Router, Tailwind CSS, Framer Motion
- **Backend:** Firebase (Firestore, Authentication)
- **Icons:** Lucide React

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Firebase account

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory with your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Development

Start the development server:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

## Project Structure

```
app/
├── components/       # React components
│   ├── admin/       # Admin-specific components
│   ├── authentication/  # Auth components
│   ├── common/      # Shared components
│   ├── navigation/   # Navbar, sidebar
│   └── user/        # User-specific components
├── context/         # React Context providers
├── lib/            # Utilities and services
│   └── services/   # Firebase services
└── routes/         # Page routes
    └── admin/      # Admin routes
```

## Building for Production

Create a production build:

```bash
npm run build
```

## License

MIT
