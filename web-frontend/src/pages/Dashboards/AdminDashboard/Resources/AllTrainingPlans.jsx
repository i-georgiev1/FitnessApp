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
    IconButton,
    Tooltip,
    Button,
} from '@mui/material';
import { Search as SearchIcon, MoreVert as MoreVertIcon } from '@mui/icons-material';
import axiosInstance from '../../../../config/axios';
import AdminSidebar from '../AdminSidebar';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const AllTrainingPlans = () => {
    const { t } = useTranslation();
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({
        weekNumber: 'all',
        dayNumber: 'all',
        exerciseType: 'all'
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [advancedFilters, setAdvancedFilters] = useState({
        difficultyLevel: 'all',
        trainingObjective: 'all',
        focusAreas: []
    });
    const [sidebarExpanded, setSidebarExpanded] = useState(true);
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedPlan, setSelectedPlan] = useState(null);

    const focusAreaOptions = [
        'Strength', 'Hypertrophy', 'Endurance', 'Weight Loss', 'Flexibility',
        'Core Strength', 'Upper Body', 'Lower Body', 'Full Body', 'Cardio'
    ];

    const exerciseTypeOptions = [
        'Bodyweight', 'Free Weights', 'Machines', 'Resistance Bands',
        'Cardio Equipment', 'Yoga', 'Pilates', 'HIIT', 'Circuit Training'
    ];

    const trainingObjectiveOptions = [
        'Weight Loss', 'Muscle Gain', 'Strength Building', 'Endurance Improvement',
        'General Fitness', 'Athletic Performance', 'Rehabilitation', 'Flexibility'
    ];

    useEffect(() => {
        fetchTrainingPlans();
    }, []);

    const fetchTrainingPlans = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/api/admin/training-plans');
            setPlans(response.data);
            setError('');
        } catch (err) {
            console.error('Error fetching training plans:', err);
            setError(t('Failed to load training plans'));
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (plan) => {
        navigate(`/admin/training-plans/${plan.plan_id}`);
    };

    const filterExercises = (exercises) => {
        if (!exercises) return [];

        return exercises.filter(exercise => {
            const weekMatch = filters.weekNumber === 'all' || exercise.week_number === parseInt(filters.weekNumber);
            const dayMatch = filters.dayNumber === 'all' || exercise.day_number === parseInt(filters.dayNumber);
            const typeMatch = filters.exerciseType === 'all' || (exercise.exercise_type && exercise.exercise_type.toLowerCase().includes(filters.exerciseType.toLowerCase()));
            return weekMatch && dayMatch && typeMatch;
        });
    };

    const filterPlans = (plansToFilter) => {
        return plansToFilter.filter(plan => {
            const searchMatch = !searchQuery ||
                plan.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                plan.description.toLowerCase().includes(searchQuery.toLowerCase());

            const difficultyMatch = advancedFilters.difficultyLevel === 'all' ||
                plan.difficulty_level === advancedFilters.difficultyLevel;

            const objectiveMatch = advancedFilters.trainingObjective === 'all' ||
                plan.training_objective === advancedFilters.trainingObjective;

            return searchMatch && difficultyMatch && objectiveMatch;
        });
    };

    const handleOptionsClick = (event, plan) => {
        setAnchorEl(event.currentTarget);
        setSelectedPlan(plan);
    };

    const handleOptionsClose = () => {
        setAnchorEl(null);
        setSelectedPlan(null);
    };

    if (loading) {
        return (
            <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
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
                                label={t('Search Plans')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                InputProps={{
                                    startAdornment: <SearchIcon sx={{ mr: 1 }} />
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={8}>
                            <Stack direction="row" spacing={2}>
                                <FormControl size="small" sx={{ minWidth: 120 }}>
                                    <InputLabel>{t('Difficulty')}</InputLabel>
                                    <Select
                                        value={advancedFilters.difficultyLevel}
                                        label={t('Difficulty')}
                                        onChange={(e) => setAdvancedFilters({
                                            ...advancedFilters,
                                            difficultyLevel: e.target.value
                                        })}
                                    >
                                        <MenuItem value="all">{t('All Levels')}</MenuItem>
                                        <MenuItem value="beginner">{t('Beginner')}</MenuItem>
                                        <MenuItem value="intermediate">{t('Intermediate')}</MenuItem>
                                        <MenuItem value="advanced">{t('Advanced')}</MenuItem>
                                    </Select>
                                </FormControl>
                                <FormControl size="small" sx={{ minWidth: 150 }}>
                                    <InputLabel>{t('Training Objective')}</InputLabel>
                                    <Select
                                        value={advancedFilters.trainingObjective}
                                        label={t('Training Objective')}
                                        onChange={(e) => setAdvancedFilters({
                                            ...advancedFilters,
                                            trainingObjective: e.target.value
                                        })}
                                    >
                                        <MenuItem value="all">{t('All Objectives')}</MenuItem>
                                        {trainingObjectiveOptions.map((objective) => (
                                            <MenuItem key={objective} value={objective}>
                                                {objective}
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
                        {t('All Training Plans')}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel>{t('Week')}</InputLabel>
                            <Select
                                value={filters.weekNumber}
                                label={t('Week')}
                                onChange={(e) => setFilters({ ...filters, weekNumber: e.target.value })}
                            >
                                <MenuItem value="all">{t('All Weeks')}</MenuItem>
                                {[...Array(12)].map((_, i) => (
                                    <MenuItem key={i + 1} value={i + 1}>
                                        {t('Week')} {i + 1}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel>{t('Day')}</InputLabel>
                            <Select
                                value={filters.dayNumber}
                                label={t('Day')}
                                onChange={(e) => setFilters({ ...filters, dayNumber: e.target.value })}
                            >
                                <MenuItem value="all">{t('All Days')}</MenuItem>
                                {[...Array(7)].map((_, i) => (
                                    <MenuItem key={i + 1} value={i + 1}>
                                        {t('Day')} {i + 1}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl size="small" sx={{ minWidth: 150 }}>
                            <InputLabel>{t('Exercise Type')}</InputLabel>
                            <Select
                                value={filters.exerciseType}
                                label={t('Exercise Type')}
                                onChange={(e) => setFilters({ ...filters, exerciseType: e.target.value })}
                            >
                                <MenuItem value="all">{t('All Types')}</MenuItem>
                                {exerciseTypeOptions.map((type) => (
                                    <MenuItem key={type} value={type}>
                                        {type}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <Grid container spacing={3}>
                    {filterPlans(plans).map((plan) => (
                        <Grid item xs={12} sm={6} md={4} key={plan.plan_id}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        {plan.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                        {t('Created by')}: {plan.coach?.first_name} {plan.coach?.last_name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                        {plan.description}
                                    </Typography>
                                    <Typography variant="body2">
                                        {t('Difficulty')}: {plan.difficulty_level}
                                    </Typography>
                                    <Typography variant="body2">
                                        {t('Duration')}: {plan.duration_weeks} {t('weeks')}
                                    </Typography>
                                    <Typography variant="body2">
                                        {t('Training Frequency')}: {plan.training_frequency} {t('times per week')}
                                    </Typography>
                                    {plan.training_objective && (
                                        <Typography variant="body2">
                                            {t('Training Objective')}: {plan.training_objective}
                                        </Typography>
                                    )}
                                    {plan.focus_areas && (
                                        <Typography variant="body2">
                                            {t('Focus Areas')}: {plan.focus_areas}
                                        </Typography>
                                    )}
                                    {plan.exercise_types && (
                                        <Typography variant="body2">
                                            {t('Exercise Types')}: {plan.exercise_types}
                                        </Typography>
                                    )}
                                    {plan.specific_instructions && (
                                        <Typography variant="body2">
                                            {t('Specific Instructions')}: {plan.specific_instructions}
                                        </Typography>
                                    )}
                                </CardContent>
                                <CardActions sx={{ justifyContent: 'space-between' }}>
                                    <Button
                                        size="small"
                                        color="primary"
                                        onClick={() => handleViewDetails(plan)}
                                    >
                                        {t('View Exercises')}
                                    </Button>
                                    <Button
                                        size="small"
                                        color="primary"
                                        onClick={(e) => handleOptionsClick(e, plan)}
                                        endIcon={<MoreVertIcon />}
                                    >
                                        {t('Options')}
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </Box>
    );
};

export default AllTrainingPlans;
