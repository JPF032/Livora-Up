import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

/**
 * Carte stylisée en fonction du thème actuel
 * 
 * @param {Object} props - Propriétés du composant
 * @param {string} props.title - Titre de la carte
 * @param {string} props.subtitle - Sous-titre optionnel
 * @param {string} props.content - Contenu textuel
 * @param {Function} props.onPress - Fonction appelée au clic (optionnel)
 * @param {Object} props.style - Styles additionnels
 * @param {React.ReactNode} props.children - Éléments enfants (optionnel)
 */
const ThemedCard = ({ 
  title, 
  subtitle, 
  content, 
  onPress, 
  style, 
  children 
}) => {
  // Récupérer le thème actuel
  const { theme } = useTheme();
  
  // Créer les styles en fonction du thème
  const themedStyles = StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.shape.cardBorderRadius,
      padding: theme.spacing.containerPadding,
      marginVertical: 8,
      marginHorizontal: 16,
      shadowColor: theme.shadows.shadowColor,
      shadowOpacity: theme.shadows.shadowOpacity,
      shadowRadius: theme.shadows.shadowRadius,
      shadowOffset: theme.shadows.shadowOffset,
      elevation: theme.shadows.elevation,
    },
    title: {
      color: theme.colors.text,
      fontSize: theme.typography.headingSize,
      fontWeight: theme.typography.headingWeight,
      marginBottom: 8,
    },
    subtitle: {
      color: theme.colors.text + 'CC', // Ajouter transparence
      fontSize: theme.typography.fontSize * 0.9,
      marginBottom: 12,
    },
    content: {
      color: theme.colors.text,
      fontSize: theme.typography.fontSize,
      lineHeight: theme.typography.fontSize * theme.typography.lineHeight,
    }
  });

  // Si la carte est cliquable, l'envelopper dans un TouchableOpacity
  if (onPress) {
    return (
      <TouchableOpacity 
        style={[themedStyles.card, style]} 
        onPress={onPress}
        activeOpacity={0.7}
      >
        {title && <Text style={themedStyles.title}>{title}</Text>}
        {subtitle && <Text style={themedStyles.subtitle}>{subtitle}</Text>}
        {content && <Text style={themedStyles.content}>{content}</Text>}
        {children}
      </TouchableOpacity>
    );
  }
  
  // Sinon, utiliser une vue simple
  return (
    <View style={[themedStyles.card, style]}>
      {title && <Text style={themedStyles.title}>{title}</Text>}
      {subtitle && <Text style={themedStyles.subtitle}>{subtitle}</Text>}
      {content && <Text style={themedStyles.content}>{content}</Text>}
      {children}
    </View>
  );
};

export default ThemedCard;
