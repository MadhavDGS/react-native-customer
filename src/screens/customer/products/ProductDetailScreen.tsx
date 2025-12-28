/**
 * Product Detail Screen - Detailed Product Information
 * Shows full product details, business info, and ordering options
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getThemedColors, Typography, Spacing, BorderRadius, Shadows } from '../../../constants/theme';
import { useTheme } from '../../../context/ThemeContext';

export default function ProductDetailScreen({ navigation, route }: any) {
  const { isDark } = useTheme();
  const Colors = getThemedColors(isDark);
  const { product } = route.params || {};

  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  if (!product) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors.background }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={Colors.textTertiary} />
          <Text style={[styles.errorText, { color: Colors.textPrimary }]}>Product not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleIncrement = () => {
    if (product.stock_quantity && quantity >= product.stock_quantity) {
      Alert.alert('Out of Stock', 'Maximum quantity available reached');
      return;
    }
    setQuantity(quantity + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = () => {
    Alert.alert(
      'Add to Cart', 
      'Cart feature is not available. Please contact the business directly to place an order.',
      [{ text: 'OK' }]
    );
  };

  const handleOrder = () => {
    Alert.alert(
      'Place Order',
      'To order this product, please contact the business directly.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Contact Business', onPress: handleContactBusiness }
      ]
    );
  };

  const handleContactBusiness = () => {
    const phoneNumber = product.business_phone || product.phone_number;
    if (phoneNumber) {
      Alert.alert(
        'Contact Business',
        `Contact ${product.business_name || 'this business'}`,
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

  const totalPrice = (product.price || 0) * quantity;
  const inStock = product.stock_quantity > 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.background }]} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        <View style={[styles.imageContainer, { backgroundColor: Colors.backgroundSecondary }]}>
          {product.image_url || product.product_image ? (
            <Image
              source={{ uri: product.image_url || product.product_image }}
              style={styles.productImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.placeholderImage, { backgroundColor: Colors.bgLightPurple }]}>
              <Ionicons name="cube" size={80} color={Colors.primary} />
            </View>
          )}
          
          {/* Stock Badge */}
          {!inStock && (
            <View style={[styles.stockBadge, { backgroundColor: Colors.creditRed }]}>
              <Text style={styles.stockBadgeText}>Out of Stock</Text>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.content}>
          {/* Category Badge */}
          {product.category && (
            <View style={[styles.categoryBadge, { backgroundColor: Colors.bgLightPurple }]}>
              <Text style={[styles.categoryText, { color: Colors.primary }]}>{product.category}</Text>
            </View>
          )}

          {/* Product Name */}
          <Text style={[styles.productName, { color: Colors.textPrimary }]}>{product.name}</Text>

          {/* Price & Unit */}
          <View style={styles.priceRow}>
            <Text style={[styles.price, { color: Colors.primary }]}>
              ₹{product.price?.toLocaleString('en-IN')}
            </Text>
            {product.unit && (
              <Text style={[styles.unit, { color: Colors.textSecondary }]}>/ {product.unit}</Text>
            )}
          </View>

          {/* Business Info */}
          {product.business_name && (
            <TouchableOpacity
              style={[styles.businessCard, { backgroundColor: Colors.card, borderColor: Colors.borderLight }]}
              onPress={handleContactBusiness}
            >
              <View style={[styles.businessIcon, { backgroundColor: Colors.bgLightGreen }]}>
                <Ionicons name="storefront" size={24} color={Colors.paymentGreen} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.businessLabel, { color: Colors.textTertiary }]}>Sold by</Text>
                <Text style={[styles.businessName, { color: Colors.textPrimary }]}>{product.business_name}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.textTertiary} />
            </TouchableOpacity>
          )}

          {/* Description */}
          {product.description && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: Colors.textPrimary }]}>Description</Text>
              <Text style={[styles.description, { color: Colors.textSecondary }]}>
                {product.description}
              </Text>
            </View>
          )}

          {/* Product Details */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: Colors.textPrimary }]}>Product Details</Text>
            
            {product.subcategory && (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: Colors.textTertiary }]}>Subcategory</Text>
                <Text style={[styles.detailValue, { color: Colors.textPrimary }]}>{product.subcategory}</Text>
              </View>
            )}

            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: Colors.textTertiary }]}>Stock</Text>
              <Text style={[styles.detailValue, { color: inStock ? Colors.paymentGreen : Colors.creditRed }]}>
                {inStock ? `${product.stock_quantity} ${product.unit || 'units'} available` : 'Out of Stock'}
              </Text>
            </View>

            {product.low_stock_threshold && (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: Colors.textTertiary }]}>Low Stock Alert</Text>
                <Text style={[styles.detailValue, { color: Colors.textSecondary }]}>
                  Below {product.low_stock_threshold} {product.unit || 'units'}
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      {inStock && (
        <View style={[styles.bottomBar, { backgroundColor: Colors.card, borderTopColor: Colors.borderLight }]}>
          {/* Quantity Selector */}
          <View style={styles.quantitySelector}>
            <TouchableOpacity
              style={[styles.quantityButton, { borderColor: Colors.borderLight }]}
              onPress={handleDecrement}
            >
              <Ionicons name="remove" size={20} color={Colors.textPrimary} />
            </TouchableOpacity>
            <Text style={[styles.quantityText, { color: Colors.textPrimary }]}>{quantity}</Text>
            <TouchableOpacity
              style={[styles.quantityButton, { borderColor: Colors.borderLight }]}
              onPress={handleIncrement}
            >
              <Ionicons name="add" size={20} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.orderButton, { backgroundColor: Colors.primary }]}
              onPress={handleOrder}
            >
              <Text style={styles.orderButtonText}>Order ₹{totalPrice.toLocaleString('en-IN')}</Text>
            </TouchableOpacity>
          </View>
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
  imageContainer: {
    width: '100%',
    height: 300,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stockBadge: {
    position: 'absolute',
    top: Spacing.lg,
    right: Spacing.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  stockBadgeText: {
    color: '#fff',
    fontSize: Typography.fontSm,
    fontWeight: Typography.semiBold,
  },
  content: {
    padding: Spacing.lg,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
  },
  categoryText: {
    fontSize: Typography.fontXs,
    fontWeight: Typography.semiBold,
    textTransform: 'uppercase',
  },
  productName: {
    fontSize: Typography.fontXl,
    fontWeight: Typography.bold,
    marginBottom: Spacing.sm,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: Spacing.lg,
  },
  price: {
    fontSize: Typography.font2xl,
    fontWeight: Typography.bold,
  },
  unit: {
    fontSize: Typography.fontBase,
    marginLeft: Spacing.xs,
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
    paddingVertical: Spacing.sm,
  },
  detailLabel: {
    fontSize: Typography.fontBase,
  },
  detailValue: {
    fontSize: Typography.fontBase,
    fontWeight: Typography.medium,
  },
  bottomBar: {
    borderTopWidth: 1,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.lg,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: Typography.fontXl,
    fontWeight: Typography.bold,
    minWidth: 40,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  orderButton: {
    flex: 1,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  orderButtonText: {
    color: '#fff',
    fontSize: Typography.fontBase,
    fontWeight: Typography.bold,
  },
});
