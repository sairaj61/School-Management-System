import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container, Typography, TextField, Button, MenuItem, Grid, Snackbar, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, Card, CardContent, Box
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { handleApiError } from '../utils/errorHandler';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import GroupsIcon from '@mui/icons-material/Groups';
import BarChartIcon from '@mui/icons-material/BarChart';
import ClassIcon from '@mui/icons-material/Class';

const SectionManager = () => {
  const [sections, setSections] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSection, setSelectedSection] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    class_id: ''
  });
  const [stats, setStats] = useState({
    totalSections: 0,
    totalStudents: 0,
    averageStudents: 0,
    classesWithSections: 0
  });

  useEffect(() => {
    fetchSections();
    fetchClasses();
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await axios.get('http://localhost:8000/students/');
      setStudents(response.data);
    } catch (error) {
      handleApiError(error, setAlert);
    }
  };

  const fetchSections = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/sections/');
      setSections(response.data);
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

  const handleModalOpen = (section = null) => {
    if (section) {
      setSelectedSection(section);
      setFormData({
        name: section.name,
        class_id: section.class_id
      });
    } else {
      setSelectedSection(null);
      setFormData({
        name: '',
        class_id: ''
      });
    }
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedSection(null);
    setFormData({
      name: '',
      class_id: ''
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
      const sectionData = {
        name: formData.name.trim(),
        class_id: formData.class_id
      };

      if (selectedSection) {
        await axios.put(`http://localhost:8000/sections/${selectedSection.id}`, sectionData);
        setAlert({ open: true, message: 'Section updated successfully!', severity: 'success' });
      } else {
        await axios.post('http://localhost:8000/sections/', sectionData);
        setAlert({ open: true, message: 'Section added successfully!', severity: 'success' });
      }

      handleModalClose();
      fetchSections();
    } catch (error) {
      handleApiError(error, setAlert);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this section?')) {
      try {
        await axios.delete(`http://localhost:8000/sections/${id}`);
        setAlert({ open: true, message: 'Section deleted successfully!', severity: 'success' });
        fetchSections();
      } catch (error) {
        handleApiError(error, setAlert);
      }
    }
  };

  const filteredSections = sections.filter(section => {
    const searchString = (section.name + (classes.find(c => c.id === section.class_id)?.name || '')).toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  const calculateStats = () => {
    try {
      if (!sections.length || !students.length) return;

      const totalSections = sections.length;
      const totalStudents = students.length;
      const averageStudents = totalSections ? Math.round(totalStudents / totalSections) : 0;
      const classesWithSections = new Set(sections.map(section => section.class_id)).size;

      setStats({
        totalSections,
        totalStudents,
        averageStudents,
        classesWithSections
      });
    } catch (error) {
      console.error('Error calculating stats:', error);
    }
  };

  useEffect(() => {
    if (sections.length > 0 && students.length > 0) {
      calculateStats();
    }
  }, [sections, students]);

  const columns = [
    { field: 'name', headerName: 'Name', width: 150 },
    {
      field: 'class_name',
      headerName: 'Class',
      width: 150,
      valueGetter: (params) => {
        const cls = classes.find(c => c.id === params.row.class_id);
        return cls ? cls.name : '';
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
                <ViewWeekIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Total Sections</Typography>
              </Box>
              <Typography variant="h4">{stats.totalSections}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'success.light', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <GroupsIcon sx={{ mr: 1 }} />
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
                <BarChartIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Avg. Students/Section</Typography>
              </Box>
              <Typography variant="h4">{stats.averageStudents}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'warning.light', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <ClassIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Classes with Sections</Typography>
              </Box>
              <Typography variant="h4">{stats.classesWithSections}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Grid item xs>
          <Typography variant="h4">Sections</Typography>
        </Grid>
        <Grid item>
          <TextField
            size="small"
            placeholder="Search sections..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            onClick={() => handleModalOpen()}
          >
            Add Section
          </Button>
        </Grid>
      </Grid>

      <div style={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={filteredSections}
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
          {selectedSection ? 'Edit Section' : 'Add Section'}
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
                  label="Section Name"
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
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleModalClose}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {selectedSection ? 'Update' : 'Add'} Section
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

export default SectionManager;