import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Typography, TextField, Button, Grid, Snackbar, Alert } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

const ClassManager = () => {
  const [classes, setClasses] = useState([]);
  const [newClass, setNewClass] = useState({ name: '', academic_year: '' });
  const [editingClass, setEditingClass] = useState(null);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await axios.get('http://localhost:8000/classes/');
      setClasses(response.data);
    } catch (error) {
      setAlert({ open: true, message: 'Error fetching classes: ' + error.message, severity: 'error' });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewClass(prev => ({ ...prev, [name]: value }));
  };

  const handleAddClass = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/classes/', newClass);
      setAlert({ open: true, message: 'Class added successfully!', severity: 'success' });
      fetchClasses();
      setNewClass({ name: '', academic_year: '' });
    } catch (error) {
      setAlert({ open: true, message: 'Error adding class: ' + error.message, severity: 'error' });
    }
  };

  const handleEditClass = (cls) => {
    setEditingClass(cls);
    setNewClass(cls);
  };

  const handleUpdateClass = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:8000/classes/${editingClass.id}`, newClass);
      setAlert({ open: true, message: 'Class updated successfully!', severity: 'success' });
      fetchClasses();
      setEditingClass(null);
      setNewClass({ name: '', academic_year: '' });
    } catch (error) {
      setAlert({ open: true, message: 'Error updating class: ' + error.message, severity: 'error' });
    }
  };

  const handleDeleteClass = async (id) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      try {
        await axios.delete(`http://localhost:8000/classes/${id}`);
        setAlert({ open: true, message: 'Class deleted successfully!', severity: 'success' });
        fetchClasses();
      } catch (error) {
        setAlert({ open: true, message: 'Error deleting class: ' + error.message, severity: 'error' });
      }
    }
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'name', headerName: 'Name', width: 150 },
    { field: 'academic_year', headerName: 'Academic Year', width: 150 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      renderCell: ({ row }) => (
        <>
          <Button variant="contained" color="primary" size="small" onClick={() => handleEditClass(row)} sx={{ mr: 1 }}>
            Edit
          </Button>
          <Button variant="contained" color="error" size="small" onClick={() => handleDeleteClass(row.id)}>
            Delete
          </Button>
        </>
      ),
    },
  ];

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>{editingClass ? 'Edit Class' : 'Add Class'}</Typography>
      <form onSubmit={editingClass ? handleUpdateClass : handleAddClass}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={newClass.name}
              onChange={handleInputChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Academic Year"
              name="academic_year"
              value={newClass.academic_year}
              onChange={handleInputChange}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary" sx={{ mr: 1 }}>
              {editingClass ? 'Update Class' : 'Add Class'}
            </Button>
            {editingClass && (
              <Button
                variant="outlined"
                onClick={() => {
                  setEditingClass(null);
                  setNewClass({ name: '', academic_year: '' });
                }}
              >
                Cancel
              </Button>
            )}
          </Grid>
        </Grid>
      </form>
      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>Classes</Typography>
      <div style={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={classes}
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

export default ClassManager;