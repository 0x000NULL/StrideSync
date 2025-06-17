import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import Card from './ui/Card';

const StatsCard = ({ title, value, unit, icon, color }) => {
  const theme = useTheme();
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      marginHorizontal: theme.spacing.xs,
    },
    content: {
      alignItems: 'center',
    },
    valueContainer: {
      flexDirection: 'row',
      alignItems: 'baseline',
      marginBottom: theme.spacing.xs,
    },
    value: {
      ...theme.typography.h2,
      color: color || theme.colors.primary,
      marginRight: 2,
    },
    unit: {
      ...theme.typography.body,
      color: theme.colors.text.secondary,
      marginLeft: 2,
    },
    title: {
      ...theme.typography.caption,
      color: theme.colors.text.secondary,
      textAlign: 'center',
    },
  });

  return (
    <Card style={styles.container}>
      <View style={styles.content}>
        <View style={styles.valueContainer}>
          {icon && (
            <View style={{ marginRight: 4 }}>
              {React.cloneElement(icon, { 
                size: 20, 
                color: color || theme.colors.primary 
              })}
            </View>
          )}
          <Text style={styles.value}>{value}</Text>
          {unit && <Text style={styles.unit}>{unit}</Text>}
        </View>
        <Text style={styles.title}>{title}</Text>
      </View>
    </Card>
  );
};

export default StatsCard;
