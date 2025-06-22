import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Card from '../ui/Card';
import LoadingIndicator from '../ui/LoadingIndicator';
import PropTypes from 'prop-types';
import { useTheme } from '../../theme/ThemeProvider';

const GPSStatusIndicator = ({ gpsStatus }) => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    card: {
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
    },
    container: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    // label: { // This style is unused according to previous lint output
    //   fontSize: 16,
    //   fontWeight: '600',
    //   color: theme.colors.text.primary,
    // },
    // statusContainer: { // This style is unused according to previous lint output
    //   flexDirection: 'row',
    //   alignItems: 'center',
    // },
    statusText: {
      marginLeft: theme.spacing.sm,
      fontSize: 16, // Consider theme.typography.subtitle1.fontSize
      fontWeight: 'bold', // Consider theme.typography.subtitle1.fontWeight
    },
    searching: {
      color: theme.colors.warning,
    },
    good: {
      color: theme.colors.success,
    },
    poor: {
      color: theme.colors.error,
    },
  });

  const getStatusStyle = () => {
    switch (gpsStatus) {
      case 'good':
        return styles.good;
      case 'poor':
        return styles.poor;
      case 'searching':
      default:
        return styles.searching;
    }
  };

  const statusText = gpsStatus.charAt(0).toUpperCase() + gpsStatus.slice(1);
  const displayText =
    gpsStatus === 'searching' ? `GPS Status: Searching...` : `GPS Status: ${statusText}`;

  return (
    <Card style={styles.card}>
      <View style={styles.container}>
        {gpsStatus === 'searching' && <LoadingIndicator size="small" />}
        <Text style={[styles.statusText, getStatusStyle()]} accessibilityLabel="gps-status-text">
          {displayText}
        </Text>
      </View>
    </Card>
  );
};

GPSStatusIndicator.propTypes = {
  gpsStatus: PropTypes.oneOf(['good', 'poor', 'searching']).isRequired,
};

export default GPSStatusIndicator;
