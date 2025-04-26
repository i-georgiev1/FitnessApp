import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Typography,
    Alert
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import axiosInstance from '../../../../config/axios';
import { API_ENDPOINTS } from '../../../../config/api';

const SetupPassword = ({ open, onClose, onSuccess }) => {
    const { t } = useTranslation();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        try {
            if (password !== confirmPassword) {
                setError(t('Passwords do not match'));
                return;
            }

            if (password.length < 8) {
                setError(t('Password must be at least 8 characters long'));
                return;
            }

            await axiosInstance.post(API_ENDPOINTS.auth.setupPassword, {
                password: password
            });

            onSuccess();
            onClose();
        } catch (err) {
            console.error('Error setting up password:', err);
            setError(err.response?.data?.error || t('Failed to set up password'));
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{t('Set Up Your Password')}</DialogTitle>
            <DialogContent>
                <Box sx={{ pt: 2 }}>
                    <Typography variant="body1" sx={{ mb: 3 }}>
                        {t('Welcome! Please set up a password for your account.')}
                    </Typography>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}
                    <TextField
                        fullWidth
                        type="password"
                        label={t('New Password')}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        type="password"
                        label={t('Confirm Password')}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={!password || !confirmPassword}
                >
                    {t('Set Password')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default SetupPassword; 