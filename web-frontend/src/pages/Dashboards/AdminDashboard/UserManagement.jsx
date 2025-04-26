import React, { useState, useEffect } from 'react';
import {
    Box,
    // Remove Container if main content Box handles padding
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Typography,
    Button,
    IconButton,
    TextField,
    CircularProgress,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Stack,
    Snackbar
} from '@mui/material';
import { useTheme } from '@mui/material/styles'; // Import useTheme
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Block as BlockIcon,
    CheckCircle as CheckCircleIcon,
    Send as SendIcon
} from '@mui/icons-material';
import axiosInstance from '../../../config/axios';
import AdminSidebar from './AdminSidebar'; // Assuming AdminSidebar is already responsive internally
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { API_ENDPOINTS } from '../../../config/api';

const UserManagement = () => {
    const { t } = useTranslation();
    const theme = useTheme(); // Get the theme for transitions
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [assignCoachDialogOpen, setAssignCoachDialogOpen] = useState(false);
    const [selectedCoach, setSelectedCoach] = useState('');
    const [coaches, setCoaches] = useState([]);
    const [currentCoach, setCurrentCoach] = useState(null);
    const [newUser, setNewUser] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        user_type: 'user'
    });
    const [coachAssignments, setCoachAssignments] = useState({}); // This state doesn't seem used in rendering the table?
    const navigate = useNavigate();
    const [sidebarExpanded, setSidebarExpanded] = useState(true); // State from AdminSidebar
    const [openInviteDialog, setOpenInviteDialog] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteUserType, setInviteUserType] = useState('user');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // Use a more descriptive name for notification state
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        // This fetches coaches whenever assignCoachDialogOpen opens
        if (assignCoachDialogOpen || editDialogOpen) { // Fetch coaches when either dialog that needs them opens
             fetchCoaches();
             if (selectedUser && selectedUser.user_type === 'user') {
                 fetchCurrentCoach(selectedUser.user_id);
             }
        } else {
             // Reset selected coach and current coach when dialog closes
             setSelectedCoach('');
             setCurrentCoach(null);
        }
    }, [assignCoachDialogOpen, editDialogOpen, selectedUser]); // Depend on selectedUser as well

    // This function seems unused, and the coach assignments are fetched within fetchUsers now.
    // If you need to display assignments in the table later, you might use this data.
    // const fetchAllCoachAssignments = async () => {
    //     try {
    //         const response = await axiosInstance.get(API_ENDPOINTS.admin.coachClients);
    //         const assignments = {};
    //         if (response.data && Array.isArray(response.data.assignments)) {
    //             response.data.assignments.forEach(assignment => {
    //                 if (assignment.status === 'active') {
    //                     assignments[assignment.client_id] = assignment.coach_id;
    //                 }
    //             });
    //         }
    //         setCoachAssignments(assignments);
    //     } catch (err) {
    //         console.error('Error fetching coach assignments:', err);
    //         // Don't throw error here, just log it
    //     }
    // };


    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(API_ENDPOINTS.admin.users);
            setUsers(response.data);
            // Decide if you still need fetchAllCoachAssignments here or if fetching per user is enough
            // await fetchAllCoachAssignments(); // Keep if you need assignments for the main table view
            setLoading(false);
        } catch (err) {
            console.error('Error fetching users:', err);
            if (err.response?.status === 401 || err.response?.status === 403) {
                setError(t('Unauthorized: Admin access required'));
                navigate('/login'); // Redirect to login on auth failure
            } else {
                setError(t('Failed to load user data'));
            }
            setLoading(false);
        }
    };

    const fetchCoaches = async () => {
        try {
            // Assuming the users endpoint returns all users and we filter by type
            const response = await axiosInstance.get(API_ENDPOINTS.admin.users);
            const coachUsers = response.data.filter(user => user.user_type === 'coach');
            setCoaches(coachUsers);
        } catch (err) {
            console.error('Error fetching coaches:', err);
            // Set notification instead of global error for specific actions?
            // setError(t('Failed to load coaches'));
            setNotification({
                 open: true,
                 message: t('Failed to load coaches for assignment'),
                 severity: 'error'
            });
        }
    };

    const fetchCurrentCoach = async (userId) => {
         if (!userId) {
              setCurrentCoach(null);
              setSelectedCoach('');
              return;
         }
        try {
            // Assuming an endpoint exists to get assignments for a specific user/client
            // The original code fetched ALL assignments and filtered on the client side.
            // A more efficient approach might be an endpoint like GET /admin/users/{userId}/coach
            // For now, let's stick to the existing logic but make sure it filters correctly.
             const response = await axiosInstance.get(API_ENDPOINTS.admin.coachClients);
             if (response.data && Array.isArray(response.data.assignments)) {
                  const assignment = response.data.assignments.find(
                       a => a.client_id === userId && a.status === 'active'
                  );
                  if (assignment) {
                       setCurrentCoach(assignment.coach_id);
                       setSelectedCoach(assignment.coach_id); // Pre-select current coach in dropdown
                  } else {
                       setCurrentCoach(null);
                       setSelectedCoach('');
                  }
             } else {
                  setCurrentCoach(null);
                  setSelectedCoach('');
             }
        } catch (err) {
            console.error('Error fetching current coach:', err);
             setCurrentCoach(null);
             setSelectedCoach('');
             setNotification({
                 open: true,
                 message: t('Failed to load current coach assignment'),
                 severity: 'error'
             });
        }
    };


    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
        setPage(0); // Reset page on search
    };

    const handleEditUser = async (user) => {
        setSelectedUser(user);
        setEditDialogOpen(true);
         // The useEffect hook now handles fetching coaches and current coach when dialog opens
    };

    const handleSaveEdit = async () => {
         if (!selectedUser) return; // Should not happen if dialog is open

        try {
            // Prepare user data for update, excluding coach assignment logic here
            // Coach assignment is handled separately in the dialog logic and save
             const userUpdateData = {
                 first_name: selectedUser.first_name,
                 last_name: selectedUser.last_name,
                 email: selectedUser.email,
                 // Do NOT include password here unless explicitly allowed/changed
                 user_type: selectedUser.user_type,
                 // Do NOT include is_active here, status is handled by the toggle button
             };

            // Update user details
             const userResponse = await axiosInstance.put(`${API_ENDPOINTS.admin.users}/${selectedUser.user_id}`, userUpdateData);
             console.log('User update response:', userResponse.data);

            // Handle coach assignment if the user is a regular user AND a coach was selected/changed
             if (selectedUser.user_type === 'user') {
                  // Check if the selected coach is different from the current coach
                  if (selectedCoach !== (currentCoach || '')) { // Compare selectedCoach string with currentCoach ID (or empty if null)
                       // If there's a current assignment, deactivate it
                       if (currentCoach) {
                            console.log(`Deactivating assignment for client ${selectedUser.user_id} with coach ${currentCoach}`);
                           await axiosInstance.patch(
                                API_ENDPOINTS.admin.deactivateAssignment(currentCoach),
                                { client_id: selectedUser.user_id }
                            );
                       }

                       // If a new coach is selected (i.e., selectedCoach is not empty)
                       if (selectedCoach) {
                             console.log(`Creating new assignment for client ${selectedUser.user_id} with coach ${selectedCoach}`);
                           await axiosInstance.post(
                                API_ENDPOINTS.admin.assignClient,
                                {
                                    coach_id: selectedCoach,
                                    client_id: selectedUser.user_id
                                }
                           );
                       }
                  }
             }


            setEditDialogOpen(false);
            // Reset dialog states
             setSelectedUser(null);
             setSelectedCoach('');
             setCurrentCoach(null);

            await fetchUsers(); // Refresh the user list and assignments
            setNotification({
                open: true,
                message: t('User updated successfully'),
                severity: 'success'
            });
        } catch (err) {
            console.error('Error updating user:', err.response?.data || err);
            setNotification({
                open: true,
                message: err.response?.data?.error || err.response?.data?.message || t('Failed to update user'),
                severity: 'error'
            });
        }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm(t('Are you sure you want to delete this user?'))) {
            try {
                await axiosInstance.delete(`${API_ENDPOINTS.admin.users}/${userId}`);
                // setError(''); // Clear general error if specific action succeeded
                fetchUsers(); // Fetch updated list
                setNotification({
                     open: true,
                     message: t('User deleted successfully'),
                     severity: 'success'
                });
            } catch (err) {
                console.error('Error deleting user:', err.response || err);
                if (err.response?.status === 401 || err.response?.status === 403) {
                    // setError(t('Unauthorized: Admin access required')); // Consider using notification instead
                    navigate('/login');
                } else if (err.response?.status === 404) {
                    // setError(t('User not found')); // Consider using notification instead
                     setNotification({
                         open: true,
                         message: t('User not found'),
                         severity: 'error'
                     });
                } else if (err.response?.data?.message) {
                    // setError(err.response.data.message); // Consider using notification instead
                     setNotification({
                         open: true,
                         message: err.response.data.message,
                         severity: 'error'
                     });
                } else {
                    // setError(t('Failed to delete user')); // Consider using notification instead
                     setNotification({
                         open: true,
                         message: t('Failed to delete user'),
                         severity: 'error'
                     });
                }
            }
        }
    };

    const handleToggleUserStatus = async (userId, currentStatus) => {
        try {
            const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
            console.log('Toggling status:', { userId, currentStatus, newStatus });

            const response = await axiosInstance.patch(`${API_ENDPOINTS.admin.users}/${userId}/status`, {
                status: newStatus
            });

            console.log('Toggle response:', response);

            if (response.status === 200) {
                // setError(''); // Clear general error
                await fetchUsers(); // Fetch updated list
                 setNotification({
                     open: true,
                     message: t('User status updated successfully'),
                     severity: 'success'
                 });
            }
        } catch (err) {
            console.error('Error toggling user status:', err.response || err);
            if (err.response?.status === 401 || err.response?.status === 403) {
                // setError(t('Unauthorized: Admin access required')); // Consider using notification
                navigate('/login');
            } else if (err.response?.data?.error) {
                // setError(err.response.data.error); // Consider using notification
                 setNotification({
                     open: true,
                     message: err.response.data.error,
                     severity: 'error'
                 });
            } else {
                // setError(t('Failed to update user status')); // Consider using notification
                 setNotification({
                     open: true,
                     message: t('Failed to update user status'),
                     severity: 'error'
                 });
            }
        }
    };

    const handleCreateUser = async () => {
         // Basic validation
         if (!newUser.first_name || !newUser.last_name || !newUser.email || !newUser.password || !newUser.user_type) {
             setNotification({
                 open: true,
                 message: t('Please fill in all fields'),
                 severity: 'warning'
             });
             return;
         }
         if (!/\S+@\S+\.\S+/.test(newUser.email)) {
              setNotification({
                   open: true,
                   message: t('Please enter a valid email address'),
                   severity: 'warning'
              });
              return;
         }


        try {
            await axiosInstance.post(API_ENDPOINTS.auth.register, newUser); // Using register endpoint? Ensure this is the correct admin endpoint to create users without email verification if needed. Assuming it's correct for now.
            setCreateDialogOpen(false);
            setNewUser({
                first_name: '',
                last_name: '',
                email: '',
                password: '',
                user_type: 'user'
            });
            fetchUsers(); // Fetch updated list
             setNotification({
                 open: true,
                 message: t('User created successfully'),
                 severity: 'success'
             });
            // setError(''); // Clear general error
        } catch (err) {
            console.error('Error creating user:', err.response?.data || err);
            if (err.response?.status === 401 || err.response?.status === 403) {
                // setError(t('Unauthorized: Admin access required')); // Use notification
                navigate('/login');
            }
            else if (err.response?.status === 409) {
                // setError(t('User Already exists')); // Use notification
                 setNotification({
                     open: true,
                     message: t('User with this email already exists'),
                     severity: 'error'
                 });

            }
            else {
                // setError(t('Failed to create user')); // Use notification
                 setNotification({
                     open: true,
                     message: err.response?.data?.error || err.response?.data?.message || t('Failed to create user'),
                     severity: 'error'
                 });
            }
        }
    };

    // The separate Assign Coach dialog seems redundant given the Edit User dialog now includes this functionality.
    // Let's keep the functionality integrated into the Edit User dialog for simplicity, as implemented in handleSaveEdit.
    // We can potentially remove the assignCoachDialogOpen state and related handlers if the Edit dialog suffices.
    // However, the original code *did* have a separate assign coach button. Let's keep the logic in Edit for now
    // and decide if the separate dialog is still needed or wanted. The separate button in the table could
    // just open the *Edit* dialog with the coach select visible.

    // Removing the separate Assign Coach handlers and dialog state
    // const handleAssignCoach = (user) => {
    //     setSelectedUser(user);
    //     setAssignCoachDialogOpen(true); // This dialog seems redundant with the Edit dialog now
    // };

    // Removing the separate Save Assignment handler
    // const handleSaveAssignment = async () => { /* ... logic now in handleSaveEdit */ };

    const handleSendInvite = async () => {
        // Basic validation
        if (!inviteEmail || !/\S+@\S+\.\S+/.test(inviteEmail)) {
             setSnackbar({
                 open: true,
                 message: t('Please enter a valid email address'),
                 severity: 'warning'
             });
            return;
        }

        try {
            await axiosInstance.post(API_ENDPOINTS.admin.sendInvite, {
                email: inviteEmail,
                user_type: inviteUserType
            });
            setOpenInviteDialog(false);
            setInviteEmail('');
            setInviteUserType('user');
            setSnackbar({ // UsingSnackbar for invite feedback
                open: true,
                message: t('Invitation sent successfully'),
                severity: 'success'
            });
        } catch (err) {
            console.error('Error sending invite:', err.response?.data || err);
            setSnackbar({ // Using Snackbar for invite feedback
                open: true,
                message: err.response?.data?.error || err.response?.data?.message || t('Failed to send invitation'),
                severity: 'error'
            });
        }
    };

    const filteredUsers = users.filter(user =>
        // Check if user or any of its values is null/undefined before calling toLowerCase()
        Object.values(user).some(value =>
            String(value ?? '').toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbar({ ...snackbar, open: false });
    };

    const handleCloseNotification = (event, reason) => {
         if (reason === 'clickaway') {
              return;
         }
         setNotification({ ...notification, open: false });
    };


    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex' }}>
            {/* AdminSidebar handles its own responsiveness */}
            <AdminSidebar onToggle={(expanded) => setSidebarExpanded(expanded)} />

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: { xs: 2, sm: 3 }, // Adjust padding based on screen size
                    width: {
                        xs: '100%', // Full width on extra small screens
                        sm: `calc(100% - ${sidebarExpanded ? '270px' : '65px'})`, // Calculated width on small and above
                    },
                    ml: {
                        xs: 0, // No left margin on extra small screens
                        sm: sidebarExpanded ? '270px' : '65px', // Margin based on sidebar state on small and above
                    },
                    transition: theme.transitions.create(['width', 'margin-left'], {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.enteringScreen,
                    }),
                }}
            >
                {/* Toolbar / Header */}
                <Box sx={{
                     display: 'flex',
                     flexDirection: { xs: 'column', sm: 'row' }, // Stack vertically on xs
                     justifyContent: 'space-between',
                     alignItems: { xs: 'flex-start', sm: 'center' }, // Align items differently when stacked
                     mb: 3,
                     gap: { xs: 2, sm: 0 } // Add gap when stacked
                }}>
                    <Typography variant="h4" gutterBottom sx={{ mb: { xs: 1, sm: 0 } }}>
                        {t('User Management')}
                    </Typography>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: { xs: '100%', sm: 'auto' } }}>
                        <Button
                            variant="outlined"
                            color="primary"
                            onClick={() => setOpenInviteDialog(true)}
                            startIcon={<SendIcon />}
                            fullWidth={window.innerWidth < theme.breakpoints.values.sm} // Make button full width on xs
                        >
                            {t('Send Invite Link')}
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => setCreateDialogOpen(true)}
                            fullWidth={window.innerWidth < theme.breakpoints.values.sm} // Make button full width on xs
                        >
                            {t('Create User')}
                        </Button>
                    </Stack>
                </Box>

                 {/* General Error Alert (if needed, or rely on snackbar) */}
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}


                <Paper sx={{ p: { xs: 1, sm: 2 }, mb: 2 }}> {/* Adjust paper padding */}
                    <TextField
                        fullWidth
                        label={t('Search Users')}
                        variant="outlined"
                        value={searchTerm}
                        onChange={handleSearch}
                        sx={{ mb: 2 }}
                        size="small" // Use smaller size for density on mobile
                    />

                    {/* Make TableContainer horizontally scrollable */}
                    <TableContainer sx={{ overflowX: 'auto' }}>
                        <Table sx={{ minWidth: 650 }}> {/* Add a minWidth to ensure scrolling */}
                            <TableHead>
                                <TableRow>
                                    {/* Consider hiding less important columns on small screens */}
                                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{t('ID')}</TableCell>
                                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{t('Name')}</TableCell>
                                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{t('Email')}</TableCell>
                                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{t('Last Login')}</TableCell>
                                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{t('User Type')}</TableCell>
                                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{t('Status')}</TableCell>
                                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{t('Actions')}</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredUsers
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((user) => (
                                        <TableRow key={user.user_id}>
                                            <TableCell sx={{ whiteSpace: 'nowrap' }}>{user.user_id}</TableCell>
                                            <TableCell sx={{ whiteSpace: 'nowrap' }}>{`${user.first_name} ${user.last_name}`}</TableCell>
                                            <TableCell sx={{ whiteSpace: 'nowrap' }}>{user.email}</TableCell>
                                            <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                                {user.last_login
                                                    ? new Date(user.last_login).toLocaleString(undefined, {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })
                                                    : t('Never')}
                                            </TableCell>
                                            <TableCell sx={{ whiteSpace: 'nowrap' }}>{t(user.user_type)}</TableCell>
                                            <TableCell sx={{ whiteSpace: 'nowrap' }}>{t(user.is_active ? 'active' : 'inactive')}</TableCell>
                                            <TableCell sx={{ whiteSpace: 'nowrap' }}> {/* Prevent actions from wrapping */}
                                                <IconButton
                                                    onClick={() => handleEditUser(user)}
                                                    size="small"
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                                {/* Conditionally render Assign Coach button only for 'user' type */}
                                                 {user.user_type === 'user' && (
                                                      <IconButton
                                                          onClick={() => handleEditUser(user)} // Open Edit dialog to assign coach
                                                          size="small"
                                                          color="primary" // Optional: different color for clarity
                                                           title={t('Assign Coach')}
                                                      >
                                                          <SendIcon /> {/* Or a different icon */}
                                                      </IconButton>
                                                 )}
                                                <IconButton
                                                    onClick={() => handleToggleUserStatus(user.user_id, user.is_active ? 'active' : 'inactive')}
                                                    size="small"
                                                    color={user.is_active ? 'error' : 'success'}
                                                    title={user.is_active ? t('Deactivate User') : t('Activate User')}
                                                >
                                                    {user.is_active ? <BlockIcon /> : <CheckCircleIcon />}
                                                </IconButton>
                                                <IconButton
                                                    onClick={() => handleDeleteUser(user.user_id)}
                                                    size="small"
                                                    color="error"
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <TablePagination
                        component="div"
                        count={filteredUsers.length}
                        page={page}
                        onPageChange={handleChangePage}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        rowsPerPageOptions={[5, 10, 25]} // Add more options if desired
                    />
                </Paper>

                {/* Create User Dialog */}
                <Dialog
                    open={createDialogOpen}
                    onClose={() => setCreateDialogOpen(false)}
                    fullWidth // Dialog takes full width of container
                    maxWidth="sm" // Max width before scaling down
                >
                    <DialogTitle>{t('Create User')}</DialogTitle>
                    <DialogContent>
                        <Box sx={{ pt: 2 }}>
                            <TextField
                                fullWidth
                                label={t('First Name')}
                                value={newUser.first_name}
                                onChange={(e) => setNewUser({
                                    ...newUser,
                                    first_name: e.target.value
                                })}
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                fullWidth
                                label={t('Last Name')}
                                value={newUser.last_name}
                                onChange={(e) => setNewUser({
                                    ...newUser,
                                    last_name: e.target.value
                                })}
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                fullWidth
                                label={t('Email')}
                                type="email"
                                value={newUser.email}
                                onChange={(e) => setNewUser({
                                    ...newUser,
                                    email: e.target.value
                                })}
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                fullWidth
                                label={t('Password')}
                                type="password"
                                value={newUser.password}
                                onChange={(e) => setNewUser({
                                    ...newUser,
                                    password: e.target.value
                                })}
                                sx={{ mb: 2 }}
                            />
                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel>{t('User Type')}</InputLabel>
                                <Select
                                    value={newUser.user_type}
                                    label={t('User Type')}
                                    onChange={(e) => setNewUser({
                                        ...newUser,
                                        user_type: e.target.value
                                    })}
                                >
                                    <MenuItem value="user">{t('user')}</MenuItem>
                                    <MenuItem value="coach">{t('coach')}</MenuItem>
                                    <MenuItem value="admin">{t('admin')}</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setCreateDialogOpen(false)}>{t('Cancel')}</Button>
                        <Button onClick={handleCreateUser} variant="contained">{t('Create')}</Button>
                    </DialogActions>
                </Dialog>

                {/* Edit User Dialog */}
                {/* This dialog now also handles coach assignment for 'user' types */}
                <Dialog
                    open={editDialogOpen}
                    onClose={() => setEditDialogOpen(false)}
                    fullWidth // Dialog takes full width
                    maxWidth="sm" // Max width before scaling down
                >
                    <DialogTitle>{t('Edit User')}</DialogTitle>
                    <DialogContent>
                        {selectedUser && (
                            <Box sx={{ pt: 2 }}>
                                <TextField
                                    fullWidth
                                    label={t('First Name')}
                                    value={selectedUser.first_name}
                                    onChange={(e) => setSelectedUser({
                                        ...selectedUser,
                                        first_name: e.target.value
                                    })}
                                    sx={{ mb: 2 }}
                                />
                                <TextField
                                    fullWidth
                                    label={t('Last Name')}
                                    value={selectedUser.last_name}
                                    onChange={(e) => setSelectedUser({
                                        ...selectedUser,
                                        last_name: e.target.value
                                    })}
                                    sx={{ mb: 2 }}
                                />
                                <TextField
                                    fullWidth
                                    label={t('Email')}
                                    value={selectedUser.email}
                                    onChange={(e) => setSelectedUser({
                                        ...selectedUser,
                                        email: e.target.value
                                    })}
                                    sx={{ mb: 2 }}
                                />
                                <FormControl fullWidth sx={{ mb: 2 }}>
                                    <InputLabel>{t('User Type')}</InputLabel>
                                    <Select
                                        value={selectedUser.user_type}
                                        label={t('User Type')}
                                        onChange={(e) => setSelectedUser({
                                            ...selectedUser,
                                            user_type: e.target.value
                                        })}
                                        // Disable user type change if it's an admin user for safety?
                                         disabled={selectedUser.user_type === 'admin'}
                                    >
                                        <MenuItem value="user">{t('user')}</MenuItem>
                                        <MenuItem value="coach">{t('coach')}</MenuItem>
                                        {/* Allow changing to admin only if the current user is not an admin, or handle carefully */}
                                         {selectedUser.user_type === 'admin' ? (
                                              <MenuItem value="admin">{t('admin')}</MenuItem>
                                         ) : (
                                              <MenuItem value="admin">{t('admin')}</MenuItem> // Allow changing to admin for now
                                         )}
                                    </Select>
                                </FormControl>

                                {/* Coach assignment section for regular users */}
                                {selectedUser.user_type === 'user' && (
                                    <FormControl fullWidth sx={{ mb: 2 }}>
                                        <InputLabel>{t('Assigned Coach')}</InputLabel>
                                        <Select
                                            value={selectedCoach}
                                            label={t('Assigned Coach')}
                                            onChange={(e) => setSelectedCoach(e.target.value)}
                                        >
                                            <MenuItem value="">
                                                <em>{t('No Coach')}</em>
                                            </MenuItem>
                                            {coaches.map((coach) => (
                                                <MenuItem
                                                    key={coach.user_id}
                                                    value={coach.user_id}
                                                    sx={{
                                                        fontWeight: coach.user_id === currentCoach ? 'bold' : 'normal',
                                                        // bgcolor: coach.user_id === currentCoach ? 'action.selected' : 'transparent' // Visual hint for current coach
                                                    }}
                                                >
                                                    {`${coach.first_name} ${coach.last_name}`}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                         {currentCoach && (
                                              <Typography
                                                   variant="caption"
                                                   color="textSecondary"
                                                   sx={{ mt: 1, display: 'block' }}
                                              >
                                                   {t('Currently assigned to: {{name}}', {
                                                        name: `${coaches.find(c => c.user_id === currentCoach)?.first_name || ''} ${coaches.find(c => c.user_id === currentCoach)?.last_name || ''}`
                                                   })}
                                              </Typography>
                                         )}

                                    </FormControl>
                                )}
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setEditDialogOpen(false)}>{t('Cancel')}</Button>
                        <Button onClick={handleSaveEdit} variant="contained">{t('Save Changes')}</Button>
                    </DialogActions>
                </Dialog>

                {/* Removed the redundant Assign Coach Dialog */}
                {/* <Dialog open={assignCoachDialogOpen} onClose={() => setAssignCoachDialogOpen(false)}> */}
                {/* ... Removed ... */}
                {/* </Dialog> */}

                {/* Invite Dialog */}
                <Dialog
                    open={openInviteDialog}
                    onClose={() => setOpenInviteDialog(false)}
                    fullWidth // Dialog takes full width
                    maxWidth="sm" // Max width before scaling down
                >
                    <DialogTitle>{t('Send Invitation Link')}</DialogTitle>
                    <DialogContent>
                        <Box sx={{ pt: 2 }}>
                            <TextField
                                fullWidth
                                label={t('Email Address')}
                                type="email"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                placeholder={t('Enter email address')}
                                sx={{ mb: 2 }}
                            />
                            <FormControl fullWidth>
                                <InputLabel>{t('User Type')}</InputLabel>
                                <Select
                                    value={inviteUserType}
                                    label={t('User Type')}
                                    onChange={(e) => setInviteUserType(e.target.value)}
                                >
                                    <MenuItem value="user">{t('user')}</MenuItem>
                                    <MenuItem value="coach">{t('coach')}</MenuItem>
                                    <MenuItem value="admin">{t('admin')}</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => {
                            setOpenInviteDialog(false);
                            setInviteEmail('');
                            setInviteUserType('user');
                        }}>
                            {t('Cancel')}
                        </Button>
                        <Button
                            onClick={handleSendInvite}
                            variant="contained"
                            disabled={!inviteEmail || !/\S+@\S+\.\S+/.test(inviteEmail)} // Disable if email is empty or invalid format
                        >
                            {t('Send Invite')}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Snackbar for notifications (using one for general feedback) */}
                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={6000}
                    onClose={handleCloseSnackbar}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }} // Adjust position if needed
                >
                    <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                        {snackbar.message}
                    </Alert>
                </Snackbar>

                 {/* Consider replacing the general error state with a second snackbar or a persistent alert */}
                 {/* For now, keeping the Alert but maybe use the notification state for it */}
                  <Snackbar
                       open={notification.open}
                       autoHideDuration={6000}
                       onClose={handleCloseNotification}
                       anchorOrigin={{ vertical: 'top', horizontal: 'center' }} // Position differently than the other snackbar
                  >
                       <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
                            {notification.message}
                       </Alert>
                  </Snackbar>

            </Box>
        </Box>
    );
};

export default UserManagement;