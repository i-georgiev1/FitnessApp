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
    Stack,
    Autocomplete,
    Menu,
    IconButton,
    Tooltip,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Search as SearchIcon, FileCopy as FileCopyIcon, SaveAlt as SaveAltIcon, MoreVert as MoreVertIcon } from '@mui/icons-material';
import axiosInstance from '../../../../config/axios';
import CoachSidebar from '../CoachSidebar';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const TrainingPlans = () => {
    const { t } = useTranslation();
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [useAI, setUseAI] = useState(false);
    const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
    const [filters, setFilters] = useState({
        weekNumber: 'all',
        dayNumber: 'all',
        exerciseType: 'all'
    });
    const [newPlan, setNewPlan] = useState({
        title: '',
        description: '',
        difficulty_level: '',
        duration_weeks: 1,
        training_frequency: "",
        training_objective: '',
        focus_areas: '',
        exercise_types: '',
        specific_instructions: ''
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
    const [templates, setTemplates] = useState([]);
    const [advancedFilters, setAdvancedFilters] = useState({
        difficultyLevel: 'all',
        trainingObjective: 'all',
        focusAreas: []
    });
    const [sidebarExpanded, setSidebarExpanded] = useState(true);
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);

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
        fetchTemplates();
    }, []);

    const fetchTrainingPlans = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/api/training-plans');
            setPlans(response.data);
            setError('');
        } catch (err) {
            console.error('Error fetching training plans:', err);
            setError(t('Failed to load training plans'));
        } finally {
            setLoading(false);
        }
    };

    const fetchTemplates = async () => {
        try {
            const response = await axiosInstance.get('/api/training-plan-templates');
            setTemplates(response.data);
        } catch (err) {
            console.error('Error fetching templates:', err);
            setError(t('Failed to load templates'));
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

            // Increase timeout for AI-generated plans
            const config = {
                timeout: useAI ? 600000 : 10000 // 60 seconds for AI plans, 10 seconds for regular plans
            };

            const response = await axiosInstance.post('/api/training-plans', planData, config);
            setCreateDialogOpen(false);
            setNewPlan({
                title: '',
                description: '',
                difficulty_level: '',
                duration_weeks: 1,
                training_frequency: 3,
                training_objective: '',
                focus_areas: '',
                exercise_types: '',
                specific_instructions: ''
            });
            fetchTrainingPlans();
        } catch (err) {
            console.error('Error creating training plan:', err);
            setError(t('Failed to create training plan'));
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
                // Generate AI suggestions for the existing plan
                const aiResponse = await axiosInstance.post('/api/training-plans/enhance', {
                    plan_id: selectedPlan.plan_id,
                    training_objective: selectedPlan.training_objective,
                    focus_areas: selectedPlan.focus_areas,
                    exercise_types: selectedPlan.exercise_types,
                    difficulty_level: selectedPlan.difficulty_level,
                    duration_weeks: selectedPlan.duration_weeks,
                    specific_instructions: selectedPlan.specific_instructions
                });

                // Merge AI suggestions with existing plan
                const enhancedPlan = {
                    ...selectedPlan,
                    exercises: aiResponse.data.exercises
                };

                await axiosInstance.put(`/api/training-plans/${selectedPlan.plan_id}`, enhancedPlan);
            } else {
                await axiosInstance.put(`/api/training-plans/${selectedPlan.plan_id}`, selectedPlan);
            }

            setEditDialogOpen(false);
            setSelectedPlan(null);
            fetchTrainingPlans();
        } catch (err) {
            console.error('Error updating training plan:', err);
            setError(t('Failed to update training plan'));
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
            await axiosInstance.delete(`/api/training-plans/${selectedPlan.plan_id}`);
            setDeleteDialogOpen(false);
            setSelectedPlan(null);
            fetchTrainingPlans();
        } catch (err) {
            console.error('Error deleting training plan:', err);
            setError(t('Failed to delete training plan'));
        }
    };

    const handleViewDetails = (plan) => {
        navigate(`/coach/training-plans/${plan.plan_id}/exercises`);
    };

    const handleSaveAsTemplate = async (plan) => {
        try {
            const templateData = {
                ...plan,
                is_template: true,
                original_plan_id: plan.plan_id,
                template_name: `${plan.title} Template`
            };
            delete templateData.plan_id;

            await axiosInstance.post('/api/training-plan-templates', templateData);
            fetchTemplates();
        } catch (err) {
            setError(t('Failed to save as template'));
        }
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

    const handleOptionSelect = (action) => {
        if (selectedPlan) {
            switch (action) {
                case 'edit':
                    handleEditClick(selectedPlan);
                    break;
                case 'delete':
                    handleDeleteClick(selectedPlan);
                    break;
                case 'template':
                    handleSaveAsTemplate(selectedPlan);
                    break;
            }
        }
        handleOptionsClose();
    };

    if (loading) {
        return (
            <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
                {isGeneratingPlan && (
                    <Typography variant="h6" sx={{ mt: 2, textAlign: 'center' }}>
                        {t('Generating plan exercises...')}
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
                        {t('Training Plans')}
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
                    {filterPlans(plans).map((plan) => (
                        <Grid item xs={12} sm={6} md={4} key={plan.plan_id}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        {plan.title}
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
                                <CardActions>
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
                                        sx={{ ml: 'auto' }}
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
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                >
                    <MenuItem onClick={() => handleOptionSelect('edit')}>
                        {t('Edit')}
                    </MenuItem>
                    <MenuItem onClick={() => handleOptionSelect('delete')} sx={{ color: 'error.main' }}>
                        {t('Delete')}
                    </MenuItem>
                    <MenuItem onClick={() => handleOptionSelect('template')}>
                        {t('Save as Template')}
                    </MenuItem>
                </Menu>

                <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)}>
                    <DialogTitle>{t('Create Training Plan')}</DialogTitle>
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
                                    {t('AI will help generate and optimize your training plan based on the parameters you provide.')}
                                </Alert>
                            )}
                            <TextField
                                fullWidth
                                label={t('Title')}
                                value={newPlan.title}
                                onChange={(e) => setNewPlan({
                                    ...newPlan,
                                    title: e.target.value
                                })}
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                fullWidth
                                label={t('Description')}
                                value={newPlan.description}
                                onChange={(e) => setNewPlan({
                                    ...newPlan,
                                    description: e.target.value
                                })}
                                multiline
                                rows={4}
                                sx={{ mb: 2 }}
                            />
                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel>{t('Difficulty Level')}</InputLabel>
                                <Select
                                    value={newPlan.difficulty_level}
                                    label={t('Difficulty Level')}
                                    onChange={(e) => setNewPlan({
                                        ...newPlan,
                                        difficulty_level: e.target.value
                                    })}
                                >
                                    <MenuItem value="beginner">{t('Beginner')}</MenuItem>
                                    <MenuItem value="intermediate">{t('Intermediate')}</MenuItem>
                                    <MenuItem value="advanced">{t('Advanced')}</MenuItem>
                                </Select>
                            </FormControl>
                            <TextField
                                fullWidth
                                type="number"
                                label={t('Duration (weeks)')}
                                value={newPlan.duration_weeks}
                                onChange={(e) => setNewPlan({
                                    ...newPlan,
                                    duration_weeks: parseInt(e.target.value) || 1
                                })}
                                inputProps={{ min: 1, max: 52 }}
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                fullWidth
                                type="number"
                                label={t('Training Sessions per Week')}
                                value={newPlan.training_frequency}
                                onChange={(e) => setNewPlan({
                                    ...newPlan,
                                    training_frequency: parseInt(e.target.value) || 1
                                })}
                                inputProps={{ min: 1, max: 7 }}
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                fullWidth
                                label={t('Training Objective')}
                                value={newPlan.training_objective}
                                onChange={(e) => setNewPlan({
                                    ...newPlan,
                                    training_objective: e.target.value
                                })}
                                multiline
                                rows={2}
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                fullWidth
                                label={t('Focus Areas')}
                                value={newPlan.focus_areas}
                                onChange={(e) => setNewPlan({
                                    ...newPlan,
                                    focus_areas: e.target.value
                                })}
                                multiline
                                rows={2}
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                fullWidth
                                label={t('Exercise Types')}
                                value={newPlan.exercise_types}
                                onChange={(e) => setNewPlan({
                                    ...newPlan,
                                    exercise_types: e.target.value
                                })}
                                multiline
                                rows={2}
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                fullWidth
                                label={t('Specific Instructions')}
                                value={newPlan.specific_instructions}
                                onChange={(e) => setNewPlan({
                                    ...newPlan,
                                    specific_instructions: e.target.value
                                })}
                                multiline
                                rows={4}
                                sx={{ mb: 2 }}
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setCreateDialogOpen(false)}>
                            {t('Cancel')}
                        </Button>
                        <Button
                            onClick={handleCreatePlan}
                            variant="contained"
                            disabled={!newPlan.title || !newPlan.description}
                        >
                            {t('Create')}
                        </Button>
                    </DialogActions>
                </Dialog>

                <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
                    <DialogTitle>{t('Edit Training Plan')}</DialogTitle>
                    <DialogContent>
                        <Box sx={{ pt: 2 }}>
                            <TextField
                                fullWidth
                                label={t('Title')}
                                value={selectedPlan?.title || ''}
                                onChange={(e) => setSelectedPlan({
                                    ...selectedPlan,
                                    title: e.target.value
                                })}
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                fullWidth
                                label={t('Description')}
                                value={selectedPlan?.description || ''}
                                onChange={(e) => setSelectedPlan({
                                    ...selectedPlan,
                                    description: e.target.value
                                })}
                                multiline
                                rows={4}
                                sx={{ mb: 2 }}
                            />
                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel>{t('Difficulty Level')}</InputLabel>
                                <Select
                                    value={selectedPlan?.difficulty_level || 'beginner'}
                                    label={t('Difficulty Level')}
                                    onChange={(e) => setSelectedPlan({
                                        ...selectedPlan,
                                        difficulty_level: e.target.value
                                    })}
                                >
                                    <MenuItem value="beginner">{t('Beginner')}</MenuItem>
                                    <MenuItem value="intermediate">{t('Intermediate')}</MenuItem>
                                    <MenuItem value="advanced">{t('Advanced')}</MenuItem>
                                </Select>
                            </FormControl>
                            <TextField
                                fullWidth
                                type="number"
                                label={t('Duration (weeks)')}
                                value={selectedPlan?.duration_weeks || 1}
                                onChange={(e) => setSelectedPlan({
                                    ...selectedPlan,
                                    duration_weeks: parseInt(e.target.value) || 1
                                })}
                                inputProps={{ min: 1, max: 52 }}
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                fullWidth
                                type="number"
                                label={t('Training Sessions per Week')}
                                value={selectedPlan?.training_frequency || 3}
                                onChange={(e) => setSelectedPlan({
                                    ...selectedPlan,
                                    training_frequency: parseInt(e.target.value) || 1
                                })}
                                inputProps={{ min: 1, max: 7 }}
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                fullWidth
                                label={t('Training Objective')}
                                value={selectedPlan?.training_objective || ''}
                                onChange={(e) => setSelectedPlan({
                                    ...selectedPlan,
                                    training_objective: e.target.value
                                })}
                                multiline
                                rows={2}
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                fullWidth
                                label={t('Focus Areas')}
                                value={selectedPlan?.focus_areas || ''}
                                onChange={(e) => setSelectedPlan({
                                    ...selectedPlan,
                                    focus_areas: e.target.value
                                })}
                                multiline
                                rows={2}
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                fullWidth
                                label={t('Exercise Types')}
                                value={selectedPlan?.exercise_types || ''}
                                onChange={(e) => setSelectedPlan({
                                    ...selectedPlan,
                                    exercise_types: e.target.value
                                })}
                                multiline
                                rows={2}
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                fullWidth
                                label={t('Specific Instructions')}
                                value={selectedPlan?.specific_instructions || ''}
                                onChange={(e) => setSelectedPlan({
                                    ...selectedPlan,
                                    specific_instructions: e.target.value
                                })}
                                multiline
                                rows={4}
                                sx={{ mb: 2 }}
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setEditDialogOpen(false)}>
                            {t('Cancel')}
                        </Button>
                        <Button
                            onClick={handleEditPlan}
                            variant="contained"
                            disabled={!selectedPlan?.title || !selectedPlan?.description}
                        >
                            {t('Save Changes')}
                        </Button>
                    </DialogActions>
                </Dialog>

                <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                    <DialogTitle>{t('Delete Training Plan')}</DialogTitle>
                    <DialogContent>
                        <Typography>
                            {t('Are you sure you want to delete the training plan')} "{selectedPlan?.title}"?
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

                <Dialog
                    open={templateDialogOpen}
                    onClose={() => setTemplateDialogOpen(false)}
                    maxWidth="md"
                    fullWidth
                >
                    <DialogTitle>{t('Training Plan Templates')}</DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            {templates.map((template) => (
                                <Grid item xs={12} sm={6} key={template.template_id}>
                                    <Card>
                                        <CardContent>
                                            <Typography variant="h6">{template.template_name}</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {template.description}
                                            </Typography>
                                        </CardContent>
                                        <CardActions>
                                            <Button
                                                size="small"
                                                onClick={() => {
                                                    setNewPlan({
                                                        ...template,
                                                        title: `${template.title} (${t('Copy')})`
                                                    });
                                                    setTemplateDialogOpen(false);
                                                    setCreateDialogOpen(true);
                                                }}
                                            >
                                                {t('Use Template')}
                                            </Button>
                                        </CardActions>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setTemplateDialogOpen(false)}>
                            {t('Close')}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Box>
    );
};

export default TrainingPlans;
