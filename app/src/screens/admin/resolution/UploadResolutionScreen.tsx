import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Image as ImageIcon, X, AlertCircle } from 'lucide-react-native';
import { Colors } from '../../../constants/colors';
import { Typography } from '../../../constants/typography';
import { uploadResolution } from '../../../services/adminService';
import { Card } from '../../../components/common/Card';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import { ReportsStackParamList } from '../../../types/navigation.types';

type NavigationProp = NativeStackNavigationProp<ReportsStackParamList, 'UploadResolution'>;
type ScreenRouteProp = RouteProp<ReportsStackParamList, 'UploadResolution'>;

export const UploadResolutionScreen: React.FC = () => {
  const route = useRoute<ScreenRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { reportId } = route.params;

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const pickFromGallery = async () => {

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need access to your photo library to pick images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need access to your camera to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!imageUri) {
      Alert.alert('Image Required', 'Please capture or select an image showing the resolved incident.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      
      const fileUri = Platform.OS === 'ios' ? imageUri.replace('file://', '') : imageUri;
      formData.append('image', {
        uri: fileUri,
        type: 'image/jpeg',
        name: 'resolution_work.jpg',
      } as any);

      formData.append('notes', notes.trim());

      await uploadResolution(reportId, formData);
      Alert.alert('Incident Resolved', 'Resolution logs submitted successfully. Citizen has been notified.');
      navigation.goBack();
    } catch (error: any) {
      console.error('Error submitting resolution:', error);
      Alert.alert('Failed', error.message || 'An error occurred while uploading resolution details.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
          <X size={20} color={Colors.darkText} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upload Resolution</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {}
        <Card style={styles.infoCard}>
          <AlertCircle size={16} color={Colors.primaryBlue} />
          <Text style={styles.infoText}>
            Admins may choose existing photos from the gallery to upload screenshots/reports sent by operational field workers.
          </Text>
        </Card>

        {}
        {imageUri ? (
          <View style={styles.previewContainer}>
            <Image source={{ uri: imageUri }} style={styles.previewImage} />
            <TouchableOpacity style={styles.removeBtn} onPress={() => setImageUri(null)}>
              <X size={18} color={Colors.white} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.pickerOptionsContainer}>
            <TouchableOpacity style={styles.pickerOption} onPress={takePhoto} activeOpacity={0.8}>
              <View style={[styles.iconCircle, { backgroundColor: Colors.primaryBlue + '15' }]}>
                <Camera size={24} color={Colors.primaryBlue} />
              </View>
              <Text style={styles.pickerOptionLabel}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.pickerOption} onPress={pickFromGallery} activeOpacity={0.8}>
              <View style={[styles.iconCircle, { backgroundColor: Colors.environmentalGreen + '15' }]}>
                <ImageIcon size={24} color={Colors.environmentalGreen} />
              </View>
              <Text style={styles.pickerOptionLabel}>Choose from Gallery</Text>
            </TouchableOpacity>
          </View>
        )}

        {}
        <Card style={styles.notesCard}>
          <Input
            label="Resolution Notes"
            placeholder="Describe what action was taken to resolve the issue..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            style={styles.textArea}
            containerStyle={styles.inputContainer}
          />
        </Card>

        {}
        <Button
          title="Submit Resolution Logs"
          onPress={handleSubmit}
          variant="secondary"
          loading={submitting}
          style={styles.submitBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Colors.spacing.md,
    paddingVertical: Colors.spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  closeBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
  },
  placeholder: {
    width: 28,
  },
  scroll: {
    padding: Colors.spacing.md,
    paddingBottom: Colors.spacing.xl,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    borderWidth: 1,
    padding: Colors.spacing.md,
    gap: 8,
    marginBottom: Colors.spacing.md,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: Colors.grayText,
    lineHeight: 16,
  },
  previewContainer: {
    width: '100%',
    aspectRatio: 1.5,
    borderRadius: Colors.radius.md,
    overflow: 'hidden',
    marginBottom: Colors.spacing.md,
    ...Colors.shadow.soft,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeBtn: {
    position: 'absolute',
    top: Colors.spacing.sm,
    right: Colors.spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerOptionsContainer: {
    flexDirection: 'row',
    gap: Colors.spacing.md,
    marginBottom: Colors.spacing.md,
  },
  pickerOption: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: Colors.radius.md,
    paddingVertical: Colors.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...Colors.shadow.soft,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Colors.spacing.sm,
  },
  pickerOptionLabel: {
    fontSize: 13,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
  },
  notesCard: {
    padding: Colors.spacing.md,
    marginBottom: Colors.spacing.lg,
  },
  inputContainer: {
    marginBottom: 0,
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
  },
  submitBtn: {
    width: '100%',
  },
});
