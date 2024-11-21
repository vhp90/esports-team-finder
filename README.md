# Esports Team Finder

A modern web application that connects esports players based on their skills and preferences. The platform features a dark theme and is designed to be scalable for future updates.

## Features

- User Profiles with customizable gaming preferences
- Team matching based on skill levels and game preferences
- Real-time chat functionality
- Modern, responsive dark-themed UI
- Scalable architecture for future enhancements

## Tech Stack

### Frontend
- React.js
- Chakra UI (for theming and components)
- React Router (for navigation)
- Axios (for API calls)

### Backend
- FastAPI (Python)
- MongoDB Atlas (cloud database)
- WebSockets (for real-time chat)

## Project Structure

```
esports-team-finder/
├── backend/
│   ├── main.py
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── Navbar.js
    │   ├── pages/
    │   │   ├── Home.js
    │   │   ├── Profile.js
    │   │   ├── TeamFinder.js
    │   │   └── Chat.js
    │   ├── App.js
    │   └── theme.js
    └── package.json
```

## Setup Instructions

### Backend Setup

1. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. Set up environment variables:
   Create a `.env` file in the backend directory with:
   ```
   MONGODB_URL=your_mongodb_atlas_url
   JWT_SECRET=your_jwt_secret
   JWT_ALGORITHM=HS256
   CORS_ORIGINS=http://localhost:3000
   ```

4. Start the backend server:
   ```bash
   uvicorn main:app --reload
   ```

### Frontend Setup

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

## Deployment

The application can be deployed using Render.com's free tier:

1. Fork this repository to your GitHub account.

2. Create a MongoDB Atlas account and database:
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free cluster
   - Create a database user
   - Get your connection string

3. Deploy on Render.com:
   - Sign up for a [Render](https://render.com) account
   - Connect your GitHub repository
   - Create a new Web Service for the backend:
     - Choose Python environment
     - Set build command: `pip install -r requirements.txt`
     - Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
     - Add environment variables from `.env`

   - Create a new Static Site for the frontend:
     - Set build command: `npm install && npm run build`
     - Set publish directory: `build`
     - Add environment variable: `REACT_APP_API_URL=your_backend_url`

4. Update CORS settings:
   - Add your frontend URL to `CORS_ORIGINS` in backend environment variables

## Development

The application is structured to be modular and maintainable:

- Backend API endpoints are defined in `backend/main.py`
- Frontend components are organized by feature in the `frontend/src/components` directory
- Pages are separated into their own directory for better organization
- Theme configuration is centralized in `theme.js`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License
