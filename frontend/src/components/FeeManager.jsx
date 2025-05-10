import { useState, useEffect } from 'react';
import {
  Container, Typography, TextField, Button, MenuItem, Grid, Snackbar, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, Card, CardContent, Box, Paper, Autocomplete
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { handleApiError } from '../utils/errorHandler';
import PaymentIcon from '@mui/icons-material/Payment';
import axiosInstance from '../utils/axiosConfig';

const MONTHS = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'
];

const containerStyle = {
  minHeight: 'calc(100vh - 80px)', // Adjust for navbar height
  display: 'flex',
  flexDirection: 'column',
  padding: '32px 0'
};

const dataGridStyle = {
  flex: 1,
  width: '100%',
  minHeight: '400px', // Minimum height
  '& .MuiDataGrid-root': {
    backgroundColor: 'white',
  }
};

const FeeManager = () => {
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [formData, setFormData] = useState({
    student_id: '',
    month: 'JAN',
    tuition_fees: '',
    auto_fees: '',
    day_boarding_fees: '',
    receipt_number: ''
  });
  const [stats, setStats] = useState({
    totalCollected: 0,
    pendingFees: 0,
    paidStudents: 0,
    defaulters: 0
  });
  const [monthlyStats, setMonthlyStats] = useState({
    currentMonth: {
      totalCollected: 0,
      tuitionFees: 0,
      autoFees: 0,
      dayBoardingFees: 0
    },
    allTime: {
      totalCollected: 0,
      tuitionFees: 0,
      autoFees: 0,
      dayBoardingFees: 0
    }
  });
  const [filteredStudents, setFilteredStudents] = useState([]);

  useEffect(() => {
    fetchPayments();
    fetchStudents();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('http://localhost:8000/fee_payments/');
      const transformedPayments = response.data.map(payment => ({
        ...payment,
        tuition_fees: parseFloat(payment.tuition_fees),
        auto_fees: parseFloat(payment.auto_fees),
        day_boarding_fees: parseFloat(payment.day_boarding_fees),
        total_amount: parseFloat(payment.total_amount),
        receipt_number:  payment.receipt_number,
      }));
      setPayments(transformedPayments);
    } catch (error) {
      handleApiError(error, setAlert);
    } finally {
      setLoading(false);
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

  const handleModalOpen = (payment = null) => {
    if (payment) {
      setSelectedPayment(payment);
      setFormData({
        student_id: payment.student_id,
        month: payment.month,
        tuition_fees: parseFloat(payment.tuition_fees).toString(),
        auto_fees: parseFloat(payment.auto_fees).toString(),
        day_boarding_fees: parseFloat(payment.day_boarding_fees).toString(),
         receipt_number: payment.receipt_number || ''
      });
    } else {
      setSelectedPayment(null);
      setFormData({
        student_id: '',
        month: 'JAN',
        tuition_fees: '',
        auto_fees: '',
        day_boarding_fees: ''
      });
    }
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedPayment(null);
    setFormData({
      student_id: '',
      month: 'JAN',
      tuition_fees: '',
      auto_fees: '',
      day_boarding_fees: '',
      receipt_number: ''
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
      const paymentData = {
        student_id: formData.student_id,
        month: formData.month,
        tuition_fees: parseInt(formData.tuition_fees) || 0,
        auto_fees: parseInt(formData.auto_fees) || 0,
        day_boarding_fees: parseInt(formData.day_boarding_fees) || 0,
        receipt_number: formData.receipt_number || '',
      };

      if (selectedPayment) {
        await axiosInstance.put(`http://localhost:8000/fee_payments/${selectedPayment.id}`, paymentData);
        setAlert({ open: true, message: 'Payment updated successfully!', severity: 'success' });
      } else {
        await axiosInstance.post('http://localhost:8000/fee_payments/', paymentData);
        setAlert({ open: true, message: 'Payment added successfully!', severity: 'success' });
      }

      handleModalClose();
      fetchPayments();
    } catch (error) {
      handleApiError(error, setAlert);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this payment?')) {
      try {
        await axiosInstance.delete(`http://localhost:8000/fee_payments/${id}`);
        setAlert({ open: true, message: 'Payment deleted successfully!', severity: 'success' });
        fetchPayments();
      } catch (error) {
        handleApiError(error, setAlert);
      }
    }
  };

  const handleStudentSearch = (event, value) => {
    setSearchTerm(value);
    if (!value) {
      setFilteredStudents(students);
      return;
    }
    
    const filtered = students.filter(student => 
      student.name.toLowerCase().includes(value.toLowerCase()) ||
      student.roll_number?.toLowerCase().includes(value.toLowerCase()) ||
      student.father_name?.toLowerCase().includes(value.toLowerCase()) ||
      student.class_name?.toLowerCase().includes(value.toLowerCase()) ||
      student.section_name?.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredStudents(filtered);
  };

  const filteredPayments = payments.filter(payment => {
    const student = students.find(s => s.id === payment.student_id);
    const searchString = (student?.name || '').toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  const calculateStats = () => {
    try {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-based
      const currentYear = currentDate.getFullYear();

      // Filter payments for current month
      const currentMonthPayments = payments.filter(payment => {
        const paymentDate = new Date(payment.transaction_date);
        return paymentDate.getMonth() + 1 === currentMonth && 
               paymentDate.getFullYear() === currentYear;
      });

      // Calculate current month stats
      const currentMonthStats = {
        totalCollected: currentMonthPayments.reduce((sum, payment) => sum + payment.total_amount, 0),
        tuitionFees: currentMonthPayments.reduce((sum, payment) => sum + payment.tuition_fees, 0),
        autoFees: currentMonthPayments.reduce((sum, payment) => sum + payment.auto_fees, 0),
        dayBoardingFees: currentMonthPayments.reduce((sum, payment) => sum + payment.day_boarding_fees, 0)
      };

      // Calculate all time stats
      const allTimeStats = {
        totalCollected: payments.reduce((sum, payment) => sum + payment.total_amount, 0),
        tuitionFees: payments.reduce((sum, payment) => sum + payment.tuition_fees, 0),
        autoFees: payments.reduce((sum, payment) => sum + payment.auto_fees, 0),
        dayBoardingFees: payments.reduce((sum, payment) => sum + payment.day_boarding_fees, 0)
      };

      // Update monthly stats
      setMonthlyStats({
        currentMonth: currentMonthStats,
        allTime: allTimeStats
      });

      // Update existing stats
      const paidStudents = new Set(payments.map(payment => payment.student_id)).size;
      const defaulters = students.length - paidStudents;
      const pendingFees = students.reduce((sum, student) => {
        const totalFees = student.tuition_fees + student.auto_fees + student.day_boarding_fees;
        const paid = payments
          .filter(payment => payment.student_id === student.id)
          .reduce((sum, payment) => sum + payment.total_amount, 0);
        return sum + (totalFees - paid);
      }, 0);

      setStats({
        totalCollected: allTimeStats.totalCollected,
        pendingFees,
        paidStudents,
        defaulters
      });
    } catch (error) {
      console.error('Error calculating stats:', error);
    }
  };

  useEffect(() => {
    if (students.length && payments.length) {
      calculateStats();
    }
  }, [students, payments]);

  const columns = [
    {
      field: 'student_name',
      headerName: 'Student',
      width: 200,
      valueGetter: (params) => {
        const student = students.find(s => s.id === params.row.student_id);
        return student ? student.name : '';
      }
    },
    {
      field: 'month',
      headerName: 'Month',
      width: 100
    },
    {
      field: 'tuition_fees',
      headerName: 'Tuition Fees',
      width: 130,
      valueFormatter: (params) => `₹${parseFloat(params.value).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`
    },
    {
      field: 'auto_fees',
      headerName: 'Auto Fees',
      width: 130,
      valueFormatter: (params) => `₹${parseFloat(params.value).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`
    },
    {
      field: 'day_boarding_fees',
      headerName: 'Day Boarding',
      width: 130,
      valueFormatter: (params) => `₹${parseFloat(params.value).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`
    },
    {
      field: 'receipt_number',
      headerName: 'Receipt No.',
      width: 130,
      valueFormatter: (params) => params.value?.toString() || ''
    }
    ,
    {
      field: 'total_amount',
      headerName: 'Total',
      width: 130,
      valueFormatter: (params) => `₹${parseFloat(params.value).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`
    },
    {
      field: 'transaction_date',
      headerName: 'Date',
      width: 180,
      valueFormatter: (params) => {
        const date = new Date(params.value);
        return date.toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
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
    <Container maxWidth="lg" sx={containerStyle}>
      {/* Monthly Breakdown and All Time Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Current Month Breakdown ({new Date().toLocaleString('default', { month: 'long' })})
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ p: 2, bgcolor: 'primary.light', color: 'white', borderRadius: 1 }}>
                    <Typography variant="subtitle2">Total Collected</Typography>
                    <Typography variant="h6">
                      ₹{monthlyStats.currentMonth.totalCollected.toLocaleString()}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ p: 2, bgcolor: 'success.light', color: 'white', borderRadius: 1 }}>
                    <Typography variant="subtitle2">Tuition Fees</Typography>
                    <Typography variant="h6">
                      ₹{monthlyStats.currentMonth.tuitionFees.toLocaleString()}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ p: 2, bgcolor: 'info.light', color: 'white', borderRadius: 1 }}>
                    <Typography variant="subtitle2">Auto Fees</Typography>
                    <Typography variant="h6">
                      ₹{monthlyStats.currentMonth.autoFees.toLocaleString()}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ p: 2, bgcolor: 'warning.light', color: 'white', borderRadius: 1 }}>
                    <Typography variant="subtitle2">Day Boarding Fees</Typography>
                    <Typography variant="h6">
                      ₹{monthlyStats.currentMonth.dayBoardingFees.toLocaleString()}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* All Time Stats */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>All Time Collection</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ p: 2, bgcolor: 'primary.light', color: 'white', borderRadius: 1 }}>
                    <Typography variant="subtitle2">Total Collected</Typography>
                    <Typography variant="h6">
                      ₹{monthlyStats.allTime.totalCollected.toLocaleString()}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ p: 2, bgcolor: 'success.light', color: 'white', borderRadius: 1 }}>
                    <Typography variant="subtitle2">Tuition Fees</Typography>
                    <Typography variant="h6">
                      ₹{monthlyStats.allTime.tuitionFees.toLocaleString()}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ p: 2, bgcolor: 'info.light', color: 'white', borderRadius: 1 }}>
                    <Typography variant="subtitle2">Auto Fees</Typography>
                    <Typography variant="h6">
                      ₹{monthlyStats.allTime.autoFees.toLocaleString()}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ p: 2, bgcolor: 'warning.light', color: 'white', borderRadius: 1 }}>
                    <Typography variant="subtitle2">Day Boarding Fees</Typography>
                    <Typography variant="h6">
                      ₹{monthlyStats.allTime.dayBoardingFees.toLocaleString()}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Actions Bar */}
      <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Grid item xs>
          <Typography variant="h5">Payment Records</Typography>
        </Grid>
        <Grid item>
          <TextField
            size="small"
            placeholder="Search by student name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ mr: 2 }}
          />
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            onClick={() => handleModalOpen()}
            startIcon={<PaymentIcon />}
            sx={{ height: 40 }}
          >
            Add Payment
          </Button>
        </Grid>
      </Grid>

      {/* DataGrid */}
      <Paper sx={dataGridStyle}>
        <DataGrid
          rows={filteredPayments}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          disableSelectionOnClick
          loading={loading}
          getRowId={(row) => row.id}
          sx={{
            height: '100%',
            '& .MuiDataGrid-row:hover': {
              backgroundColor: 'action.hover'
            }
          }}
        />
      </Paper>

      <Dialog open={modalOpen} onClose={handleModalClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedPayment ? 'Edit Payment' : 'Add Payment'}
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
                <Autocomplete
                  fullWidth
                  options={students}
                  getOptionLabel={(student) => 
                    `${student.name} - ${student.roll_number} (${student.class_name} ${student.section_name})`
                  }
                  renderOption={(props, student) => (
                    <Box component="li" {...props}>
                      <Box>
                        <Typography variant="subtitle1">
                          {student.name} ({student.roll_number})
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Class: {student.class_name} | Section: {student.section_name}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Father's Name: {student.father_name}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Search Student"
                      variant="outlined"
                      onChange={(e) => handleStudentSearch(e, e.target.value)}
                    />
                  )}
                  onChange={(event, newValue) => {
                    setFormData({
                      ...formData,
                      student_id: newValue?.id || '',
                      tuition_fees: newValue?.tuition_fees?.toString() || '',
                      auto_fees: newValue?.auto_fees?.toString() || '',
                      day_boarding_fees: newValue?.day_boarding_fees?.toString() || ''
                    });
                  }}
                  value={students.find(student => student.id === formData.student_id)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Month"
                  name="month"
                  value={formData.month}
                  onChange={handleInputChange}
                  required
                >
                  {MONTHS.map((month) => (
                    <MenuItem key={month} value={month}>
                      {month}
                    </MenuItem>
                  ))}
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
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth   
                  label="Receipt Number"
                  name="receipt_number"
                  value={formData.receipt_number}
                  onChange={handleInputChange}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleModalClose}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {selectedPayment ? 'Update' : 'Add'} Payment
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

export default FeeManager;