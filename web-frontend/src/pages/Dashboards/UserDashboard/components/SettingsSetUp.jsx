import React, { useState, useEffect } from 'react';
import {
    Modal,
    Box,
    Typography,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    Stack
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import axiosInstance from '../../../../config/axios';
import { API_ENDPOINTS } from '../../../../config/api';

const SettingsSetUp = ({ open, onClose, profileData, onUpdate }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        contact_number: '',
        age: '',
        gender: '',
        height: '',
        weight: '',
        fitness_level: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (profileData) {
            setFormData({
                contact_number: profileData.contact_number || '',
                age: profileData.age || '',
                gender: profileData.gender || '',
                height: profileData.height || '',
                weight: profileData.weight || '',
                fitness_level: profileData.fitness_level || ''
            });
        }
    }, [profileData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Validate all required fields
        const requiredFields = ['contact_number', 'age', 'gender', 'height', 'weight', 'fitness_level'];
        const missingFields = requiredFields.filter(field => !formData[field]);

        if (missingFields.length > 0) {
            setError(t('Please fill in all required fields'));
            setLoading(false);
            return;
        }

        try {
            await axiosInstance.put(API_ENDPOINTS.profile.update, formData);
            if (onUpdate) {
                onUpdate(formData);
            }
            onClose();
        } catch (err) {
            console.error('Error updating profile:', err);
            setError(t('Failed to update profile'));
        } finally {
            setLoading(false);
        }
    };

    const handleClose = (event, reason) => {
        // Check if all required fields are filled
        const requiredFields = ['contact_number', 'age', 'gender', 'height', 'weight', 'fitness_level'];
        const missingFields = requiredFields.filter(field => !formData[field]);

        // Only allow closing if all required fields are filled
        if (missingFields.length === 0) {
            onClose();
        }
    };

    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="settings-setup-modal"
            disableEscapeKeyDown
            disableAutoFocus
            sx={{
                '& .MuiBackdrop-root': {
                    pointerEvents: 'none'
                }
            }}
        >
            <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '90%',
                maxWidth: 500,
                bgcolor: 'background.paper',
                boxShadow: 24,
                p: 4,
                borderRadius: 2,
                maxHeight: '90vh',
                overflow: 'auto'
            }}>
                <Typography variant="h5" component="h2" gutterBottom>
                    {t('Complete Your Profile')}
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, color: 'error.main' }}>
                    {t('You must complete all required fields before proceeding')}
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <Stack spacing={3}>
                        <TextField
                            required
                            fullWidth
                            label={t('Contact Number')}
                            name="contact_number"
                            value={formData.contact_number}
                            onChange={handleChange}
                        />

                        <TextField
                            required
                            fullWidth
                            type="number"
                            label={t('Age')}
                            name="age"
                            value={formData.age}
                            onChange={handleChange}
                            inputProps={{ min: 0 }}
                        />

                        <FormControl required fullWidth>
                            <InputLabel>{t('Gender')}</InputLabel>
                            <Select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                label={t('Gender')}
                            >
                                <MenuItem value="male">{t('Male')}</MenuItem>
                                <MenuItem value="female">{t('Female')}</MenuItem>
                                <MenuItem value="other">{t('Other')}</MenuItem>
                            </Select>
                        </FormControl>

                        <TextField
                            required
                            fullWidth
                            type="number"
                            label={t('Height (cm)')}
                            name="height"
                            value={formData.height}
                            onChange={handleChange}
                            inputProps={{ min: 0 }}
                        />

                        <TextField
                            required
                            fullWidth
                            type="number"
                            label={t('Weight (kg)')}
                            name="weight"
                            value={formData.weight}
                            onChange={handleChange}
                            inputProps={{ min: 0 }}
                        />

                        <FormControl required fullWidth>
                            <InputLabel>{t('Fitness Level')}</InputLabel>
                            <Select
                                name="fitness_level"
                                value={formData.fitness_level}
                                onChange={handleChange}
                                label={t('Fitness Level')}
                            >
                                <MenuItem value="beginner">{t('Beginner')}</MenuItem>
                                <MenuItem value="intermediate">{t('Intermediate')}</MenuItem>
                                <MenuItem value="advanced">{t('Advanced')}</MenuItem>
                            </Select>
                        </FormControl>

                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            disabled={loading}
                        >
                            {loading ? t('Saving...') : t('Save')}
                        </Button>
                    </Stack>
                </form>
            </Box>
        </Modal>
    );
};

export default SettingsSetUp;
