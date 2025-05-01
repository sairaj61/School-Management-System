import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container, Typography, TextField, Button, MenuItem, Grid, Snackbar, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { handleApiError } from '../utils/errorHandler';

const StudentManager = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [formData, setFormData] = useState({
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
      handleApiError(error, setAlert);
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await axios.get('http://localhost:8000/classes/');
      setClasses(response.data);
    } catch (error) {
      handleApiError(error, setAlert);
    }
  };

  const fetchSections = async (classId) => {
    try {
      setSections([]);
      if (!classId) return;
      const response = await axios.get(`http://localhost:8000/sections/?class_id=${classId}`);
      setSections(response.data);
    } catch (error) {
      handleApiError(error, setAlert);
    }
  };

  const fetchAcademicYears = async () => {
    try {
      const response = await axios.get('http://localhost:8000/academic-years/');
      setAcademicYears(response.data);
    } catch (error) {
      handleApiError(error, setAlert);
    }
  };

  const handleModalOpen = (student = null) => {
    if (student) {
      setSelectedStudent(student);
      setFormData({
        name: student.name,
        roll_number: student.roll_number,
        father_name: student.father_name,
        mother_name: student.mother_name,
        date_of_birth: student.date_of_birth?.split('T')[0] || '',
        contact: student.contact,
        address: student.address,
        enrollment_date: student.enrollment_date?.split('T')[0] || '',
        tuition_fees: student.tuition_fees.toString(),
        auto_fees: student.auto_fees.toString(),
        day_boarding_fees: student.day_boarding_fees.toString(),
        class_id: student.class_id,
        section_id: student.section_id,
        academic_year_id: student.academic_year_id
      });
      if (student.class_id) {
        fetchSections(student.class_id);
      }
    } else {
      setSelectedStudent(null);
      setFormData({
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
    }
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedStudent(null);
    setFormData({
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
    setSections([]);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'class_id') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        section_id: ''
      }));
      fetchSections(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const studentData = {
        name: formData.name.trim(),
        roll_number: formData.roll_number.trim(),
        father_name: formData.father_name.trim(),
        mother_name: formData.mother_name.trim(),
        date_of_birth: formData.date_of_birth,
        contact: formData.contact.trim(),
        address: formData.address.trim(),
        enrollment_date: formData.enrollment_date,
        tuition_fees: parseInt(formData.tuition_fees) || 0,
        auto_fees: parseInt(formData.auto_fees) || 0,
        day_boarding_fees: parseInt(formData.day_boarding_fees) || 0,
        class_id: formData.class_id,
        section_id: formData.section_id,
        academic_year_id: formData.academic_year_id
      };

      if (selectedStudent) {
        await axios.put(`http://localhost:8000/students/${selectedStudent.id}`, studentData);
        setAlert({ open: true, message: 'Student updated successfully!', severity: 'success' });
      } else {
        await axios.post('http://localhost:8000/students/', studentData);
        setAlert({ open: true, message: 'Student added successfully!', severity: 'success' });
      }

      handleModalClose();
      fetchStudents();
    } catch (error) {
      handleApiError(error, setAlert);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await axios.delete(`http://localhost:8000/students/${id}`);
        setAlert({ open: true, message: 'Student deleted successfully!', severity: 'success' });
        fetchStudents();
      } catch (error) {
        handleApiError(error, setAlert);
      }
    }
  };

  const filteredStudents = students.filter(student => {
    const searchString = (
      student.name +
      student.roll_number +
      student.father_name +
      (classes.find(c => c.id === student.class_id)?.name || '')
    ).toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

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
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      renderCell: (params) => (
        <div>
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={() => handleModalOpen(params.row)}
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
      <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Grid item xs>
          <Typography variant="h4">Students</Typography>
        </Grid>
        <Grid item>
          <TextField
            size="small"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            onClick={() => handleModalOpen()}
          >
            Add Student
          </Button>
        </Grid>
      </Grid>

      <div style={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={filteredStudents}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5]}
          disableSelectionOnClick
          loading={loading}
          getRowId={(row) => row.id}
        />
      </div>

      <Dialog open={modalOpen} onClose={handleModalClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedStudent ? 'Edit Student' : 'Add Student'}
          <Button
            onClick={handleModalClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            Close
          </Button>
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Roll Number"
                  name="roll_number"
                  value={formData.roll_number}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Father's Name"
                  name="father_name"
                  value={formData.father_name}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Mother's Name"
                  name="mother_name"
                  value={formData.mother_name}
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
                  value={formData.date_of_birth}
                  onChange={handleInputChange}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Contact"
                  name="contact"
                  value={formData.contact}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  multiline
                  rows={2}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Enrollment Date"
                  name="enrollment_date"
                  type="date"
                  value={formData.enrollment_date}
                  onChange={handleInputChange}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Academic Year"
                  name="academic_year_id"
                  value={formData.academic_year_id}
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
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Class"
                  name="class_id"
                  value={formData.class_id}
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
                  value={formData.section_id}
                  onChange={handleInputChange}
                  required
                  disabled={!formData.class_id || sections.length === 0}
                >
                  {sections.length === 0 ? (
                    <MenuItem disabled value="">
                      {formData.class_id ? 'Loading sections...' : 'Select a class first'}
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
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Tuition Fees"
                  name="tuition_fees"
                  type="number"
                  value={formData.tuition_fees}
                  onChange={handleInputChange}
                  required
                  inputProps={{ min: 0 }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Auto Fees"
                  name="auto_fees"
                  type="number"
                  value={formData.auto_fees}
                  onChange={handleInputChange}
                  required
                  inputProps={{ min: 0 }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Day Boarding Fees"
                  name="day_boarding_fees"
                  type="number"
                  value={formData.day_boarding_fees}
                  onChange={handleInputChange}
                  required
                  inputProps={{ min: 0 }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleModalClose}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {selectedStudent ? 'Update' : 'Add'} Student
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={() => setAlert({ ...alert, open: false })}
      >
        <Alert
          onClose={() => setAlert({ ...alert, open: false })}
          severity={alert.severity}
          sx={{ width: '100%', whiteSpace: 'pre-line' }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default StudentManager;