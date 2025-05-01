import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Typography, TextField, Button, MenuItem, Grid, Snackbar, Alert } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

const StudentManager = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [newStudent, setNewStudent] = useState({
    name: '',
    roll_number: '',
    father_name: '',
    mother_name: '',
    date_of_birth: '',
    contact: '',
    address: '',
    enrollment_date: '',
    tuition_fees: '',
    auto_fees: '',
    day_boarding_fees: '',
    class_id: '',
    section_id: '',
    academic_year_id: ''
  });
  const [editingStudent, setEditingStudent] = useState(null);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
    fetchClasses();
    fetchAcademicYears();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/students/');
      setStudents(response.data);
    } catch (error) {
      setAlert({ open: true, message: 'Error fetching students: ' + error.message, severity: 'error' });
    } finally {
      setLoading(false);
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

  const fetchSections = async (classId) => {
    try {
      setSections([]);
      
      if (!classId) return;

      const response = await axios.get(`http://localhost:8000/sections/?class_id=${classId}`);
      setSections(response.data);
    } catch (error) {
      setAlert({ open: true, message: 'Error fetching sections: ' + error.message, severity: 'error' });
    }
  };

  const fetchAcademicYears = async () => {
    try {
      const response = await axios.get('http://localhost:8000/academic-years/');
      setAcademicYears(response.data);
    } catch (error) {
      setAlert({ open: true, message: 'Error fetching academic years: ' + error.message, severity: 'error' });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'class_id') {
      setNewStudent(prev => ({
        ...prev,
        [name]: value,
        section_id: ''
      }));
      fetchSections(value);
    } else {
      setNewStudent(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleFeeInput = (e) => {
    const { name, value } = e.target;
    if (value === '' || /^\d+$/.test(value)) {
      setNewStudent(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!newStudent.academic_year_id) {
        setAlert({ 
          open: true, 
          message: 'Please select an academic year', 
          severity: 'error' 
        });
        return;
      }

      const studentData = {
        name: newStudent.name.trim(),
        roll_number: newStudent.roll_number.trim(),
        father_name: newStudent.father_name.trim(),
        mother_name: newStudent.mother_name.trim(),
        date_of_birth: newStudent.date_of_birth,
        contact: newStudent.contact.trim(),
        address: newStudent.address.trim(),
        enrollment_date: newStudent.enrollment_date,
        tuition_fees: Number(newStudent.tuition_fees || 0),
        auto_fees: Number(newStudent.auto_fees || 0),
        day_boarding_fees: Number(newStudent.day_boarding_fees || 0),
        class_id: newStudent.class_id,
        section_id: newStudent.section_id,
        academic_year_id: newStudent.academic_year_id
      };

      if (editingStudent) {
        await axios.put(`http://localhost:8000/students/${editingStudent.id}`, studentData);
        setAlert({ open: true, message: 'Student updated successfully!', severity: 'success' });
      } else {
        const response = await axios.post('http://localhost:8000/students/', studentData);
        console.log('Created student:', response.data);
        setAlert({ open: true, message: 'Student added successfully!', severity: 'success' });
      }
      
      setNewStudent({
        name: '',
        roll_number: '',
        father_name: '',
        mother_name: '',
        date_of_birth: '',
        contact: '',
        address: '',
        enrollment_date: '',
        tuition_fees: '',
        auto_fees: '',
        day_boarding_fees: '',
        class_id: '',
        section_id: '',
        academic_year_id: ''
      });
      setEditingStudent(null);
      fetchStudents();
    } catch (error) {
      console.error('Error details:', error.response?.data);
      setAlert({ 
        open: true, 
        message: 'Error: ' + (error.response?.data?.detail || error.message), 
        severity: 'error' 
      });
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setNewStudent({
      ...student,
      date_of_birth: student.date_of_birth?.split('T')[0] || '',
      enrollment_date: student.enrollment_date?.split('T')[0] || '',
      tuition_fees: student.tuition_fees.toString(),
      auto_fees: student.auto_fees.toString(),
      day_boarding_fees: student.day_boarding_fees.toString(),
      class_id: student.class_id.toString(),
      section_id: student.section_id.toString(),
      academic_year_id: student.academic_year_id?.toString() || ''
    });
    if (student.class_id) {
      fetchSections(student.class_id);
    }
  };

  const handleDelete = async (id) => {
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

  const columns = [
    { field: 'name', headerName: 'Name', width: 150 },
    { field: 'roll_number', headerName: 'Roll Number', width: 120 },
    { field: 'father_name', headerName: 'Father Name', width: 150 },
    { field: 'contact', headerName: 'Contact', width: 120 },
    { 
      field: 'class_name', 
      headerName: 'Class', 
      width: 100,
      valueGetter: (params) => {
        const cls = classes.find(c => c.id === params.row.class_id);
        return cls ? cls.name : '';
      }
    },
    { 
      field: 'section_name', 
      headerName: 'Section', 
      width: 100,
      valueGetter: (params) => {
        const section = sections.find(s => s.id === params.row.section_id);
        return section ? section.name : '';
      }
    },
    { 
      field: 'tuition_fees', 
      headerName: 'Tuition Fees', 
      width: 120,
      valueFormatter: ({ value }) => `₹${parseFloat(value).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      renderCell: (params) => (
        <div>
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={() => handleEdit(params.row)}
            sx={{ mr: 1 }}
          >
            Edit
          </Button>
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={() => handleDelete(params.row.id)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        {editingStudent ? 'Edit Student' : 'Add Student'}
      </Typography>

      <form onSubmit={handleSubmit}>
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
              label="Roll Number"
              name="roll_number"
              value={newStudent.roll_number}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Father Name"
              name="father_name"
              value={newStudent.father_name}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Mother Name"
              name="mother_name"
              value={newStudent.mother_name}
              onChange={handleInputChange}
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
              label="Tuition Fees"
              name="tuition_fees"
              value={newStudent.tuition_fees}
              onChange={handleFeeInput}
              type="text"
              inputProps={{
                inputMode: 'numeric',
                pattern: '[0-9]*'
              }}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Auto Fees"
              name="auto_fees"
              value={newStudent.auto_fees}
              onChange={handleFeeInput}
              type="text"
              inputProps={{
                inputMode: 'numeric',
                pattern: '[0-9]*'
              }}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Day Boarding Fees"
              name="day_boarding_fees"
              value={newStudent.day_boarding_fees}
              onChange={handleFeeInput}
              type="text"
              inputProps={{
                inputMode: 'numeric',
                pattern: '[0-9]*'
              }}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Class"
              name="class_id"
              value={newStudent.class_id}
              onChange={handleInputChange}
              required
            >
              {classes.map((cls) => (
                <MenuItem key={cls.id} value={cls.id}>
                  {cls.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Section"
              name="section_id"
              value={newStudent.section_id}
              onChange={handleInputChange}
              required
              disabled={!newStudent.class_id || sections.length === 0}
            >
              {sections.length === 0 ? (
                <MenuItem disabled value="">
                  {newStudent.class_id ? 'Loading sections...' : 'Select a class first'}
                </MenuItem>
              ) : (
                sections.map((section) => (
                  <MenuItem key={section.id} value={section.id}>
                    {section.name}
                  </MenuItem>
                ))
              )}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Academic Year"
              name="academic_year_id"
              value={newStudent.academic_year_id}
              onChange={handleInputChange}
              required
            >
              {academicYears.map((year) => (
                <MenuItem key={year.id} value={year.id}>
                  {year.year}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ mr: 1 }}
            >
              {editingStudent ? 'Update' : 'Add'} Student
            </Button>
            {editingStudent && (
              <Button
                variant="contained"
                color="secondary"
                onClick={() => {
                  setEditingStudent(null);
                  setNewStudent({
                    name: '',
                    roll_number: '',
                    father_name: '',
                    mother_name: '',
                    date_of_birth: '',
                    contact: '',
                    address: '',
                    enrollment_date: '',
                    tuition_fees: '',
                    auto_fees: '',
                    day_boarding_fees: '',
                    class_id: '',
                    section_id: '',
                    academic_year_id: ''
                  });
                }}
              >
                Cancel
              </Button>
            )}
          </Grid>
        </Grid>
      </form>

      <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>Students List</Typography>
      <div style={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={students}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5]}
          disableSelectionOnClick
          loading={loading}
          getRowId={(row) => row.id}
        />
      </div>

      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={() => setAlert({ ...alert, open: false })}
      >
        <Alert
          onClose={() => setAlert({ ...alert, open: false })}
          severity={alert.severity}
          sx={{ width: '100%' }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default StudentManager;