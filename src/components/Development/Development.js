import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Stepper,
  Step,
  StepLabel,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Paper,
  Alert,
  AlertTitle,
  Chip,
  LinearProgress,
  Divider,
  Tooltip,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { 
  Code as CodeIcon,
  DesignServices as DesignIcon,
  Storage as StorageIcon,
  Memory as AIIcon,
  ViewModule as DatabaseIcon,
  Launch as LaunchIcon,
  Info as InfoIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';

import { 
  PRODUCT_CATEGORIES, 
  PRODUCT_TYPES, 
  selectProductsInDevelopment, 
  startDevelopingProduct, 
  updateDevelopmentProgress, 
  updateResourceAllocation, 
  launchProduct 
} from '../../store/productsSlice';

const Development = () => {
  const dispatch = useDispatch();
  const productsInDevelopment = useSelector(selectProductsInDevelopment);
  
  // New Product Form State
  const [activeStep, setActiveStep] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [productName, setProductName] = useState('');
  const [resourceAllocation, setResourceAllocation] = useState({
    backend: 20,
    frontend: 20,
    infrastructure: 20,
    ai: 20,
    database: 20,
  });
  
  const steps = ['Select Category', 'Select Product Type', 'Name Your Product', 'Allocate Resources'];
  
  // Reset form when going back to step 0
  useEffect(() => {
    if (activeStep === 0) {
      setSelectedCategory('');
      setSelectedType('');
      setProductName('');
      setResourceAllocation({
        backend: 20,
        frontend: 20,
        infrastructure: 20,
        ai: 20,
        database: 20,
      });
    }
  }, [activeStep]);
  
  // Helper to get available product types for selected category
  const getProductTypesForCategory = () => {
    if (!selectedCategory) return [];
    
    return Object.entries(PRODUCT_TYPES)
      .filter(([_, typeInfo]) => typeInfo.category === selectedCategory)
      .map(([type, typeInfo]) => ({
        type,
        ...typeInfo
      }));
  };
  
  // Handle resource allocation sliders
  const handleResourceChange = (resource, value) => {
    // Calculate remaining points to distribute
    const currentTotal = Object.values(resourceAllocation).reduce((sum, val) => sum + val, 0);
    const currentValue = resourceAllocation[resource];
    const difference = value - currentValue;
    
    // If increasing one resource, decrease others proportionally
    if (difference > 0) {
      const otherResources = Object.keys(resourceAllocation).filter(r => r !== resource);
      const totalOtherResources = otherResources.reduce((sum, r) => sum + resourceAllocation[r], 0);
      
      if (totalOtherResources > 0) {
        const newAllocation = { ...resourceAllocation, [resource]: value };
        
        otherResources.forEach(r => {
          const proportion = resourceAllocation[r] / totalOtherResources;
          newAllocation[r] = Math.max(0, Math.floor(resourceAllocation[r] - difference * proportion));
        });
        
        // Adjust to ensure total is exactly 100
        const newTotal = Object.values(newAllocation).reduce((sum, val) => sum + val, 0);
        if (newTotal !== 100) {
          const lastResource = otherResources[otherResources.length - 1];
          newAllocation[lastResource] += (100 - newTotal);
        }
        
        setResourceAllocation(newAllocation);
      }
    } else {
      // If decreasing, just update the value
      setResourceAllocation({
        ...resourceAllocation,
        [resource]: value
      });
    }
  };
  
  // Start developing a new product
  const handleStartDevelopment = () => {
    dispatch(startDevelopingProduct({
      productType: selectedType,
      name: productName,
      resourceAllocation,
    }));
    
    // Reset form and go back to first step
    setActiveStep(0);
  };
  
  // Advance development progress manually (in real game this would happen automatically)
  const handleAdvanceDevelopment = (id) => {
    dispatch(updateDevelopmentProgress({
      id,
      progress: 10, // Advance by 10% for demo purposes
    }));
  };
  
  // Launch a completed product
  const handleLaunchProduct = (id) => {
    dispatch(launchProduct({ id }));
  };
  
  // Get ideal resource allocation for a product type
  const getIdealResourceAllocation = (type) => {
    if (!type) return null;
    return PRODUCT_TYPES[type]?.idealResourceDistribution || null;
  };
  
  // Calculate match score between current and ideal allocation
  const calculateMatchScore = (current, ideal) => {
    if (!ideal) return 'N/A';
    
    let totalDifference = 0;
    for (const resource in ideal) {
      const difference = Math.abs((current[resource] || 0) - ideal[resource]);
      totalDifference += difference;
    }
    
    // Convert to a 1-10 score (lower difference = higher score)
    const score = Math.max(1, 10 - Math.floor(totalDifference / 10));
    return score;
  };
  
  // Render different steps of the new product form
  const renderStep = () => {
    switch (activeStep) {
      case 0: // Select Category
        return (
          <FormControl fullWidth>
            <InputLabel>Product Category</InputLabel>
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              label="Product Category"
            >
              {Object.values(PRODUCT_CATEGORIES).map((category) => (
                <MenuItem key={category} value={category}>{category}</MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      
      case 1: // Select Product Type
        return (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Select a product type from {selectedCategory}:
            </Typography>
            
            <Grid container spacing={2}>
              {getProductTypesForCategory().map((productType) => (
                <Grid item xs={12} md={6} key={productType.type}>
                  <Card 
                    variant={selectedType === productType.type ? "outlined" : "elevation"}
                    sx={{ 
                      cursor: 'pointer',
                      border: selectedType === productType.type ? '2px solid #3f51b5' : 'none',
                    }}
                    onClick={() => setSelectedType(productType.type)}
                  >
                    <CardContent>
                      <Typography variant="h6">{productType.name}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {productType.description}
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <Chip 
                          size="small" 
                          label={`Competitiveness: ${productType.competitiveness}`} 
                          sx={{ mr: 1, mb: 1 }}
                        />
                        <Chip 
                          size="small" 
                          label={`Max Market: ${(productType.maxMarketSize / 1000000000).toFixed(1)}B users`}
                          sx={{ mb: 1 }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        );
      
      case 2: // Name Your Product
        return (
          <TextField
            fullWidth
            label="Product Name"
            variant="outlined"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            helperText="Choose a memorable name for your product"
          />
        );
      
      case 3: // Allocate Resources
        const idealAllocation = getIdealResourceAllocation(selectedType);
        const matchScore = calculateMatchScore(resourceAllocation, idealAllocation);
        
        return (
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              <AlertTitle>Resource Allocation</AlertTitle>
              Allocate development resources across different areas. The better your allocation matches the ideal distribution for this product type, the higher quality your product will be at launch.
            </Alert>
            
            <Grid container spacing={4}>
              <Grid item xs={12} md={7}>
                <Typography variant="subtitle1" gutterBottom>
                  Allocate 100 resource points:
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CodeIcon sx={{ mr: 1 }} />
                    <Typography variant="body1">Backend: {resourceAllocation.backend}%</Typography>
                  </Box>
                  <Slider
                    value={resourceAllocation.backend}
                    onChange={(_, value) => handleResourceChange('backend', value)}
                    min={0}
                    max={100}
                  />
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <DesignIcon sx={{ mr: 1 }} />
                    <Typography variant="body1">Frontend: {resourceAllocation.frontend}%</Typography>
                  </Box>
                  <Slider
                    value={resourceAllocation.frontend}
                    onChange={(_, value) => handleResourceChange('frontend', value)}
                    min={0}
                    max={100}
                  />
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <StorageIcon sx={{ mr: 1 }} />
                    <Typography variant="body1">Infrastructure: {resourceAllocation.infrastructure}%</Typography>
                  </Box>
                  <Slider
                    value={resourceAllocation.infrastructure}
                    onChange={(_, value) => handleResourceChange('infrastructure', value)}
                    min={0}
                    max={100}
                  />
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AIIcon sx={{ mr: 1 }} />
                    <Typography variant="body1">AI: {resourceAllocation.ai}%</Typography>
                  </Box>
                  <Slider
                    value={resourceAllocation.ai}
                    onChange={(_, value) => handleResourceChange('ai', value)}
                    min={0}
                    max={100}
                  />
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <DatabaseIcon sx={{ mr: 1 }} />
                    <Typography variant="body1">Database: {resourceAllocation.database}%</Typography>
                  </Box>
                  <Slider
                    value={resourceAllocation.database}
                    onChange={(_, value) => handleResourceChange('database', value)}
                    min={0}
                    max={100}
                  />
                </Box>
                
                <Typography variant="subtitle2" color="textSecondary">
                  Total: {Object.values(resourceAllocation).reduce((sum, val) => sum + val, 0)}%
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={5}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Allocation Analysis
                  </Typography>
                  
                  {idealAllocation && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Ideal allocation for {PRODUCT_TYPES[selectedType].name}:
                      </Typography>
                      
                      <List dense>
                        {Object.entries(idealAllocation).map(([resource, value]) => (
                          <ListItem key={resource}>
                            <ListItemText 
                              primary={`${resource.charAt(0).toUpperCase() + resource.slice(1)}: ${value}%`}
                              secondary={`Your allocation: ${resourceAllocation[resource]}%`}
                            />
                          </ListItem>
                        ))}
                      </List>
                      
                      <Divider sx={{ my: 2 }} />
                      
                      <Typography variant="subtitle2" gutterBottom>
                        Match Score: {matchScore}/10
                      </Typography>
                      
                      <LinearProgress 
                        variant="determinate" 
                        value={matchScore * 10} 
                        color={matchScore >= 8 ? "success" : matchScore >= 5 ? "primary" : "warning"}
                        sx={{ height: 10, borderRadius: 5 }}
                      />
                      
                      <Typography variant="body2" sx={{ mt: 2 }}>
                        A higher match score will result in better product quality at launch.
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </Box>
        );
      
      default:
        return null;
    }
  };
  
  // Render products currently in development
  const renderProductsInDevelopment = () => {
    if (productsInDevelopment.length === 0) {
      return (
        <Alert severity="info" sx={{ mt: 3 }}>
          No products currently in development. Start a new project!
        </Alert>
      );
    }
    
    return (
      <Grid container spacing={3} sx={{ mt: 1 }}>
        {productsInDevelopment.map((product) => (
          <Grid item xs={12} md={6} key={product.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{product.name}</Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  {PRODUCT_TYPES[product.type]?.name} ({PRODUCT_TYPES[product.type]?.category})
                </Typography>
                
                <Box sx={{ mt: 2, mb: 1 }}>
                  <Typography variant="body2" gutterBottom>
                    Development Progress: {product.developmentProgress}%
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={product.developmentProgress} 
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                </Box>
                
                <Typography variant="body2" sx={{ mt: 2 }}>
                  Resource Allocation:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                  <Chip size="small" label={`Backend: ${product.resourceAllocation.backend}%`} />
                  <Chip size="small" label={`Frontend: ${product.resourceAllocation.frontend}%`} />
                  <Chip size="small" label={`Infrastructure: ${product.resourceAllocation.infrastructure}%`} />
                  <Chip size="small" label={`AI: ${product.resourceAllocation.ai}%`} />
                  <Chip size="small" label={`Database: ${product.resourceAllocation.database}%`} />
                </Box>
              </CardContent>
              
              <CardActions>
                {product.developmentProgress < 100 ? (
                  <Button 
                    size="small" 
                    onClick={() => handleAdvanceDevelopment(product.id)}
                  >
                    Continue Development
                  </Button>
                ) : (
                  <Button 
                    size="small" 
                    variant="contained" 
                    color="success"
                    startIcon={<LaunchIcon />}
                    onClick={() => handleLaunchProduct(product.id)}
                  >
                    Launch Product
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Product Development
      </Typography>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Start a New Project
        </Typography>
        
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        <Box sx={{ mt: 3, mb: 3 }}>
          {renderStep()}
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            disabled={activeStep === 0}
            onClick={() => setActiveStep((prevStep) => prevStep - 1)}
          >
            Back
          </Button>
          
          {activeStep === steps.length - 1 ? (
            <Button 
              variant="contained" 
              onClick={handleStartDevelopment}
              disabled={!productName || Object.values(resourceAllocation).reduce((sum, val) => sum + val, 0) !== 100}
            >
              Start Development
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={() => setActiveStep((prevStep) => prevStep + 1)}
              disabled={
                (activeStep === 0 && !selectedCategory) ||
                (activeStep === 1 && !selectedType) ||
                (activeStep === 2 && !productName.trim())
              }
            >
              Next
            </Button>
          )}
        </Box>
      </Paper>
      
      <Typography variant="h5" gutterBottom>
        Products in Development
      </Typography>
      {renderProductsInDevelopment()}
    </Box>
  );
};

export default Development;
