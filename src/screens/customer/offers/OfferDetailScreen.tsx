/**
 * Offer Detail Screen - Detailed Offer Information
 * Shows full offer details, terms & conditions, business info
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getThemedColors, Typography, Spacing, BorderRadius, Shadows } from '../../../constants/theme';
import { useTheme } from '../../../context/ThemeContext';

export default function OfferDetailScreen({ navigation, route }: any) {
  const { isDark } = useTheme();
  const Colors = getThemedColors(isDark);
  const { offer } = route.params || {};

  if (!offer) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors.background }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={Colors.textTertiary} />
          <Text style={[styles.errorText, { color: Colors.textPrimary }]}>Offer not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleClaimOffer = () => {
    Alert.alert(
      'Claim Offer',
      'To redeem this offer, please visit the business and show this offer details.',
      [
        { text: 'OK', style: 'cancel' },
        { text: 'Contact Business', onPress: handleContactBusiness }
      ]
    );
  };

  const handleContactBusiness = () => {
    const phoneNumber = offer.business_phone || offer.phone_number;
    if (phoneNumber) {
      Alert.alert(
        'Contact Business',
        `Contact ${offer.business_name || 'this business'}`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Call', 
            onPress: () => Linking.openURL(`tel:${phoneNumber}`) 
          },
          { 
            text: 'WhatsApp', 
            onPress: () => Linking.openURL(`https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}`) 
          }
        ]
      );
    } else {
      Alert.alert('Contact Information', 'Contact details not available for this business.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const isExpired = offer.valid_until && new Date(offer.valid_until) < new Date();
  const isActive = !isExpired && offer.is_active !== false;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.background }]} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header Card with Gradient */}
        <LinearGradient
          colors={isExpired ? ['#ef4444', '#dc2626'] : ['#5A9A8E', '#4A8A7E']}
          style={styles.headerGradient}
        >
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>
              {offer.discount_percentage || offer.discount_value}%
            </Text>
            <Text style={styles.discountLabel}>OFF</Text>
          </View>
          
          {isExpired && (
            <View style={styles.expiredBadge}>
              <Text style={styles.expiredText}>EXPIRED</Text>
            </View>
          )}
        </LinearGradient>

        {/* Content */}
        <View style={styles.content}>
          {/* Offer Title */}
          <Text style={[styles.offerTitle, { color: Colors.textPrimary }]}>{offer.title}</Text>

          {/* Business Info */}
          {offer.business_name && (
            <TouchableOpacity
              style={[styles.businessCard, { backgroundColor: Colors.card, borderColor: Colors.borderLight }]}
              onPress={handleContactBusiness}
            >
              <View style={[styles.businessIcon, { backgroundColor: Colors.bgLightGreen }]}>
                <Ionicons name="storefront" size={24} color={Colors.paymentGreen} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.businessLabel, { color: Colors.textTertiary }]}>Offered by</Text>
                <Text style={[styles.businessName, { color: Colors.textPrimary }]}>{offer.business_name}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.textTertiary} />
            </TouchableOpacity>
          )}

          {/* Validity Period */}
          <View style={[styles.validityCard, { backgroundColor: Colors.bgLightBlue }]}>
            <Ionicons name="calendar-outline" size={24} color={Colors.blue} />
            <View style={{ flex: 1, marginLeft: Spacing.md }}>
              <Text style={[styles.validityLabel, { color: Colors.blue }]}>Valid Period</Text>
              <Text style={[styles.validityText, { color: Colors.blue }]}>
                {offer.valid_from && formatDate(offer.valid_from)} - {offer.valid_until && formatDate(offer.valid_until)}
              </Text>
            </View>
          </View>

          {/* Description */}
          {offer.description && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: Colors.textPrimary }]}>About this offer</Text>
              <Text style={[styles.description, { color: Colors.textSecondary }]}>
                {offer.description}
              </Text>
            </View>
          )}

          {/* Offer Details */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: Colors.textPrimary }]}>Offer Details</Text>
            
            {offer.discount_type && (
              <View style={styles.detailRow}>
                <View style={styles.detailLeft}>
                  <Ionicons name="pricetag" size={20} color={Colors.textTertiary} />
                  <Text style={[styles.detailLabel, { color: Colors.textTertiary }]}>Discount Type</Text>
                </View>
                <Text style={[styles.detailValue, { color: Colors.textPrimary }]}>
                  {offer.discount_type === 'percentage' ? 'Percentage' : 'Fixed Amount'}
                </Text>
              </View>
            )}

            {offer.min_purchase && (
              <View style={styles.detailRow}>
                <View style={styles.detailLeft}>
                  <Ionicons name="wallet" size={20} color={Colors.textTertiary} />
                  <Text style={[styles.detailLabel, { color: Colors.textTertiary }]}>Minimum Purchase</Text>
                </View>
                <Text style={[styles.detailValue, { color: Colors.textPrimary }]}>
                  ₹{offer.min_purchase.toLocaleString('en-IN')}
                </Text>
              </View>
            )}

            {offer.max_discount && (
              <View style={styles.detailRow}>
                <View style={styles.detailLeft}>
                  <Ionicons name="trending-down" size={20} color={Colors.textTertiary} />
                  <Text style={[styles.detailLabel, { color: Colors.textTertiary }]}>Maximum Discount</Text>
                </View>
                <Text style={[styles.detailValue, { color: Colors.textPrimary }]}>
                  ₹{offer.max_discount.toLocaleString('en-IN')}
                </Text>
              </View>
            )}

            {offer.product_name && (
              <View style={styles.detailRow}>
                <View style={styles.detailLeft}>
                  <Ionicons name="cube" size={20} color={Colors.textTertiary} />
                  <Text style={[styles.detailLabel, { color: Colors.textTertiary }]}>Applicable Product</Text>
                </View>
                <Text style={[styles.detailValue, { color: Colors.textPrimary }]}>{offer.product_name}</Text>
              </View>
            )}
          </View>

          {/* Terms & Conditions */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: Colors.textPrimary }]}>Terms & Conditions</Text>
            <View style={styles.termItem}>
              <Ionicons name="checkmark-circle" size={16} color={Colors.paymentGreen} />
              <Text style={[styles.termText, { color: Colors.textSecondary }]}>
                Valid only at participating outlets
              </Text>
            </View>
            <View style={styles.termItem}>
              <Ionicons name="checkmark-circle" size={16} color={Colors.paymentGreen} />
              <Text style={[styles.termText, { color: Colors.textSecondary }]}>
                Cannot be combined with other offers
              </Text>
            </View>
            <View style={styles.termItem}>
              <Ionicons name="checkmark-circle" size={16} color={Colors.paymentGreen} />
              <Text style={[styles.termText, { color: Colors.textSecondary }]}>
                One time use per customer
              </Text>
            </View>
            <View style={styles.termItem}>
              <Ionicons name="checkmark-circle" size={16} color={Colors.paymentGreen} />
              <Text style={[styles.termText, { color: Colors.textSecondary }]}>
                Subject to availability
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Button */}
      {isActive && (
        <View style={[styles.bottomBar, { backgroundColor: Colors.card, borderTopColor: Colors.borderLight }]}>
          <TouchableOpacity
            style={[styles.claimButton, { backgroundColor: Colors.primary }]}
            onPress={handleClaimOffer}
          >
            <Ionicons name="gift" size={20} color="#fff" />
            <Text style={styles.claimButtonText}>Claim This Offer</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  errorText: {
    fontSize: Typography.fontLg,
    fontWeight: Typography.semiBold,
    marginTop: Spacing.lg,
  },
  headerGradient: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  discountBadge: {
    alignItems: 'center',
  },
  discountText: {
    fontSize: 64,
    fontWeight: Typography.extraBold,
    color: '#fff',
    lineHeight: 72,
  },
  discountLabel: {
    fontSize: Typography.fontXl,
    fontWeight: Typography.bold,
    color: '#fff',
    letterSpacing: 2,
  },
  expiredBadge: {
    position: 'absolute',
    top: Spacing.lg,
    right: Spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  expiredText: {
    color: '#fff',
    fontSize: Typography.fontSm,
    fontWeight: Typography.bold,
  },
  content: {
    padding: Spacing.lg,
  },
  offerTitle: {
    fontSize: Typography.font2xl,
    fontWeight: Typography.bold,
    marginBottom: Spacing.lg,
  },
  businessCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.lg,
    ...Shadows.sm,
  },
  businessIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  businessLabel: {
    fontSize: Typography.fontXs,
    marginBottom: 2,
  },
  businessName: {
    fontSize: Typography.fontBase,
    fontWeight: Typography.semiBold,
  },
  validityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xl,
  },
  validityLabel: {
    fontSize: Typography.fontSm,
    fontWeight: Typography.medium,
    marginBottom: 2,
  },
  validityText: {
    fontSize: Typography.fontBase,
    fontWeight: Typography.semiBold,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.fontLg,
    fontWeight: Typography.semiBold,
    marginBottom: Spacing.md,
  },
  description: {
    fontSize: Typography.fontBase,
    lineHeight: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  detailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.sm,
  },
  detailLabel: {
    fontSize: Typography.fontBase,
  },
  detailValue: {
    fontSize: Typography.fontBase,
    fontWeight: Typography.semiBold,
  },
  termItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  termText: {
    flex: 1,
    fontSize: Typography.fontSm,
    lineHeight: 20,
  },
  bottomBar: {
    borderTopWidth: 1,
    padding: Spacing.lg,
  },
  claimButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  claimButtonText: {
    color: '#fff',
    fontSize: Typography.fontBase,
    fontWeight: Typography.bold,
  },
});
