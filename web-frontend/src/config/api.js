// In development, use relative URLs since we have Vite proxy configured
export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const API_ENDPOINTS = {
    auth: {
        login: `/api/auth/login`,
        register: `/api/auth/register`,
        me: `/api/auth/me`,
        oauth: `/api/oauth2`,
        forgotPassword: `/api/auth/forgot-password`,
        resetPassword: `/api/auth/reset-password`,
        logout: `/api/auth/logout`,
        verifyEmail: `/api/auth/verify-email`,
        verifyInvite: `/api/auth/verify-invite`,
        setupPassword: `/api/auth/setup-password`,
    },
    profile: {
        get: `/api/profile`,
        update: `/api/profile`,
        uploadImage: `/api/profile/image`,
    },
    admin: {
        stats: `/api/admin/stats`,
        settings: `/api/admin/settings`,
        users: `/api/admin/users`,
        logs: `/api/admin/logs`,
        backup: `/api/admin/backup`,
        coachClients: `/api/admin/coach-clients`,
        assignClient: `/api/admin/assign-client`,
        deactivateAssignment: (coachId) => `/api/admin/coach-clients/${coachId}/deactivate`,
        auditLogs: `/api/admin/audit-logs`,
        sendInvite: `/api/admin/invite-link`,
    },
    coach: {
        clients: `/api/coach/clients`,
        settings: `/api/coach/settings`,
        programs: `/api/coach/programs`,
        schedule: `/api/coach/schedule`,
        stats: `/api/coach/stats`,
        trainingPlans: `/api/training-plans`,
        mealPlans: `/api/meal-plans`,
        assignPlan: (clientId) => `/api/coach/clients/${clientId}/assign-plan`,
        assignMealPlan: (clientId) => `/api/coach/clients/${clientId}/assign-meal-plan`,
        clientInfo: (clientId) => `/api/coach/clients/${clientId}/info`,
        clientProgress: (clientId) => `/api/coach/clients/${clientId}/progress`,
        clientMetrics: (clientId) => `/api/coach/clients/${clientId}/metrics`,
        clientExercises: (clientId) => `/api/coach/clients/${clientId}/exercises`,
    },
    user: {
        workouts: `/api/user/workouts`,
        progress: `/api/user/progress`,
        nutrition: `/api/user/nutrition`,
        goals: `/api/user/goals`,
        update: `/api/user`,
        trainingPlan: `/api/user/training-plan`,
        bodyMetrics: `/api/user/body-metrics`,
    },
    contact: {
        sendMessage: `/api/contact/send`,
    },
    subscribe: `/api/subscribe`,
    notifications: {
        get: `/api/notifications`,
        markRead: `/api/notifications/read`,
        settings: `/api/notifications/settings`,
    },
    search: `/api/search`,
};

export default API_ENDPOINTS; 