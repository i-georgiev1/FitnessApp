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
    CircularProgress,
    Alert,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../../../config/axios';
import CoachSidebar from '../CoachSidebar';
import { useTranslation } from 'react-i18next';

const PlanExercises = () => {
    const { t } = useTranslation();
    const { planId } = useParams();
    const navigate = useNavigate();
    const [exercises, setExercises] = useState([]);
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedExercise, setSelectedExercise] = useState(null);
    const [filters, setFilters] = useState({
        weekNumber: 'all',
        dayNumber: 'all'
    });
    const [newExercise, setNewExercise] = useState({
        name: '',
        description: '',
        sets: '',
        reps: '',
        intensity: '',
        rest_period: '',
        special_instructions: '',
        week_number: '',
        day_number: '',
        order_in_day: '',
        video_url: '',
        image_url: ''
    });
    const [sidebarExpanded, setSidebarExpanded] = useState(true);

    useEffect(() => {
        fetchPlanAndExercises();
    }, [planId]);

    const fetchPlanAndExercises = async () => {
        try {
            setLoading(true);
            const planResponse = await axiosInstance.get(`/api/training-plans/${planId}`);
            setPlan(planResponse.data);
            setExercises(planResponse.data.exercises || []);
            setError('');
        } catch (err) {
            console.error('Error fetching exercises:', err);
            console.error('Error response:', err.response?.data);
            setError(t('Failed to load exercises'));
        } finally {
            setLoading(false);
        }
    };

    const handleCreateExercise = async () => {
        try {
            const response = await axiosInstance.post(`/api/training-plans/${planId}/exercises`, newExercise);
            setCreateDialogOpen(false);
            setNewExercise({
                name: '',
                description: '',
                sets: '',
                reps: '',
                intensity: '',
                rest_period: '',
                special_instructions: '',
                week_number: '',
                day_number: '',
                order_in_day: '',
                video_url: '',
                image_url: ''
            });
            fetchPlanAndExercises();
        } catch (err) {
            console.error('Error creating exercise:', err);
            console.error('Error response:', err.response?.data);
            setError(t('Failed to create exercise'));
        }
    };

    const handleEditClick = (exercise) => {
        setSelectedExercise(exercise);
        setEditDialogOpen(true);
    };

    const handleEditExercise = async () => {
        try {
            await axiosInstance.put(
                `/api/training-plans/${planId}/exercises/${selectedExercise.exercise_id}`,
                selectedExercise
            );
            setEditDialogOpen(false);
            setSelectedExercise(null);
            fetchPlanAndExercises();
        } catch (err) {
            console.error('Error updating exercise:', err);
            setError(t('Failed to update exercise'));
        }
    };

    const handleDeleteClick = (exercise) => {
        setSelectedExercise(exercise);
        setDeleteDialogOpen(true);
    };

    const handleDeleteExercise = async () => {
        try {
            await axiosInstance.delete(
                `/api/training-plans/${planId}/exercises/${selectedExercise.exercise_id}`
            );
            setDeleteDialogOpen(false);
            setSelectedExercise(null);
            fetchPlanAndExercises();
        } catch (err) {
            console.error('Error deleting exercise:', err);
            setError(t('Failed to delete exercise'));
        }
    };

    const filterExercises = (exercises) => {
        if (!exercises) return [];

        return exercises.filter(exercise => {
            const weekMatch = filters.weekNumber === 'all' || exercise.week_number === parseInt(filters.weekNumber);
            const dayMatch = filters.dayNumber === 'all' || exercise.day_number === parseInt(filters.dayNumber);
            return weekMatch && dayMatch;
        });
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
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
                    <Box>
                        <Typography variant="h4" gutterBottom>
                            {plan?.title}
                        </Typography>
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle1" color="text.secondary">
                                {t('Duration')}: {plan?.duration_weeks} {t('weeks')} | {t('Training Frequency')}: {plan?.training_frequency} {t('times per week')}
                            </Typography>
                            <Typography variant="subtitle1" color="text.secondary">
                                {t('Exercises')}
                            </Typography>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel>{t('Week')}</InputLabel>
                            <Select
                                value={filters.weekNumber}
                                label={t('Week')}
                                onChange={(e) => setFilters({ ...filters, weekNumber: e.target.value })}
                            >
                                <MenuItem value="all">{t('All Weeks')}</MenuItem>
                                {[...Array(plan?.duration_weeks || 12)].map((_, i) => (
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
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<AddIcon />}
                            onClick={() => setCreateDialogOpen(true)}
                        >
                            {t('Create Exercise')}
                        </Button>
                    </Box>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <Grid container spacing={3}>
                    {filterExercises(exercises).map((exercise) => (
                        <Grid item xs={12} sm={6} md={4} key={exercise.exercise_id}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        {exercise.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                        {exercise.description}
                                    </Typography>
                                    <Typography variant="body2">
                                        {t('Sets')}: {exercise.sets}
                                    </Typography>
                                    <Typography variant="body2">
                                        {t('Reps')}: {exercise.reps}
                                    </Typography>
                                    <Typography variant="body2">
                                        {t('Week')}: {exercise.week_number}, {t('Day')}: {exercise.day_number}
                                    </Typography>
                                    {exercise.intensity && (
                                        <Typography variant="body2">
                                            {t('Intensity')}: {exercise.intensity}
                                        </Typography>
                                    )}
                                    {exercise.rest_period && (
                                        <Typography variant="body2">
                                            {t('Rest Period')}: {exercise.rest_period}
                                        </Typography>
                                    )}
                                </CardContent>
                                <CardActions>
                                    <Button
                                        size="small"
                                        color="primary"
                                        onClick={() => handleEditClick(exercise)}
                                    >
                                        {t('Edit')}
                                    </Button>
                                    <Button
                                        size="small"
                                        color="error"
                                        startIcon={<DeleteIcon />}
                                        onClick={() => handleDeleteClick(exercise)}
                                    >
                                        {t('Delete')}
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                {/* Create Exercise Dialog */}
                <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)}>
                    <DialogTitle>{t('Create Exercise')}</DialogTitle>
                    <DialogContent>
                        <Box sx={{ pt: 2 }}>
                            <TextField
                                fullWidth
                                label={t('Name')}
                                value={newExercise.name}
                                onChange={(e) => setNewExercise({
                                    ...newExercise,
                                    name: e.target.value
                                })}
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                fullWidth
                                label={t('Description')}
                                value={newExercise.description}
                                onChange={(e) => setNewExercise({
                                    ...newExercise,
                                    description: e.target.value
                                })}
                                multiline
                                rows={4}
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                fullWidth
                                label={t('Sets')}
                                type="number"
                                value={newExercise.sets}
                                onChange={(e) => setNewExercise({
                                    ...newExercise,
                                    sets: e.target.value
                                })}
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                fullWidth
                                label={t('Reps')}
                                type="number"
                                value={newExercise.reps}
                                onChange={(e) => setNewExercise({
                                    ...newExercise,
                                    reps: e.target.value
                                })}
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                fullWidth
                                label={t('Intensity')}
                                value={newExercise.intensity}
                                onChange={(e) => setNewExercise({
                                    ...newExercise,
                                    intensity: e.target.value
                                })}
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                fullWidth
                                label={t('Rest Period')}
                                value={newExercise.rest_period}
                                onChange={(e) => setNewExercise({
                                    ...newExercise,
                                    rest_period: e.target.value
                                })}
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                fullWidth
                                label={t('Special Instructions')}
                                value={newExercise.special_instructions}
                                onChange={(e) => setNewExercise({
                                    ...newExercise,
                                    special_instructions: e.target.value
                                })}
                                multiline
                                rows={4}
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                fullWidth
                                label={t('Week Number')}
                                type="number"
                                value={newExercise.week_number}
                                onChange={(e) => setNewExercise({
                                    ...newExercise,
                                    week_number: e.target.value
                                })}
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                fullWidth
                                label={t('Day Number')}
                                type="number"
                                value={newExercise.day_number}
                                onChange={(e) => setNewExercise({
                                    ...newExercise,
                                    day_number: e.target.value
                                })}
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                fullWidth
                                label={t('Order in Day')}
                                type="number"
                                value={newExercise.order_in_day}
                                onChange={(e) => setNewExercise({
                                    ...newExercise,
                                    order_in_day: e.target.value
                                })}
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                fullWidth
                                label={t('Video URL')}
                                value={newExercise.video_url}
                                onChange={(e) => setNewExercise({
                                    ...newExercise,
                                    video_url: e.target.value
                                })}
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                fullWidth
                                label={t('Image URL')}
                                value={newExercise.image_url}
                                onChange={(e) => setNewExercise({
                                    ...newExercise,
                                    image_url: e.target.value
                                })}
                                sx={{ mb: 2 }}
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setCreateDialogOpen(false)}>
                            {t('Cancel')}
                        </Button>
                        <Button
                            onClick={handleCreateExercise}
                            variant="contained"
                            disabled={!newExercise.name}
                        >
                            {t('Create')}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Edit Exercise Dialog */}
                <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
                    <DialogTitle>{t('Edit Exercise')}</DialogTitle>
                    <DialogContent>
                        <Box sx={{ pt: 2 }}>
                            <TextField
                                fullWidth
                                label={t('Name')}
                                value={selectedExercise?.name || ''}
                                onChange={(e) => setSelectedExercise({
                                    ...selectedExercise,
                                    name: e.target.value
                                })}
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                fullWidth
                                label={t('Description')}
                                value={selectedExercise?.description || ''}
                                onChange={(e) => setSelectedExercise({
                                    ...selectedExercise,
                                    description: e.target.value
                                })}
                                multiline
                                rows={4}
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                fullWidth
                                label={t('Sets')}
                                type="number"
                                value={selectedExercise?.sets || ''}
                                onChange={(e) => setSelectedExercise({
                                    ...selectedExercise,
                                    sets: e.target.value
                                })}
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                fullWidth
                                label={t('Reps')}
                                type="number"
                                value={selectedExercise?.reps || ''}
                                onChange={(e) => setSelectedExercise({
                                    ...selectedExercise,
                                    reps: e.target.value
                                })}
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                fullWidth
                                label={t('Intensity')}
                                value={selectedExercise?.intensity || ''}
                                onChange={(e) => setSelectedExercise({
                                    ...selectedExercise,
                                    intensity: e.target.value
                                })}
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                fullWidth
                                label={t('Rest Period')}
                                value={selectedExercise?.rest_period || ''}
                                onChange={(e) => setSelectedExercise({
                                    ...selectedExercise,
                                    rest_period: e.target.value
                                })}
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                fullWidth
                                label={t('Special Instructions')}
                                value={selectedExercise?.special_instructions || ''}
                                onChange={(e) => setSelectedExercise({
                                    ...selectedExercise,
                                    special_instructions: e.target.value
                                })}
                                multiline
                                rows={4}
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                fullWidth
                                label={t('Week Number')}
                                type="number"
                                value={selectedExercise?.week_number || ''}
                                onChange={(e) => setSelectedExercise({
                                    ...selectedExercise,
                                    week_number: e.target.value
                                })}
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                fullWidth
                                label={t('Day Number')}
                                type="number"
                                value={selectedExercise?.day_number || ''}
                                onChange={(e) => setSelectedExercise({
                                    ...selectedExercise,
                                    day_number: e.target.value
                                })}
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                fullWidth
                                label={t('Order in Day')}
                                type="number"
                                value={selectedExercise?.order_in_day || ''}
                                onChange={(e) => setSelectedExercise({
                                    ...selectedExercise,
                                    order_in_day: e.target.value
                                })}
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                fullWidth
                                label={t('Video URL')}
                                value={selectedExercise?.video_url || ''}
                                onChange={(e) => setSelectedExercise({
                                    ...selectedExercise,
                                    video_url: e.target.value
                                })}
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                fullWidth
                                label={t('Image URL')}
                                value={selectedExercise?.image_url || ''}
                                onChange={(e) => setSelectedExercise({
                                    ...selectedExercise,
                                    image_url: e.target.value
                                })}
                                sx={{ mb: 2 }}
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setEditDialogOpen(false)}>
                            {t('Cancel')}
                        </Button>
                        <Button
                            onClick={handleEditExercise}
                            variant="contained"
                            disabled={!selectedExercise?.name}
                        >
                            {t('Save Changes')}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                    <DialogTitle>{t('Delete Exercise')}</DialogTitle>
                    <DialogContent>
                        <Typography>
                            {t('Are you sure you want to delete the exercise')} "{selectedExercise?.name}"?
                            {t('This action cannot be undone.')}
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDeleteDialogOpen(false)}>
                            {t('Cancel')}
                        </Button>
                        <Button
                            onClick={handleDeleteExercise}
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

export default PlanExercises; 