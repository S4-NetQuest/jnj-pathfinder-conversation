# Pathfinder Conversation Guide

A web application for J&J sales representatives to conduct alignment philosophy conversations with surgeons in Total Knee Arthroplasty (TKA).

## Features

- **Responsive Design**: Optimized for tablets and phones with rotation support
- **Dual Access**:
  - Sales reps with SAML SSO authentication
  - Unauthenticated access for surgeons
- **Conversation Management**: Create, load, and manage surgeon conversations
- **Scoring System**: Maps responses to 4 knee alignment philosophies
- **Rich Text Notes**: Sales reps can create formatted notes
- **PDF Export**: Download conversation results
- **Searchable Glossary**: Medical terms accessible throughout the app
- **J&J Branding**: Custom Chakra UI theme with J&J color palette

## Technology Stack

### Frontend
- **React 18** with Vite for fast development
- **Chakra UI** for component library and theming
- **React Router** for navigation
- **Axios** for API communication
- **React Quill** for rich text editing
- **jsPDF** for PDF generation

### Backend
- **Node.js LTS** with Express
- **SQL Server** database
- **Passport.js** with SAML strategy for SSO
- **Express Session** for session management
- **Helmet** for security headers
- **Rate limiting** and input validation

## Quick Start

### Prerequisites
- Node.js LTS (18.x or higher)
- SQL Server (2019 or higher)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pathfinder-conversation-guide
   ```

2. **Install dependencies**

   Frontend:
   ```bash
   cd frontend
   npm install
   ```

   Backend:
   ```bash
   cd ../backend
   npm install
   ```

3. **Database Setup**

   - Create a SQL Server database named `JNJ-PATHFINDER-CONVERSATION`
   - Run the schema script:
   ```bash
   sqlcmd -S localhost -d JNJ-PATHFINDER-CONVERSATION -i database/schema.sql
   ```

4. **Environment Configuration**

   Copy and configure environment variables:
   ```bash
   cp .env.example .env
   ```

   Update the `.env` file with your specific configuration:

   ```bash
   # Database Configuration
   DB_SERVER=your-sql-server
   DB_USER=your-username
   DB_PASSWORD=your-password
   DB_NAME=JNJ-PATHFINDER-CONVERSATION

   # SAML SSO Configuration
   SAML_ENTRY_POINT=https://your-idp.com/sso/saml
   SAML_CERT=your-idp-certificate

   # Session Secret
   SESSION_SECRET=your-secure-session-secret
   ```

5. **Start the Application**

   Development mode (run both simultaneously):

   Backend:
   ```bash
   cd backend
   npm run dev
   ```

   Frontend (in a new terminal):
   ```bash
   cd frontend
   npm run dev
   ```

   The application will be available at:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Project Structure

```
pathfinder-conversation-guide/
├── frontend/                    # React frontend application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/             # Page components
│   │   ├── contexts/          # React contexts
│   │   ├── services/          # API services
│   │   ├── theme/             # Chakra UI theme
│   │   ├── data/              # Static data (questions.json)
│   │   └── utils/             # Utility functions
│   ├── public/                # Static assets
│   └── package.json
├── backend/                    # Node.js/Express backend
│   ├── routes/                # API route handlers
│   ├── config/                # Configuration files
│   ├── middleware/            # Custom middleware
│   ├── models/                # Database models
│   └── server.js              # Server entry point
├── database/                   # Database scripts
│   └── schema.sql             # Database schema
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/saml` - Initiate SAML login
- `POST /api/auth/saml/callback` - SAML callback
- `GET /api/auth/status` - Check authentication status
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/surgeon` - Surgeon access (no auth required)

### Conversations
- `GET /api/conversations` - List conversations (sales rep only)
- `POST /api/conversations` - Create new conversation (sales rep only)
- `GET /api/conversations/:id` - Get conversation details
- `PUT /api/conversations/:id` - Update conversation
- `DELETE /api/conversations/:id` - Delete conversation (sales rep only)
- `POST /api/conversations/:id/responses` - Save question responses
- `GET /api/conversations/:id/pdf` - Generate PDF export

### Notes
- `GET /api/conversations/:id/notes` - Get conversation notes
- `POST /api/conversations/:id/notes` - Create/update notes (sales rep only)

### Glossary
- `GET /api/glossary` - Get all glossary terms
- `GET /api/glossary/search?term=:term` - Search glossary terms

## Configuration

### Chakra UI Theme

The application uses a custom Chakra UI theme configured with J&J's brand colors:

- **Primary Red**: #eb1700
- **Secondary Colors**: Blues, greens, oranges from the J&J palette
- **Gray Scale**: 8 shades from light to dark
- **Responsive Breakpoints**: Optimized for mobile and tablet

### Database Schema

Key tables:
- `users` - Sales representative information
- `conversations` - Conversation records
- `conversation_responses` - Individual question responses
- `conversation_notes` - Rich text notes
- `hospitals` - Hospital reference data
- `glossary_terms` - Medical terminology

### SAML SSO Configuration

Configure your identity provider with:
- **ACS URL**: `http://localhost:5000/api/auth/saml/callback`
- **Entity ID**: `pathfinder-app`
- **NameID Format**: Email address
- **Required Attributes**: email, displayName, firstName, lastName

## Development

### Adding New Questions

1. Update `src/data/questions.json` with new question objects
2. Each question must include scoring for all 4 alignment types
3. Question types supported: `binary`, `single_choice`, `multiple_choice`

### Custom Components

The application uses several custom components:
- `ConversationModal` - Create/load conversations
- `QuestionCard` - Individual question display
- `ScoreDisplay` - Alignment scoring visualization
- `GlossaryModal` - Searchable medical glossary
- `NotesEditor` - Rich text note editing

### Styling Guidelines

- Use Chakra UI components and theme colors
- Follow responsive design patterns
- Maintain accessibility standards
- Use J&J brand colors consistently

## Deployment

### Production Build

Frontend:
```bash
cd frontend
npm run build
```

Backend:
```bash
cd backend
npm start
```

### Environment Variables

Ensure all production environment variables are set:
- Database connection strings
- SAML configuration
- Session secrets
- SSL certificates (if applicable)

### Database Migration

Run the schema script on your production database:
```sql
-- Run database/schema.sql on production SQL Server
```

## Security Considerations

- SAML SSO for sales representative authentication
- Session management with secure cookies
- Rate limiting on API endpoints
- Input validation and sanitization
- SQL injection prevention with parameterized queries
- XSS prevention with content security policy

## Support

For technical support or questions about implementation, please contact the development team.

## License

This application is proprietary software developed for Johnson & Johnson.