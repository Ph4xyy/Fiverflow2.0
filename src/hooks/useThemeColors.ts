import { useTheme } from '../contexts/ThemeContext';

export const useThemeColors = () => {
  const { getThemeColors } = useTheme();
  const colors = getThemeColors();

  return {
    primary: colors.primary,
    secondary: colors.secondary,
    background: colors.background,
    card: colors.card,
    text: colors.text,
    border: colors.border,
    // Classes CSS pour les boutons
    buttonPrimary: `bg-[${colors.primary}] hover:bg-[${colors.secondary}] text-white`,
    buttonSecondary: `bg-[${colors.card}] hover:bg-[${colors.border}] text-${colors.text}`,
    // Classes pour les éléments actifs
    activeTab: `bg-[${colors.primary}] text-white`,
    inactiveTab: `text-gray-400 hover:text-white hover:bg-[${colors.card}]`,
    // Classes pour les cartes
    cardBg: `bg-[${colors.card}] border-[${colors.border}]`,
    // Classes pour les inputs
    inputBg: `bg-[${colors.card}] border-[${colors.border}] text-${colors.text}`,
  };
};
