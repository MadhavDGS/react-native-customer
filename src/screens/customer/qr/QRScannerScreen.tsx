/**
 * QR Scanner Screen - Scan Business QR Code
 * Allows customers to quickly connect to businesses by scanning QR codes
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { getThemedColors, Typography, Spacing, BorderRadius } from '../../../constants/theme';
import { useTheme } from '../../../context/ThemeContext';
import ApiService from '../../../services/api';

export default function QRScannerScreen({ navigation }: any) {
  const { isDark } = useTheme();
  const Colors = getThemedColors(isDark);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    requestCameraPermission();
  }, []);

  const requestCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned || loading) return;

    setScanned(true);
    setLoading(true);

    try {
      // QR data format: KATHAPE_BUSINESS:<business_id>:<access_pin>
      if (!data.startsWith('KATHAPE_BUSINESS:')) {
        Alert.alert(
          'Invalid QR Code',
          'This is not a valid Kathape business QR code. Please scan a QR code from the Kathape Business app.',
          [{ text: 'Scan Again', onPress: () => setScanned(false) }]
        );
        return;
      }

      const parts = data.split(':');
      if (parts.length !== 3) {
        Alert.alert(
          'Invalid QR Code',
          'QR code format is incorrect. Please try scanning again.',
          [{ text: 'Scan Again', onPress: () => setScanned(false) }]
        );
        return;
      }

      const accessPin = parts[2];

      // Connect to business using PIN
      const response = await ApiService.connectBusiness(accessPin);

      Alert.alert(
        'Success!',
        response.message || 'Successfully connected to business',
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.goBack();
              // Optionally navigate to My Businesses
              // navigation.navigate('My Businesses');
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Error connecting business:', error);
      const errorMessage = error.response?.data?.error || 'Failed to connect to business. Please try again.';
      
      Alert.alert(
        'Connection Failed',
        errorMessage,
        [
          { text: 'Scan Again', onPress: () => setScanned(false) },
          { text: 'Cancel', onPress: () => navigation.goBack() },
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  if (hasPermission === null) {
    return (
      <View style={[styles.container, { backgroundColor: Colors.background }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={[styles.messageText, { color: Colors.textSecondary, marginTop: Spacing.md }]}>
          Requesting camera permission...
        </Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={[styles.container, { backgroundColor: Colors.background }]}>
        <Ionicons name="camera-outline" size={64} color={Colors.textTertiary} />
        <Text style={[styles.messageTitle, { color: Colors.textPrimary }]}>
          Camera Access Required
        </Text>
        <Text style={[styles.messageText, { color: Colors.textSecondary }]}>
          Please enable camera access in your device settings to scan QR codes.
        </Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: Colors.primary }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      >
        {/* Overlay */}
        <View style={styles.overlay}>
          {/* Top Section */}
          <View style={[styles.overlaySection, { backgroundColor: 'rgba(0, 0, 0, 0.6)' }]}>
            <Text style={styles.instructionText}>
              {loading ? 'Connecting to business...' : 'Position the QR code within the frame'}
            </Text>
          </View>

          {/* Scanning Frame */}
          <View style={styles.scannerFrameContainer}>
            <View style={styles.overlayLeft} />
            <View style={styles.scannerFrame}>
              {/* Corner borders */}
              <View style={[styles.corner, styles.cornerTopLeft]} />
              <View style={[styles.corner, styles.cornerTopRight]} />
              <View style={[styles.corner, styles.cornerBottomLeft]} />
              <View style={[styles.corner, styles.cornerBottomRight]} />
              
              {loading && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator size="large" color="#fff" />
                </View>
              )}
            </View>
            <View style={styles.overlayRight} />
          </View>

          {/* Bottom Section */}
          <View style={[styles.overlaySection, { backgroundColor: 'rgba(0, 0, 0, 0.6)' }]}>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, { opacity: scanned ? 0.5 : 1 }]}
                onPress={() => {
                  setScanned(false);
                  setLoading(false);
                }}
                disabled={scanned}
              >
                <Ionicons name="refresh" size={24} color="#fff" />
                <Text style={styles.actionButtonText}>Scan Again</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.goBack()}
              >
                <Ionicons name="close" size={24} color="#fff" />
                <Text style={styles.actionButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  overlay: {
    flex: 1,
  },
  overlaySection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  scannerFrameContainer: {
    flexDirection: 'row',
    height: 300,
  },
  overlayLeft: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  overlayRight: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  scannerFrame: {
    width: 300,
    height: 300,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#5A9A8E',
    borderWidth: 4,
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructionText: {
    color: '#fff',
    fontSize: Typography.fontMd,
    fontFamily: Typography.fonts.semiBold,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: Spacing.xl,
  },
  actionButton: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: Typography.fontSm,
    fontFamily: Typography.fonts.medium,
  },
  messageTitle: {
    fontSize: Typography.fontXl,
    fontFamily: Typography.fonts.bold,
    textAlign: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  messageText: {
    fontSize: Typography.fontMd,
    textAlign: 'center',
    marginHorizontal: Spacing.xl,
    lineHeight: 24,
  },
  button: {
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  buttonText: {
    color: '#fff',
    fontSize: Typography.fontMd,
    fontFamily: Typography.fonts.semiBold,
  },
});
