import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Container, Grid, Card, CardContent, Typography, Snackbar, Alert } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [dashboard, setDashboard] = useState({ total_students: 0, total_payments: 0, total_dues: 0, students_with_payments: [] });
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await axios.get('http://localhost:8000/dashboard/');
      setDashboard(response.data);
    } catch (error) {
      setAlert({ open: true, message: 'Error fetching dashboard: ' + error.message, severity: 'error' });
    }
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  const chartData = {
    labels: dashboard.students_with_payments.map(item => item.name),
    datasets: [
      {
        label: 'Total Paid',
        data: dashboard.students_with_payments.map(item => item.total_paid),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
      {
        label: 'Total Balance',
        data: dashboard.students_with_payments.map(item => item.total_balance),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      },
    ],
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'name', headerName: 'Name', width: 150 },
    { field: 'total_paid', headerName: 'Total Paid', width: 120, valueFormatter: ({ value }) => `$${value.toFixed(2)}` },
    { field: 'total_balance', headerName: 'Total Balance', width: 120, valueFormatter: ({ value }) => `$${value.toFixed(2)}` },
    { field: 'payment_status', headerName: 'Status', width: 120 },
  ];

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>Dashboard</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total Students</Typography>
              <Typography variant="h4">{dashboard.total_students}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total Payments</Typography>
              <Typography variant="h4">${dashboard.total_payments.toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total Dues</Typography>
              <Typography variant="h4">${dashboard.total_dues.toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom>Student Payment Status</Typography>
          <div style={{ height: 400, width: '100%' }}>
            <DataGrid
              rows={dashboard.students_with_payments}
              columns={columns}
              pageSizeOptions={[5]}
              disableRowSelectionOnClick
            />
          </div>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom>Payment Breakdown</Typography>
          <div style={{ height: 400, width: '100%' }}>
            <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </Grid>
      </Grid>
      <Snackbar open={alert.open} autoHideDuration={3000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} severity={alert.severity} sx={{ width: '100%' }}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Dashboard;