import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    TableSortLabel,
    TextField,
    MenuItem,
    Grid,
    Chip,
    IconButton,
    Tooltip,
    Alert,
    Snackbar
} from '@mui/material';
import { format } from 'date-fns';
import FilterListIcon from '@mui/icons-material/FilterList';
import AdminSidebar from '../AdminSidebar';
import axios from 'axios';
import API_ENDPOINTS from '../../../../config/api';

const Audit = () => {
    const [sidebarExpanded, setSidebarExpanded] = useState(true);
    const [logs, setLogs] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [orderBy, setOrderBy] = useState('created_at');
    const [order, setOrder] = useState('desc');
    const [filters, setFilters] = useState({
        action: '',
        entity_type: '',
        user_type: '',
        user_search: ''
    });
    const [showFilters, setShowFilters] = useState(false);
    const [error, setError] = useState(null);
    const [openSnackbar, setOpenSnackbar] = useState(false);

    const fetchLogs = async () => {
        try {
            const token = localStorage.getItem('token');

            const params = {
                page: page + 1,
                per_page: rowsPerPage,
                sort_by: orderBy,
                sort_order: order,
                ...filters
            };


            // Remove 'Bearer ' prefix if it exists in the token
            const cleanToken = token?.replace('Bearer ', '').trim();

            const response = await axios.get(API_ENDPOINTS.admin.auditLogs, {
                headers: {
                    'Authorization': `Bearer ${cleanToken}`
                },
                params: params
            });
            setLogs(response.data.logs);
            setTotalCount(response.data.total);
            setError(null);
        } catch (error) {
            console.error('Error fetching audit logs:', error);
            console.error('Error response:', error.response?.data);
            console.error('Request headers:', error.config?.headers);
            let errorMessage = 'Failed to fetch audit logs';

            if (error.response?.status === 401) {
                errorMessage = 'Unauthorized access. Please ensure you are logged in as an admin.';
                // Optionally redirect to login
            } else if (error.response?.status === 403) {
                errorMessage = 'Access forbidden. Admin privileges required.';
            } else if (error.response?.status === 422) {
                errorMessage = error.response.data.error || 'Invalid request parameters. Please try again.';
            }

            setError(errorMessage);
            setOpenSnackbar(true);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [page, rowsPerPage, orderBy, order, filters]);

    const handleCloseSnackbar = () => {
        setOpenSnackbar(false);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleSort = (property) => {
        // Only allow sorting on fields that match backend's valid sort fields
        const validSortFields = ['created_at', 'action', 'entity_type', 'entity_id'];
        if (!validSortFields.includes(property)) {
            return;
        }

        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleFilterChange = (event) => {
        const { name, value } = event.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
        setPage(0);
    };

    const getActionColor = (action) => {
        const colors = {
            create: 'success',
            update: 'info',
            delete: 'error',
            login: 'primary',
            logout: 'secondary'
        };
        return colors[action.toLowerCase()] || 'default';
    };

    const columns = [
        { id: 'created_at', label: 'Timestamp', minWidth: 170 },
        { id: 'user', label: 'User', minWidth: 170 },
        { id: 'action', label: 'Action', minWidth: 100 },
        { id: 'entity_type', label: 'Entity Type', minWidth: 130 },
        { id: 'entity_id', label: 'Entity ID', minWidth: 100 },
        { id: 'details', label: 'Details', minWidth: 200 },
        { id: 'ip_address', label: 'IP Address', minWidth: 130 }
    ];

    return (
        <Box display="flex">
            <AdminSidebar onToggle={(expanded) => setSidebarExpanded(expanded)} />

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
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h4">
                        Audit Logs
                    </Typography>
                    <IconButton onClick={() => setShowFilters(!showFilters)}>
                        <Tooltip title="Toggle Filters">
                            <FilterListIcon />
                        </Tooltip>
                    </IconButton>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {showFilters && (
                    <Paper sx={{ p: 2, mb: 3 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Search User (Name or Email)"
                                    name="user_search"
                                    value={filters.user_search}
                                    onChange={handleFilterChange}
                                    placeholder="Enter name or email to search"
                                    sx={{ mb: 2 }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    select
                                    fullWidth
                                    label="Action"
                                    name="action"
                                    value={filters.action}
                                    onChange={handleFilterChange}
                                >
                                    <MenuItem value="">All</MenuItem>
                                    <MenuItem value="create">Create</MenuItem>
                                    <MenuItem value="update">Update</MenuItem>
                                    <MenuItem value="delete">Delete</MenuItem>
                                    <MenuItem value="login">Login</MenuItem>
                                    <MenuItem value="logout">Logout</MenuItem>
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    select
                                    fullWidth
                                    label="Entity Type"
                                    name="entity_type"
                                    value={filters.entity_type}
                                    onChange={handleFilterChange}
                                >
                                    <MenuItem value="">All</MenuItem>
                                    <MenuItem value="user">User</MenuItem>
                                    <MenuItem value="meal_plan">Meal Plan</MenuItem>
                                    <MenuItem value="training_plan">Training Plan</MenuItem>
                                    <MenuItem value="body_metrics">Body Metrics</MenuItem>
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    select
                                    fullWidth
                                    label="User Type"
                                    name="user_type"
                                    value={filters.user_type}
                                    onChange={handleFilterChange}
                                >
                                    <MenuItem value="">All</MenuItem>
                                    <MenuItem value="admin">Admin</MenuItem>
                                    <MenuItem value="coach">Coach</MenuItem>
                                    <MenuItem value="user">User</MenuItem>
                                </TextField>
                            </Grid>
                        </Grid>
                    </Paper>
                )}

                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                {columns.map((column) => (
                                    <TableCell
                                        key={column.id}
                                        style={{ minWidth: column.minWidth }}
                                    >
                                        <TableSortLabel
                                            active={orderBy === column.id}
                                            direction={orderBy === column.id ? order : 'asc'}
                                            onClick={() => handleSort(column.id)}
                                        >
                                            {column.label}
                                        </TableSortLabel>
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {logs.map((log) => (
                                <TableRow hover key={log.id}>
                                    <TableCell>
                                        {format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss')}
                                    </TableCell>
                                    <TableCell>
                                        {log.user ? `${log.user.first_name} ${log.user.last_name}` : 'Unknown User'}
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={log.action}
                                            color={getActionColor(log.action)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>{log.entity_type}</TableCell>
                                    <TableCell>{log.entity_id}</TableCell>
                                    <TableCell>{log.details}</TableCell>
                                    <TableCell>{log.ip_address}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    rowsPerPageOptions={[10, 25, 50]}
                    component="div"
                    count={totalCount}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Box>

            <Snackbar
                open={openSnackbar}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert onClose={handleCloseSnackbar} severity="error">
                    {error}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Audit;
