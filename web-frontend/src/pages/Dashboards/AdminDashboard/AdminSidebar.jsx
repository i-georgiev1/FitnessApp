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
    CategoryRounded,
    PaymentRounded,
    CreditCard,
    Healing,
    GroupAdd,
    Email,
    SupervisedUserCircle,
    RssFeed,
    Storage,
    CloudUpload,
    Language,
    Article,
    Code,
    Dns,
    DesignServices,
    FormatPaint,
    Accessibility,
    VerifiedUser,
    Security,
    Gavel,
    Apartment,
    AdminPanelSettings,
    MonetizationOn,
    BarChart,
    Timeline,
    QueryStats,
    Toc,
    Recommend,
    Forum,
    Comment,
    Contacts,
    ContactSupport,
    AppSettingsAlt,
    Cake,
    Campaign,
    MarkEmailRead,
    Computer,
    Api,
    ExpandLess,
    ExpandMore,
    ChevronLeft,
    ChevronRight,
    FitnessCenter,
    Restaurant,
    MenuBook,
    Description,
    FileCopy,
    HelpCenter,
    DarkMode,
    LightMode
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import LanguageSwitcher from '../../../components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import { useTheme as useCustomTheme } from '../../../context/ThemeContext';

const AdminSidebar = ({ onToggle }) => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const theme = useTheme();
    const { darkMode, toggleDarkMode } = useCustomTheme();
    const [expanded, setExpanded] = useState(() => {
        const savedExpanded = localStorage.getItem('adminSidebarExpanded');
        return savedExpanded ? JSON.parse(savedExpanded) : true;
    });
    const [openMenus, setOpenMenus] = useState(() => {
        const savedMenus = localStorage.getItem('adminSidebarMenus');
        return savedMenus ? JSON.parse(savedMenus) : {
            core: true,
            users: false,
            content: false,
            config: false,
            analytics: false,
            security: false
        };
    });

    const handleSignOut = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('adminSidebarExpanded');
        localStorage.removeItem('adminSidebarMenus');
        navigate('/login');
    };

    const toggleMenu = (menu) => {
        const newOpenMenus = {
            ...openMenus,
            [menu]: !openMenus[menu]
        };
        setOpenMenus(newOpenMenus);
        localStorage.setItem('adminSidebarMenus', JSON.stringify(newOpenMenus));
    };

    const toggleSidebar = () => {
        const newExpanded = !expanded;
        setExpanded(newExpanded);
        localStorage.setItem('adminSidebarExpanded', JSON.stringify(newExpanded));
        onToggle?.(newExpanded);
    };

    // Core admin functions
    const coreMenuItems = [
        { text: t('Admin Dashboard'), icon: <Dashboard />, onClick: () => navigate('/admin') },
        { text: t('System Overview'), icon: <AdminPanelSettings />, onClick: () => navigate('/admin/overview') },
        { text: t('Health Status'), icon: <Healing />, onClick: () => navigate('/admin/health') },
        { text: t('Notifications'), icon: <MarkEmailRead />, onClick: () => navigate('/admin/notifications') },
    ];

    // User management
    const userMenuItems = [
        { text: t('User Management'), icon: <People />, onClick: () => navigate('/admin/users') },
        { text: t('User Roles'), icon: <SupervisedUserCircle />, onClick: () => navigate('/admin/roles') },
        { text: t('Permissions'), icon: <VerifiedUser />, onClick: () => navigate('/admin/permissions') },
        { text: t('User Import/Export'), icon: <GroupAdd />, onClick: () => navigate('/admin/user-import') },
        { text: t('User Activities'), icon: <Assessment />, onClick: () => navigate('/admin/user-activities') },
        { text: t('Support Requests'), icon: <ContactSupport />, onClick: () => navigate('/admin/support') },
    ];

    // Resources menu items
    const resourcesMenuItems = [
        { text: t('Training Plans'), icon: <FitnessCenter />, onClick: () => navigate('/admin/training-plans') },
        { text: t('Meal Plans'), icon: <Restaurant />, onClick: () => navigate('/admin/meal-plans') },
        { text: t('Exercise Library'), icon: <MenuBook />, onClick: () => navigate('/admin/exercise-library') },
        { text: t('Nutrition Database'), icon: <Description />, onClick: () => navigate('/admin/nutrition-database') },
        { text: t('Template Manager'), icon: <FileCopy />, onClick: () => navigate('/admin/templates') },
        { text: t('Knowledge Base'), icon: <HelpCenter />, onClick: () => navigate('/admin/knowledge-base') },
    ];

    // Content management
    const contentMenuItems = [
        { text: t('Content Management'), icon: <Article />, onClick: () => navigate('/admin/content') },
        { text: t('Media Library'), icon: <CloudUpload />, onClick: () => navigate('/admin/media') },
        { text: t('Categories & Tags'), icon: <CategoryRounded />, onClick: () => navigate('/admin/categories') },
        { text: t('Blog Management'), icon: <RssFeed />, onClick: () => navigate('/admin/blog') },
        { text: t('Pages & Layouts'), icon: <FormatPaint />, onClick: () => navigate('/admin/pages') },
        { text: t('Comments'), icon: <Comment />, onClick: () => navigate('/admin/comments') },
    ];

    // Site configuration
    const configMenuItems = [
        { text: t('Site Settings'), icon: <SettingsIcon />, onClick: () => navigate('/admin/settings') },
        { text: t('Theme Customization'), icon: <DesignServices />, onClick: () => navigate('/admin/theme') },
        { text: t('Menu Builder'), icon: <Toc />, onClick: () => navigate('/admin/menus') },
        { text: t('Localization'), icon: <Language />, onClick: () => navigate('/admin/localization') },
        { text: t('Email Templates'), icon: <Email />, onClick: () => navigate('/admin/email-templates') },
        { text: t('App Configuration'), icon: <AppSettingsAlt />, onClick: () => navigate('/admin/app-config') },
    ];

    // Analytics and reporting
    const analyticsMenuItems = [
        { text: t('Analytics Dashboard'), icon: <BarChart />, onClick: () => navigate('/admin/analytics') },
        { text: t('User Statistics'), icon: <QueryStats />, onClick: () => navigate('/admin/user-stats') },
        { text: t('Financial Reports'), icon: <MonetizationOn />, onClick: () => navigate('/admin/financials') },
        { text: t('Performance Metrics'), icon: <Timeline />, onClick: () => navigate('/admin/performance') },
        { text: t('Audit Logs'), icon: <Storage />, onClick: () => navigate('/admin/logs') },
        { text: t('System Reports'), icon: <Assessment />, onClick: () => navigate('/admin/reports') },
    ];

    // Security and compliance
    const securityMenuItems = [
        { text: t('Security Settings'), icon: <Security />, onClick: () => navigate('/admin/security') },
        { text: t('Data Privacy'), icon: <VerifiedUser />, onClick: () => navigate('/admin/privacy') },
        { text: t('API Management'), icon: <Api />, onClick: () => navigate('/admin/api') },
        { text: t('Compliance'), icon: <Gavel />, onClick: () => navigate('/admin/compliance') },
        { text: t('Backup & Restore'), icon: <Computer />, onClick: () => navigate('/admin/backup') },
        { text: t('Legal Documents'), icon: <Apartment />, onClick: () => navigate('/admin/legal') },
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
                    {expanded && <Typography variant="h6">{t('Admin Portal')}</Typography>}
                </Box>

                <Divider />

                {/* Menu Content */}
                <List>
                    {expanded ? (
                        <>
                            {renderMenuSection(t('Core Administration'), coreMenuItems, 'core')}
                            {renderMenuSection(t('User Management'), userMenuItems, 'users')}
                            {renderMenuSection(t('Resources'), resourcesMenuItems, 'resources')}
                            {renderMenuSection(t('Content Management'), contentMenuItems, 'content')}
                            {renderMenuSection(t('Site Configuration'), configMenuItems, 'config')}
                            {renderMenuSection(t('Analytics & Reporting'), analyticsMenuItems, 'analytics')}
                            {renderMenuSection(t('Security & Compliance'), securityMenuItems, 'security')}
                        </>
                    ) : (
                        // Collapsed view shows only icons
                        <>
                            {[...coreMenuItems, ...userMenuItems, ...contentMenuItems, ...configMenuItems, ...analyticsMenuItems, ...securityMenuItems]
                                .slice(0, 20) // Limit items when collapsed to prevent overflow
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

                {/* Toggle Sidebar Button - Placed above Sign Out */}
                <List>
                    <Divider />
                    <ListItem disablePadding>
                        <ListItemButton
                            onClick={toggleSidebar}
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

export default AdminSidebar;
