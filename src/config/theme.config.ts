/**
 * Brand design tokens — source of truth for theme colors.
 * CSS variables in `src/styles/theme.css` mirror these values.
 */
export const themeConfig = {
  colors: {
    primary: '#FF5733',
    primaryHover: '#FF6F4D',
    secondary: '#1F2D3D',
    secondaryMuted: '#2A3D52',
    text: '#FFFFFF',
  },
  defaultTheme: 'light' as const,
} as const;
