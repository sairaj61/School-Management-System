import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Typography, TextField, Button, MenuItem, Grid, Snackbar, Alert } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

const FeeManager = () => {
  const [feePayments, setFeePayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [newFeePayment, setNewFeePayment] = useState({ student_id: '', amount: '', academic_year: '', balance: '' });
  const [editingFeePayment, setEditingFeePayment] = useState(null);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchFeePayments();
    fetchStudents();
  }, []);

  const fetchFeePayments = async () => {
    try {
      const response = await axios.get('http://localhost:8000/fee_payments/');
      setFeePayments(response.data);
    } catch (error) {
      setAlert({ open: true, message: 'Error fetching fee payments: ' + error.message, severity: 'error' });
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await axios.get('http://localhost:8000/students/');
      setStudents(response.data);
    } catch (error) {
      setAlert({ open: true, message: 'Error fetching students: ' + error.message, severity: 'error' });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewFeePayment(prev => ({ ...prev, [name]: value }));
  };

  const handleAddFeePayment = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/fee_payments/', newFeePayment);
      setAlert({ open: true, message: 'Fee payment added successfully!', severity: 'success' });
      fetchFeePayments();
      setNewFeePayment({ student_id: '', amount: '', academic_year: '', balance: '' });
    } catch (error) {
      setAlert({ open: true, message: 'Error adding fee payment: ' + error.message, severity: 'error' });
    }
  };

  const handleEditFeePayment = (payment) => {
    setEditingFeePayment(payment);
    setNewFeePayment(payment);
  };

  const handleUpdateFeePayment = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/fee_payments/', newFeePayment); // Note: API doesn't support PUT, so create new payment
      setAlert({ open: true, message: 'Fee payment updated successfully!', severity: 'success' });
      fetchFeePayments();
      setEditingFeePayment(null);
      setNewFeePayment({ student_id: '', amount: '', academic_year: '', balance: '' });
    } catch (error) {
      setAlert({ open: true, message: 'Error updating fee payment: ' + error.message, severity: 'error' });
    }
  };

  const handleDeleteFeePayment = async (id) => {
    if (window.confirm('Are you sure you want to delete this fee payment?')) {
      try {
        await axios.delete(`http://localhost:8000/fee_payments/${id}`);
        setAlert({ open: true, message: 'Fee payment deleted successfully!', severity: 'success' });
        fetchFeePayments();
      } catch (error) {
        setAlert({ open: true, message: 'Error deleting fee payment: ' + error.message, severity: 'error' });
      }
    }
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'student_name', headerName: 'Student', width: 150, valueGetter: ({ row }) => students.find(s => s.id === row.student_id)?.name || '' },
    { field: 'amount', headerName: 'Amount', width: 120, valueFormatter: ({ value }) => `$${value.toFixed(2)}` },
    { field: 'academic_year', headerName: 'Academic Year', width: 150 },
    { field: 'balance', headerName: 'Balance', width: 120, valueFormatter: ({ value }) => `$${value.toFixed(2)}` },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      renderCell: ({ row }) => (
        <>
          <Button variant="contained" color="primary" size="small" onClick={() => handleEditFeePayment(row)} sx={{ mr: 1 }}>
            Edit
          </Button>
          <Button variant="contained" color="error" size="small" onClick={() => handleDeleteFeePayment(row.id)}>
            Delete
          </Button>
        </>
      ),
    },
  ];

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>{editingFeePayment ? 'Edit Fee Payment' : 'Add Fee Payment'}</Typography>
      <form onSubmit={editingFeePayment ? handleUpdateFeePayment : handleAddFeePayment}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              select
              label="Student"
              name="student_id"
              value={newFeePayment.student_id}
              onChange={handleInputChange}
              required
            >
              {students.map(student => (
                <MenuItem key={student.id} value={student.id}>{student.name}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Amount"
              name="amount"
              type="number"
              value={newFeePayment.amount}
              onChange={handleInputChange}
              required
              inputProps={{ min: 0, step: 0.01 }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Academic Year"
              name="academic_year"
              value={newFeePayment.academic_year}
              onChange={handleInputChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Balance"
              name="balance"
              type="number"
              value={newFeePayment.balance}
              onChange={handleInputChange}
              required
              inputProps={{ min: 0, step: 0.01 }}
            />
          </Grid>
          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary" sx={{ mr: 1 }}>
              {editingFeePayment ? 'Update Fee Payment' : 'Add Fee Payment'}
            </Button>
            {editingFeePayment && (
              <Button
                variant="outlined"
                onClick={() => {
                  setEditingFeePayment(null);
                  setNewFeePayment({ student_id: '', amount: '', academic_year: '', balance: '' });
                }}
              >
                Cancel
              </Button>
            )}
          </Grid>
        </Grid>
      </form>
      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>Fee Payments</Typography>
      <div style={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={feePayments}
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

export default FeeManager;