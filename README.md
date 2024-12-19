# SuperPro WebApp

A secure, modular web application for processing Excel files and generating charts using React, Flask, and Supabase.

## Features

- User authentication using Supabase
- Excel file upload and processing
- Chart generation from Excel data
- Secure file storage
- Responsive UI using Material-UI
- Protected routes and API endpoints

## Technology Stack

### Frontend
- React with TypeScript
- Material-UI for components
- React Router for navigation
- Axios for API requests
- Supabase client for authentication
- Vite for development and building

### Backend
- Flask (Python)
- Flask-CORS for cross-origin requests
- Pandas for Excel processing
- Matplotlib for chart generation
- Supabase for authentication and storage

### Shared
- TypeScript configuration
- Supabase configuration and database schema

## Project Structure

```
superpro_webapp_v2/
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── contexts/      # Context providers
│   │   └── App.tsx        # Main application component
│   ├── .env               # Frontend environment variables
│   └── package.json       # Frontend dependencies
├── backend/               # Flask backend application
│   ├── app.py            # Main Flask application
│   ├── .env              # Backend environment variables
│   └── venv/             # Python virtual environment
├── shared/               # Shared configuration and types
│   ├── supabase.config.ts # Supabase configuration
│   └── tsconfig.json     # TypeScript configuration
└── README.md             # Project documentation
```

## Setup Instructions

### Prerequisites
- Node.js and npm
- Python 3.8 or higher
- Supabase account

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_API_URL=http://localhost:5000
   ```
   Note: The environment variables must be prefixed with `VITE_` as this is a Vite-based application.

4. Start the development server:
   ```bash
   npm run dev
   ```
   The frontend will be available at http://localhost:5173

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   ```bash
   # Windows
   python -m venv venv
   .\venv\Scripts\activate

   # Unix/macOS
   python -m venv venv
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file with your configuration:
   ```
   FLASK_APP=app.py
   FLASK_ENV=development
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_service_role_key
   UPLOAD_FOLDER=uploads
   CHARTS_FOLDER=charts
   ```

5. Start the Flask server:
   ```bash
   # Windows PowerShell
   $env:FLASK_APP = "app.py"
   $env:FLASK_ENV = "development"
   python -m flask run

   # Windows CMD
   set FLASK_APP=app.py
   set FLASK_ENV=development
   python -m flask run

   # Unix/macOS
   export FLASK_APP=app.py
   export FLASK_ENV=development
   flask run
   ```
   The backend will be available at http://localhost:5000

### Supabase Setup

1. Create a new Supabase project

2. Enable the following features:
   - Authentication
   - Database
   - Storage

3. Create the necessary tables using the SQL in `shared/supabase.config.ts`

4. Set up storage buckets for:
   - Excel file uploads
   - Generated charts

## Usage

1. Register a new account or log in with existing credentials

2. Navigate to the dashboard

3. Upload Excel files for processing:
   - Files must be in .xls or .xlsx format
   - Multiple files can be uploaded for comparison

4. View generated charts:
   - Comparative charts for different cost categories
   - Stacked bar charts for unit production costs

## Security Considerations

- All routes and API endpoints are protected
- File uploads are validated and sanitized
- Supabase Row Level Security (RLS) is implemented
- Environment variables are used for sensitive data
- CORS is configured for security

## Development

### Adding New Features

1. Create new components in the appropriate directory
2. Update the routing configuration if needed
3. Add new API endpoints in the Flask backend
4. Update the documentation

### Testing

1. Frontend:
   ```bash
   cd frontend
   npm test
   ```

2. Backend:
   ```bash
   cd backend
   python -m pytest
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.