import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    CardActions,
    Grid,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    CircularProgress,
    Alert,
    Switch,
    FormControlLabel,
    Chip,
    Stack
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../../config/axios';
import CoachSidebar from '../CoachSidebar';

const MealPlans = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [mealPlans, setMealPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [useAI, setUseAI] = useState(false);
    const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
    const [filters, setFilters] = useState({
        dietaryPreference: 'all',
        calorieRange: 'all',
        mealType: 'all'
    });
    const [newPlan, setNewPlan] = useState({
        name: '',
        description: '',
        total_calories: '',
        total_protein: '',
        total_carbs: '',
        total_fats: '',
        dietary_preferences: '',
        meals: []
    });
    const [sidebarExpanded, setSidebarExpanded] = useState(true);

    const dietaryPreferenceOptions = [
        'None', 'Vegan', 'Vegetarian', 'Keto', 'Paleo',
        'Gluten-Free', 'Low-Carb', 'Mediterranean', 'Dairy-Free'
    ];

    const calorieRangeOptions = [
        '0-500', '500-1000', '1000-1500', '1500-2000',
        '2000-2500', '2500-3000', '3000+'
    ];

    const mealTypeOptions = [
        'Breakfast', 'Lunch', 'Dinner', 'Snack',
        'Pre-Workout', 'Post-Workout', 'All-Day'
    ];

    useEffect(() => {
        fetchMealPlans();
    }, []);

    const fetchMealPlans = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/api/meal-plans');
            setMealPlans(response.data);
            setError('');
        } catch (error) {
            console.error('Error fetching meal plans:', error);
            setError(t('Failed to load meal plans'));
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePlan = async () => {
        try {
            setLoading(true);
            if (useAI) {
                setIsGeneratingPlan(true);
            }
            const planData = {
                ...newPlan,
                is_ai_generated: useAI
            };

            const config = {
                timeout: useAI ? 60000 : 10000
            };

            await axiosInstance.post('/api/meal-plans', planData, config);
            setCreateDialogOpen(false);
            setNewPlan({
                name: '',
                description: '',
                total_calories: '',
                total_protein: '',
                total_carbs: '',
                total_fats: '',
                dietary_preferences: '',
                meals: []
            });
            fetchMealPlans();
        } catch (error) {
            console.error('Error creating meal plan:', error);
            setError(t('Failed to create meal plan'));
        } finally {
            setLoading(false);
            setIsGeneratingPlan(false);
        }
    };

    const handleEditClick = (plan) => {
        setSelectedPlan(plan);
        setEditDialogOpen(true);
    };

    const handleEditPlan = async () => {
        try {
            if (useAI) {
                setLoading(true);
                const aiResponse = await axiosInstance.post('/api/meal-plans/enhance', {
                    plan_id: selectedPlan.id,
                    dietary_preferences: selectedPlan.dietary_preferences,
                    total_calories: selectedPlan.total_calories,
                    total_protein: selectedPlan.total_protein,
                    total_carbs: selectedPlan.total_carbs,
                    total_fats: selectedPlan.total_fats
                });

                const enhancedPlan = {
                    ...selectedPlan,
                    meals: aiResponse.data.meals
                };

                await axiosInstance.put(`/api/meal-plans/${selectedPlan.id}`, enhancedPlan);
            } else {
                await axiosInstance.put(`/api/meal-plans/${selectedPlan.id}`, selectedPlan);
            }

            setEditDialogOpen(false);
            setSelectedPlan(null);
            fetchMealPlans();
        } catch (error) {
            console.error('Error updating meal plan:', error);
            setError(t('Failed to update meal plan'));
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (plan) => {
        setSelectedPlan(plan);
        setDeleteDialogOpen(true);
    };

    const handleDeletePlan = async () => {
        try {
            await axiosInstance.delete(`/api/meal-plans/${selectedPlan.id}`);
            setDeleteDialogOpen(false);
            setSelectedPlan(null);
            fetchMealPlans();
        } catch (error) {
            console.error('Error deleting meal plan:', error);
            setError(t('Failed to delete meal plan'));
        }
    };

    const handleViewDetails = (plan) => {
        navigate(`/coach/meal-plans/${plan.id}/meals`);
    };

    if (loading) {
        return (
            <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
                {isGeneratingPlan && (
                    <Typography variant="h6" sx={{ mt: 2, textAlign: 'center' }}>
                        {t('Generating meal plan...')}
                        <br />
                        {t('This may take a minute')}
                    </Typography>
                )}
            </Box>
        );
    }

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
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h4" gutterBottom>
                        {t('Meal Plans')}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <FormControl size="small" sx={{ minWidth: 150 }}>
                            <InputLabel>{t('Dietary Preference')}</InputLabel>
                            <Select
                                value={filters.dietaryPreference}
                                label={t('Dietary Preference')}
                                onChange={(e) => setFilters({ ...filters, dietaryPreference: e.target.value })}
                            >
                                <MenuItem value="all">{t('All Preferences')}</MenuItem>
                                {dietaryPreferenceOptions.map((option) => (
                                    <MenuItem key={option} value={option.toLowerCase()}>
                                        {t(option)}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl size="small" sx={{ minWidth: 150 }}>
                            <InputLabel>{t('Calorie Range')}</InputLabel>
                            <Select
                                value={filters.calorieRange}
                                label={t('Calorie Range')}
                                onChange={(e) => setFilters({ ...filters, calorieRange: e.target.value })}
                            >
                                <MenuItem value="all">{t('All Ranges')}</MenuItem>
                                {calorieRangeOptions.map((range) => (
                                    <MenuItem key={range} value={range}>
                                        {range} {t('calories')}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl size="small" sx={{ minWidth: 150 }}>
                            <InputLabel>{t('Meal Type')}</InputLabel>
                            <Select
                                value={filters.mealType}
                                label={t('Meal Type')}
                                onChange={(e) => setFilters({ ...filters, mealType: e.target.value })}
                            >
                                <MenuItem value="all">{t('All Types')}</MenuItem>
                                {mealTypeOptions.map((type) => (
                                    <MenuItem key={type} value={type.toLowerCase()}>
                                        {t(type)}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<AddIcon />}
                            onClick={() => setCreateDialogOpen(true)}
                        >
                            {t('Create Plan')}
                        </Button>
                    </Box>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <Grid container spacing={3}>
                    {mealPlans.map((plan) => (
                        <Grid item xs={12} sm={6} md={4} key={plan.id}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" component="div">
                                        {plan.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        {plan.description}
                                    </Typography>
                                    <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                                        {plan.dietary_preferences && (
                                            <Chip
                                                label={plan.dietary_preferences}
                                                size="small"
                                                color="primary"
                                                variant="outlined"
                                            />
                                        )}
                                    </Stack>
                                    <Grid container spacing={2}>
                                        <Grid item xs={6}>
                                            <Typography variant="body2">
                                                {t('Calories')}: {plan.total_calories}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2">
                                                {t('Protein')}: {plan.total_protein}g
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2">
                                                {t('Carbs')}: {plan.total_carbs}g
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2">
                                                {t('Fats')}: {plan.total_fats}g
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                                <CardActions>
                                    <Button
                                        size="small"
                                        color="primary"
                                        onClick={() => handleViewDetails(plan)}
                                    >
                                        {t('View Meals')}
                                    </Button>
                                    <Button
                                        size="small"
                                        color="primary"
                                        onClick={() => handleEditClick(plan)}
                                    >
                                        {t('Edit')}
                                    </Button>
                                    <Button
                                        size="small"
                                        color="error"
                                        onClick={() => handleDeleteClick(plan)}
                                    >
                                        {t('Delete')}
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                {/* Create Plan Dialog */}
                <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
                    <DialogTitle>{t('Create Meal Plan')}</DialogTitle>
                    <DialogContent>
                        <Box sx={{ pt: 2 }}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={useAI}
                                        onChange={(e) => setUseAI(e.target.checked)}
                                        color="primary"
                                    />
                                }
                                label={t('Enable AI Generation')}
                                sx={{ mb: 2, display: 'block' }}
                            />
                            {useAI && (
                                <Alert severity="info" sx={{ mb: 2 }}>
                                    {t('AI will help generate and optimize your meal plan based on the parameters you provide.')}
                                </Alert>
                            )}
                            <TextField
                                fullWidth
                                label={t('Plan Name')}
                                value={newPlan.name}
                                onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                                sx={{ mb: 2 }}
                                required
                            />
                            <TextField
                                fullWidth
                                label={t('Description')}
                                value={newPlan.description}
                                onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
                                multiline
                                rows={3}
                                sx={{ mb: 2 }}
                            />
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        type="number"
                                        label={t('Total Calories')}
                                        value={newPlan.total_calories}
                                        onChange={(e) => setNewPlan({ ...newPlan, total_calories: e.target.value })}
                                        sx={{ mb: 2 }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        type="number"
                                        label={t('Protein (g)')}
                                        value={newPlan.total_protein}
                                        onChange={(e) => setNewPlan({ ...newPlan, total_protein: e.target.value })}
                                        sx={{ mb: 2 }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        type="number"
                                        label={t('Carbs (g)')}
                                        value={newPlan.total_carbs}
                                        onChange={(e) => setNewPlan({ ...newPlan, total_carbs: e.target.value })}
                                        sx={{ mb: 2 }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        type="number"
                                        label={t('Fats (g)')}
                                        value={newPlan.total_fats}
                                        onChange={(e) => setNewPlan({ ...newPlan, total_fats: e.target.value })}
                                        sx={{ mb: 2 }}
                                    />
                                </Grid>
                            </Grid>
                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel>{t('Dietary Preferences')}</InputLabel>
                                <Select
                                    value={newPlan.dietary_preferences}
                                    label={t('Dietary Preferences')}
                                    onChange={(e) => setNewPlan({ ...newPlan, dietary_preferences: e.target.value })}
                                >
                                    {dietaryPreferenceOptions.map((option) => (
                                        <MenuItem key={option} value={option.toLowerCase()}>
                                            {t(option)}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setCreateDialogOpen(false)}>
                            {t('Cancel')}
                        </Button>
                        <Button
                            onClick={handleCreatePlan}
                            variant="contained"
                            disabled={!newPlan.name}
                        >
                            {t('Create')}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Edit Plan Dialog */}
                <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
                    <DialogTitle>{t('Edit Meal Plan')}</DialogTitle>
                    <DialogContent>
                        <Box sx={{ pt: 2 }}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={useAI}
                                        onChange={(e) => setUseAI(e.target.checked)}
                                        color="primary"
                                    />
                                }
                                label={t('Use AI to Enhance Plan')}
                                sx={{ mb: 2, display: 'block' }}
                            />
                            {useAI && (
                                <Alert severity="info" sx={{ mb: 2 }}>
                                    {t('AI will suggest improvements and generate additional meal options based on your plan.')}
                                </Alert>
                            )}
                            <TextField
                                fullWidth
                                label={t('Plan Name')}
                                value={selectedPlan?.name || ''}
                                onChange={(e) => setSelectedPlan({ ...selectedPlan, name: e.target.value })}
                                sx={{ mb: 2 }}
                                required
                            />
                            <TextField
                                fullWidth
                                label={t('Description')}
                                value={selectedPlan?.description || ''}
                                onChange={(e) => setSelectedPlan({ ...selectedPlan, description: e.target.value })}
                                multiline
                                rows={3}
                                sx={{ mb: 2 }}
                            />
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        type="number"
                                        label={t('Total Calories')}
                                        value={selectedPlan?.total_calories || ''}
                                        onChange={(e) => setSelectedPlan({ ...selectedPlan, total_calories: e.target.value })}
                                        sx={{ mb: 2 }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        type="number"
                                        label={t('Protein (g)')}
                                        value={selectedPlan?.total_protein || ''}
                                        onChange={(e) => setSelectedPlan({ ...selectedPlan, total_protein: e.target.value })}
                                        sx={{ mb: 2 }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        type="number"
                                        label={t('Carbs (g)')}
                                        value={selectedPlan?.total_carbs || ''}
                                        onChange={(e) => setSelectedPlan({ ...selectedPlan, total_carbs: e.target.value })}
                                        sx={{ mb: 2 }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        type="number"
                                        label={t('Fats (g)')}
                                        value={selectedPlan?.total_fats || ''}
                                        onChange={(e) => setSelectedPlan({ ...selectedPlan, total_fats: e.target.value })}
                                        sx={{ mb: 2 }}
                                    />
                                </Grid>
                            </Grid>
                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel>{t('Dietary Preferences')}</InputLabel>
                                <Select
                                    value={selectedPlan?.dietary_preferences || ''}
                                    label={t('Dietary Preferences')}
                                    onChange={(e) => setSelectedPlan({ ...selectedPlan, dietary_preferences: e.target.value })}
                                >
                                    {dietaryPreferenceOptions.map((option) => (
                                        <MenuItem key={option} value={option.toLowerCase()}>
                                            {t(option)}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setEditDialogOpen(false)}>
                            {t('Cancel')}
                        </Button>
                        <Button
                            onClick={handleEditPlan}
                            variant="contained"
                            disabled={!selectedPlan?.name}
                        >
                            {t('Save Changes')}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                    <DialogTitle>{t('Delete Meal Plan')}</DialogTitle>
                    <DialogContent>
                        <Typography>
                            {t('Are you sure you want to delete the meal plan')} "{selectedPlan?.name}"?
                            {t('This action cannot be undone.')}
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDeleteDialogOpen(false)}>
                            {t('Cancel')}
                        </Button>
                        <Button
                            onClick={handleDeletePlan}
                            variant="contained"
                            color="error"
                        >
                            {t('Delete')}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Box>
    );
};

export default MealPlans;
