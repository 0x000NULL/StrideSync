import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Card from '../ui/Card';
import LoadingIndicator from '../ui/LoadingIndicator';
import PropTypes from 'prop-types';

const GPSStatusIndicator = ({ gpsStatus }) => {
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

const styles = StyleSheet.create({
  card: {
    padding: 15,
    marginBottom: 15,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
  },
  searching: {
    color: '#f39c12', // Orange
  },
  good: {
    color: '#2ecc71', // Green
  },
  poor: {
    color: '#e74c3c', // Red
  },
});

GPSStatusIndicator.propTypes = {
  gpsStatus: PropTypes.oneOf(['good', 'poor', 'searching']).isRequired,
};

export default GPSStatusIndicator;
