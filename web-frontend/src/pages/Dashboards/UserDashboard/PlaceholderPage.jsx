import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import DashboardSidebar from './DashboardSidebar';

const PlaceholderPage = () => {
    return (
        <Box display="flex">
            <DashboardSidebar />
            <Container maxWidth="sm" sx={{ mt: 4, ml: '260px' }}>
                <Box display="flex" flexDirection="column" alignItems="center">
                    <Typography variant="h3" gutterBottom>
                        Placeholder Page
                    </Typography>
                    <Typography variant="body1" color="text.secondary" align="center">
                        This is a placeholder page. Content will be added here in the future.
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
};

export default PlaceholderPage; 