import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';
import { Colors } from '../../constants/colors';
import { Report } from '../../types/report.types';

interface MapMarkerProps {
  report: Report;
  onPress: () => void;
}

export const MapMarker: React.FC<MapMarkerProps> = ({ report, onPress }) => {
  const getMarkerColor = () => {
    if (report.status === 'resolved') {
      return Colors.environmentalGreen;
    }

    if (report.priority === 'high' || report.category === 'emergency_situation') {
      return Colors.alertOrange;
    }
    // mediumlow pending incidents are yellow
    return '#F59E0B'; // amber yellow
  };

  const color = getMarkerColor();

  return (
    <Marker
      coordinate={{
        latitude: report.latitude,
        longitude: report.longitude,
      }}
      onPress={onPress}
      tracksViewChanges={false}
    >
      <View style={[styles.outerPin, { borderColor: color }]}>
        <View style={[styles.innerDot, { backgroundColor: color }]} />
      </View>
      <View style={[styles.arrow, { borderTopColor: color }]} />
    </Marker>
  );
};

const styles = StyleSheet.create({
  outerPin: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.white,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  innerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  arrow: {
    width: 0,
    height: 0,
    alignSelf: 'center',
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -1,
  },
});
