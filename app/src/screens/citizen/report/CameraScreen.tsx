import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { X, Camera } from 'lucide-react-native';
import { Colors } from '../../../constants/colors';
import { Typography } from '../../../constants/typography';
import { getCurrentLocation } from '../../../services/locationService';
import { ReportStackParamList } from '../../../types/navigation.types';

type NavigationProp = NativeStackNavigationProp<ReportStackParamList, 'Camera'>;
type ScreenRouteProp = RouteProp<ReportStackParamList, 'Camera'>;

export const CameraScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRouteProp>();
  const { category } = route.params;

  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<any>(null);
  const [capturing, setCapturing] = useState(false);

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission]);

  if (!permission) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primaryBlue} />
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Text style={styles.noPermissionText}>We need camera access to capture incident reports.</Text>
        <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
          <Text style={styles.permissionBtnText}>Grant Camera Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const handleCapture = async () => {
    if (!cameraRef.current || capturing) return;

    try {
      setCapturing(true);

      // take standard photo using expocamera
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: false,
      });

      if (!photo?.uri) {
        throw new Error('Failed to capture photo');
      }

      const coordinates = await getCurrentLocation();
      if (!coordinates) {
        Alert.alert(
          'Location Required',
          'We need access to your device location to tag the report coordinates. Please enable GPS and try again.'
        );
        setCapturing(false);
        return;
      }

      navigation.navigate('Description', {
        category,
        imageUri: photo.uri,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Error capturing report assets:', error);
      Alert.alert('Error', 'Failed to capture photo. Please try again.');
    } finally {
      setCapturing(false);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView style={StyleSheet.absoluteFillObject} ref={cameraRef}>
        <SafeAreaView style={styles.overlay}>
          {}
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
              <X size={24} color={Colors.white} />
            </TouchableOpacity>
            <Text style={styles.title}>Align Incident Photo</Text>
            <View style={styles.placeholder} />
          </View>

          {}
          <View style={styles.frameContainer}>
            <View style={styles.frame} />
          </View>

          {}
          <View style={styles.footer}>
            <View style={styles.shutterContainer}>
              {}
              <TouchableOpacity
                style={styles.shutter}
                onPress={handleCapture}
                disabled={capturing}
              >
                {capturing ? (
                  <ActivityIndicator size="large" color={Colors.primaryBlue} />
                ) : (
                  <View style={styles.shutterInner}>
                    <Camera size={28} color={Colors.white} />
                  </View>
                )}
              </TouchableOpacity>
            </View>
            <Text style={styles.guidelineText}>
              Evidence must be captured live. Photo library selection is disabled.
            </Text>
          </View>
        </SafeAreaView>
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Colors.spacing.lg,
    backgroundColor: Colors.background,
  },
  noPermissionText: {
    fontSize: 15,
    color: Colors.grayText,
    textAlign: 'center',
    marginBottom: Colors.spacing.lg,
    lineHeight: 22,
  },
  permissionBtn: {
    backgroundColor: Colors.primaryBlue,
    paddingHorizontal: Colors.spacing.lg,
    paddingVertical: Colors.spacing.sm,
    borderRadius: Colors.radius.md,
    marginBottom: Colors.spacing.md,
  },
  permissionBtnText: {
    color: Colors.white,
    fontWeight: Typography.fontWeight.bold,
  },
  backBtn: {
    padding: 8,
  },
  backBtnText: {
    color: Colors.grayText,
    fontWeight: Typography.fontWeight.semibold,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Colors.spacing.md,
    paddingVertical: Colors.spacing.sm,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: Typography.fontWeight.bold,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  placeholder: {
    width: 40,
  },
  frameContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Colors.spacing.xl,
  },
  frame: {
    width: '100%',
    aspectRatio: 1,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: Colors.radius.md,
    borderStyle: 'dashed',
  },
  footer: {
    paddingBottom: Colors.spacing.xl,
    alignItems: 'center',
    paddingHorizontal: Colors.spacing.lg,
  },
  shutterContainer: {
    marginBottom: Colors.spacing.md,
  },
  shutter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  shutterInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primaryBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guidelineText: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 11,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});
