import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

/**
 * Bouton stylisé en fonction du thème actuel
 * 
 * @param {Object} props - Propriétés du composant
 * @param {string} props.title - Texte du bouton
 * @param {Function} props.onPress - Fonction appelée au clic
 * @param {string} props.variant - Variant du bouton ('primary', 'secondary', 'outline', etc.)
 * @param {Object} props.style - Styles additionnels
 * @param {Object} props.textStyle - Styles additionnels pour le texte
 * @param {boolean} props.disabled - Si le bouton est désactivé
 */
const ThemedButton = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  style, 
  textStyle,
  disabled = false
}) => {
  // Récupérer le thème actuel
  const { theme } = useTheme();
  
  // Déterminer les couleurs selon le variant
  let backgroundColor, textColor, borderColor;
  
  switch (variant) {
    case 'primary':
      backgroundColor = theme.colors.primary;
      textColor = theme.colors.textOnPrimary;
      borderColor = theme.colors.primary;
      break;
    case 'secondary':
      backgroundColor = theme.colors.accent;
      textColor = theme.colors.text;
      borderColor = theme.colors.accent;
      break;
    case 'outline':
      backgroundColor = 'transparent';
      textColor = theme.colors.primary;
      borderColor = theme.colors.primary;
      break;
    case 'text':
      backgroundColor = 'transparent';
      textColor = theme.colors.primary;
      borderColor = 'transparent';
      break;
    default:
      backgroundColor = theme.colors.primary;
      textColor = theme.colors.textOnPrimary;
      borderColor = theme.colors.primary;
  }
  
  // Si désactivé, ajuster les couleurs
  if (disabled) {
    backgroundColor = backgroundColor === 'transparent' 
      ? 'transparent' 
      : backgroundColor + '80'; // Ajouter transparence
    textColor = textColor + '80'; // Ajouter transparence
    borderColor = borderColor + '80'; // Ajouter transparence
  }
  
  // Créer les styles en fonction du thème
  const themedStyles = StyleSheet.create({
    button: {
      backgroundColor,
      borderColor,
      borderWidth: variant === 'outline' ? 1 : 0,
      borderRadius: theme.shape.buttonBorderRadius,
      paddingVertical: theme.spacing.buttonPadding.vertical,
      paddingHorizontal: theme.spacing.buttonPadding.horizontal,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: variant !== 'text' && variant !== 'outline' ? theme.shadows.shadowColor : 'transparent',
      shadowOpacity: variant !== 'text' && variant !== 'outline' ? theme.shadows.shadowOpacity / 2 : 0,
      shadowRadius: variant !== 'text' && variant !== 'outline' ? theme.shadows.shadowRadius / 2 : 0,
      shadowOffset: variant !== 'text' && variant !== 'outline' 
        ? { height: theme.shadows.shadowOffset.height / 2, width: 0 } 
        : { height: 0, width: 0 },
      elevation: variant !== 'text' && variant !== 'outline' ? Math.floor(theme.shadows.elevation / 2) : 0,
    },
    text: {
      color: textColor,
      fontSize: theme.typography.fontSize,
      fontWeight: '500',
    }
  });

  return (
    <TouchableOpacity 
      style={[themedStyles.button, style]} 
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={[themedStyles.text, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};

export default ThemedButton;
