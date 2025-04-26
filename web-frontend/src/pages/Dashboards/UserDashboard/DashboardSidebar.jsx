import React, { useState, useEffect } from 'react';
import {
    Box,
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider,
    ListItemButton,
    Collapse,
    Typography,
    useTheme,
    IconButton
} from '@mui/material';
import {
    AccountCircle,
    ArrowBack,
    Settings as SettingsIcon,
    Logout,
    Dashboard,
    FitnessCenter,
    Restaurant,
    TrendingUp,
    Assessment,
    MenuBook,
    Description,
    CalendarMonth,
    ExpandLess,
    ExpandMore,
    ChevronLeft,
    ChevronRight,
    Flag,
    Summarize,
    Upload,
    DarkMode,
    LightMode
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import LanguageSwitcher from '../../../components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import { useTheme as useCustomTheme } from '../../../context/ThemeContext';

const DashboardSidebar = ({ expanded, onToggle }) => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const theme = useTheme();
    const { darkMode, toggleDarkMode } = useCustomTheme();
    const [userType, setUserType] = useState(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        return user?.user_type || null;
    });

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user?.user_type) {
            setUserType(user.user_type);
        }
    }, []);

    const handleSignOut = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userSidebarMenus');
        navigate('/login');
    };

    const toggleMenu = (menu) => {
        const newOpenMenus = {
            ...openMenus,
            [menu]: !openMenus[menu]
        };
        setOpenMenus(newOpenMenus);
        localStorage.setItem('userSidebarMenus', JSON.stringify(newOpenMenus));
    };

    // Core navigation items
    const coreMenuItems = [
        { text: t('Profile Overview'), icon: <AccountCircle />, onClick: () => navigate('/dashboard') },
        { text: t('Calendar'), icon: <CalendarMonth />, onClick: () => navigate('/dashboard/calendar') },
        { text: t('Exercises'), icon: <FitnessCenter />, onClick: () => navigate('/dashboard/exercises') },
        { text: t('Meal Plan'), icon: <Restaurant />, onClick: () => navigate('/dashboard/meal-plans') },
        { text: t('Progress Tracking'), icon: <TrendingUp />, onClick: () => navigate('/dashboard/progress') },
        { text: t('Settings'), icon: <SettingsIcon />, onClick: () => navigate('/dashboard/settings') },
    ];

    // Render a collapsible menu section
    const renderMenuSection = (title, items, menuKey) => (
        <>
            {expanded && (
                <ListItemButton onClick={() => toggleMenu(menuKey)}>
                    <ListItemText
                        primary={<Typography variant="subtitle2" color="text.secondary">{title}</Typography>}
                    />
                    {openMenus[menuKey] ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
            )}
            <Collapse in={expanded && openMenus[menuKey]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                    {items.map((item, index) => (
                        <ListItem key={index} disablePadding>
                            <ListItemButton
                                onClick={item.onClick}
                                sx={{
                                    pl: expanded ? 4 : 2,
                                    justifyContent: expanded ? 'flex-start' : 'center',
                                    minHeight: 48
                                }}
                            >
                                <ListItemIcon sx={{
                                    minWidth: expanded ? 40 : 'auto',
                                    mr: expanded ? 2 : 'auto',
                                    justifyContent: 'center'
                                }}>
                                    {item.icon}
                                </ListItemIcon>
                                {expanded && <ListItemText primary={item.text} />}
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Collapse>
        </>
    );

    const [openMenus, setOpenMenus] = useState(() => {
        const savedMenus = localStorage.getItem('userSidebarMenus');
        return savedMenus ? JSON.parse(savedMenus) : {
            core: true,
            fitness: false,
            nutrition: false,
            progress: false
        };
    });

    return (
        <Drawer
            variant="permanent"
            sx={{
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: expanded ? 270 : 65,
                    boxSizing: 'border-box',
                    borderRight: '1px solid rgba(0, 0, 0, 0.12)',
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    transition: theme.transitions.create('width', {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.enteringScreen,
                    }),
                }
            }}
        >
            <Box sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* App logo or title */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: theme.spacing(0, 1),
                        ...theme.mixins.toolbar,
                    }}
                >
                    {expanded && <Typography variant="h6">{t('User Portal')}</Typography>}
                </Box>

                <Divider />

                {/* Menu Items */}
                <List>
                    {expanded ? (
                        <>
                            {renderMenuSection(t('Main Navigation'), coreMenuItems, 'core')}
                        </>
                    ) : (
                        // Collapsed view shows only icons
                        <>
                            {[...coreMenuItems]
                                .slice(0, 15)
                                .map((item, index) => (
                                    <ListItem key={index} disablePadding>
                                        <ListItemButton
                                            onClick={item.onClick}
                                            sx={{
                                                minHeight: 48,
                                                justifyContent: 'center',
                                                px: 2.5,
                                            }}
                                        >
                                            <ListItemIcon
                                                sx={{
                                                    minWidth: 0,
                                                    mr: 'auto',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                {item.icon}
                                            </ListItemIcon>
                                        </ListItemButton>
                                    </ListItem>
                                ))}
                        </>
                    )}
                </List>

                {/* Back to Site Link */}
                <List>
                    <Divider />
                    <ListItem disablePadding>
                        <ListItemButton
                            onClick={() => navigate('/home')}
                            sx={{
                                justifyContent: expanded ? 'flex-start' : 'center',
                                minHeight: 48
                            }}
                        >
                            <ListItemIcon sx={{
                                minWidth: expanded ? 40 : 'auto',
                                mr: expanded ? 2 : 'auto',
                                justifyContent: 'center'
                            }}>
                                <ArrowBack />
                            </ListItemIcon>
                            {expanded && <ListItemText primary={t('Back to Site')} />}
                        </ListItemButton>
                    </ListItem>
                </List>

                {/* Spacer */}
                <Box flexGrow={1} />

                {/* Settings and Navigation Links */}
                <List>
                    <Divider />
                </List>

                {/* Conditional Navigation Links */}
                {(userType === 'coach' || userType === 'admin') && (
                    <List>
                        <Divider />
                        <ListItem disablePadding>
                            <ListItemButton
                                onClick={() => navigate(userType === 'coach' ? '/coach' : '/admin')}
                                sx={{
                                    justifyContent: expanded ? 'flex-start' : 'center',
                                    minHeight: 48
                                }}
                            >
                                <ListItemIcon sx={{
                                    minWidth: expanded ? 40 : 'auto',
                                    mr: expanded ? 2 : 'auto',
                                    justifyContent: 'center'
                                }}>
                                    <Dashboard />
                                </ListItemIcon>
                                {expanded && <ListItemText primary={
                                    userType === 'coach'
                                        ? t('Coach Dashboard')
                                        : t('Admin Dashboard')
                                } />}
                            </ListItemButton>
                        </ListItem>
                    </List>
                )}

                {/* Toggle Sidebar Button */}
                <List>
                    <Divider />
                    <ListItem disablePadding>
                        <ListItemButton
                            onClick={() => onToggle(!expanded)}
                            sx={{
                                justifyContent: expanded ? 'flex-start' : 'center',
                                minHeight: 48
                            }}
                        >
                            <ListItemIcon sx={{
                                minWidth: expanded ? 40 : 'auto',
                                mr: expanded ? 2 : 'auto',
                                justifyContent: 'center'
                            }}>
                                {expanded ? <ChevronLeft /> : <ChevronRight />}
                            </ListItemIcon>
                            {expanded && <ListItemText primary={t('Collapse Menu')} />}
                        </ListItemButton>
                    </ListItem>
                </List>

                {/* Sign Out Button */}
                <List>
                    <Divider />
                    <ListItem disablePadding>
                        <ListItemButton
                            onClick={handleSignOut}
                            sx={{
                                justifyContent: expanded ? 'flex-start' : 'center',
                                minHeight: 48
                            }}
                        >
                            <ListItemIcon sx={{
                                minWidth: expanded ? 40 : 'auto',
                                mr: expanded ? 2 : 'auto',
                                justifyContent: 'center'
                            }}>
                                <Logout />
                            </ListItemIcon>
                            {expanded && <ListItemText primary={t('Sign Out')} />}
                        </ListItemButton>
                    </ListItem>
                </List>

                {/* Language Switcher and Theme Toggle - only show when expanded */}
                {expanded && (
                    <>
                        <Divider />
                        <Box sx={{
                            p: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 1
                        }}>
                            <LanguageSwitcher variant="dark" upward={true} />
                            <IconButton
                                onClick={toggleDarkMode}
                                color="inherit"
                                sx={{
                                    ml: 1,
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.08)'
                                    }
                                }}
                            >
                                {darkMode ? <LightMode /> : <DarkMode />}
                            </IconButton>
                        </Box>
                    </>
                )}
            </Box>
        </Drawer>
    );
};

export default DashboardSidebar; 