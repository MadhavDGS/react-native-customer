/**
 * Add Business Modal - PIN Entry
 * Allows customers to add businesses using a 6-digit PIN
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getThemedColors, Typography, Spacing, BorderRadius } from '../../../constants/theme';
import { useTheme } from '../../../context/ThemeContext';
import ApiService from '../../../services/api';

interface AddBusinessModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  navigation: any;
}

export default function AddBusinessModal({ visible, onClose, onSuccess, navigation }: AddBusinessModalProps) {
  const { isDark } = useTheme();
  const Colors = getThemedColors(isDark);
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddByPIN = async () => {
    if (!pin || pin.length !== 6) {
      Alert.alert('Invalid PIN', 'Please enter a 6-digit PIN');
      return;
    }

    try {
      setLoading(true);
      const response = await ApiService.connectBusiness(pin);
      Alert.alert(
        'Success!',
        response.message || 'Business connected successfully',
        [
          {
            text: 'OK',
            onPress: () => {
              setPin('');
              onClose();
              onSuccess();
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Error connecting business:', error);
      Alert.alert(
        'Connection Failed',
        error.response?.data?.error || 'Failed to connect to business. Please check the PIN and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddByQR = () => {
    onClose();
    navigation.navigate('QRScanner');
  };

  const handleClose = () => {
    setPin('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleClose}
        />
        <View style={[styles.modalContainer, { backgroundColor: Colors.card }]}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: Colors.textPrimary }]}>
              Add Business
            </Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* QR Code Option */}
          <TouchableOpacity
            style={[styles.optionButton, {
              backgroundColor: isDark ? Colors.background : Colors.backgroundSecondary,
              borderColor: Colors.borderLight,
            }]}
            onPress={handleAddByQR}
            activeOpacity={0.7}
          >
            <View style={[styles.optionIcon, { backgroundColor: Colors.primary + '20' }]}>
              <Ionicons name="qr-code" size={32} color={Colors.primary} />
            </View>
            <View style={styles.optionContent}>
              <Text style={[styles.optionTitle, { color: Colors.textPrimary }]}>
                Scan QR Code
              </Text>
              <Text style={[styles.optionDescription, { color: Colors.textSecondary }]}>
                Scan the business QR code to connect instantly
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textTertiary} />
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: Colors.borderLight }]} />
            <Text style={[styles.dividerText, { color: Colors.textTertiary }]}>OR</Text>
            <View style={[styles.dividerLine, { backgroundColor: Colors.borderLight }]} />
          </View>

          {/* PIN Entry Option */}
          <View style={styles.pinSection}>
            <Text style={[styles.pinLabel, { color: Colors.textPrimary }]}>
              Enter Business PIN
            </Text>
            <Text style={[styles.pinDescription, { color: Colors.textSecondary }]}>
              Ask the shopkeeper for their 6-digit PIN
            </Text>
            <TextInput
              style={[styles.pinInput, {
                backgroundColor: isDark ? Colors.background : Colors.backgroundSecondary,
                borderColor: Colors.borderLight,
                color: Colors.textPrimary,
              }]}
              value={pin}
              onChangeText={(text) => setPin(text.replace(/[^0-9]/g, '').slice(0, 6))}
              placeholder="000000"
              placeholderTextColor={Colors.textTertiary}
              keyboardType="number-pad"
              maxLength={6}
              editable={!loading}
            />
            <TouchableOpacity
              style={[styles.connectButton, {
                backgroundColor: pin.length === 6 ? Colors.primary : Colors.textTertiary,
              }]}
              onPress={handleAddByPIN}
              disabled={loading || pin.length !== 6}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons name="add-circle-outline" size={20} color="#fff" />
                  <Text style={styles.connectButtonText}>Add Business</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? Spacing.xl + Spacing.lg : Spacing.lg,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    fontSize: Typography.fontXl,
    fontFamily: Typography.fonts.bold,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  optionIcon: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: Typography.fontMd,
    fontFamily: Typography.fonts.semiBold,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: Typography.fontSm,
    lineHeight: 18,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: Spacing.md,
    fontSize: Typography.fontSm,
    fontFamily: Typography.fonts.medium,
  },
  pinSection: {
    marginTop: Spacing.sm,
  },
  pinLabel: {
    fontSize: Typography.fontMd,
    fontFamily: Typography.fonts.semiBold,
    marginBottom: Spacing.xs,
  },
  pinDescription: {
    fontSize: Typography.fontSm,
    marginBottom: Spacing.md,
  },
  pinInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    fontSize: 24,
    fontFamily: Typography.fonts.bold,
    textAlign: 'center',
    letterSpacing: 8,
    marginBottom: Spacing.md,
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.xs,
  },
  connectButtonText: {
    color: '#fff',
    fontSize: Typography.fontMd,
    fontFamily: Typography.fonts.semiBold,
  },
});
