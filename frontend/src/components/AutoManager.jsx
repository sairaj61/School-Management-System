import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container, Typography, TextField, Button, MenuItem, Grid, Snackbar, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { handleApiError } from '../utils/errorHandler';

const AutoManager = () => {
  const [autos, setAutos] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  const [modalOpen, setModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAuto, setSelectedAuto] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [formData, setFormData] = useState({
    name: ''
  });
  const [viewStudentsModalOpen, setViewStudentsModalOpen] = useState(false);
  const [selectedAutoStudents, setSelectedAutoStudents] = useState([]);

  useEffect(() => {
    fetchAutos();
    fetchStudents();
  }, []);

  const fetchAutos = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/auto-management/with-students');
      setAutos(response.data);
    } catch (error) {
      handleApiError(error, setAlert);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await axios.get('http://localhost:8000/students/');
      setStudents(response.data);
    } catch (error) {
      handleApiError(error, setAlert);
    }
  };

  const handleModalOpen = (auto = null) => {
    if (auto) {
      setSelectedAuto(auto);
      setFormData({
        name: auto.name
      });
    } else {
      setSelectedAuto(null);
      setFormData({
        name: ''
      });
    }
    setModalOpen(true);
  };

  const handleAssignModalOpen = (auto) => {
    setSelectedAuto(auto);
    setSelectedStudents(auto?.students || []);
    setAssignModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedAuto(null);
    setFormData({ name: '' });
  };

  const handleAssignModalClose = () => {
    setAssignModalOpen(false);
    setSelectedAuto(null);
    setSelectedStudents([]);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStudentSelection = (e) => {
    setSelectedStudents(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedAuto) {
        await axios.put(`http://localhost:8000/auto-management/${selectedAuto.id}`, formData);
        setAlert({ open: true, message: 'Auto updated successfully!', severity: 'success' });
      } else {
        await axios.post('http://localhost:8000/auto-management/', formData);
        setAlert({ open: true, message: 'Auto added successfully!', severity: 'success' });
      }
      handleModalClose();
      fetchAutos();
    } catch (error) {
      handleApiError(error, setAlert);
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:8000/auto-management/${selectedAuto.id}/assign-students`, 
        selectedStudents  // Send the array directly, not wrapped in an object
      );
      setAlert({ open: true, message: 'Students assigned successfully!', severity: 'success' });
      handleAssignModalClose();
      fetchAutos();
    } catch (error) {
      handleApiError(error, setAlert);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this auto?')) {
      try {
        await axios.delete(`http://localhost:8000/auto-management/${id}`);
        setAlert({ open: true, message: 'Auto deleted successfully!', severity: 'success' });
        fetchAutos();
      } catch (error) {
        handleApiError(error, setAlert);
      }
    }
  };

  const handleViewStudentsModalOpen = async (auto) => {
    try {
      const assignedStudents = students.filter(student => 
        auto.students.includes(student.id)
      );
      setSelectedAutoStudents(assignedStudents);
      setViewStudentsModalOpen(true);
    } catch (error) {
      handleApiError(error, setAlert);
    }
  };

  const handleViewStudentsModalClose = () => {
    setViewStudentsModalOpen(false);
    setSelectedAutoStudents([]);
  };

  const columns = [
    { field: 'name', headerName: 'Auto Name', width: 200 },
    {
      field: 'studentCount',
      headerName: 'Assigned Students',
      width: 150,
      valueGetter: (params) => params.row.students?.length || 0
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 400,
      renderCell: (params) => (
        <div>
          <Button
            variant="contained"
            size="small"
            onClick={() => handleModalOpen(params.row)}
            sx={{ mr: 1 }}
          >
            Edit
          </Button>
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={() => handleAssignModalOpen(params.row)}
            sx={{ mr: 1 }}
          >
            Assign Students
          </Button>
          <Button
            variant="contained"
            color="info"
            size="small"
            onClick={() => handleViewStudentsModalOpen(params.row)}
            sx={{ mr: 1 }}
          >
            View Students
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

  const filteredAutos = autos.filter(auto => 
    auto.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Grid item xs>
          <Typography variant="h4">Auto Management</Typography>
        </Grid>
        <Grid item>
          <TextField
            size="small"
            placeholder="Search autos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ minWidth: 200 }}
          />
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            onClick={() => handleModalOpen()}
          >
            Add Auto
          </Button>
        </Grid>
      </Grid>

      <div style={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={filteredAutos}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5]}
          disableSelectionOnClick
          loading={loading}
          getRowId={(row) => row.id}
        />
      </div>

      {/* Add/Edit Auto Modal */}
      <Dialog open={modalOpen} onClose={handleModalClose}>
        <DialogTitle>{selectedAuto ? 'Edit Auto' : 'Add Auto'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Auto Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleModalClose}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {selectedAuto ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Assign Students Modal */}
      <Dialog open={assignModalOpen} onClose={handleAssignModalClose}>
        <DialogTitle>Assign Students to Auto</DialogTitle>
        <form onSubmit={handleAssignSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  SelectProps={{ multiple: true }}
                  label="Select Students"
                  value={selectedStudents}
                  onChange={handleStudentSelection}
                  required
                >
                  {students.map((student) => (
                    <MenuItem key={student.id} value={student.id}>
                      {student.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleAssignModalClose}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              Assign Students
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* View Students Modal */}
      <Dialog 
        open={viewStudentsModalOpen} 
        onClose={handleViewStudentsModalClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Assigned Students</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            {selectedAutoStudents.length > 0 ? (
              <Grid item xs={12}>
                <DataGrid
                  rows={selectedAutoStudents}
                  columns={[
                    { field: 'name', headerName: 'Student Name', width: 200 },
                    { field: 'roll_number', headerName: 'Roll Number', width: 150 },
                    { field: 'father_name', headerName: 'Father Name', width: 200 },
                    { field: 'contact', headerName: 'Contact', width: 150 }
                  ]}
                  autoHeight
                  pageSize={5}
                  rowsPerPageOptions={[5]}
                  disableSelectionOnClick
                  getRowId={(row) => row.id}
                />
              </Grid>
            ) : (
              <Grid item xs={12}>
                <Typography variant="body1" align="center">
                  No students assigned to this auto
                </Typography>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleViewStudentsModalClose}>Close</Button>
        </DialogActions>
      </Dialog>

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

export default AutoManager; 