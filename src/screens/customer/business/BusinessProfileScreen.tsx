/**
 * Business Profile Screen - Customer View
 * Shows complete business information including location, products
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Image,
    Linking,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getThemedColors, Typography, Spacing, BorderRadius } from '../../../constants/theme';
import { useTheme } from '../../../context/ThemeContext';
import ApiService from '../../../services/api';

export default function BusinessProfileScreen({ route, navigation }: any) {
    const { isDark } = useTheme();
    const Colors = getThemedColors(isDark);
    const { businessId } = route.params;
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);

    useEffect(() => {
        loadBusinessProfile();
    }, [businessId]);

    useEffect(() => {
        navigation.setOptions({
            headerTitle: profile?.name || 'Business Profile',
        });
    }, [navigation, profile]);

    const loadBusinessProfile = async () => {
        try {
            setLoading(true);
            console.log('🔍 Loading profile for business ID:', businessId);
            const response = await ApiService.getBusinessProfile(businessId);
            console.log('📊 Business Profile Response:', JSON.stringify(response, null, 2));
            console.log('📦 Products count:', response.profile?.products?.length || 0);
            console.log('📍 Location:', response.profile?.latitude, response.profile?.longitude);
            console.log('📧 Address:', response.profile?.address);
            console.log('📱 Phone:', response.profile?.phone_number);
            console.log('🏢 Business ID in response:', response.profile?.id);
            setProfile(response.profile);
        } catch (error) {
            console.error('❌ Error loading business profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const openLocation = () => {
        if (profile?.latitude && profile?.longitude) {
            const scheme = Platform.select({
                ios: 'maps:',
                android: 'geo:',
            });
            const url = Platform.select({
                ios: `${scheme}${profile.latitude},${profile.longitude}?q=${encodeURIComponent(profile.name)}`,
                android: `${scheme}${profile.latitude},${profile.longitude}?q=${encodeURIComponent(profile.name)}`,
            });
            Linking.openURL(url || '');
        }
    };

    const makeCall = () => {
        if (profile?.phone_number) {
            Linking.openURL(`tel:${profile.phone_number}`);
        }
    };

    const formatCurrency = (amount: number) => {
        return `₹${Math.round(amount).toLocaleString('en-IN')}`;
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.center, { backgroundColor: Colors.background }]}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    if (!profile) {
        return (
            <View style={[styles.container, styles.center, { backgroundColor: Colors.background }]}>
                <Ionicons name="business-outline" size={64} color={Colors.textTertiary} />
                <Text style={[styles.emptyText, { color: Colors.textSecondary }]}>
                    Business profile not found
                </Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: Colors.background }]}>
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Header Section */}
                <View style={[styles.header, { backgroundColor: Colors.primary }]}>
                    <View style={styles.headerContent}>
                        {profile.profile_image_url ? (
                            <Image
                                source={{ uri: profile.profile_image_url }}
                                style={styles.profileImage}
                            />
                        ) : (
                            <View style={[styles.profileImage, styles.placeholderImage, { backgroundColor: Colors.backgroundSecondary }]}>
                                <Ionicons name="business" size={40} color={Colors.primary} />
                            </View>
                        )}
                        <View style={styles.headerText}>
                            <Text style={styles.businessName}>{profile.name}</Text>
                            {profile.description && (
                                <Text style={styles.description}>{profile.description}</Text>
                            )}
                        </View>
                    </View>
                </View>

                {/* Contact Section */}
                <View style={[styles.section, { backgroundColor: Colors.background }]}>
                    <Text style={[styles.sectionTitle, { color: Colors.textPrimary }]}>Contact Information</Text>
                    
                    {profile.phone_number && (
                        <TouchableOpacity
                            style={[styles.contactCard, { backgroundColor: Colors.backgroundSecondary }]}
                            onPress={makeCall}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.iconCircle, { backgroundColor: Colors.primary + '15' }]}>
                                <Ionicons name="call" size={20} color={Colors.primary} />
                            </View>
                            <View style={styles.contactText}>
                                <Text style={[styles.contactLabel, { color: Colors.textSecondary }]}>Phone</Text>
                                <Text style={[styles.contactValue, { color: Colors.textPrimary }]}>
                                    {profile.phone_number}
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={Colors.textTertiary} />
                        </TouchableOpacity>
                    )}

                    {profile.email && (
                        <View style={[styles.contactCard, { backgroundColor: Colors.backgroundSecondary }]}>
                            <View style={[styles.iconCircle, { backgroundColor: Colors.primary + '15' }]}>
                                <Ionicons name="mail" size={20} color={Colors.primary} />
                            </View>
                            <View style={[styles.contactText, { flex: 1 }]}>
                                <Text style={[styles.contactLabel, { color: Colors.textSecondary }]}>Email</Text>
                                <Text style={[styles.contactValue, { color: Colors.textPrimary }]}>
                                    {profile.email}
                                </Text>
                            </View>
                        </View>
                    )}

                    {(profile.address || profile.city || profile.state || profile.pincode) && (
                        <View style={[styles.contactCard, { backgroundColor: Colors.backgroundSecondary }]}>
                            <View style={[styles.iconCircle, { backgroundColor: Colors.primary + '15' }]}>
                                <Ionicons name="location" size={20} color={Colors.primary} />
                            </View>
                            <View style={[styles.contactText, { flex: 1 }]}>
                                <Text style={[styles.contactLabel, { color: Colors.textSecondary }]}>Address</Text>
                                {profile.address && (
                                    <Text style={[styles.contactValue, { color: Colors.textPrimary }]}>
                                        {profile.address}
                                    </Text>
                                )}
                                {(profile.city || profile.state || profile.pincode) && (
                                    <Text style={[styles.contactValue, { color: Colors.textPrimary, marginTop: 2 }]}>
                                        {[profile.city, profile.state, profile.pincode].filter(Boolean).join(', ')}
                                    </Text>
                                )}
                            </View>
                        </View>
                    )}

                    {profile.gst_number && (
                        <View style={[styles.contactCard, { backgroundColor: Colors.backgroundSecondary }]}>
                            <View style={[styles.iconCircle, { backgroundColor: Colors.primary + '15' }]}>
                                <Ionicons name="document-text" size={20} color={Colors.primary} />
                            </View>
                            <View style={[styles.contactText, { flex: 1 }]}>
                                <Text style={[styles.contactLabel, { color: Colors.textSecondary }]}>GST Number</Text>
                                <Text style={[styles.contactValue, { color: Colors.textPrimary }]}>
                                    {profile.gst_number}
                                </Text>
                            </View>
                        </View>
                    )}

                    {profile.website && (
                        <TouchableOpacity
                            style={[styles.contactCard, { backgroundColor: Colors.backgroundSecondary }]}
                            onPress={() => Linking.openURL(profile.website)}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.iconCircle, { backgroundColor: Colors.primary + '15' }]}>
                                <Ionicons name="globe" size={20} color={Colors.primary} />
                            </View>
                            <View style={styles.contactText}>
                                <Text style={[styles.contactLabel, { color: Colors.textSecondary }]}>Website</Text>
                                <Text style={[styles.contactValue, { color: Colors.primary }]} numberOfLines={1}>
                                    {profile.website}
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={Colors.textTertiary} />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Location Map Section */}
                {profile.latitude && profile.longitude && (
                    <View style={[styles.section, { backgroundColor: Colors.background }]}>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { color: Colors.textPrimary }]}>Location</Text>
                            <TouchableOpacity onPress={openLocation} style={styles.viewMapButton}>
                                <Text style={[styles.viewMapText, { color: Colors.primary }]}>Open in Maps</Text>
                                <Ionicons name="arrow-forward" size={16} color={Colors.primary} />
                            </TouchableOpacity>
                        </View>
                        
                        <TouchableOpacity
                            style={[styles.mapPreview, { backgroundColor: Colors.backgroundSecondary }]}
                            onPress={openLocation}
                            activeOpacity={0.7}
                        >
                            <Image
                                source={{
                                    uri: `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-l-shop+7c3aed(${profile.longitude},${profile.latitude})/${profile.longitude},${profile.latitude},14,0/600x300@2x?access_token=pk.eyJ1IjoibWFkaGF2ZGdzIiwiYSI6ImNtNWFtZTBsdzBiNXoya3M4MnYwYXB6cGoifQ.Km3YB7X0aCrOBN0dABHXMg`
                                }}
                                style={styles.mapImage}
                                resizeMode="cover"
                            />
                            <View style={[styles.mapOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                                <Ionicons name="navigate" size={24} color="#fff" />
                                <Text style={styles.mapOverlayText}>Tap to open directions</Text>
                            </View>
                        </TouchableOpacity>

                        {profile.location && (
                            <Text style={[styles.locationText, { color: Colors.textSecondary }]}>
                                {profile.location}
                            </Text>
                        )}
                    </View>
                )}

                {/* Products Section */}
                {profile.products && profile.products.length > 0 && (
                    <View style={[styles.section, { backgroundColor: Colors.background }]}>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { color: Colors.textPrimary }]}>
                                Products ({profile.products_count})
                            </Text>
                        </View>

                        <View style={styles.productsGrid}>
                            {profile.products.map((product: any) => (
                                <View
                                    key={product.id}
                                    style={[styles.productCard, { backgroundColor: Colors.backgroundSecondary }]}
                                >
                                    {product.product_image_url ? (
                                        <Image
                                            source={{ uri: product.product_image_url }}
                                            style={styles.productImage}
                                        />
                                    ) : (
                                        <View style={[styles.productImage, styles.productImagePlaceholder, { backgroundColor: Colors.background }]}>
                                            <Ionicons name="cube-outline" size={32} color={Colors.textTertiary} />
                                        </View>
                                    )}
                                    
                                    <View style={styles.productInfo}>
                                        <Text style={[styles.productName, { color: Colors.textPrimary }]} numberOfLines={2}>
                                            {product.name}
                                        </Text>
                                        
                                        <View style={styles.productMeta}>
                                            <Text style={[styles.productPrice, { color: Colors.primary }]}>
                                                {formatCurrency(product.price)}
                                            </Text>
                                            <Text style={[styles.productUnit, { color: Colors.textSecondary }]}>
                                                / {product.unit}
                                            </Text>
                                        </View>

                                        {product.stock_quantity !== undefined && (
                                            <View style={styles.stockBadge}>
                                                <Ionicons 
                                                    name={product.is_low_stock ? "alert-circle" : "checkmark-circle"} 
                                                    size={12} 
                                                    color={product.is_low_stock ? '#ef4444' : '#10b981'} 
                                                />
                                                <Text style={[
                                                    styles.stockText,
                                                    { color: product.is_low_stock ? '#ef4444' : '#10b981' }
                                                ]}>
                                                    {product.stock_quantity} in stock
                                                </Text>
                                            </View>
                                        )}

                                        {product.category && (
                                            <View style={[styles.categoryBadge, { backgroundColor: Colors.background }]}>
                                                <Text style={[styles.categoryText, { color: Colors.textSecondary }]}>
                                                    {product.category}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Empty State for Products */}
                {(!profile.products || profile.products.length === 0) && (
                    <View style={[styles.section, { backgroundColor: Colors.background }]}>
                        <Text style={[styles.sectionTitle, { color: Colors.textPrimary }]}>Products</Text>
                        <View style={styles.emptyProducts}>
                            <Ionicons name="cube-outline" size={48} color={Colors.textTertiary} />
                            <Text style={[styles.emptyText, { color: Colors.textSecondary }]}>
                                No products available
                            </Text>
                        </View>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
    },
    header: {
        paddingTop: Spacing.space6,
        paddingBottom: Spacing.space8,
        paddingHorizontal: Spacing.space4,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    profileImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginRight: Spacing.space4,
    },
    placeholderImage: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerText: {
        flex: 1,
    },
    businessName: {
        fontSize: 24,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 4,
    },
    description: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        lineHeight: 20,
    },
    section: {
        padding: Spacing.space4,
        marginBottom: Spacing.space2,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.space3,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: Spacing.space3,
    },
    contactCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.space4,
        borderRadius: BorderRadius.md,
        marginBottom: Spacing.space2,
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.space3,
    },
    contactText: {
        flex: 1,
    },
    contactLabel: {
        fontSize: 12,
        marginBottom: 2,
    },
    contactValue: {
        fontSize: 16,
        fontWeight: '600',
    },
    viewMapButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    viewMapText: {
        fontSize: 14,
        fontWeight: '600',
    },
    mapPreview: {
        height: 200,
        borderRadius: BorderRadius.md,
        overflow: 'hidden',
        marginBottom: Spacing.space2,
    },
    mapImage: {
        width: '100%',
        height: '100%',
    },
    mapOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mapOverlayText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        marginTop: 8,
    },
    locationText: {
        fontSize: 14,
        lineHeight: 20,
    },
    productsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -Spacing.space2,
    },
    productCard: {
        width: '48%',
        margin: '1%',
        borderRadius: BorderRadius.md,
        overflow: 'hidden',
    },
    productImage: {
        width: '100%',
        height: 120,
    },
    productImagePlaceholder: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    productInfo: {
        padding: Spacing.space3,
    },
    productName: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 6,
        height: 36,
    },
    productMeta: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 6,
    },
    productPrice: {
        fontSize: 16,
        fontWeight: '700',
    },
    productUnit: {
        fontSize: 12,
        marginLeft: 2,
    },
    stockBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 6,
    },
    stockText: {
        fontSize: 11,
        fontWeight: '600',
    },
    categoryBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: BorderRadius.sm,
        alignSelf: 'flex-start',
    },
    categoryText: {
        fontSize: 10,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    emptyProducts: {
        alignItems: 'center',
        paddingVertical: Spacing.space8,
    },
    emptyText: {
        fontSize: 14,
        marginTop: Spacing.space2,
    },
});
