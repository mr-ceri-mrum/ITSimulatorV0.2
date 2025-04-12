import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Grid,
  Typography,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Button,
  Tabs,
  Tab,
} from '@mui/material';
import { 
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Storage as StorageIcon,
  CalendarToday as CalendarIcon,
  Business as BusinessIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

import { selectCompanyName, selectCompanyCash, selectCompanyValuation, selectEmployees, selectServers, selectTotalUsers, selectFinancialHistory } from '../../store/companySlice';
import { selectActiveProducts } from '../../store/productsSlice';
import { selectCurrentDate, formatDate } from '../../store/timeSlice';
import { selectTopCompanies, selectActiveEvents } from '../../store/marketSlice';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const companyName = useSelector(selectCompanyName);
  const companyCash = useSelector(selectCompanyCash);
  const companyValuation = useSelector(selectCompanyValuation);
  const employees = useSelector(selectEmployees);
  const servers = useSelector(selectServers);
  const totalUsers = useSelector(selectTotalUsers);
  const currentDate = useSelector(selectCurrentDate);
  const financialHistory = useSelector(selectFinancialHistory);
  const activeProducts = useSelector(selectActiveProducts);
  const topCompanies = useSelector(state => selectTopCompanies(state, 5));
  const activeEvents = useSelector(state => selectActiveEvents(state, currentDate));
  
  const [chartTab, setChartTab] = useState(0);
  
  // Format data for charts
  const prepareChartData = () => {
    // Only use last 24 data points (months) if available
    const history = financialHistory.slice(-24);
    
    const labels = history.map(entry => {
      const date = new Date(entry.date);
      return `${date.getMonth() + 1}/${date.getFullYear()}`;
    });
    
    const cashData = history.map(entry => entry.cashBalance);
    const valuationData = history.map(entry => entry.valuation);
    const usersData = history.map(entry => entry.totalUsers);
    
    return {
      labels,
      cashData,
      valuationData,
      usersData
    };
  };
  
  const { labels, cashData, valuationData, usersData } = prepareChartData();
  
  // Format rankings
  const companyRanking = [...topCompanies, { name: companyName, valuation: companyValuation }]
    .sort((a, b) => b.valuation - a.valuation)
    .map((company, index) => ({
      ...company,
      rank: index + 1,
      isPlayer: company.name === companyName
    }));
  
  const playerRank = companyRanking.find(company => company.isPlayer)?.rank || 'N/A';
  
  const renderChart = () => {
    switch (chartTab) {
      case 0: // Cash
        return (
          <Line
            data={{
              labels,
              datasets: [
                {
                  label: 'Cash Balance',
                  data: cashData,
                  borderColor: 'rgba(75, 192, 192, 1)',
                  backgroundColor: 'rgba(75, 192, 192, 0.2)',
                  tension: 0.1,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: value => `$${value.toLocaleString()}`,
                  },
                },
              },
            }}
            height={300}
          />
        );
      case 1: // Valuation
        return (
          <Line
            data={{
              labels,
              datasets: [
                {
                  label: 'Company Valuation',
                  data: valuationData,
                  borderColor: 'rgba(153, 102, 255, 1)',
                  backgroundColor: 'rgba(153, 102, 255, 0.2)',
                  tension: 0.1,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: value => `$${value.toLocaleString()}`,
                  },
                },
              },
            }}
            height={300}
          />
        );
      case 2: // Users
        return (
          <Line
            data={{
              labels,
              datasets: [
                {
                  label: 'Total Users',
                  data: usersData,
                  borderColor: 'rgba(255, 159, 64, 1)',
                  backgroundColor: 'rgba(255, 159, 64, 0.2)',
                  tension: 0.1,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: value => value.toLocaleString(),
                  },
                },
              },
            }}
            height={300}
          />
        );
      default:
        return null;
    }
  };
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Company Dashboard
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        {formatDate(currentDate)}
      </Typography>
      
      {/* Key Stats */}
      <Grid container spacing={3} sx={{ mb: 4, mt: 1 }}>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 1 }}>
                <MoneyIcon />
              </Avatar>
              <Typography variant="h6">Cash</Typography>
            </Box>
            <Typography variant="h4" component="div" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              ${companyCash.toLocaleString()}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Avatar sx={{ bgcolor: 'secondary.main', mr: 1 }}>
                <TrendingUpIcon />
              </Avatar>
              <Typography variant="h6">Valuation</Typography>
            </Box>
            <Typography variant="h4" component="div" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              ${companyValuation.toLocaleString()}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Avatar sx={{ bgcolor: 'success.main', mr: 1 }}>
                <PeopleIcon />
              </Avatar>
              <Typography variant="h6">Users</Typography>
            </Box>
            <Typography variant="h4" component="div" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {totalUsers.toLocaleString()}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Avatar sx={{ bgcolor: 'info.main', mr: 1 }}>
                <PeopleIcon />
              </Avatar>
              <Typography variant="h6">Employees</Typography>
            </Box>
            <Typography variant="h4" component="div" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {employees.toLocaleString()}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Avatar sx={{ bgcolor: 'warning.main', mr: 1 }}>
                <StorageIcon />
              </Avatar>
              <Typography variant="h6">Servers</Typography>
            </Box>
            <Typography variant="h4" component="div" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {servers.toLocaleString()}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Avatar sx={{ bgcolor: 'error.main', mr: 1 }}>
                <BusinessIcon />
              </Avatar>
              <Typography variant="h6">Rank</Typography>
            </Box>
            <Typography variant="h4" component="div" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              #{playerRank}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Charts and Lists */}
      <Grid container spacing={3}>
        {/* Charts */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Financial Overview
            </Typography>
            <Tabs
              value={chartTab}
              onChange={(e, newValue) => setChartTab(newValue)}
              sx={{ mb: 2 }}
            >
              <Tab label="Cash" />
              <Tab label="Valuation" />
              <Tab label="Users" />
            </Tabs>
            <Box sx={{ height: 350 }}>
              {renderChart()}
            </Box>
          </Paper>
        </Grid>
        
        {/* Company Rankings */}
        <Grid item xs={12} md={6} lg={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Top Companies
            </Typography>
            <List>
              {companyRanking.slice(0, 5).map((company) => (
                <ListItem
                  key={company.name}
                  divider
                  sx={{
                    backgroundColor: company.isPlayer ? 'rgba(63, 81, 181, 0.1)' : 'transparent',
                  }}
                >
                  <Typography variant="h6" sx={{ mr: 2, width: 30, textAlign: 'center' }}>
                    #{company.rank}
                  </Typography>
                  <ListItemText
                    primary={company.name}
                    secondary={`Valuation: $${company.valuation.toLocaleString()}`}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
        
        {/* Products Overview */}
        <Grid item xs={12} md={6} lg={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Products Overview
            </Typography>
            {activeProducts.length > 0 ? (
              <List>
                {activeProducts.slice(0, 5).map((product) => (
                  <ListItem key={product.id} divider>
                    <ListItemText
                      primary={product.name}
                      secondary={`Users: ${product.users.toLocaleString()} | Quality: ${product.quality.toFixed(1)}/10 | Market Share: ${product.marketSharePercentage.toFixed(1)}%`}
                    />
                  </ListItem>
                ))}
                {activeProducts.length > 5 && (
                  <Box sx={{ textAlign: 'center', mt: 1 }}>
                    <Button size="small">View All Products</Button>
                  </Box>
                )}
              </List>
            ) : (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body1" color="textSecondary">
                  You don't have any active products yet.
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary" 
                  sx={{ mt: 2 }}
                >
                  Develop Your First Product
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Market Events */}
        <Grid item xs={12} md={6} lg={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Active Market Events
            </Typography>
            {activeEvents.length > 0 ? (
              <List>
                {activeEvents.map((event) => (
                  <ListItem key={event.id} divider>
                    <ListItemText
                      primary={event.title}
                      secondary={event.description}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body1" color="textSecondary">
                  There are no active market events at this time.
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
