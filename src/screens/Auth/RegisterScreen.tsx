/**
 * Register Screen - Multi-Step Customer Registration
 * Step-by-step customer onboarding with Next/Skip options
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { getThemedColors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { AvatarSizes } from '../../constants/scales';
import { useTheme } from '../../context/ThemeContext';
import ApiService from '../../services/api';

interface Step {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  placeholder: string;
  value: string;
  setValue: (value: string) => void;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'url';
  maxLength?: number;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  multiline?: boolean;
  secureTextEntry?: boolean;
  validation?: (value: string) => string | null;
  required?: boolean;
  isSpecial?: 'profile-photo';
}

export default function RegisterScreen({ navigation }: any) {
  const { isDark } = useTheme();
  const Colors = getThemedColors(isDark);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fadeAnim = useState(new Animated.Value(1))[0];
  const [registered, setRegistered] = useState(false);
  const [authToken, setAuthToken] = useState(''); // Store token temporarily
  const [userData, setUserData] = useState<any>(null); // Store user data temporarily

  // Form state
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');

  const steps: Step[] = [
    {
      id: 'name',
      title: 'What\'s your name?',
      subtitle: 'Enter your full name',
      icon: 'person',
      placeholder: 'Enter your name',
      value: name,
      setValue: setName,
      required: true,
    },
    {
      id: 'phoneNumber',
      title: 'Your mobile number?',
      subtitle: 'We\'ll use this for login',
      icon: 'call',
      placeholder: 'Enter 10-digit mobile number',
      value: phoneNumber,
      setValue: setPhoneNumber,
      maxLength: 10,
      validation: (value) => {
        if (value.length !== 10) return 'Phone number must be 10 digits';
        return null;
      },
      required: true,
    },
    {
      id: 'password',
      title: 'Create a password',
      subtitle: 'Secure your account',
      icon: 'lock-closed',
      placeholder: 'Enter password',
      value: password,
      setValue: setPassword,
      secureTextEntry: true,
      validation: (value) => {
        if (value.length < 6) return 'Password must be at least 6 characters';
        return null;
      },
      required: true,
    },
    {
      id: 'profilePhoto',
      title: 'Add a profile photo',
      subtitle: 'Choose a photo (optional)',
      icon: 'camera',
      placeholder: '',
      value: profilePhoto,
      setValue: setProfilePhoto,
      isSpecial: 'profile-photo',
    },
    {
      id: 'email',
      title: 'Email address',
      subtitle: 'For important updates (optional)',
      icon: 'mail',
      placeholder: 'Enter email address',
      value: email,
      setValue: setEmail,
      keyboardType: 'email-address',
      autoCapitalize: 'none',
    },
    {
      id: 'address',
      title: 'Your address',
      subtitle: 'Street address (optional)',
      icon: 'location',
      placeholder: 'Enter your address',
      value: address,
      setValue: setAddress,
      multiline: true,
    },
    {
      id: 'city',
      title: 'City',
      subtitle: 'Which city do you live in?',
      icon: 'business',
      placeholder: 'Enter city',
      value: city,
      setValue: setCity,
    },
    {
      id: 'pincode',
      title: 'Pincode',
      subtitle: 'Your area pincode (optional)',
      icon: 'pin',
      placeholder: 'Enter pincode',
      value: pincode,
      setValue: setPincode,
      keyboardType: 'numeric',
      maxLength: 6,
    },
  ];

  const currentStep = steps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  // Direct setter mapping to avoid closure issues
  const getSetterForStep = (stepId: string) => {
    const setterMap: { [key: string]: (value: string) => void } = {
      name: setName,
      phoneNumber: setPhoneNumber,
      password: setPassword,
      profilePhoto: setProfilePhoto,
      email: setEmail,
      address: setAddress,
      city: setCity,
      pincode: setPincode,
    };
    return setterMap[stepId] || (() => {});
  };

  const handleProfilePhotoPick = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setProfilePhoto(result.assets[0].uri);
      }
    } catch (err) {
      console.error('Error picking photo:', err);
      Alert.alert('Error', 'Failed to pick photo');
    }
  };

  const handleNext = async () => {
    setError('');

    // Validate current step if required
    if (currentStep.required && !currentStep.value) {
      setError(`${currentStep.title.replace('?', '')} is required`);
      return;
    }

    if (currentStep.validation) {
      const validationError = currentStep.validation(currentStep.value);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    // If this is step 2 (password), perform registration
    if (currentStepIndex === 2) {
      await handleRegister();
      return;
    }

    // Move to next step with animation
    if (currentStepIndex < steps.length - 1) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start(() => {
        setCurrentStepIndex(currentStepIndex + 1);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }).start();
      });
    } else {
      // Last step - update profile and complete
      await handleUpdateProfile();
    }
  };

  const handleSkip = () => {
    if (currentStepIndex < steps.length - 1) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start(() => {
        setCurrentStepIndex(currentStepIndex + 1);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }).start();
      });
    } else {
      // Last step - complete without updating
      handleUpdateProfile();
    }
  };

  const handleRegister = async () => {
    try {
      setLoading(true);
      const response = await ApiService.register(name, phoneNumber, password);
      
      // Store token and user data temporarily - DON'T save to AsyncStorage yet
      if (response.token) {
        setAuthToken(response.token);
        setUserData(response.user);
      }
      
      setRegistered(true);
      setLoading(false);
      
      // Move to next step with animation after successful registration
      if (currentStepIndex < steps.length - 1) {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }).start(() => {
          setCurrentStepIndex(currentStepIndex + 1);
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }).start();
        });
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.response?.data?.error || err.response?.data?.message || err.message || 'Registration failed');
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      
      // Save auth token and user data to AsyncStorage now that all steps are complete
      if (authToken) {
        await AsyncStorage.setItem('authToken', authToken);
        if (userData) {
          await AsyncStorage.setItem('userData', JSON.stringify(userData));
        }
      }
      
      const updateData: any = {};
      if (email) updateData.email = email;
      if (address) updateData.address = address;
      if (city) updateData.city = city;
      if (pincode) updateData.pincode = pincode;

      // Upload profile photo if selected
      if (profilePhoto) {
        try {
          console.log('📸 Uploading profile photo:', profilePhoto);
          const photoResponse = await ApiService.uploadProfilePhoto(profilePhoto);
          console.log('📸 Photo upload response:', photoResponse);
          if (photoResponse.profile_photo_url) {
            updateData.profile_photo_url = photoResponse.profile_photo_url;
            // Update local storage with new photo URL
            const userData = await AsyncStorage.getItem('userData');
            if (userData) {
              const user = JSON.parse(userData);
              user.profile_photo_url = photoResponse.profile_photo_url;
              await AsyncStorage.setItem('userData', JSON.stringify(user));
            }
          }
        } catch (photoError) {
          console.error('Photo upload error:', photoError);
          // Continue even if photo upload fails
        }
      }

      if (Object.keys(updateData).length > 0) {
        await ApiService.updateProfile(updateData);
      }

      // Navigate to main app
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    } catch (err: any) {
      console.error('Update profile error:', err);
      // Even if update fails, navigate to app
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.primary }]} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressBarBg, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
            <View style={[styles.progressBar, { width: `${progress}%`, backgroundColor: '#fff' }]} />
          </View>
          <Text style={styles.progressText}>
            Step {currentStepIndex + 1} of {steps.length}
          </Text>
        </View>

        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Icon */}
          <View style={[styles.iconContainer, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
            <Ionicons name={currentStep.icon} size={48} color="#fff" />
          </View>

          {/* Title & Subtitle */}
          <Text style={styles.title}>{currentStep.title}</Text>
          <Text style={styles.subtitle}>{currentStep.subtitle}</Text>

          {/* Input or Special Component */}
          {currentStep.isSpecial === 'profile-photo' ? (
            <TouchableOpacity
              style={[styles.photoPickerContainer, { borderColor: 'rgba(255,255,255,0.3)' }]}
              onPress={handleProfilePhotoPick}
            >
              {profilePhoto ? (
                <Image source={{ uri: profilePhoto }} style={styles.profilePhotoPreview} resizeMode="cover" />
              ) : (
                <>
                  <Ionicons name="camera" size={48} color="rgba(255,255,255,0.6)" />
                  <Text style={styles.photoPickerText}>Tap to choose photo</Text>
                </>
              )}
            </TouchableOpacity>
          ) : (
            <TextInput
              key={`input-${currentStep.id}-${currentStepIndex}`}
              style={[
                styles.input,
                currentStep.multiline && styles.inputMultiline,
                { color: '#fff', borderColor: 'rgba(255,255,255,0.3)' },
              ]}
              placeholder={currentStep.placeholder}
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={currentStep.value}
              onChangeText={getSetterForStep(currentStep.id)}
              keyboardType={currentStep.keyboardType}
              maxLength={currentStep.maxLength}
              autoCapitalize={currentStep.autoCapitalize || 'sentences'}
              multiline={currentStep.multiline}
              secureTextEntry={currentStep.secureTextEntry}
              autoFocus={true}
              editable={true}
            />
          )}

          {/* Error Message */}
          {error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={16} color="#ffcccc" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}
        </Animated.View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          {/* Skip Button (shown after step 2) */}
          {currentStepIndex >= 3 && !currentStep.required && (
            <TouchableOpacity
              style={[styles.skipButton, { borderColor: 'rgba(255,255,255,0.3)' }]}
              onPress={handleSkip}
              disabled={loading}
            >
              <Text style={styles.skipButtonText}>Skip</Text>
            </TouchableOpacity>
          )}

          {/* Next/Register/Finish Button */}
          <TouchableOpacity
            style={[
              styles.nextButton,
              { backgroundColor: '#fff' },
              (!currentStep.required || currentStepIndex >= 3) && { flex: 1 },
            ]}
            onPress={handleNext}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.primary} />
            ) : (
              <Text style={[styles.nextButtonText, { color: Colors.primary }]}>
                {currentStepIndex === 2
                  ? 'Register'
                  : currentStepIndex === steps.length - 1
                  ? 'Finish'
                  : 'Next'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Back to Login */}
        {currentStepIndex === 0 && (
          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginLinkText}>Already have an account? Login</Text>
          </TouchableOpacity>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  progressContainer: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  progressBarBg: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  progressBar: {
    height: '100%',
  },
  progressText: {
    color: '#fff',
    fontSize: Typography.fontSm,
    fontWeight: Typography.medium,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: Spacing.space12,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: Typography.fontXl,
    fontWeight: Typography.bold,
    color: '#fff',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.fontBase,
    fontWeight: Typography.regular,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: Spacing.space8,
  },
  input: {
    width: '100%',
    borderWidth: 2,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    fontSize: Typography.fontBase,
    fontWeight: Typography.medium,
    textAlign: 'center',
  },
  inputMultiline: {
    height: 120,
    textAlignVertical: 'top',
    textAlign: 'left',
  },
  photoPickerContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 3,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  profilePhotoPreview: {
    width: '100%',
    height: '100%',
  },
  photoPickerText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: Typography.fontSm,
    marginTop: Spacing.sm,
    fontWeight: Typography.medium,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: 'rgba(255,100,100,0.15)',
    borderRadius: BorderRadius.sm,
  },
  errorText: {
    color: '#ffcccc',
    fontSize: Typography.fontSm,
    marginLeft: Spacing.sm,
    fontWeight: Typography.medium,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  skipButton: {
    flex: 1,
    borderWidth: 2,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#fff',
    fontSize: Typography.fontBase,
    fontWeight: Typography.semiBold,
  },
  nextButton: {
    flex: 2,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: Typography.fontBase,
    fontWeight: Typography.bold,
  },
  loginLink: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  loginLinkText: {
    color: '#fff',
    fontSize: Typography.fontSm,
    fontWeight: Typography.medium,
  },
});
