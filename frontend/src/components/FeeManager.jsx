import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Typography, TextField, Button, MenuItem, Grid, Snackbar, Alert } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { handleApiError } from '../utils/errorHandler';

const MONTHS = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'
];

const FeeManager = () => {
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [newPayment, setNewPayment] = useState({
    student_id: '',
    month: 'JAN',
    tuition_fees: '',
    auto_fees: '',
    day_boarding_fees: ''
  });
  const [editingPayment, setEditingPayment] = useState(null);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(true);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPayment(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const paymentData = {
        student_id: newPayment.student_id,
        month: newPayment.month,
        tuition_fees: parseInt(newPayment.tuition_fees) || 0,
        auto_fees: parseInt(newPayment.auto_fees) || 0,
        day_boarding_fees: parseInt(newPayment.day_boarding_fees) || 0
      };

      if (editingPayment) {
        await axios.put(`http://localhost:8000/fee_payments/${editingPayment.id}`, paymentData);
        setAlert({ open: true, message: 'Payment updated successfully!', severity: 'success' });
      } else {
        await axios.post('http://localhost:8000/fee_payments/', paymentData);
        setAlert({ open: true, message: 'Payment added successfully!', severity: 'success' });
      }

      setNewPayment({
        student_id: '',
        month: 'JAN',
        tuition_fees: '',
        auto_fees: '',
        day_boarding_fees: ''
      });
      setEditingPayment(null);
      fetchPayments();
    } catch (error) {
      handleApiError(error, setAlert);
    }
  };

  const handleEdit = (payment) => {
    setEditingPayment(payment);
    setNewPayment({
      student_id: payment.student_id,
      month: payment.month,
      tuition_fees: parseFloat(payment.tuition_fees).toString(),
      auto_fees: parseFloat(payment.auto_fees).toString(),
      day_boarding_fees: parseFloat(payment.day_boarding_fees).toString()
    });
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
        {editingPayment ? 'Edit Fee Payment' : 'Add Fee Payment'}
      </Typography>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Student"
              name="student_id"
              value={newPayment.student_id}
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
              value={newPayment.month}
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
              value={newPayment.tuition_fees}
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
              value={newPayment.auto_fees}
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
              value={newPayment.day_boarding_fees}
              onChange={handleInputChange}
              required
              inputProps={{ min: 0 }}
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ mr: 1 }}
            >
              {editingPayment ? 'Update' : 'Add'} Payment
            </Button>
            {editingPayment && (
              <Button
                variant="contained"
                color="secondary"
                onClick={() => {
                  setEditingPayment(null);
                  setNewPayment({
                    student_id: '',
                    month: 'JAN',
                    tuition_fees: '',
                    auto_fees: '',
                    day_boarding_fees: ''
                  });
                }}
              >
                Cancel
              </Button>
            )}
          </Grid>
        </Grid>
      </form>

      <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>Fee Payments List</Typography>
      <div style={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={payments}
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

export default FeeManager;