# IroHub CRM Frontend

A modern, responsive Customer Relationship Management (CRM) system built with React and Vite. This application provides comprehensive tools for managing leads, customers, staff, tasks, and payments with role-based access control.

## Features

### Core Functionality
- **User Authentication & Authorization** - Secure login with JWT tokens and role-based access
- **Dashboard Analytics** - Interactive charts and metrics for business insights
- **Lead Management** - Track and convert leads through the sales pipeline
- **Customer Management** - Comprehensive customer database and interaction history
- **Staff Management** - User roles (Admin, Sub-admin, Agent) with appropriate permissions
- **Task Management** - Assign and track tasks across different user levels
- **Follow-up System** - Automated and manual follow-up scheduling
- **Payment Processing** - Payment tracking and reporting system
- **Reports & Analytics** - Detailed reporting with data visualization

### User Roles
- **Admin** - Full system access and management capabilities
- **Sub-admin** - Limited administrative functions and team management
- **Agent** - Customer interaction and task execution

## Tech Stack

### Frontend Framework
- **React 19** - Latest React with modern features
- **Vite 6** - Fast build tool and development server
- **React Router DOM 7** - Client-side routing

### State Management
- **Redux Toolkit** - Predictable state container
- **React Redux** - React bindings for Redux
- **TanStack Query** - Server state management and caching

### UI & Styling
- **Tailwind CSS 4** - Utility-first CSS framework
- **DaisyUI** - Tailwind CSS component library
- **Framer Motion** - Animation library
- **Heroicons & Lucide React** - Icon libraries
- **FontAwesome** - Additional icon set

### Data Visualization
- **Chart.js** - Flexible charting library
- **React Chart.js 2** - React wrapper for Chart.js
- **Recharts** - Composable charting library

### Form Handling & Validation
- **Formik** - Build forms without tears
- **Yup** - Schema validation

### Utilities
- **Axios** - HTTP client for API requests
- **JWT Decode** - JWT token decoding
- **Date-fns & Moment** - Date manipulation libraries
- **SweetAlert2** - Beautiful alert dialogs

## Project Structure

```
src/
├── assets/          # Static assets (images, icons, etc.)
├── components/      # Reusable UI components
├── pages/          # Page components and route handlers
├── redux/          # Redux store, slices, and actions
├── services/       # API services and HTTP requests
├── utils/          # Utility functions and helpers
├── App.jsx         # Main application component
├── main.jsx        # Application entry point
└── index.css       # Global styles
```

## Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Irohub_frontend-main
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will open automatically in your default browser at `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server with auto-open browser
- `npm run build` - Build the application for production
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint for code quality checks

## Routes & Navigation

### Public Routes
- `/` - Authentication/Login page

### Protected Routes
- `/admindashboard` - Admin dashboard with analytics
- `/subadminhome` - Sub-admin dashboard
- `/agents` - Agent management (Admin view)
- `/staffs` - Staff management (Sub-admin view)
- `/leads` - Lead management system
- `/customers` - Customer database
- `/tasks` - Task management (Admin level)
- `/subadmintasks` - Task management (Sub-admin level)
- `/agenttasks` - Task management (Agent level)
- `/followups` - Follow-up management
- `/payments` - Payment reports and management
- `/settings` - Application settings

### Payment Routes
- `/payment-details/:productId` - Detailed payment information
- `/addPayment` - Add new payment
- `/productPaymentDetails` - Product-specific payment details
- `/paymentReports` - Payment reporting dashboard

## Development Guidelines

### Code Style
- ESLint configuration included for consistent code quality
- React Hooks rules enforced
- Modern JavaScript (ES6+) features utilized

### State Management
- Redux Toolkit for global state management
- TanStack Query for server state and caching
- Local component state for UI-specific data

### Styling Approach
- Tailwind CSS utility classes for rapid development
- DaisyUI components for consistent design system
- Custom scrollbar styling with tailwind-scrollbar plugins

## Build & Deployment

### Production Build
```bash
npm run build
```

### Deployment
The project includes a `vercel.json` configuration file for easy deployment to Vercel. The build artifacts will be generated in the `dist/` directory.

## Browser Support
- Modern browsers with ES6+ support
- Chrome, Firefox, Safari, Edge (latest versions)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and proprietary. All rights reserved.
