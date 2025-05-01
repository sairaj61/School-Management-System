import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Snackbar,
  Alert
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { handleApiError } from '../utils/errorHandler';

const ClassManager = () => {
  const [classes, setClasses] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [newClass, setNewClass] = useState({
    name: '',
    academic_year_id: ''
  });
  const [editingClass, setEditingClass] = useState(null);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClasses();
    fetchAcademicYears();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/classes/');
      setClasses(response.data);
    } catch (error) {
      handleApiError(error, setAlert);
    } finally {
      setLoading(false);
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`Input change - ${name}:`, value);
    setNewClass(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!newClass.academic_year_id) {
        setAlert({
          open: true,
          message: 'Please select an academic year',
          severity: 'error'
        });
        return;
      }

      const classData = {
        name: newClass.name.trim(),
        academic_year_id: newClass.academic_year_id
      };

      console.log('Submitting class data:', classData);

      if (editingClass) {
        console.log('Updating class with ID:', editingClass.id);
        await axios.put(`http://localhost:8000/classes/${editingClass.id}`, classData);
        setAlert({ open: true, message: 'Class updated successfully!', severity: 'success' });
      } else {
        await axios.post('http://localhost:8000/classes/', classData);
        setAlert({ open: true, message: 'Class added successfully!', severity: 'success' });
      }

      setNewClass({ name: '', academic_year_id: '' });
      setEditingClass(null);
      fetchClasses();
    } catch (error) {
      console.error('Error data:', error.response?.data);
      handleApiError(error, setAlert);
    }
  };

  const handleEdit = (classItem) => {
    setEditingClass(classItem);
    setNewClass({
      name: classItem.name,
      academic_year_id: classItem.academic_year_id
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      try {
        await axios.delete(`http://localhost:8000/classes/${id}`);
        setAlert({ open: true, message: 'Class deleted successfully!', severity: 'success' });
        fetchClasses();
      } catch (error) {
        handleApiError(error, setAlert);
      }
    }
  };

  const columns = [
    { field: 'name', headerName: 'Name', width: 150 },
    {
      field: 'academic_year',
      headerName: 'Academic Year',
      width: 150,
      valueGetter: (params) => {
        const year = academicYears.find(y => y.id === params.row.academic_year_id);
        return year ? year.year : '';
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
        {editingClass ? 'Edit Class' : 'Add Class'}
      </Typography>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Class Name"
              name="name"
              value={newClass.name}
              onChange={handleInputChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Academic Year"
              name="academic_year_id"
              value={newClass.academic_year_id || ''}
              onChange={handleInputChange}
              required
            >
              <MenuItem value="">
                <em>Select an academic year</em>
              </MenuItem>
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
              {editingClass ? 'Update' : 'Add'} Class
            </Button>
            {editingClass && (
              <Button
                variant="contained"
                color="secondary"
                onClick={() => {
                  setEditingClass(null);
                  setNewClass({ name: '', academic_year_id: '' });
                }}
              >
                Cancel
              </Button>
            )}
          </Grid>
        </Grid>
      </form>

      <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>Classes List</Typography>
      <div style={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={classes}
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
          sx={{ width: '100%', whiteSpace: 'pre-line' }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ClassManager;