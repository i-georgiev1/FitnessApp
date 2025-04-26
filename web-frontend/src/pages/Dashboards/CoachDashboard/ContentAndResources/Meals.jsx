import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Grid,
    Card,
    CardContent,
    IconButton,
    MenuItem,
    Divider,
    Alert,
    Snackbar,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axiosInstance from '../../../../config/axios';
import { useParams } from 'react-router-dom';
import CoachSidebar from '../CoachSidebar';

const mealTypes = [
    'Breakfast',
    'Morning Snack',
    'Lunch',
    'Afternoon Snack',
    'Dinner',
    'Evening Snack'
];

const daysOfWeek = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
];

const Meals = () => {
    const { planId } = useParams();
    const [meals, setMeals] = useState([]);
    const [open, setOpen] = useState(false);
    const [editingMeal, setEditingMeal] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        calories: '',
        protein: '',
        carbs: '',
        fats: '',
        meal_type: '',
        ingredients: '',
        instructions: '',
        day_of_week: '',
        meal_time: ''
    });
    const [error, setError] = useState('');
    const [showError, setShowError] = useState(false);
    const [loading, setLoading] = useState(true);
    const [sidebarExpanded, setSidebarExpanded] = useState(true);

    useEffect(() => {
        fetchMeals();
    }, [planId]);

    const fetchMeals = async () => {
        try {
            const response = await axiosInstance.get(`/api/meal-plans/${planId}/meals`);
            setMeals(response.data);
        } catch (error) {
            console.error('Error fetching meals:', error);
        }
    };

    const handleOpen = (meal = null) => {
        if (meal) {
            setEditingMeal(meal);
            setFormData(meal);
        } else {
            setEditingMeal(null);
            setFormData({
                name: '',
                description: '',
                calories: '',
                protein: '',
                carbs: '',
                fats: '',
                meal_type: '',
                ingredients: '',
                instructions: '',
                day_of_week: '',
                meal_time: ''
            });
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setEditingMeal(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = () => {
        const requiredFields = ['name', 'meal_type', 'day_of_week'];
        const missingFields = requiredFields.filter(field => !formData[field]);

        if (missingFields.length > 0) {
            setError(`Please fill in the following required fields: ${missingFields.join(', ')}`);
            setShowError(true);
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        try {
            if (!validateForm()) {
                return;
            }

            // Format the data according to what the server expects
            const mealData = {
                meal_plan_id: planId,  // Make sure this is first
                name: formData.name.trim(),
                description: formData.description ? formData.description.trim() : '',
                meal_type: formData.meal_type,
                day_of_week: formData.day_of_week,
                meal_time: formData.meal_time || null,
                calories: formData.calories ? parseInt(formData.calories) : 0,
                protein: formData.protein ? parseInt(formData.protein) : 0,
                carbs: formData.carbs ? parseInt(formData.carbs) : 0,
                fats: formData.fats ? parseInt(formData.fats) : 0,
                ingredients: formData.ingredients ? formData.ingredients.trim() : '',
                instructions: formData.instructions ? formData.instructions.trim() : ''
            };

            console.log('Attempting to create meal with data:', JSON.stringify(mealData, null, 2));

            let response;
            if (editingMeal) {
                response = await axiosInstance.put(`/api/meal-plans/${planId}/meals/${editingMeal.id}`, mealData);
            } else {
                response = await axiosInstance.post(`/api/meal-plans/${planId}/meals`, mealData);
            }

            console.log('Server response:', response.data);

            await fetchMeals();
            handleClose();
            setError('');
            setShowError(false);
        } catch (error) {
            console.error('Error saving meal:', error);
            console.error('Error details:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });

            let errorMessage = 'Failed to save meal. ';
            if (error.response?.data?.error) {
                errorMessage += error.response.data.error;
            } else if (error.response?.data?.message) {
                errorMessage += error.response.data.message;
            } else if (error.message) {
                errorMessage += error.message;
            }

            setError(errorMessage);
            setShowError(true);
        }
    };

    const handleDelete = async (mealId) => {
        if (window.confirm('Are you sure you want to delete this meal?')) {
            try {
                await axiosInstance.delete(`/api/meal-plans/${planId}/meals/${mealId}`);
                fetchMeals();
            } catch (error) {
                console.error('Error deleting meal:', error);
            }
        }
    };

    return (
        <Box display="flex">
            <CoachSidebar expanded={sidebarExpanded} onToggle={(expanded) => setSidebarExpanded(expanded)} />
            <Box component="main" sx={{
                flexGrow: 1,
                p: 3,
                width: { sm: `calc(100% - ${sidebarExpanded ? '270px' : '65px'})` },
                ml: { sm: sidebarExpanded ? '270px' : '65px' },
                transition: theme => theme.transitions.create(['width', 'margin-left'], {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.enteringScreen,
                }),
            }}>
                <Snackbar
                    open={showError}
                    autoHideDuration={6000}
                    onClose={() => setShowError(false)}
                >
                    <Alert
                        onClose={() => setShowError(false)}
                        severity="error"
                        sx={{ width: '100%' }}
                    >
                        {error}
                    </Alert>
                </Snackbar>

                <Box sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                        <Typography variant="h4">Meals</Typography>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => handleOpen()}
                        >
                            Add Meal
                        </Button>
                    </Box>

                    <Grid container spacing={3}>
                        {meals.map((meal) => (
                            <Grid item xs={12} md={6} lg={4} key={meal.id}>
                                <Card>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                            <Typography variant="h6">{meal.name}</Typography>
                                            <Box>
                                                <IconButton onClick={() => handleOpen(meal)} size="small">
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton onClick={() => handleDelete(meal.id)} size="small">
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Box>
                                        </Box>
                                        <Typography color="textSecondary" gutterBottom>
                                            {meal.meal_type} - {meal.day_of_week}
                                        </Typography>
                                        <Divider sx={{ my: 1 }} />
                                        <Typography variant="body2" paragraph>
                                            {meal.description}
                                        </Typography>
                                        <Grid container spacing={1}>
                                            <Grid item xs={3}>
                                                <Typography variant="caption" display="block">Calories</Typography>
                                                <Typography variant="body2">{meal.calories}</Typography>
                                            </Grid>
                                            <Grid item xs={3}>
                                                <Typography variant="caption" display="block">Protein</Typography>
                                                <Typography variant="body2">{meal.protein}g</Typography>
                                            </Grid>
                                            <Grid item xs={3}>
                                                <Typography variant="caption" display="block">Carbs</Typography>
                                                <Typography variant="body2">{meal.carbs}g</Typography>
                                            </Grid>
                                            <Grid item xs={3}>
                                                <Typography variant="caption" display="block">Fats</Typography>
                                                <Typography variant="body2">{meal.fats}g</Typography>
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>

                    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
                        <DialogTitle>{editingMeal ? 'Edit Meal' : 'Add New Meal'}</DialogTitle>
                        <DialogContent>
                            <Grid container spacing={2} sx={{ mt: 1 }}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        name="name"
                                        label="Meal Name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        fullWidth
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        name="meal_type"
                                        label="Meal Type"
                                        value={formData.meal_type}
                                        onChange={handleInputChange}
                                        select
                                        fullWidth
                                        required
                                    >
                                        {mealTypes.map((type) => (
                                            <MenuItem key={type} value={type}>
                                                {type}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        name="day_of_week"
                                        label="Day of Week"
                                        value={formData.day_of_week}
                                        onChange={handleInputChange}
                                        select
                                        fullWidth
                                        required
                                    >
                                        {daysOfWeek.map((day) => (
                                            <MenuItem key={day} value={day}>
                                                {day}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        name="meal_time"
                                        label="Meal Time"
                                        type="time"
                                        value={formData.meal_time}
                                        onChange={handleInputChange}
                                        fullWidth
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        name="description"
                                        label="Description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        fullWidth
                                        multiline
                                        rows={2}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <TextField
                                        name="calories"
                                        label="Calories"
                                        type="number"
                                        value={formData.calories}
                                        onChange={handleInputChange}
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <TextField
                                        name="protein"
                                        label="Protein (g)"
                                        type="number"
                                        value={formData.protein}
                                        onChange={handleInputChange}
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <TextField
                                        name="carbs"
                                        label="Carbs (g)"
                                        type="number"
                                        value={formData.carbs}
                                        onChange={handleInputChange}
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <TextField
                                        name="fats"
                                        label="Fats (g)"
                                        type="number"
                                        value={formData.fats}
                                        onChange={handleInputChange}
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        name="ingredients"
                                        label="Ingredients"
                                        value={formData.ingredients}
                                        onChange={handleInputChange}
                                        fullWidth
                                        multiline
                                        rows={3}
                                        placeholder="Enter ingredients, one per line"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        name="instructions"
                                        label="Instructions"
                                        value={formData.instructions}
                                        onChange={handleInputChange}
                                        fullWidth
                                        multiline
                                        rows={3}
                                        placeholder="Enter preparation instructions"
                                    />
                                </Grid>
                            </Grid>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleClose}>Cancel</Button>
                            <Button onClick={handleSubmit} variant="contained" color="primary">
                                {editingMeal ? 'Save Changes' : 'Add Meal'}
                            </Button>
                        </DialogActions>
                    </Dialog>
                </Box>
            </Box>
        </Box>
    );
};

export default Meals;
