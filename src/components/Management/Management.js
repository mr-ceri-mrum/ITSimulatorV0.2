import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  TextField,
  Slider,
  InputAdornment,
  Card,
  CardContent,
  Divider,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tooltip,
} from '@mui/material';
import { 
  People as PeopleIcon,
  Storage as StorageIcon,
  Visibility as VisibilityIcon,
  MonetizationOn as MoneyIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

import { 
  selectCompanyCash, 
  selectEmployees, 
  selectServers, 
  selectMarketingBudget,
  selectTotalUsers,
  hireEmployees,
  fireEmployees,
  addServers,
  removeServers,
  setMarketingBudget,
} from '../../store/companySlice';

const Management = () => {
  const dispatch = useDispatch();
  const companyCash = useSelector(selectCompanyCash);
  const employees = useSelector(selectEmployees);
  const servers = useSelector(selectServers);
  const marketingBudget = useSelector(selectMarketingBudget);
  const totalUsers = useSelector(selectTotalUsers);
  
  // Local state for form inputs
  const [employeesToHire, setEmployeesToHire] = useState(10);
  const [employeesToFire, setEmployeesToFire] = useState(5);
  const [serversToAdd, setServersToAdd] = useState(100);
  const [serversToRemove, setServersToRemove] = useState(50);
  const [newMarketingBudget, setNewMarketingBudget] = useState(marketingBudget);
  
  // Helper calculations
  const employeeCost = employeesToHire * 17000; // $17,000 per employee
  const serverCost = serversToAdd * 10; // $10 per server
  const usersPerEmployee = 5000; // Each employee supports 5,000 users
  const usersPerServer = 100; // Each server supports 100 users
  
  const maxUsersByEmployees = employees * usersPerEmployee;
  const maxUsersByServers = servers * usersPerServer;
  const resourceConstraint = Math.min(maxUsersByEmployees, maxUsersByServers);
  
  const resourceUtilization = totalUsers > 0 ? (totalUsers / resourceConstraint) * 100 : 0;
  
  // Handle actions
  const handleHireEmployees = () => {
    if (employeesToHire > 0 && companyCash >= employeeCost) {
      dispatch(hireEmployees(employeesToHire));
      setEmployeesToHire(10); // Reset to default
    }
  };
  
  const handleFireEmployees = () => {
    if (employeesToFire > 0 && employees >= employeesToFire) {
      dispatch(fireEmployees(employeesToFire));
      setEmployeesToFire(5); // Reset to default
    }
  };
  
  const handleAddServers = () => {
    if (serversToAdd > 0 && companyCash >= serverCost) {
      dispatch(addServers(serversToAdd));
      setServersToAdd(100); // Reset to default
    }
  };
  
  const handleRemoveServers = () => {
    if (serversToRemove > 0 && servers >= serversToRemove) {
      dispatch(removeServers(serversToRemove));
      setServersToRemove(50); // Reset to default
    }
  };
  
  const handleUpdateMarketingBudget = () => {
    if (newMarketingBudget >= 0) {
      dispatch(setMarketingBudget(newMarketingBudget));
    }
  };
  
  // Helper to get utilization status text and color
  const getUtilizationStatus = (percentage) => {
    if (percentage >= 95) return { text: 'Critical', color: 'error.main' };
    if (percentage >= 80) return { text: 'High', color: 'warning.main' };
    if (percentage >= 50) return { text: 'Moderate', color: 'info.main' };
    return { text: 'Low', color: 'success.main' };
  };
  
  const utilizationStatus = getUtilizationStatus(resourceUtilization);
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Company Management
      </Typography>
      
      <Grid container spacing={3}>
        {/* Resource Overview */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Resource Overview
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <PeopleIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="h6">
                        Employees: {employees.toLocaleString()}
                      </Typography>
                    </Box>
                    <Typography variant="body2" gutterBottom>
                      Monthly Cost: ${(employees * 25000).toLocaleString()}/month
                    </Typography>
                    <Typography variant="body2">
                      Max Users Supported: {(employees * usersPerEmployee).toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <StorageIcon sx={{ mr: 1, color: 'secondary.main' }} />
                      <Typography variant="h6">
                        Servers: {servers.toLocaleString()}
                      </Typography>
                    </Box>
                    <Typography variant="body2" gutterBottom>
                      Monthly Cost: ${(servers * 10).toLocaleString()}/month
                    </Typography>
                    <Typography variant="body2">
                      Max Users Supported: {(servers * usersPerServer).toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <VisibilityIcon sx={{ mr: 1, color: 'success.main' }} />
                      <Typography variant="h6">
                        Marketing Budget: ${marketingBudget.toLocaleString()}/month
                      </Typography>
                    </Box>
                    <Typography variant="body2" gutterBottom>
                      Current Users: {totalUsers.toLocaleString()}
                    </Typography>
                    <Typography variant="body2">
                      Estimated Monthly Revenue: ${(totalUsers * 12).toLocaleString()}/month
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Resource Utilization: {Math.round(resourceUtilization)}% - 
                <span style={{ color: utilizationStatus.color }}>
                  {" " + utilizationStatus.text}
                </span>
              </Typography>
              
              {resourceUtilization >= 80 && (
                <Alert severity={resourceUtilization >= 95 ? "error" : "warning"} sx={{ mt: 1 }}>
                  Resource utilization is {utilizationStatus.text.toLowerCase()}! Users may experience degraded service quality. 
                  Consider hiring more employees or adding more servers.
                </Alert>
              )}
              
              {totalUsers > 0 && (
                <Alert severity="info" sx={{ mt: 1 }}>
                  <strong>Resource Breakdown:</strong>
                  <List dense>
                    <ListItem>
                      <ListItemText 
                        primary={`Employee Capacity: ${Math.round(totalUsers / maxUsersByEmployees * 100)}%`}
                        secondary={`Each employee supports up to 5,000 users`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary={`Server Capacity: ${Math.round(totalUsers / maxUsersByServers * 100)}%`}
                        secondary={`Each server supports up to 100 users`}
                      />
                    </ListItem>
                  </List>
                </Alert>
              )}
            </Box>
          </Paper>
        </Grid>
        
        {/* Employees Management */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Employees Management
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Hire New Employees
              </Typography>
              <TextField
                type="number"
                label="Number of Employees to Hire"
                value={employeesToHire}
                onChange={(e) => setEmployeesToHire(Math.max(1, parseInt(e.target.value) || 0))}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PeopleIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
                fullWidth
              />
              <Typography variant="body2" gutterBottom>
                Cost: ${employeeCost.toLocaleString()} (${17000.toLocaleString()} per employee)
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={handleHireEmployees}
                disabled={companyCash < employeeCost}
                sx={{ mt: 1 }}
              >
                Hire Employees
              </Button>
              
              {companyCash < employeeCost && (
                <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                  Insufficient funds to hire employees.
                </Typography>
              )}
            </Box>
            
            <Divider sx={{ my: 3 }} />
            
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Reduce Workforce
              </Typography>
              <TextField
                type="number"
                label="Number of Employees to Let Go"
                value={employeesToFire}
                onChange={(e) => setEmployeesToFire(Math.max(1, parseInt(e.target.value) || 0))}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PeopleIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
                fullWidth
              />
              <Typography variant="body2" gutterBottom>
                Monthly Savings: ${(employeesToFire * 25000).toLocaleString()}
              </Typography>
              <Button 
                variant="outlined" 
                color="error"
                startIcon={<RemoveIcon />}
                onClick={handleFireEmployees}
                disabled={employees < employeesToFire}
                sx={{ mt: 1 }}
              >
                Let Go Employees
              </Button>
              
              {employees < employeesToFire && (
                <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                  You don't have that many employees.
                </Typography>
              )}
              
              {employeesToFire > 0 && totalUsers > (employees - employeesToFire) * usersPerEmployee && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    Warning: Reducing your workforce will result in degraded service quality for your users because you won't have enough employees to support your user base!
                  </Typography>
                </Alert>
              )}
            </Box>
          </Paper>
        </Grid>
        
        {/* Servers Management */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Infrastructure Management
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Add Servers
              </Typography>
              <TextField
                type="number"
                label="Number of Servers to Add"
                value={serversToAdd}
                onChange={(e) => setServersToAdd(Math.max(1, parseInt(e.target.value) || 0))}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <StorageIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
                fullWidth
              />
              <Typography variant="body2" gutterBottom>
                Cost: ${serverCost.toLocaleString()} (${10} per server)
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={handleAddServers}
                disabled={companyCash < serverCost}
                sx={{ mt: 1 }}
              >
                Add Servers
              </Button>
              
              {companyCash < serverCost && (
                <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                  Insufficient funds to add servers.
                </Typography>
              )}
            </Box>
            
            <Divider sx={{ my: 3 }} />
            
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Remove Servers
              </Typography>
              <TextField
                type="number"
                label="Number of Servers to Remove"
                value={serversToRemove}
                onChange={(e) => setServersToRemove(Math.max(1, parseInt(e.target.value) || 0))}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <StorageIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
                fullWidth
              />
              <Typography variant="body2" gutterBottom>
                Monthly Savings: ${(serversToRemove * 10).toLocaleString()}
              </Typography>
              <Button 
                variant="outlined" 
                color="error"
                startIcon={<RemoveIcon />}
                onClick={handleRemoveServers}
                disabled={servers < serversToRemove}
                sx={{ mt: 1 }}
              >
                Remove Servers
              </Button>
              
              {servers < serversToRemove && (
                <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                  You don't have that many servers.
                </Typography>
              )}
              
              {serversToRemove > 0 && totalUsers > (servers - serversToRemove) * usersPerServer && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    Warning: Reducing your server count will result in degraded service quality for your users because you won't have enough infrastructure to support your user base!
                  </Typography>
                </Alert>
              )}
            </Box>
          </Paper>
        </Grid>
        
        {/* Marketing Budget */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Marketing Budget
            </Typography>
            
            <Typography variant="body2" sx={{ mb: 3 }}>
              Set your monthly marketing budget to attract new users. Higher marketing budgets can accelerate user growth, but the effectiveness diminishes as markets saturate.
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography gutterBottom>
                Budget: ${newMarketingBudget.toLocaleString()}/month
              </Typography>
              <Slider
                value={newMarketingBudget}
                min={0}
                max={Math.max(1000000, companyCash * 0.5)}
                step={10000}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `$${value.toLocaleString()}`}
                onChange={(_, value) => setNewMarketingBudget(value)}
                sx={{ mb: 2 }}
              />
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  type="number"
                  label="Custom Budget"
                  value={newMarketingBudget}
                  onChange={(e) => setNewMarketingBudget(Math.max(0, parseInt(e.target.value) || 0))}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <MoneyIcon />
                      </InputAdornment>
                    ),
                  }}
                />
                
                <Button 
                  variant="contained" 
                  onClick={handleUpdateMarketingBudget}
                >
                  Update Budget
                </Button>
              </Box>
            </Box>
            
            <Alert severity="info">
              <Typography variant="body2">
                Your marketing budget affects user acquisition rates. The cost to acquire new users increases as markets become saturated.
                Higher quality products also benefit more from marketing investment.
              </Typography>
            </Alert>
            
            {newMarketingBudget > companyCash * 0.3 && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  Your marketing budget is more than 30% of your available cash. This may lead to cash flow issues if your revenue doesn't increase accordingly.
                </Typography>
              </Alert>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Management;
