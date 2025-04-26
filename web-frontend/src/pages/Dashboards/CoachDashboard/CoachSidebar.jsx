import React, { useState } from 'react';
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
    IconButton,
    useTheme
} from '@mui/material';
import {
    Dashboard,
    People,
    Settings as SettingsIcon,
    ArrowBack,
    Assessment,
    Logout,
    FitnessCenter,
    Restaurant,
    CalendarMonth,
    BarChart,
    Message,
    Description,
    Payment,
    MenuBook,
    Flag,
    Summarize,
    Analytics,
    FileCopy,
    Notifications,
    Groups,
    PersonAdd,
    TaskAlt,
    School,
    Feedback,
    HelpCenter,
    Campaign,
    ExpandLess,
    ExpandMore,
    Upload,
    ChevronLeft,
    ChevronRight,
    DarkMode,
    LightMode
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import LanguageSwitcher from '../../../components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import { useTheme as useCustomTheme } from '../../../context/ThemeContext';

const CoachSidebar = ({ expanded, onToggle }) => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const theme = useTheme();
    const { darkMode, toggleDarkMode } = useCustomTheme();
    const [openMenus, setOpenMenus] = useState(() => {
        // Initialize from localStorage or use default values
        const savedMenus = localStorage.getItem('coachSidebarMenus');
        return savedMenus ? JSON.parse(savedMenus) : {
            core: true,
            client: false,
            content: false,
            business: false
        };
    });

    const handleSignOut = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('coachSidebarMenus'); // Clear menu states on sign out
        navigate('/login');
    };

    const toggleMenu = (menu) => {
        const newOpenMenus = {
            ...openMenus,
            [menu]: !openMenus[menu]
        };
        setOpenMenus(newOpenMenus);
        // Save to localStorage
        localStorage.setItem('coachSidebarMenus', JSON.stringify(newOpenMenus));
    };

    // Core navigation items
    const coreMenuItems = [
        { text: t('Coach Dashboard'), icon: <Dashboard />, onClick: () => navigate('/coach') },
        { text: t('Calendar'), icon: <CalendarMonth />, onClick: () => navigate('/coach/calendar') },
        { text: t('Clients'), icon: <People />, onClick: () => navigate('/coach/clients') },
        { text: t('Communication Hub'), icon: <Message />, onClick: () => navigate('/coach/communication') },
    ];

    // Client-focused items
    const clientMenuItems = [
        { text: t('Client Progress'), icon: <BarChart />, onClick: () => navigate('/coach/client-progress') },
        { text: t('Assessment Tools'), icon: <Assessment />, onClick: () => navigate('/coach/assessments') },
        { text: t('Goals & Milestones'), icon: <Flag />, onClick: () => navigate('/coach/goals') },
        { text: t('Client Reports'), icon: <Summarize />, onClick: () => navigate('/coach/reports') },
        { text: t('Client Onboarding'), icon: <PersonAdd />, onClick: () => navigate('/coach/onboarding') },
        { text: t('Compliance Tracking'), icon: <TaskAlt />, onClick: () => navigate('/coach/compliance') },
        { text: t('Client Feedback'), icon: <Feedback />, onClick: () => navigate('/coach/feedback') },
        { text: t('Document Sharing'), icon: <Upload />, onClick: () => navigate('/coach/documents') },
    ];

    // Content and resources
    const contentMenuItems = [
        { text: t('Training Plans'), icon: <FitnessCenter />, onClick: () => navigate('/coach/training-plans') },
        { text: t('Meal Plans'), icon: <Restaurant />, onClick: () => navigate('/coach/meal-plans') },
        { text: t('Exercise Library'), icon: <MenuBook />, onClick: () => navigate('/coach/exercise-library') },
        { text: t('Nutrition Database'), icon: <Description />, onClick: () => navigate('/coach/nutrition-database') },
        { text: t('Template Manager'), icon: <FileCopy />, onClick: () => navigate('/coach/templates') },
        { text: t('Knowledge Base'), icon: <HelpCenter />, onClick: () => navigate('/coach/knowledge-base') },
    ];

    // Business management
    const businessMenuItems = [
        { text: t('Analytics Dashboard'), icon: <Analytics />, onClick: () => navigate('/coach/analytics') },
        { text: t('Payment & Billing'), icon: <Payment />, onClick: () => navigate('/coach/billing') },
        { text: t('Team Management'), icon: <Groups />, onClick: () => navigate('/coach/team') },
        { text: t('Certifications'), icon: <School />, onClick: () => navigate('/coach/certifications') },
        { text: t('Marketing Tools'), icon: <Campaign />, onClick: () => navigate('/coach/marketing') },
        { text: t('Notifications'), icon: <Notifications />, onClick: () => navigate('/coach/notifications') },
        { text: t('Settings'), icon: <SettingsIcon />, onClick: () => navigate('/coach/settings') },
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
                {/* App logo or title without toggle button */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: theme.spacing(0, 1),
                        ...theme.mixins.toolbar,
                    }}
                >
                    {expanded && <Typography variant="h6">{t('Coach Portal')}</Typography>}
                </Box>

                <Divider />

                {/* Core Menu */}
                <List>
                    {expanded ? (
                        <>
                            {renderMenuSection(t('Main Navigation'), coreMenuItems, 'core')}
                            {renderMenuSection(t('Client Management'), clientMenuItems, 'client')}
                            {renderMenuSection(t('Content & Resources'), contentMenuItems, 'content')}
                            {renderMenuSection(t('Business Operations'), businessMenuItems, 'business')}
                        </>
                    ) : (
                        // Collapsed view shows only icons
                        <>
                            {[...coreMenuItems, ...clientMenuItems, ...contentMenuItems, ...businessMenuItems]
                                .slice(0, 15) // Limit items when collapsed to prevent overflow
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
                    <Divider sx={{ my: 1 }} />
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

                {/* Toggle Sidebar Button - Now placed above Sign Out */}
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

export default CoachSidebar;
