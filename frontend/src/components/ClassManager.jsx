import React, { useState, useEffect } from 'react';
import axios from 'axios';
import axiosInstance from '../utils/axiosConfig';
import {
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Box
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { handleApiError } from '../utils/errorHandler';
import ClassIcon from '@mui/icons-material/Class';
import GroupIcon from '@mui/icons-material/Group';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import SchoolIcon from '@mui/icons-material/School';

const ClassManager = () => {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    academic_year_id: ''
  });
  const [stats, setStats] = useState({
    totalClasses: 0,
    totalStudents: 0,
    averageStudents: 0,
    activeClasses: 0
  });

  useEffect(() => {
    fetchClasses();
    fetchAcademicYears();
    fetchStudents();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('http://localhost:8000/classes/');
      setClasses(response.data);
    } catch (error) {
      handleApiError(error, setAlert);
    } finally {
      setLoading(false);
    }
  };

  const fetchAcademicYears = async () => {
    try {
      const response = await axiosInstance.get('http://localhost:8000/academic-years/');
      setAcademicYears(response.data);
    } catch (error) {
      handleApiError(error, setAlert);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await axiosInstance.get('http://localhost:8000/students/');
      setStudents(response.data);
    } catch (error) {
      handleApiError(error, setAlert);
    }
  };

  const handleModalOpen = (classItem = null) => {
    if (classItem) {
      setSelectedClass(classItem);
      setFormData({
        name: classItem.name,
        academic_year_id: classItem.academic_year_id
      });
    } else {
      setSelectedClass(null);
      setFormData({
        name: '',
        academic_year_id: ''
      });
    }
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedClass(null);
    setFormData({
      name: '',
      academic_year_id: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const classData = {
        name: formData.name.trim(),
        academic_year_id: formData.academic_year_id
      };

      if (selectedClass) {
        await axiosInstance.put(`http://localhost:8000/classes/${selectedClass.id}`, classData);
        setAlert({ open: true, message: 'Class updated successfully!', severity: 'success' });
      } else {
        await axiosInstance.post('http://localhost:8000/classes/', classData);
        setAlert({ open: true, message: 'Class added successfully!', severity: 'success' });
      }

      handleModalClose();
      fetchClasses();
    } catch (error) {
      handleApiError(error, setAlert);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      try {
        await axiosInstance.delete(`http://localhost:8000/classes/${id}`);
        setAlert({ open: true, message: 'Class deleted successfully!', severity: 'success' });
        fetchClasses();
      } catch (error) {
        handleApiError(error, setAlert);
      }
    }
  };

  const filteredClasses = classes.filter(cls => 
    cls.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateStats = () => {
    try {
      const totalClasses = classes.length;
      const activeClasses = classes.filter(cls => cls.is_active).length;
      const totalStudents = students.length;
      const averageStudents = totalClasses ? Math.round(totalStudents / totalClasses) : 0;

      setStats({
        totalClasses,
        totalStudents,
        averageStudents,
        activeClasses
      });
    } catch (error) {
      console.error('Error calculating stats:', error);
    }
  };

  useEffect(() => {
    if (classes.length > 0 && students.length > 0) {
      calculateStats();
    }
  }, [classes, students]);

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
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'primary.light', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <ClassIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Total Classes</Typography>
              </Box>
              <Typography variant="h4">{stats.totalClasses}</Typography>
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
              <Typography variant="h4">{stats.totalStudents}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'info.light', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <AutoStoriesIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Avg. Students/Class</Typography>
              </Box>
              <Typography variant="h4">{stats.averageStudents}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'warning.light', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <SchoolIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Active Classes</Typography>
              </Box>
              <Typography variant="h4">{stats.activeClasses}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Grid item xs>
          <Typography variant="h4">Classes</Typography>
        </Grid>
        <Grid item>
          <TextField
            size="small"
            placeholder="Search classes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            onClick={() => handleModalOpen()}
          >
            Add Class
          </Button>
        </Grid>
      </Grid>

      <div style={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={filteredClasses}
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
          {selectedClass ? 'Edit Class' : 'Add Class'}
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
                  label="Class Name"
                  name="name"
                  value={formData.name}
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
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleModalClose}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {selectedClass ? 'Update' : 'Add'} Class
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

export default ClassManager;