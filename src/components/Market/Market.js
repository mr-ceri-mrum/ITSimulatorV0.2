import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  LinearProgress,
  Tooltip,
  IconButton,
} from '@mui/material';
import { 
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Business as BusinessIcon,
  Search as SearchIcon,
  Info as InfoIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  ShoppingCart as ShoppingCartIcon,
} from '@mui/icons-material';

import { 
  selectCompanies, 
  selectMarketSizes, 
  selectMarketTrends, 
  selectActiveEvents, 
  selectTopCompanies,
} from '../../store/marketSlice';
import {
  acquireProduct,
  PRODUCT_CATEGORIES,
  PRODUCT_TYPES,
} from '../../store/productsSlice';
import {
  selectCompanyCash,
  selectCompanyValuation,
} from '../../store/companySlice';
import { selectCurrentDate } from '../../store/timeSlice';

const Market = () => {
  const dispatch = useDispatch();
  const companies = useSelector(selectCompanies);
  const marketSizes = useSelector(selectMarketSizes);
  const marketTrends = useSelector(selectMarketTrends);
  const activeEvents = useSelector(state => selectActiveEvents(state, state.time.currentDate));
  const topCompanies = useSelector(state => selectTopCompanies(state, 20));
  const companyCash = useSelector(selectCompanyCash);
  const companyValuation = useSelector(selectCompanyValuation);
  const currentDate = useSelector(selectCurrentDate);
  
  // Local state
  const [currentTab, setCurrentTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('valuation');
  const [sortDirection, setSortDirection] = useState('desc');
  const [companyDialogOpen, setCompanyDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [acquireDialogOpen, setAcquireDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };
  
  // Handle sort change
  const handleSortChange = (column) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('desc');
    }
  };
  
  // Handle company click
  const handleCompanyClick = (company) => {
    setSelectedCompany(company);
    setCompanyDialogOpen(true);
  };
  
  // Handle product acquisition click
  const handleAcquireClick = (product, company) => {
    setSelectedProduct({
      ...product,
      companyName: company.name,
      acquisitionCost: calculateProductCost(product, company)
    });
    setAcquireDialogOpen(true);
  };
  
  // Handle acquire confirmation
  const handleAcquireConfirm = () => {
    if (selectedProduct) {
      dispatch(acquireProduct({
        product: selectedProduct,
        cost: selectedProduct.acquisitionCost
      }));
      setAcquireDialogOpen(false);
    }
  };
  
  // Calculate cost to acquire a product
  const calculateProductCost = (product, company) => {
    // Base cost is 2x the estimated value of the product
    const userValue = product.users * 50; // $50 per user
    const qualityMultiplier = (product.quality / 10) * 1.5; // Quality affects price
    
    return Math.round(userValue * qualityMultiplier);
  };
  
  // Filter and sort companies
  const getFilteredCompanies = () => {
    let filtered = companies;
    
    // Apply search filter
    if (searchTerm) {
      const lowercaseSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(company => 
        company.name.toLowerCase().includes(lowercaseSearch) ||
        company.products.some(p => p.name.toLowerCase().includes(lowercaseSearch))
      );
    }
    
    // Sort results
    filtered = [...filtered].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'valuation':
          comparison = a.valuation - b.valuation;
          break;
        case 'users':
          comparison = a.totalUsers - b.totalUsers;
          break;
        case 'products':
          comparison = a.products.length - b.products.length;
          break;
        default:
          comparison = a.valuation - b.valuation;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    return filtered;
  };
  
  // Helper to get growth icon based on trend
  const getGrowthIcon = (trend) => {
    if (trend > 1.05) {
      return <TrendingUpIcon sx={{ color: 'success.main' }} />;
    } else if (trend < 0.95) {
      return <TrendingDownIcon sx={{ color: 'error.main' }} />;
    }
    return null;
  };
  
  // Get buyable products (companies with lower valuation than player)
  const getBuyableProducts = () => {
    return companies
      .filter(company => company.valuation < companyCash * 2) // Companies we could afford to buy products from
      .flatMap(company => 
        company.products.map(product => ({
          ...product,
          companyName: company.name,
          companyCash: company.cash,
          companyValuation: company.valuation,
          acquisitionCost: calculateProductCost(product, company),
        }))
      )
      .filter(product => product.acquisitionCost < companyCash);
  };
  
  // Render the Market Analysis tab
  const renderMarketAnalysis = () => {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Market Analysis
        </Typography>
        
        <Grid container spacing={3}>
          {/* Market Events */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Active Market Events
              </Typography>
              
              {activeEvents.length > 0 ? (
                <List>
                  {activeEvents.map(event => (
                    <ListItem key={event.id}>
                      <ListItemText
                        primary={event.title}
                        secondary={event.description}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="textSecondary">
                  No active market events at this time.
                </Typography>
              )}
            </Paper>
          </Grid>
          
          {/* Market Sizes */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Market Sizes
              </Typography>
              
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Category</TableCell>
                      <TableCell align="right">Current Users</TableCell>
                      <TableCell align="right">Growth Trend</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(marketSizes).map(([category, size]) => (
                      <TableRow key={category}>
                        <TableCell>{category}</TableCell>
                        <TableCell align="right">{size.toLocaleString()}</TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                            {getGrowthIcon(marketTrends[category] || 1)}
                            <Typography variant="body2" sx={{ ml: 1 }}>
                              {((marketTrends[category] || 1) * 100 - 100).toFixed(1)}%
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
          
          {/* Top Companies */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Top Companies by Valuation
              </Typography>
              
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Rank</TableCell>
                      <TableCell>Company</TableCell>
                      <TableCell align="right">Valuation</TableCell>
                      <TableCell align="right">Users</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {topCompanies.slice(0, 10).map((company, index) => (
                      <TableRow 
                        key={company.id}
                        hover
                        onClick={() => handleCompanyClick(company)}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{company.name}</TableCell>
                        <TableCell align="right">${company.valuation.toLocaleString()}</TableCell>
                        <TableCell align="right">{company.totalUsers.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    );
  };
  
  // Render the Companies tab
  const renderCompanies = () => {
    const filteredCompanies = getFilteredCompanies();
    
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Companies
        </Typography>
        
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <TextField
              label="Search Companies"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ flexGrow: 1, mr: 2 }}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />,
              }}
            />
          </Box>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell 
                    onClick={() => handleSortChange('name')}
                    sx={{ cursor: 'pointer' }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      Company Name
                      {sortBy === 'name' && (
                        sortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell 
                    align="right"
                    onClick={() => handleSortChange('valuation')}
                    sx={{ cursor: 'pointer' }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                      Valuation
                      {sortBy === 'valuation' && (
                        sortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell 
                    align="right"
                    onClick={() => handleSortChange('users')}
                    sx={{ cursor: 'pointer' }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                      Users
                      {sortBy === 'users' && (
                        sortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell 
                    align="right"
                    onClick={() => handleSortChange('products')}
                    sx={{ cursor: 'pointer' }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                      Products
                      {sortBy === 'products' && (
                        sortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCompanies.slice(0, 20).map((company) => (
                  <TableRow key={company.id} hover>
                    <TableCell>{company.name}</TableCell>
                    <TableCell align="right">${company.valuation.toLocaleString()}</TableCell>
                    <TableCell align="right">{company.totalUsers.toLocaleString()}</TableCell>
                    <TableCell align="right">{company.products.length}</TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleCompanyClick(company)}
                      >
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          <Typography variant="body2" sx={{ mt: 2, textAlign: 'right' }}>
            Showing {Math.min(20, filteredCompanies.length)} of {filteredCompanies.length} companies
          </Typography>
        </Paper>
      </Box>
    );
  };
  
  // Render the Products tab
  const renderProducts = () => {
    const buyableProducts = getBuyableProducts();
    
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Acquirable Products
        </Typography>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          These are products you can acquire from other companies to expand your portfolio.
          Products are priced based on their user base, quality, and market position.
        </Alert>
        
        <Grid container spacing={3}>
          {buyableProducts.length > 0 ? (
            buyableProducts.map((product) => (
              <Grid item xs={12} sm={6} md={4} key={product.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">{product.name}</Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Owned by: {product.companyName}
                    </Typography>
                    
                    <Divider sx={{ my: 1 }} />
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" gutterBottom>
                        <strong>Type:</strong> {PRODUCT_TYPES[product.type]?.name || 'Unknown'}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        <strong>Category:</strong> {PRODUCT_TYPES[product.type]?.category || 'Unknown'}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        <strong>Users:</strong> {product.users.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        <strong>Market Share:</strong> {product.marketSharePercentage.toFixed(1)}%
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        <strong>Quality:</strong> {product.quality.toFixed(1)}/10
                      </Typography>
                    </Box>
                    
                    <Typography variant="subtitle1" color="primary">
                      Acquisition Cost: ${product.acquisitionCost.toLocaleString()}
                    </Typography>
                  </CardContent>
                  
                  <CardActions>
                    <Button 
                      size="small"
                      variant="contained"
                      startIcon={<ShoppingCartIcon />}
                      onClick={() => handleAcquireClick(product, { name: product.companyName })}
                      disabled={product.acquisitionCost > companyCash}
                    >
                      Acquire Product
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Alert severity="warning">
                No acquirable products found. Either you don't have enough cash or there are no suitable products on the market.
              </Alert>
            </Grid>
          )}
        </Grid>
      </Box>
    );
  };
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Market
      </Typography>
      
      <Tabs value={currentTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Market Analysis" />
        <Tab label="Companies" />
        <Tab label="Acquirable Products" />
      </Tabs>
      
      {currentTab === 0 && renderMarketAnalysis()}
      {currentTab === 1 && renderCompanies()}
      {currentTab === 2 && renderProducts()}
      
      {/* Company Details Dialog */}
      <Dialog
        open={companyDialogOpen}
        onClose={() => setCompanyDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedCompany && (
          <>
            <DialogTitle>
              {selectedCompany.name}
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Company Information
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText 
                        primary="Valuation" 
                        secondary={`$${selectedCompany.valuation.toLocaleString()}`} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Total Users" 
                        secondary={selectedCompany.totalUsers.toLocaleString()} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Founded" 
                        secondary={new Date(selectedCompany.foundedDate).toLocaleDateString()} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Products" 
                        secondary={`${selectedCompany.products.length} products`} 
                      />
                    </ListItem>
                  </List>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Products
                  </Typography>
                  {selectedCompany.products.length > 0 ? (
                    <List>
                      {selectedCompany.products.map(product => (
                        <ListItem key={product.id}>
                          <ListItemText 
                            primary={product.name} 
                            secondary={
                              <>
                                <Typography variant="body2">
                                  {PRODUCT_TYPES[product.type]?.name || 'Unknown'} | Quality: {product.quality.toFixed(1)}/10
                                </Typography>
                                <Typography variant="body2">
                                  Users: {product.users.toLocaleString()} | Market Share: {product.marketSharePercentage.toFixed(1)}%
                                </Typography>
                              </>
                            } 
                          />
                          <Button 
                            size="small"
                            variant="outlined"
                            onClick={() => {
                              setCompanyDialogOpen(false);
                              handleAcquireClick(product, selectedCompany);
                            }}
                          >
                            Acquire
                          </Button>
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      This company has no products.
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setCompanyDialogOpen(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      
      {/* Acquire Product Dialog */}
      <Dialog
        open={acquireDialogOpen}
        onClose={() => setAcquireDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        {selectedProduct && (
          <>
            <DialogTitle>
              Acquire Product
            </DialogTitle>
            <DialogContent dividers>
              <Typography variant="h6" gutterBottom>
                {selectedProduct.name}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                from {selectedProduct.companyName}
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemText 
                    primary="Product Type" 
                    secondary={PRODUCT_TYPES[selectedProduct.type]?.name || 'Unknown'} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Category" 
                    secondary={PRODUCT_TYPES[selectedProduct.type]?.category || 'Unknown'} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Users" 
                    secondary={selectedProduct.users.toLocaleString()} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Quality" 
                    secondary={`${selectedProduct.quality.toFixed(1)}/10`} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Market Share" 
                    secondary={`${selectedProduct.marketSharePercentage.toFixed(1)}%`} 
                  />
                </ListItem>
              </List>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6" color="primary" gutterBottom>
                Acquisition Cost: ${selectedProduct.acquisitionCost.toLocaleString()}
              </Typography>
              
              <Typography variant="body2" gutterBottom>
                Your Cash: ${companyCash.toLocaleString()}
              </Typography>
              
              {companyCash < selectedProduct.acquisitionCost && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  You don't have enough cash for this acquisition.
                </Alert>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setAcquireDialogOpen(false)}>Cancel</Button>
              <Button 
                onClick={handleAcquireConfirm}
                variant="contained"
                disabled={companyCash < selectedProduct.acquisitionCost}
              >
                Confirm Acquisition
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default Market;
