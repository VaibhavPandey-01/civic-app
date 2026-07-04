import { Camera } from 'expo-camera';

export const requestCameraPermission = async (): Promise<boolean> => {
  const { status } = await Camera.requestCameraPermissionsAsync();
  return status === 'granted';
};
