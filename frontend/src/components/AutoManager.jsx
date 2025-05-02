import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container, Typography, TextField, Button, MenuItem, Grid, Snackbar, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, Box, Paper, Card, CardContent,
  IconButton, Tooltip, Chip
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { handleApiError } from '../utils/errorHandler';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import GroupIcon from '@mui/icons-material/Group';
import ClassIcon from '@mui/icons-material/Class';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

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
  const [stats, setStats] = useState({
    totalAutos: 0,
    totalStudents: 0,
    totalFees: 0,
    classDistribution: {},
    sectionDistribution: {}
  });

  useEffect(() => {
    fetchAutos();
    fetchStudents();
  }, []);

  useEffect(() => {
    if (autos.length > 0 && students.length > 0) {
      calculateStats();
    }
  }, [autos, students]);

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

  const calculateStats = () => {
    try {
      const classMap = {};
      const sectionMap = {};
      let totalStudents = 0;
      let totalFees = 0;

      autos.forEach(auto => {
        const autoStudents = auto.students || [];
        totalStudents += autoStudents.length;
        
        autoStudents.forEach(studentId => {
          const student = students.find(s => s.id === studentId);
          if (student) {
            // Add to class distribution
            const className = student.class_name || 'Unassigned';
            classMap[className] = (classMap[className] || 0) + 1;
            
            // Add to section distribution
            const sectionName = student.section_name || 'Unassigned';
            sectionMap[sectionName] = (sectionMap[sectionName] || 0) + 1;
            
            // Add fees
            totalFees += student.auto_fees || 0;
          }
        });
      });

      setStats({
        totalAutos: autos.length,
        totalStudents,
        totalFees,
        classDistribution: classMap,
        sectionDistribution: sectionMap
      });
    } catch (error) {
      console.error('Error calculating stats:', error);
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
      width: 450,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'nowrap' }}>
          <Button
            variant="contained"
            size="small"
            onClick={() => handleModalOpen(params.row)}
          >
            Edit
          </Button>
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={() => handleAssignModalOpen(params.row)}
          >
            Assign Students
          </Button>
          <Button
            variant="contained"
            color="info"
            size="small"
            onClick={() => handleViewStudentsModalOpen(params.row)}
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
        </Box>
      ),
    },
  ];

  const filteredAutos = autos.filter(auto => 
    auto.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'primary.light', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <DirectionsBusIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Total Autos</Typography>
              </Box>
              <Typography variant="h3">{stats.totalAutos}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'success.light', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <GroupIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Total Students</Typography>
              </Box>
              <Typography variant="h3">{stats.totalStudents}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'info.light', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <ClassIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Classes Covered</Typography>
              </Box>
              <Typography variant="h3">{Object.keys(stats.classDistribution).length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'warning.light', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <AccountBalanceIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Total Fees</Typography>
              </Box>
              <Typography variant="h3">₹{stats.totalFees.toLocaleString()}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Distribution Details */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Class Distribution</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {Object.entries(stats.classDistribution).map(([className, count]) => (
                <Chip
                  key={className}
                  label={`${className}: ${count} students`}
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Section Distribution</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {Object.entries(stats.sectionDistribution).map(([sectionName, count]) => (
                <Chip
                  key={sectionName}
                  label={`${sectionName}: ${count} students`}
                  color="secondary"
                  variant="outlined"
                />
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

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