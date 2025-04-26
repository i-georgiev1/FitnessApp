import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    CardActions,
    Grid,
    CircularProgress,
    Alert,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Stack,
    Button,
    Chip,
    IconButton,
    Menu,
} from '@mui/material';
import { Search as SearchIcon, MoreVert as MoreVertIcon } from '@mui/icons-material';
import axiosInstance from '../../../../config/axios';
import AdminSidebar from '../AdminSidebar';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../../../../config/api';

const AllMealPlans = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [mealPlans, setMealPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({
        calorieRange: 'all',
        dietaryPreference: 'all',
        mealType: 'all'
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [advancedFilters, setAdvancedFilters] = useState({
        difficultyLevel: 'all',
        nutritionalGoal: 'all',
    });
    const [sidebarExpanded, setSidebarExpanded] = useState(true);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedPlanId, setSelectedPlanId] = useState(null);

    const dietaryPreferenceOptions = [
        'Vegetarian', 'Vegan', 'Pescatarian', 'Keto',
        'Paleo', 'Low-Carb', 'Mediterranean', 'Gluten-Free'
    ];

    const mealTypeOptions = [
        'Breakfast', 'Lunch', 'Dinner', 'Snacks',
        'Pre-Workout', 'Post-Workout', 'All-Day'
    ];

    const nutritionalGoalOptions = [
        'Weight Loss', 'Muscle Gain', 'Maintenance',
        'Athletic Performance', 'Health Improvement'
    ];

    const calorieRangeOptions = [
        { value: 'all', label: 'All Ranges' },
        { value: 'under1500', label: 'Under 1500 kcal' },
        { value: '1500-2000', label: '1500-2000 kcal' },
        { value: '2000-2500', label: '2000-2500 kcal' },
        { value: 'over2500', label: 'Over 2500 kcal' }
    ];

    useEffect(() => {
        fetchMealPlans();
    }, []);

    const fetchMealPlans = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/api/admin/meal-plans');
            setMealPlans(response.data.meal_plans || []);
            setError('');
        } catch (err) {
            console.error('Error fetching meal plans:', err);
            setError(t('Failed to load meal plans'));
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteMealPlan = async (planId) => {
        if (window.confirm(t('Are you sure you want to delete this meal plan?'))) {
            try {
                await axiosInstance.delete(`${API_ENDPOINTS.mealPlans.base}/${planId}`);
                await fetchMealPlans();
                setError('');
            } catch (error) {
                console.error('Error deleting meal plan:', error);
                setError(t('Failed to delete meal plan'));
            }
        }
    };

    const filterMealPlans = (plansToFilter) => {
        return plansToFilter.filter(plan => {
            const searchMatch = !searchQuery ||
                plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (plan.description && plan.description.toLowerCase().includes(searchQuery.toLowerCase()));

            const dietaryMatch = filters.dietaryPreference === 'all' ||
                (plan.dietary_preferences && plan.dietary_preferences.includes(filters.dietaryPreference));

            const calorieMatch = filters.calorieRange === 'all' || matchCalorieRange(plan.total_calories, filters.calorieRange);

            const goalMatch = advancedFilters.nutritionalGoal === 'all' ||
                plan.nutritional_goal === advancedFilters.nutritionalGoal;

            return searchMatch && dietaryMatch && calorieMatch && goalMatch;
        });
    };

    const matchCalorieRange = (calories, range) => {
        if (!calories) return false;
        switch (range) {
            case 'under1500': return calories < 1500;
            case '1500-2000': return calories >= 1500 && calories <= 2000;
            case '2000-2500': return calories > 2000 && calories <= 2500;
            case 'over2500': return calories > 2500;
            default: return true;
        }
    };

    const handleOptionsClick = (event, planId) => {
        setAnchorEl(event.currentTarget);
        setSelectedPlanId(planId);
    };

    const handleOptionsClose = () => {
        setAnchorEl(null);
        setSelectedPlanId(null);
    };

    const handleViewDetails = (plan) => {
        navigate(`/admin/meal-plans/${plan.id}/meals`);
    };

    if (loading) {
        return (
            <Box display="flex">
                <AdminSidebar expanded={sidebarExpanded} onToggle={(expanded) => setSidebarExpanded(expanded)} />
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
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                        <CircularProgress />
                    </Box>
                </Box>
            </Box>
        );
    }

    return (
        <Box display="flex">
            <AdminSidebar expanded={sidebarExpanded} onToggle={(expanded) => setSidebarExpanded(expanded)} />
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
                <Box sx={{ mb: 3 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                label={t('Search Meal Plans')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                InputProps={{
                                    startAdornment: <SearchIcon sx={{ mr: 1 }} />
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={8}>
                            <Stack direction="row" spacing={2}>
                                <FormControl size="small" sx={{ minWidth: 150 }}>
                                    <InputLabel>{t('Calorie Range')}</InputLabel>
                                    <Select
                                        value={filters.calorieRange}
                                        label={t('Calorie Range')}
                                        onChange={(e) => setFilters({
                                            ...filters,
                                            calorieRange: e.target.value
                                        })}
                                    >
                                        {calorieRangeOptions.map((option) => (
                                            <MenuItem key={option.value} value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <FormControl size="small" sx={{ minWidth: 150 }}>
                                    <InputLabel>{t('Nutritional Goal')}</InputLabel>
                                    <Select
                                        value={advancedFilters.nutritionalGoal}
                                        label={t('Nutritional Goal')}
                                        onChange={(e) => setAdvancedFilters({
                                            ...advancedFilters,
                                            nutritionalGoal: e.target.value
                                        })}
                                    >
                                        <MenuItem value="all">{t('All Goals')}</MenuItem>
                                        {nutritionalGoalOptions.map((goal) => (
                                            <MenuItem key={goal} value={goal}>
                                                {goal}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <FormControl size="small" sx={{ minWidth: 150 }}>
                                    <InputLabel>{t('Dietary Preference')}</InputLabel>
                                    <Select
                                        value={filters.dietaryPreference}
                                        label={t('Dietary Preference')}
                                        onChange={(e) => setFilters({
                                            ...filters,
                                            dietaryPreference: e.target.value
                                        })}
                                    >
                                        <MenuItem value="all">{t('All Preferences')}</MenuItem>
                                        {dietaryPreferenceOptions.map((pref) => (
                                            <MenuItem key={pref} value={pref}>
                                                {pref}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Stack>
                        </Grid>
                    </Grid>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h4" gutterBottom>
                        {t('All Meal Plans')}
                    </Typography>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <Grid container spacing={3}>
                    {filterMealPlans(mealPlans).map((plan) => (
                        <Grid item xs={12} sm={6} md={4} key={plan.id}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        {plan.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                        {t('Created by')}: {plan.coach?.first_name} {plan.coach?.last_name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                        {plan.description}
                                    </Typography>
                                    <Box sx={{ mb: 1 }}>
                                        <Typography variant="body2" component="span" sx={{ mr: 1 }}>
                                            {t('Calories')}:
                                        </Typography>
                                        <Chip
                                            label={`${plan.total_calories || 0} kcal`}
                                            size="small"
                                            color="primary"
                                        />
                                    </Box>
                                    <Box sx={{ mb: 1 }}>
                                        <Typography variant="body2" gutterBottom>
                                            {t('Macros')}:
                                        </Typography>
                                        <Stack direction="row" spacing={1}>
                                            <Chip
                                                label={`P: ${plan.total_protein || 0}g`}
                                                size="small"
                                            />
                                            <Chip
                                                label={`C: ${plan.total_carbs || 0}g`}
                                                size="small"
                                            />
                                            <Chip
                                                label={`F: ${plan.total_fats || 0}g`}
                                                size="small"
                                            />
                                        </Stack>
                                    </Box>
                                    {plan.dietary_preferences && (
                                        <Typography variant="body2">
                                            {t('Dietary Preferences')}: {plan.dietary_preferences}
                                        </Typography>
                                    )}
                                    {plan.nutritional_goal && (
                                        <Typography variant="body2">
                                            {t('Nutritional Goal')}: {plan.nutritional_goal}
                                        </Typography>
                                    )}
                                </CardContent>
                                <CardActions sx={{ justifyContent: 'space-between' }}>
                                    <Button
                                        size="small"
                                        color="primary"
                                        onClick={() => handleViewDetails(plan)}
                                    >
                                        {t('View Plan')}
                                    </Button>
                                    <Button
                                        size="small"
                                        onClick={(e) => handleOptionsClick(e, plan.id)}
                                        endIcon={<MoreVertIcon />}
                                    >
                                        {t('Options')}
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleOptionsClose}
                >
                    <MenuItem
                        onClick={() => {
                            navigate(`/admin/meal-plans/${selectedPlanId}/edit`);
                            handleOptionsClose();
                        }}
                    >
                        {t('Edit Plan')}
                    </MenuItem>
                    <MenuItem
                        onClick={() => {
                            handleDeleteMealPlan(selectedPlanId);
                            handleOptionsClose();
                        }}
                        sx={{ color: 'error.main' }}
                    >
                        {t('Delete')}
                    </MenuItem>
                </Menu>
            </Box>
        </Box>
    );
};

export default AllMealPlans;
