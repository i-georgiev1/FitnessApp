import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    CircularProgress,
    Alert,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Chip,
    Divider,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    useTheme
} from '@mui/material';
import {
    ExpandMore as ExpandMoreIcon,
    Restaurant as RestaurantIcon,
    Schedule as ScheduleIcon,
    LocalDining as LocalDiningIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import axiosInstance from '../../../config/axios';
import { API_ENDPOINTS } from '../../../config/api';
import DashboardSidebar from './DashboardSidebar';

const UserMealPlans = () => {
    const { t } = useTranslation();
    const theme = useTheme();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [mealPlan, setMealPlan] = useState(null);
    const [meals, setMeals] = useState([]);
    const [sidebarExpanded, setSidebarExpanded] = useState(() => {
        const savedState = localStorage.getItem('userSidebarState');
        return savedState ? JSON.parse(savedState) : true;
    });

    // Handle sidebar toggle
    const handleSidebarToggle = (expanded) => {
        setSidebarExpanded(expanded);
        localStorage.setItem('userSidebarState', JSON.stringify(expanded));
    };

    useEffect(() => {
        fetchUserMealPlan();
    }, []);

    const fetchUserMealPlan = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(API_ENDPOINTS.user.mealPlan);
            setMealPlan(response.data.meal_plan);
            setMeals(response.data.meals || []);
        } catch (error) {
            console.error('Error fetching meal plan:', error);
            setError(t('Failed to load your meal plan'));
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box display="flex">
                <DashboardSidebar expanded={sidebarExpanded} onToggle={handleSidebarToggle} />
                <Box component="main" sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { sm: `calc(100% - ${sidebarExpanded ? '270px' : '65px'})` },
                    ml: { sm: sidebarExpanded ? '270px' : '65px' },
                    transition: theme.transitions.create(['width', 'margin-left'], {
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
                <DashboardSidebar expanded={sidebarExpanded} onToggle={handleSidebarToggle} />
                <Box component="main" sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { sm: `calc(100% - ${sidebarExpanded ? '270px' : '65px'})` },
                    ml: { sm: sidebarExpanded ? '270px' : '65px' },
                    transition: theme.transitions.create(['width', 'margin-left'], {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.enteringScreen,
                    }),
                }}>
                    <Alert severity="info" sx={{ mt: 2 }}>
                        {t('No meal plan is currently assigned to you. Please contact your coach to get started with your nutrition plan.')}
                    </Alert>
                </Box>
            </Box>
        );
    }

    // Group meals by day of the week
    const groupedMeals = meals.reduce((acc, meal) => {
        if (!acc[meal.day_of_week]) {
            acc[meal.day_of_week] = [];
        }
        acc[meal.day_of_week].push(meal);
        return acc;
    }, {});

    return (
        <Box display="flex">
            <DashboardSidebar expanded={sidebarExpanded} onToggle={handleSidebarToggle} />
            <Box component="main" sx={{
                flexGrow: 1,
                p: 3,
                width: { sm: `calc(100% - ${sidebarExpanded ? '270px' : '65px'})` },
                ml: { sm: sidebarExpanded ? '270px' : '65px' },
                transition: theme.transitions.create(['width', 'margin-left'], {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.enteringScreen,
                }),
            }}>
                <Typography variant="h4" gutterBottom>
                    {t('Your Meal Plan')}
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                        {error}
                    </Alert>
                )}

                {/* Meal Plan Overview */}
                <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h5" gutterBottom>
                        {mealPlan.name}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" paragraph>
                        {mealPlan.description}
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                        <Chip
                            icon={<RestaurantIcon />}
                            label={`${t('Total Calories')}: ${mealPlan.total_calories} kcal`}
                            sx={{ mr: 1, mb: 1 }}
                        />
                        <Chip
                            icon={<LocalDiningIcon />}
                            label={`${t('Dietary Type')}: ${mealPlan.dietary_preferences || t('Standard')}`}
                            sx={{ mr: 1, mb: 1 }}
                        />
                    </Box>

                    {/* Macronutrient Breakdown */}
                    <Grid container spacing={3} sx={{ mb: 3 }}>
                        <Grid item xs={12} sm={4}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        {t('Protein')}
                                    </Typography>
                                    <Typography variant="h4">
                                        {mealPlan.total_protein}g
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        {t('Carbs')}
                                    </Typography>
                                    <Typography variant="h4">
                                        {mealPlan.total_carbs}g
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        {t('Fats')}
                                    </Typography>
                                    <Typography variant="h4">
                                        {mealPlan.total_fats}g
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Daily Meal Plans */}
                {Object.keys(groupedMeals).sort().map(day => (
                    <Accordion key={day} defaultExpanded={day === 'Monday'}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="h6">
                                {t(day)}
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>{t('Meal Type')}</TableCell>
                                            <TableCell>{t('Name')}</TableCell>
                                            <TableCell>{t('Calories')}</TableCell>
                                            <TableCell>{t('Protein')}</TableCell>
                                            <TableCell>{t('Carbs')}</TableCell>
                                            <TableCell>{t('Fats')}</TableCell>
                                            <TableCell>{t('Time')}</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {groupedMeals[day]
                                            .sort((a, b) => {
                                                const mealOrder = {
                                                    'Breakfast': 1,
                                                    'Morning Snack': 2,
                                                    'Lunch': 3,
                                                    'Afternoon Snack': 4,
                                                    'Dinner': 5,
                                                    'Evening Snack': 6
                                                };
                                                return mealOrder[a.meal_type] - mealOrder[b.meal_type];
                                            })
                                            .map((meal) => (
                                                <TableRow key={meal.meal_id}>
                                                    <TableCell>{t(meal.meal_type)}</TableCell>
                                                    <TableCell>{meal.name}</TableCell>
                                                    <TableCell>{meal.calories}</TableCell>
                                                    <TableCell>{meal.protein}g</TableCell>
                                                    <TableCell>{meal.carbs}g</TableCell>
                                                    <TableCell>{meal.fats}g</TableCell>
                                                    <TableCell>{meal.meal_time || '-'}</TableCell>
                                                </TableRow>
                                            ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            {/* Meal Details */}
                            <Grid container spacing={3} sx={{ mt: 2 }}>
                                {groupedMeals[day].map((meal) => (
                                    <Grid item xs={12} md={6} key={meal.meal_id}>
                                        <Card>
                                            <CardContent>
                                                <Typography variant="h6" gutterBottom>
                                                    {meal.name}
                                                </Typography>
                                                <Typography variant="subtitle1" color="text.secondary">
                                                    {t(meal.meal_type)}
                                                    {meal.meal_time && (
                                                        <Chip
                                                            icon={<ScheduleIcon />}
                                                            label={meal.meal_time}
                                                            size="small"
                                                            sx={{ ml: 1 }}
                                                        />
                                                    )}
                                                </Typography>
                                                <Divider sx={{ my: 2 }} />
                                                {meal.description && (
                                                    <Typography variant="body2" paragraph>
                                                        {meal.description}
                                                    </Typography>
                                                )}
                                                {meal.ingredients && (
                                                    <>
                                                        <Typography variant="subtitle2" gutterBottom>
                                                            {t('Ingredients')}:
                                                        </Typography>
                                                        <Typography variant="body2" paragraph>
                                                            {meal.ingredients}
                                                        </Typography>
                                                    </>
                                                )}
                                                {meal.instructions && (
                                                    <>
                                                        <Typography variant="subtitle2" gutterBottom>
                                                            {t('Instructions')}:
                                                        </Typography>
                                                        <Typography variant="body2">
                                                            {meal.instructions}
                                                        </Typography>
                                                    </>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </AccordionDetails>
                    </Accordion>
                ))}
            </Box>
        </Box>
    );
};

export default UserMealPlans; 