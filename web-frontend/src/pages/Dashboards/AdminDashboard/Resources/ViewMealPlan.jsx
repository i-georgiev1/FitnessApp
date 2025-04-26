import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    CircularProgress,
    Alert,
    Chip,
    Divider,
    Stack,
    Button,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AdminSidebar from '../AdminSidebar';
import axiosInstance from '../../../../config/axios';

const ViewMealPlan = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const [mealPlan, setMealPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sidebarExpanded, setSidebarExpanded] = useState(true);

    useEffect(() => {
        fetchMealPlan();
    }, [id]);

    const fetchMealPlan = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/api/admin/meal-plans/${id}`);
            setMealPlan(response.data);
            setError('');
        } catch (err) {
            console.error('Error fetching meal plan:', err);
            setError(t('Failed to load meal plan'));
        } finally {
            setLoading(false);
        }
    };

    const getMealTypeColor = (mealType) => {
        const colors = {
            'Breakfast': 'primary',
            'Lunch': 'success',
            'Dinner': 'secondary',
            'Snack': 'warning',
            'Pre-Workout': 'info',
            'Post-Workout': 'error'
        };
        return colors[mealType] || 'default';
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

    if (!mealPlan) {
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
                    <Alert severity="error">{t('Meal plan not found')}</Alert>
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
                <Box sx={{ mb: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h4">
                            {mealPlan.name}
                        </Typography>
                        <Button
                            variant="outlined"
                            onClick={() => navigate('/admin/meal-plans')}
                        >
                            {t('Back to Meal Plans')}
                        </Button>
                    </Box>

                    <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                        {t('Created by')}: {mealPlan.coach?.first_name} {mealPlan.coach?.last_name}
                    </Typography>

                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid item xs={12} md={4}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        {t('Nutritional Information')}
                                    </Typography>
                                    <Stack spacing={1}>
                                        <Box>
                                            <Typography variant="body2" component="span" sx={{ mr: 1 }}>
                                                {t('Total Calories')}:
                                            </Typography>
                                            <Chip
                                                label={`${mealPlan.total_calories || 0} kcal`}
                                                size="small"
                                                color="primary"
                                            />
                                        </Box>
                                        <Typography variant="subtitle2">{t('Macronutrients')}:</Typography>
                                        <Stack direction="row" spacing={1}>
                                            <Chip label={`${t('Protein')}: ${mealPlan.total_protein || 0}g`} size="small" />
                                            <Chip label={`${t('Carbs')}: ${mealPlan.total_carbs || 0}g`} size="small" />
                                            <Chip label={`${t('Fats')}: ${mealPlan.total_fats || 0}g`} size="small" />
                                        </Stack>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={8}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        {t('Plan Details')}
                                    </Typography>
                                    <Typography variant="body1" paragraph>
                                        {mealPlan.description}
                                    </Typography>
                                    {mealPlan.dietary_preferences && (
                                        <Box sx={{ mb: 2 }}>
                                            <Typography variant="subtitle2" gutterBottom>
                                                {t('Dietary Preferences')}:
                                            </Typography>
                                            <Chip label={mealPlan.dietary_preferences} />
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    <Typography variant="h5" sx={{ mb: 3 }}>
                        {t('Meals')}
                    </Typography>

                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    <Grid container spacing={3}>
                        {mealPlan.meals?.map((meal) => (
                            <Grid item xs={12} md={6} key={meal.id}>
                                <Card>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                            <Typography variant="h6">
                                                {meal.name}
                                            </Typography>
                                            <Chip
                                                label={meal.meal_type}
                                                size="small"
                                                color={getMealTypeColor(meal.meal_type)}
                                            />
                                        </Box>
                                        <Typography variant="body2" sx={{ mb: 2 }}>
                                            {meal.description}
                                        </Typography>
                                        <Divider sx={{ my: 2 }} />
                                        <Typography variant="subtitle2" gutterBottom>
                                            {t('Nutritional Information')}:
                                        </Typography>
                                        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                                            <Chip label={`${meal.calories || 0} kcal`} size="small" color="primary" />
                                            <Chip label={`P: ${meal.protein || 0}g`} size="small" />
                                            <Chip label={`C: ${meal.carbs || 0}g`} size="small" />
                                            <Chip label={`F: ${meal.fats || 0}g`} size="small" />
                                        </Stack>
                                        {meal.ingredients && (
                                            <>
                                                <Typography variant="subtitle2" gutterBottom>
                                                    {t('Ingredients')}:
                                                </Typography>
                                                <Typography variant="body2" sx={{ mb: 2 }}>
                                                    {meal.ingredients}
                                                </Typography>
                                            </>
                                        )}
                                        {meal.cooking_instructions && (
                                            <>
                                                <Typography variant="subtitle2" gutterBottom>
                                                    {t('Cooking Instructions')}:
                                                </Typography>
                                                <Typography variant="body2">
                                                    {meal.cooking_instructions}
                                                </Typography>
                                            </>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            </Box>
        </Box>
    );
};

export default ViewMealPlan; 