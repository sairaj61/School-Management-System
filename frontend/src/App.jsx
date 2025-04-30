import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './index.css';

const App = () => {
  const [students, setStudents] = useState([]);
  const [newStudent, setNewStudent] = useState({
    name: '',
    date_of_birth: '',
    contact: '',
    address: '',
    enrollment_date: '',
    class_id: 1,
    section_id: 1,
  });
  const [dashboard, setDashboard] = useState({});

  useEffect(() => {
    fetchStudents();
    fetchDashboard();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await axios.get('http://localhost:8000/students/');
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchDashboard = async () => {
    try {
      const response = await axios.get('http://localhost:8000/dashboard/');
      setDashboard(response.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewStudent({ ...newStudent, [name]: value });
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/students/', newStudent);
      fetchStudents();
      setNewStudent({
        name: '',
        date_of_birth: '',
        contact: '',
        address: '',
        enrollment_date: '',
        class_id: 1,
        section_id: 1,
      });
    } catch (error) {
      console.error('Error adding student:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">School Management System</h1>

      {/* Dashboard */}
      <div className="mb-8 p-4 bg-gray-100 rounded">
        <h2 className="text-2xl font-semibold mb-2">Dashboard</h2>
        <p>Total Students: {dashboard.total_students || 0}</p>
        <p>Total Payments: ${dashboard.total_payments || 0}</p>
        <p>Total Dues: ${dashboard.total_dues || 0}</p>
        <h3 className="mt-4">Monthly Breakdown</h3>
        <ul>
          {dashboard.monthly_breakdown?.map((item, index) => (
            <li key={index}>
              {item.month}: Payments ${item.payments}, Dues ${item.dues}
            </li>
          ))}
        </ul>
      </div>

      {/* Add Student Form */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Add Student</h2>
        <form onSubmit={handleAddStudent} className="grid grid-cols-1 gap-4">
          <input
            type="text"
            name="name"
            value={newStudent.name}
            onChange={handleInputChange}
            placeholder="Name"
            className="p-2 border rounded"
            required
          />
          <input
            type="date"
            name="date_of_birth"
            value={newStudent.date_of_birth}
            onChange={handleInputChange}
            className="p-2 border rounded"
            required
          />
          <input
            type="text"
            name="contact"
            value={newStudent.contact}
            onChange={handleInputChange}
            placeholder="Contact"
            className="p-2 border rounded"
            required
          />
          <input
            type="text"
            name="address"
            value={newStudent.address}
            onChange={handleInputChange}
            placeholder="Address"
            className="p-2 border rounded"
            required
          />
          <input
            type="date"
            name="enrollment_date"
            value={newStudent.enrollment_date}
            onChange={handleInputChange}
            className="p-2 border rounded"
            required
          />
          <button type="submit" className="p-2 bg-blue-500 text-white rounded">
            Add Student
          </button>
        </form>
      </div>

      {/* Student List */}
      <div>
        <h2 className="text-2xl font-semibold mb-2">Students</h2>
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2">ID</th>
              <th className="p-2">Name</th>
              <th className="p-2">Contact</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id} className="border-t">
                <td className="p-2">{student.id}</td>
                <td className="p-2">{student.name}</td>
                <td className="p-2">{student.contact}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default App;