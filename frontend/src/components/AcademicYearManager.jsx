import { useState, useEffect } from 'react';
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
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ArchiveIcon from '@mui/icons-material/Archive';
import UnarchiveIcon from '@mui/icons-material/Unarchive';
import SchoolIcon from '@mui/icons-material/School';

const AcademicYearManager = () => {
  const [academicYears, setAcademicYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState(null);
  const [formData, setFormData] = useState({
    year: ''
  });
  const [stats, setStats] = useState({
    totalYears: 0,
    activeYears: 0,
    archivedYears: 0
  });

  useEffect(() => {
    fetchAcademicYears();
  }, []);

  const fetchAcademicYears = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('http://localhost:8000/academic-years/');
      setAcademicYears(response.data);
    } catch (error) {
      handleApiError(error, setAlert);
    } finally {
      setLoading(false);
    }
  };

  const handleModalOpen = (yearItem = null) => {
    if (yearItem) {
      setSelectedYear(yearItem);
      setFormData({
        year: yearItem.year
      });
    } else {
      setSelectedYear(null);
      setFormData({
        year: ''
      });
    }
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedYear(null);
    setFormData({
      year: ''
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
      const yearData = {
        year: formData.year.trim()
      };

      if (selectedYear) {
        await axiosInstance.put(`http://localhost:8000/academic-years/${selectedYear.id}`, yearData);
        setAlert({ open: true, message: 'Academic Year updated successfully!', severity: 'success' });
      } else {
        await axiosInstance.post('http://localhost:8000/academic-years/', yearData);
        setAlert({ open: true, message: 'Academic Year added successfully!', severity: 'success' });
      }

      handleModalClose();
      fetchAcademicYears();
    } catch (error) {
      handleApiError(error, setAlert);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this academic year?')) {
      try {
        await axiosInstance.delete(`http://localhost:8000/academic-years/${id}`);
        setAlert({ open: true, message: 'Academic Year deleted successfully!', severity: 'success' });
        fetchAcademicYears();
      } catch (error) {
        handleApiError(error, setAlert);
      }
    }
  };

  const handleStatusChange = async (id, currentStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'ARCHIVED' : 'ACTIVE';
    try {
      await axiosInstance.patch(`http://localhost:8000/academic-years/${id}`, { status: newStatus });
      setAlert({ open: true, message: `Academic Year ${newStatus.toLowerCase()} successfully!`, severity: 'success' });
      fetchAcademicYears();
    } catch (error) {
      handleApiError(error, setAlert);
    }
  };

  const filteredYears = academicYears.filter(year => 
    year.year.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateStats = () => {
    try {
      const totalYears = academicYears.length;
      const activeYears = academicYears.filter(year => year.status === 'ACTIVE').length;
      const archivedYears = academicYears.filter(year => year.status === 'ARCHIVED').length;

      setStats({
        totalYears,
        activeYears,
        archivedYears
      });
    } catch (error) {
      console.error('Error calculating stats:', error);
    }
  };

  useEffect(() => {
    if (academicYears.length > 0) {
      calculateStats();
    }
  }, [academicYears]);

  const columns = [
    { field: 'year', headerName: 'Year', width: 150 },
    { field: 'status', headerName: 'Status', width: 150 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 250,
      renderCell: (params) => (
        <div>
          <Button
            variant="contained"
            color={params.row.status === 'ACTIVE' ? 'warning' : 'success'}
            size="small"
            onClick={() => handleStatusChange(params.row.id, params.row.status)}
            sx={{ mr: 1 }}
            startIcon={params.row.status === 'ACTIVE' ? <ArchiveIcon /> : <UnarchiveIcon />}
          >
            {params.row.status === 'ACTIVE' ? 'Archive' : 'Activate'}
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
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ bgcolor: 'primary.light', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <CalendarTodayIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Total Academic Years</Typography>
              </Box>
              <Typography variant="h4">{stats.totalYears}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ bgcolor: 'success.light', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <SchoolIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Active Years</Typography>
              </Box>
              <Typography variant="h4">{stats.activeYears}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ bgcolor: 'warning.light', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <ArchiveIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Archived Years</Typography>
              </Box>
              <Typography variant="h4">{stats.archivedYears}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Grid item xs>
          <Typography variant="h4">Academic Years</Typography>
        </Grid>
        <Grid item>
          <TextField
            size="small"
            placeholder="Search academic years..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            onClick={() => handleModalOpen()}
          >
            Add Academic Year
          </Button>
        </Grid>
      </Grid>

      <div style={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={filteredYears}
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
          {selectedYear ? 'Edit Academic Year' : 'Add Academic Year'}
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
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Year"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  required
                  inputProps={{ pattern: "[0-9]{4}", maxLength: 4 }}
                  helperText="Enter a 4-digit year (e.g., 2025)"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleModalClose}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {selectedYear ? 'Update' : 'Add'} Year
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

export default AcademicYearManager;