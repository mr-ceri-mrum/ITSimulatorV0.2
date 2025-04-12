import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Divider,
  Alert,
} from '@mui/material';
import { 
  Update as UpdateIcon,
  Delete as DeleteIcon,
  GetApp as DownloadIcon,
  TrendingUp as TrendingUpIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

import { 
  selectOwnedProducts, 
  updateProduct, 
  discontinueProduct,
  PRODUCT_TYPES,
} from '../../store/productsSlice';

const Products = () => {
  const dispatch = useDispatch();
  const products = useSelector(selectOwnedProducts);
  const [currentTab, setCurrentTab] = useState(0);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [updateType, setUpdateType] = useState('minor');

  const activeProducts = products.filter(p => p.status === 'active');
  const discontinuedProducts = products.filter(p => p.status === 'discontinued');

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleUpdateClick = (product) => {
    setSelectedProduct(product);
    setUpdateDialogOpen(true);
  };

  const handleUpdateProduct = () => {
    if (selectedProduct) {
      dispatch(updateProduct({
        id: selectedProduct.id,
        updateType: updateType,
      }));
    }
    setUpdateDialogOpen(false);
  };

  const handleDiscontinueProduct = (id) => {
    dispatch(discontinueProduct({ id }));
  };

  const getProductTypeInfo = (type) => {
    return PRODUCT_TYPES[type] || { name: 'Unknown', category: 'Unknown' };
  };

  const getQualityColor = (quality) => {
    if (quality >= 8) return 'success';
    if (quality >= 5) return 'primary';
    if (quality >= 3) return 'warning';
    return 'error';
  };

  const renderProductCards = (productList) => {
    if (productList.length === 0) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary">
            {currentTab === 0 ? 
              "You don't have any active products yet. Start developing your first product!" : 
              "You don't have any discontinued products."}
          </Typography>
        </Box>
      );
    }

    return (
      <Grid container spacing={3}>
        {productList.map((product) => {
          const productTypeInfo = getProductTypeInfo(product.type);
          const qualityColor = getQualityColor(product.quality);
          
          return (
            <Grid item xs={12} sm={6} md={4} key={product.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {product.name}
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Chip 
                      label={productTypeInfo.category} 
                      size="small" 
                      sx={{ mr: 1, mb: 1 }} 
                    />
                    <Chip 
                      label={productTypeInfo.name} 
                      size="small" 
                      sx={{ mb: 1 }}
                      variant="outlined" 
                    />
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Quality:
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={product.quality * 10} 
                      color={qualityColor}
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                    <Typography variant="body2" textAlign="right">
                      {product.quality.toFixed(1)}/10
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 1 }} />
                  
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2">
                      Users: {product.users.toLocaleString()}
                    </Typography>
                    <Typography variant="body2">
                      Market Share: {product.marketSharePercentage.toFixed(1)}%
                    </Typography>
                    <Typography variant="body2">
                      Monthly Revenue: ${(product.users * 12).toLocaleString()}
                    </Typography>
                  </Box>
                </CardContent>
                
                <CardActions>
                  <Button 
                    size="small" 
                    startIcon={<UpdateIcon />}
                    onClick={() => handleUpdateClick(product)}
                  >
                    Update
                  </Button>
                  
                  <Button 
                    size="small" 
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDiscontinueProduct(product.id)}
                  >
                    Discontinue
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    );
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Products Management
      </Typography>
      
      <Tabs value={currentTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label={`Active Products (${activeProducts.length})`} />
        <Tab label={`Discontinued Products (${discontinuedProducts.length})`} />
      </Tabs>
      
      {currentTab === 0 && renderProductCards(activeProducts)}
      {currentTab === 1 && renderProductCards(discontinuedProducts)}
      
      {/* Product Update Dialog */}
      <Dialog open={updateDialogOpen} onClose={() => setUpdateDialogOpen(false)}>
        <DialogTitle>Update Product</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" sx={{ mt: 1, mb: 2 }}>
            {selectedProduct?.name}
          </Typography>
          
          <Alert severity="info" sx={{ mb: 2 }}>
            Regular updates prevent quality degradation and can improve product performance.
          </Alert>
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Update Type</InputLabel>
            <Select
              value={updateType}
              onChange={(e) => setUpdateType(e.target.value)}
              label="Update Type"
            >
              <MenuItem value="maintenance">Maintenance Update (Maintain Quality)</MenuItem>
              <MenuItem value="minor">Minor Update (+1 Quality)</MenuItem>
              <MenuItem value="major">Major Update (+2 Quality)</MenuItem>
            </Select>
          </FormControl>
          
          <Typography variant="body2" color="textSecondary">
            Current Quality: {selectedProduct?.quality.toFixed(1)}/10
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUpdateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateProduct} variant="contained">Update Product</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Products;
