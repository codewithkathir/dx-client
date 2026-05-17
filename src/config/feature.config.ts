export const featureConfig = {
  auth: {
    refreshEnabled: true,
    sessionCookieName: 'dx_session',
  },
  admin: {
    sidebarDefaultOpen: true,
  },
  user: {
    bottomNavEnabled: true,
  },
} as const;
