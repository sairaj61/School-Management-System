# School Management System

A scalable system for managing school students, classes, sections, fees, and car rents, with a FastAPI backend, React frontend, and SQLite database.

## Prerequisites

### For Docker Setup
- Docker
- Docker Compose
- Git

### For Local Setup
- **Python 3.11+**: For the backend.
- **Node.js 18+**: For the frontend.
- **Git**: To clone the repository.
- A modern web browser (e.g., Chrome, Firefox).

## Setup Instructions

### Option 1: Running with Docker
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/xAI-School-Management-System/school-management-system.git
   cd school-management-system
   ```

2. **Directory Structure**:
   ```
   school-management-system/
   ├── backend/
   │   ├── main.py
   │   ├── requirements.txt
   │   ├── Dockerfile
   ├── frontend/
   │   ├── src/
   │   │   ├── App.jsx
   │   │   ├── main.jsx
   │   │   ├── index.css
   │   ├── index.html
   │   ├── package.json
   │   ├── vite.config.js
   │   ├── tailwind.config.js
   │   ├── Dockerfile
   ├── docker-compose.yml
   ├── README.md
   ```

3. **Run the Application**:
   ```bash
   docker-compose up --build
   ```
   - Backend: `http://localhost:8000`
   - Frontend: `http://localhost:3000`
   - API Docs: `http://localhost:8000/docs`

4. **Access the System**:
   - Open `http://localhost:3000` in a browser.
   - Use the UI to add students and view the dashboard.
   - Sample data is preloaded (1 class, 1 section, 1 fee structure).

### Option 2: Running Locally (Without Docker)
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/xAI-School-Management-System/school-management-system.git
   cd school-management-system
   ```

2. **Set Up the Backend**:
   - Navigate to the backend directory:
     ```bash
     cd backend
     ```
   - Create a virtual environment and activate it:
     ```bash
     python -m venv venv
     # On Windows:
     venv\Scripts\activate
     # On macOS/Linux:
     source venv/bin/activate
     ```
   - Install dependencies:
     ```bash
     pip install -r requirements.txt
     ```
   - Run the FastAPI server:
     ```bash
     uvicorn main:app --host 0.0.0.0 --port 8000
     ```
   - The backend will be available at `http://localhost:8000`.

3. **Set Up the Frontend**:
   - Open a new terminal and navigate to the frontend directory:
     ```bash
     cd frontend
     ```
   - Install dependencies:
     ```bash
     npm install
     ```
   - Address any vulnerabilities:
     ```bash
     npm audit fix
     ```
   - Run the React development server:
     ```bash
     npm start
     ```
   - The frontend will be available at `http://localhost:3000`.

4. **Access the System**:
   - Open `http://localhost:3000` in a browser.
   - The frontend communicates with the backend at `http://localhost:8000`.
   - Use the UI to add students and view the dashboard.
   - API Docs: `http://localhost:8000/docs`.

5. **Database**:
   - The SQLite database (`school.db`) is created automatically in the `backend/` directory when the backend starts.
   - Sample data (1 class, 1 section, 1 fee structure) is preloaded on first run.

## Troubleshooting

### General Issues
- **Backend Errors**:
  - Ensure Python 3.11+ is installed (`python --version`).
  - Verify all dependencies are installed (`pip list`).
  - Check if port 8000 is free (`netstat -a -n -o` on Windows).
- **Frontend Errors**:
  - Ensure Node.js 18+ is installed (`node --version`).
  - Run `npm install` again if you encounter module errors.
  - Check if port 3000 is free.
- **CORS Issues**: The backend includes CORS middleware to allow requests from `http://localhost:3000`. Ensure both servers are running.
- **Database Issues**: If `school.db` is corrupted, delete it and restart the backend to recreate it with sample data.

### Specific Error: `NameError: name 'Depends' is not defined`
- **Cause**: Missing import of `Depends` from `fastapi` in `backend/main.py`.
- **Solution**:
  - Ensure `main.py` includes the line:
    ```python
    from fastapi import FastAPI, HTTPException, Depends
    ```
  - Reinstall dependencies:
    ```bash
    pip install -r requirements.txt
    ```
  - Recreate the virtual environment if needed:
    ```bash
    cd backend
    rmdir venv /s /q  # On Windows
    python -m venv venv
    venv\Scripts\activate
    pip install -r requirements.txt
    ```

### Specific Error: Vite Entry Point Issue
- **Error Message**: `Could not auto-determine entry point from rollupOptions or html files...`
- **Cause**: Missing `index.html` or incorrect Vite configuration.
- **Solution**:
  - Ensure `frontend/index.html` exists and references `src/main.jsx`.
  - Verify `vite.config.js` is present and configured:
    ```javascript
    import { defineConfig } from 'vite';
    import react from '@vitejs/plugin-react';
    export default defineConfig({
      plugins: [react()],
      server: { port: 3000, open: true },
    });
    ```
  - Check that `src/main.jsx` renders the `App` component.
  - Reinstall frontend dependencies:
    ```bash
    cd frontend
    npm install
    npm audit fix
    ```

### NPM Vulnerabilities
- **Issue**: `npm install` reports vulnerabilities.
- **Solution**:
  - Run:
    ```bash
    npm audit fix
    ```
  - Avoid `npm audit fix --force` unless necessary, as it may introduce breaking changes.
  - If vulnerabilities persist, update dependencies manually in `package.json` and rerun `npm install`.

### Other Common Issues
- **Windows Path Issues**: Use backslashes (`\`) in paths (e.g., `venv\Scripts\activate`).
- **Frontend Port Mismatch**: If the frontend runs on `5173` instead of `3000`, ensure `vite.config.js` sets `server.port` to `3000`.
- **Backend Not Reachable**: Start the backend before the frontend. Check browser console for CORS or network errors.

## API Endpoints
- **Students**:
  - `POST /students/`: Create a student.
  - `GET /students/`: List students.
  - `GET /students/{id}`: Get student details.
  - `PUT /students/{id}`: Update student.
  - `DELETE /students/{id}`: Delete student.
- **Fee Payments**:
  - `POST /fee_payments/`: Record a payment.
- **Dashboard**:
  - `GET /dashboard/`: Get dashboard metrics.

## Notes
- **Database**: SQLite is used for simplicity and persists in `backend/school.db`. For production with 10,000+ students, consider switching to PostgreSQL.
- **Scalability**: The system supports 10,000+ students with indexing on key fields. Optimize queries for large datasets.
- **Extensibility**: Add CRUD endpoints for classes, sections, and fees in `backend/main.py`. Enhance the frontend with additional forms and charts.
- **Security**: Add JWT authentication for production use.
- **Persistence**: SQLite ensures 50 years of data retention with proper backups.