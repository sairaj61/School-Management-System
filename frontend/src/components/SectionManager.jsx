import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Typography, TextField, Button, MenuItem, Grid, Snackbar, Alert } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

const SectionManager = () => {
  const [sections, setSections] = useState([]);
  const [classes, setClasses] = useState([]);
  const [newSection, setNewSection] = useState({ name: '', class_id: '' });
  const [editingSection, setEditingSection] = useState(null);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchSections();
    fetchClasses();
  }, []);

  const fetchSections = async () => {
    try {
      const response = await axios.get('http://localhost:8000/sections/');
      setSections(response.data);
    } catch (error) {
      setAlert({ open: true, message: 'Error fetching sections: ' + error.message, severity: 'error' });
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSection(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSection = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/sections/', newSection);
      setAlert({ open: true, message: 'Section added successfully!', severity: 'success' });
      fetchSections();
      setNewSection({ name: '', class_id: '' });
    } catch (error) {
      setAlert({ open: true, message: 'Error adding section: ' + error.message, severity: 'error' });
    }
  };

  const handleEditSection = (section) => {
    setEditingSection(section);
    setNewSection(section);
  };

  const handleUpdateSection = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:8000/sections/${editingSection.id}`, newSection);
      setAlert({ open: true, message: 'Section updated successfully!', severity: 'success' });
      fetchSections();
      setEditingSection(null);
      setNewSection({ name: '', class_id: '' });
    } catch (error) {
      setAlert({ open: true, message: 'Error updating section: ' + error.message, severity: 'error' });
    }
  };

  const handleDeleteSection = async (id) => {
    if (window.confirm('Are you sure you want to delete this section?')) {
      try {
        await axios.delete(`http://localhost:8000/sections/${id}`);
        setAlert({ open: true, message: 'Section deleted successfully!', severity: 'success' });
        fetchSections();
      } catch (error) {
        setAlert({ open: true, message: 'Error deleting section: ' + error.message, severity: 'error' });
      }
    }
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'name', headerName: 'Name', width: 150 },
    { field: 'class_name', headerName: 'Class', width: 150, valueGetter: ({ row }) => classes.find(c => c.id === row.class_id)?.name || '' },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      renderCell: ({ row }) => (
        <>
          <Button variant="contained" color="primary" size="small" onClick={() => handleEditSection(row)} sx={{ mr: 1 }}>
            Edit
          </Button>
          <Button variant="contained" color="error" size="small" onClick={() => handleDeleteSection(row.id)}>
            Delete
          </Button>
        </>
      ),
    },
  ];

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>{editingSection ? 'Edit Section' : 'Add Section'}</Typography>
      <form onSubmit={editingSection ? handleUpdateSection : handleAddSection}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={newSection.name}
              onChange={handleInputChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              select
              label="Class"
              name="class_id"
              value={newSection.class_id}
              onChange={handleInputChange}
              required
            >
              {classes.map(cls => (
                <MenuItem key={cls.id} value={cls.id}>{cls.name}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary" sx={{ mr: 1 }}>
              {editingSection ? 'Update Section' : 'Add Section'}
            </Button>
            {editingSection && (
              <Button
                variant="outlined"
                onClick={() => {
                  setEditingSection(null);
                  setNewSection({ name: '', class_id: '' });
                }}
              >
                Cancel
              </Button>
            )}
          </Grid>
        </Grid>
      </form>
      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>Sections</Typography>
      <div style={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={sections}
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

export default SectionManager;