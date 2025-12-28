/**
 * Change Password Screen - Update Account Password
 * Securely change customer password
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getThemedColors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import ApiService from '../../services/api';

export default function ChangePasswordScreen({ navigation }: any) {
  const { isDark } = useTheme();
  const Colors = getThemedColors(isDark);
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Toggle password visibility
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChangePassword = async () => {
    setError('');
    setSuccess('');

    // Validation
    if (!currentPassword.trim()) {
      setError('Current password is required');
      return;
    }

    if (!newPassword.trim()) {
      setError('New password is required');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (currentPassword === newPassword) {
      setError('New password must be different from current password');
      return;
    }

    try {
      setSaving(true);
      
      await ApiService.changePassword(currentPassword, newPassword);
      
      setSuccess('Password changed successfully!');
      
      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // Navigate back after short delay
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch (err: any) {
      console.error('Change password error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to change password';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.background }]} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Info Banner */}
          <View style={[styles.infoBanner, { backgroundColor: Colors.bgLightBlue }]}>
            <Ionicons name="information-circle" size={24} color={Colors.blue} />
            <Text style={[styles.infoText, { color: Colors.blue }]}>
              Choose a strong password with at least 6 characters
            </Text>
          </View>

          {/* Success Message */}
          {success ? (
            <View style={[styles.messageContainer, { backgroundColor: Colors.paymentGreen + '15' }]}>
              <Ionicons name="checkmark-circle" size={20} color={Colors.paymentGreen} />
              <Text style={[styles.messageText, { color: Colors.paymentGreen }]}>{success}</Text>
            </View>
          ) : null}

          {/* Error Message */}
          {error ? (
            <View style={[styles.messageContainer, { backgroundColor: Colors.creditRed + '15' }]}>
              <Ionicons name="alert-circle" size={20} color={Colors.creditRed} />
              <Text style={[styles.messageText, { color: Colors.creditRed }]}>{error}</Text>
            </View>
          ) : null}

          {/* Form Fields */}
          <View style={styles.section}>
            {/* Current Password */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: Colors.textPrimary }]}>
                Current Password <Text style={{ color: Colors.creditRed }}>*</Text>
              </Text>
              <View style={[styles.inputContainer, { backgroundColor: Colors.backgroundSecondary, borderColor: Colors.borderLight }]}>
                <Ionicons name="lock-closed-outline" size={20} color={Colors.textTertiary} />
                <TextInput
                  style={[styles.input, { color: Colors.textPrimary }]}
                  placeholder="Enter current password"
                  placeholderTextColor={Colors.textTertiary}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry={!showCurrentPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowCurrentPassword(!showCurrentPassword)}>
                  <Ionicons 
                    name={showCurrentPassword ? 'eye-off-outline' : 'eye-outline'} 
                    size={20} 
                    color={Colors.textTertiary} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* New Password */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: Colors.textPrimary }]}>
                New Password <Text style={{ color: Colors.creditRed }}>*</Text>
              </Text>
              <View style={[styles.inputContainer, { backgroundColor: Colors.backgroundSecondary, borderColor: Colors.borderLight }]}>
                <Ionicons name="lock-closed-outline" size={20} color={Colors.textTertiary} />
                <TextInput
                  style={[styles.input, { color: Colors.textPrimary }]}
                  placeholder="Enter new password"
                  placeholderTextColor={Colors.textTertiary}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showNewPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                  <Ionicons 
                    name={showNewPassword ? 'eye-off-outline' : 'eye-outline'} 
                    size={20} 
                    color={Colors.textTertiary} 
                  />
                </TouchableOpacity>
              </View>
              <Text style={[styles.helperText, { color: Colors.textTertiary }]}>
                At least 6 characters
              </Text>
            </View>

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: Colors.textPrimary }]}>
                Confirm New Password <Text style={{ color: Colors.creditRed }}>*</Text>
              </Text>
              <View style={[styles.inputContainer, { backgroundColor: Colors.backgroundSecondary, borderColor: Colors.borderLight }]}>
                <Ionicons name="lock-closed-outline" size={20} color={Colors.textTertiary} />
                <TextInput
                  style={[styles.input, { color: Colors.textPrimary }]}
                  placeholder="Re-enter new password"
                  placeholderTextColor={Colors.textTertiary}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Ionicons 
                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} 
                    size={20} 
                    color={Colors.textTertiary} 
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Security Tips */}
          <View style={[styles.tipsContainer, { backgroundColor: Colors.backgroundSecondary }]}>
            <Text style={[styles.tipsTitle, { color: Colors.textPrimary }]}>Password Tips:</Text>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color={Colors.paymentGreen} />
              <Text style={[styles.tipText, { color: Colors.textSecondary }]}>
                Use a mix of letters, numbers, and symbols
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color={Colors.paymentGreen} />
              <Text style={[styles.tipText, { color: Colors.textSecondary }]}>
                Avoid using personal information
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color={Colors.paymentGreen} />
              <Text style={[styles.tipText, { color: Colors.textSecondary }]}>
                Don't reuse passwords from other accounts
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Save Button */}
        <View style={[styles.footer, { backgroundColor: Colors.background, borderTopColor: Colors.borderLight }]}>
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: Colors.primary }]}
            onPress={handleChangePassword}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="shield-checkmark" size={20} color="#fff" />
                <Text style={styles.saveButtonText}>Change Password</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
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
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: Typography.fontSm,
    fontWeight: Typography.medium,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  messageText: {
    fontSize: Typography.fontSm,
    fontWeight: Typography.medium,
    marginLeft: Spacing.sm,
    flex: 1,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: Typography.fontSm,
    fontWeight: Typography.medium,
    marginBottom: Spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.OS === 'ios' ? Spacing.md : Spacing.sm,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: Typography.fontBase,
  },
  helperText: {
    fontSize: Typography.fontXs,
    marginTop: Spacing.xs,
  },
  tipsContainer: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  tipsTitle: {
    fontSize: Typography.fontSm,
    fontWeight: Typography.semiBold,
    marginBottom: Spacing.md,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  tipText: {
    flex: 1,
    fontSize: Typography.fontSm,
  },
  footer: {
    borderTopWidth: 1,
    padding: Spacing.lg,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: Typography.fontBase,
    fontWeight: Typography.bold,
  },
});
