# School Management System

A scalable system for managing school students, classes, sections, and fees, with a FastAPI backend, React frontend, and SQLite database.

## Features
- **CRUD Operations**: Manage students, classes, sections, and fee payments (per student).
- **Dashboard**: Displays total students, payments, dues, and student payment status with charts.
- **Scalability**: Supports 10,000+ students with indexed database tables.
- **Data Persistence**: SQLite with archival strategy for 50-year retention.
- **Responsive UI**: Built with React, Tailwind CSS, and Chart.js for visualizations.
- **User-Friendly**: Tabular interface, input validation, and success/error feedback.

## Prerequisites
- **Python 3.11+**: For the backend.
- **Node.js 18+**: For the frontend.
- **Git**: To clone the repository.
- A modern web browser (e.g., Chrome, Firefox).

## Setup Instructions

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
   │   ├── database.py
   │   ├── schemas.py
   │   ├── models.py
   │   ├── services/
   │   │   ├── __init__.py
   │   │   ├── student_service.py
   │   │   ├── class_service.py
   │   │   ├── section_service.py
   │   │   ├── fee_service.py
   │   ├── repositories/
   │   │   ├── __init__.py
   │   │   ├── student_repository.py
   │   │   ├── class_repository.py
   │   │   ├── section_repository.py
   │   │   ├── fee_repository.py
   │   ├── requirements.txt
   │   ├── test_main.py
   ├── frontend/
   │   ├── src/
   │   │   ├── App.jsx
   │   │   ├── main.jsx
   │   │   ├── index.css
   │   ├── index.html
   │   ├── package.json
   │   ├── vite.config.js
   │   ├── tailwind.config.js
   ├── .gitignore
   ├── README.md
   ```

3. **Set Up the Backend**:
   - Navigate to the backend directory:
     ```bash
     cd backend
     ```
   - Create and activate a virtual environment:
     ```bash
     python -m venv venv
     venv\Scripts\activate
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

4. **Set Up the Frontend**:
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

5. **Access the System**:
   - Open `http://localhost:3000` in a browser.
   - Navigate tabs (Dashboard, Students, Classes, Sections, Fees) to manage entities.
   - Sample data is preloaded (2 classes, 2 sections, 1 student, 1 fee payment).
   - API Docs: `http://localhost:8000/docs`.

6. **Running Tests**:
   - Install Pytest:
     ```bash
     cd backend
     pip install pytest
     ```
   - Run tests:
     ```bash
     pytest test_main.py
     ```
   - Manually test the frontend by adding/editing entities and checking the dashboard.

## Troubleshooting

- **Backend Errors**:
  - Ensure Python 3.11+ is installed (`python --version`).
  - Verify dependencies (`pip list`).
  - Check if port 8000 is free (`netstat -a -n -o`).
  - If import errors occur, ensure files are in the correct directories (e.g., `schemas.py` in `backend/`).
- **Frontend Errors**:
  - Ensure Node.js 18+ is installed (`node --version`).
  - Run `npm install` again for module errors.
  - Check if port 3000 is free.
  - If Chart.js fails, verify `chart.js` and `react-chartjs-2` in `node_modules`.
- **Database Issues**: Delete `school.db` and restart the backend to recreate with sample data.
- **CORS Issues**: Backend allows requests from `http://localhost:3000`. Ensure both servers are running.

## API Endpoints
- **Students**: `POST/GET/PUT/DELETE /students/`, `GET /students/{id}`
- **Classes**: `POST/GET/PUT/DELETE /classes/`, `GET /classes/{id}`
- **Sections**: `POST/GET/PUT/DELETE /sections/`, `GET /sections/{id}`
- **Fee Payments**: `POST/GET /fee_payments/`
- **Dashboard**: `GET /dashboard/`

## Notes
- **Database**: SQLite (`backend/school.db`). Switch to PostgreSQL for production.
- **Scalability**: Indexes on key fields support 10,000+ students. Optimize queries for large datasets.
- **Persistence**: Regular backups ensure 50-year data retention.
- **Security**: Add JWT authentication for production.
- **Testing**: Backend tests in `test_main.py`. Extend with frontend tests (e.g., Jest).