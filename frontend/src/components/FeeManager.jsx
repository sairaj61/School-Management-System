import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container, Typography, TextField, Button, MenuItem, Grid, Snackbar, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, Card, CardContent, Box
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { handleApiError } from '../utils/errorHandler';
import PaymentIcon from '@mui/icons-material/Payment';
import PendingIcon from '@mui/icons-material/Pending';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const MONTHS = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'
];

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
    day_boarding_fees: ''
  });
  const [stats, setStats] = useState({
    totalCollected: 0,
    pendingFees: 0,
    paidStudents: 0,
    defaulters: 0
  });

  useEffect(() => {
    fetchPayments();
    fetchStudents();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/fee_payments/');
      const transformedPayments = response.data.map(payment => ({
        ...payment,
        tuition_fees: parseFloat(payment.tuition_fees),
        auto_fees: parseFloat(payment.auto_fees),
        day_boarding_fees: parseFloat(payment.day_boarding_fees),
        total_amount: parseFloat(payment.total_amount)
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
      const response = await axios.get('http://localhost:8000/students/');
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
        day_boarding_fees: parseFloat(payment.day_boarding_fees).toString()
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
      day_boarding_fees: ''
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
        day_boarding_fees: parseInt(formData.day_boarding_fees) || 0
      };

      if (selectedPayment) {
        await axios.put(`http://localhost:8000/fee_payments/${selectedPayment.id}`, paymentData);
        setAlert({ open: true, message: 'Payment updated successfully!', severity: 'success' });
      } else {
        await axios.post('http://localhost:8000/fee_payments/', paymentData);
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
        await axios.delete(`http://localhost:8000/fee_payments/${id}`);
        setAlert({ open: true, message: 'Payment deleted successfully!', severity: 'success' });
        fetchPayments();
      } catch (error) {
        handleApiError(error, setAlert);
      }
    }
  };

  const filteredPayments = payments.filter(payment => {
    const student = students.find(s => s.id === payment.student_id);
    const searchString = (student?.name || '').toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  const calculateStats = () => {
    const totalCollected = payments.reduce((sum, payment) => sum + payment.total_amount, 0);
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
      totalCollected,
      pendingFees,
      paidStudents,
      defaulters
    });
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
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'success.light', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <PaymentIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Total Collected</Typography>
              </Box>
              <Typography variant="h4">₹{stats.totalCollected.toLocaleString()}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'warning.light', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <PendingIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Pending Fees</Typography>
              </Box>
              <Typography variant="h4">₹{stats.pendingFees.toLocaleString()}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'info.light', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <CheckCircleIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Paid Students</Typography>
              </Box>
              <Typography variant="h4">{stats.paidStudents}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'error.light', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <TrendingUpIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Defaulters</Typography>
              </Box>
              <Typography variant="h4">{stats.defaulters}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Grid item xs>
          <Typography variant="h4">Fee Payments</Typography>
        </Grid>
        <Grid item>
          <TextField
            size="small"
            placeholder="Search by student name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            onClick={() => handleModalOpen()}
          >
            Add Payment
          </Button>
        </Grid>
      </Grid>

      <div style={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={filteredPayments}
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
                <TextField
                  select
                  fullWidth
                  label="Student"
                  name="student_id"
                  value={formData.student_id}
                  onChange={handleInputChange}
                  required
                >
                  {students.map((student) => (
                    <MenuItem key={student.id} value={student.id}>
                      {student.name}
                    </MenuItem>
                  ))}
                </TextField>
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