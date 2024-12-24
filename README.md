# SuperPro WebApp

A secure, modular web application for processing Excel files and generating comparative charts using React, Flask, and Supabase.

## Features

- User authentication using Supabase
- Excel file upload and processing (supports both .xls and .xlsx formats)
- Multiple file upload support for process comparison
- Interactive file management (remove individual files, clear all)
- Comparative chart generation:
  - Operating Costs comparison
  - Material Costs comparison
  - Consumable Costs comparison
  - Utility Costs comparison
  - Stacked bar charts for unit production costs
- Secure file storage using Supabase Storage
- Public URLs for generated charts
- Automatic JSON conversion and storage of Excel data
# SuperPro WebApp

A secure, modular web application for processing Excel files and generating comparative charts using React, Flask, and Supabase.

## Features

- User authentication using Supabase
- Excel file upload and processing (supports both .xls and .xlsx formats)
- Multiple file upload support for process comparison
- Interactive file management (remove individual files, clear all)
- Comparative chart generation:
  - Operating Costs comparison
  - Material Costs comparison
  - Consumable Costs comparison
  - Utility Costs comparison
  - Stacked bar charts for unit production costs
- Responsive UI using Material-UI
- Protected routes and API endpoints
- Simple layout with chart display
- Static file serving for generated charts

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
- Openpyxl and xlrd for Excel file handling
- Matplotlib for chart generation
- Supabase for authentication and file storage
- BytesIO for in-memory file processing

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
│   ├── app.py            # Main Flask application with Supabase integration
│   ├── excel_reader_for_llm.py  # Excel file processor
│   ├── chart_generation_multiple.py  # Chart generation for multiple files
│   └── .env              # Backend environment variables
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
   SUPABASE_SERVICE_KEY=your_supabase_service_role_key
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

4. Set up storage buckets:
   - Create 'excel-uploads' bucket for Excel files and JSON data
   - Create 'charts' bucket for generated chart images
   - Configure public access for the buckets to serve files via URLs

5. Configure storage policies:
   - Enable public read access for generated charts
   - Secure write access to authenticated users only

## Usage

1. Register a new account or log in with existing credentials

2. Navigate to the dashboard

3. Upload Excel files for processing:
   - Supports both .xls and .xlsx formats
   - Uses openpyxl as primary engine with xlrd fallback for legacy .xls files
   - Upload multiple files simultaneously for comparison
   - Files are securely stored in Supabase Storage
   - Automatic JSON conversion and storage of Excel data
   - Manage uploaded files with individual removal or clear all option
   - View file sizes and names in the interactive file list

4. View generated charts:
   - Comparative charts for different cost categories:
     - Operating Costs comparison
     - Material Costs comparison
     - Consumable Costs comparison
     - Utility Costs comparison
   - Stacked bar charts for unit production costs
   - Charts are stored and served via Supabase Storage
   - Access charts through public URLs
   - Responsive layout with grid display

## Excel File Support

The application uses a robust Excel file handling system:
- Primary support for .xlsx files using openpyxl
- Legacy support for .xls files using both openpyxl and xlrd
- Automatic format detection and appropriate engine selection
- Error handling with detailed logging for troubleshooting

## Security Considerations

- All routes and API endpoints are protected
- File uploads are validated and sanitized
- Supabase Row Level Security (RLS) is implemented
- Environment variables are used for sensitive data
- CORS is configured for security
- Supabase Storage policies control file access
- Secure file handling with in-memory processing

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
