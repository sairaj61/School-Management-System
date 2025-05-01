import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Typography, TextField, Button, MenuItem, Grid, Snackbar, Alert } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

const StudentManager = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [newStudent, setNewStudent] = useState({
    name: '', date_of_birth: '', contact: '', address: '', enrollment_date: '', class_id: '', section_id: ''
  });
  const [editingStudent, setEditingStudent] = useState(null);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchStudents();
    fetchClasses();
    fetchSections();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await axios.get('http://localhost:8000/students/');
      setStudents(response.data);
    } catch (error) {
      setAlert({ open: true, message: 'Error fetching students: ' + error.message, severity: 'error' });
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await axios.get('http://localhost:8000/classes/');
      setClasses(response.data);
    } catch (error) {
      setAlert({ open: true, message: 'Error fetching classes: ' + error.message, severity: 'error' });
    }
  };

  const fetchSections = async () => {
    try {
      const response = await axios.get('http://localhost:8000/sections/');
      setSections(response.data);
    } catch (error) {
      setAlert({ open: true, message: 'Error fetching sections: ' + error.message, severity: 'error' });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewStudent(prev => ({ ...prev, [name]: value }));
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/students/', newStudent);
      setAlert({ open: true, message: 'Student added successfully!', severity: 'success' });
      fetchStudents();
      setNewStudent({ name: '', date_of_birth: '', contact: '', address: '', enrollment_date: '', class_id: '', section_id: '' });
    } catch (error) {
      setAlert({ open: true, message: 'Error adding student: ' + error.message, severity: 'error' });
    }
  };

  const handleEditStudent = (student) => {
    setEditingStudent(student);
    setNewStudent(student);
  };

  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:8000/students/${editingStudent.id}`, newStudent);
      setAlert({ open: true, message: 'Student updated successfully!', severity: 'success' });
      fetchStudents();
      setEditingStudent(null);
      setNewStudent({ name: '', date_of_birth: '', contact: '', address: '', enrollment_date: '', class_id: '', section_id: '' });
    } catch (error) {
      setAlert({ open: true, message: 'Error updating student: ' + error.message, severity: 'error' });
    }
  };

  const handleDeleteStudent = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await axios.delete(`http://localhost:8000/students/${id}`);
        setAlert({ open: true, message: 'Student deleted successfully!', severity: 'success' });
        fetchStudents();
      } catch (error) {
        setAlert({ open: true, message: 'Error deleting student: ' + error.message, severity: 'error' });
      }
    }
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'name', headerName: 'Name', width: 150 },
    { field: 'contact', headerName: 'Contact', width: 150 },
    { field: 'class_name', headerName: 'Class', width: 120, valueGetter: ({ row }) => classes.find(c => c.id === row.class_id)?.name || '' },
    { field: 'section_name', headerName: 'Section', width: 120, valueGetter: ({ row }) => sections.find(s => s.id === row.section_id)?.name || '' },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      renderCell: ({ row }) => (
        <>
          <Button variant="contained" color="primary" size="small" onClick={() => handleEditStudent(row)} sx={{ mr: 1 }}>
            Edit
          </Button>
          <Button variant="contained" color="error" size="small" onClick={() => handleDeleteStudent(row.id)}>
            Delete
          </Button>
        </>
      ),
    },
  ];

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>{editingStudent ? 'Edit Student' : 'Add Student'}</Typography>
      <form onSubmit={editingStudent ? handleUpdateStudent : handleAddStudent}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={newStudent.name}
              onChange={handleInputChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Date of Birth"
              name="date_of_birth"
              type="date"
              value={newStudent.date_of_birth}
              onChange={handleInputChange}
              InputLabelProps={{ shrink: true }}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Contact"
              name="contact"
              value={newStudent.contact}
              onChange={handleInputChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Address"
              name="address"
              value={newStudent.address}
              onChange={handleInputChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Enrollment Date"
              name="enrollment_date"
              type="date"
              value={newStudent.enrollment_date}
              onChange={handleInputChange}
              InputLabelProps={{ shrink: true }}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              select
              label="Class"
              name="class_id"
              value={newStudent.class_id}
              onChange={handleInputChange}
              required
            >
              {classes.map(cls => (
                <MenuItem key={cls.id} value={cls.id}>{cls.name}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              select
              label="Section"
              name="section_id"
              value={newStudent.section_id}
              onChange={handleInputChange}
              required
            >
              {sections.map(sec => (
                <MenuItem key={sec.id} value={sec.id}>{sec.name}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary" sx={{ mr: 1 }}>
              {editingStudent ? 'Update Student' : 'Add Student'}
            </Button>
            {editingStudent && (
              <Button
                variant="outlined"
                onClick={() => {
                  setEditingStudent(null);
                  setNewStudent({ name: '', date_of_birth: '', contact: '', address: '', enrollment_date: '', class_id: '', section_id: '' });
                }}
              >
                Cancel
              </Button>
            )}
          </Grid>
        </Grid>
      </form>
      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>Students</Typography>
      <div style={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={students}
          columns={columns}
          pageSizeOptions={[5]}
          disableRowSelectionOnClick
        />
      </div>
      <Snackbar open={alert.open} autoHideDuration={3000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} severity={alert.severity} sx={{ width: '100%' }}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default StudentManager;