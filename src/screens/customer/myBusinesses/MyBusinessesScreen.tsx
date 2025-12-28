/**
 * My Businesses Screen - Customer's Connected Shops
 * Shows real balance values and transaction history access
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import { getThemedColors, Typography, Spacing, BorderRadius } from '../../../constants/theme';
import ApiService from '../../../services/api';
import AddBusinessModal from './AddBusinessModal';

export default function MyBusinessesScreen({ navigation }: any) {
    const { isDark } = useTheme();
    const Colors = getThemedColors(isDark);

    const [businesses, setBusinesses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);

    useEffect(() => {
        loadMyBusinesses();
    }, []);

    const loadMyBusinesses = async () => {
        try {
            if (!refreshing) setLoading(true);
            const response = await ApiService.getMyBusinesses();
            console.log('🏢 My Businesses API Response:', JSON.stringify(response, null, 2));
            const businessesData = response.businesses || response.data || response || [];
            console.log('🏢 Businesses Data:', businessesData.length, 'businesses');
            
            // Log each business ID for debugging
            businessesData.forEach((biz: any, idx: number) => {
                console.log(`🏪 Business ${idx + 1}: ID=${biz.id}, Name=${biz.name}`);
            });
            
            setBusinesses(businessesData);
        } catch (error) {
            console.error('Failed to load businesses:', error);
            setBusinesses([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return `₹${Math.abs(amount).toLocaleString('en-IN')}`;
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadMyBusinesses();
    };

    const handleBusinessPress = (business: any) => {
        navigation.navigate('BusinessDetails', { businessId: business.id });
    };

    return (
        <View style={[styles.container, { backgroundColor: Colors.background }]}>
            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
                }
            >
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={[styles.title, { color: Colors.textPrimary }]}>My Businesses</Text>
                        <Text style={[styles.subtitle, { color: Colors.textSecondary }]}>
                            {businesses.length} {businesses.length === 1 ? 'shop' : 'shops'} connected
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.addButton, { backgroundColor: Colors.primary }]}
                        onPress={() => setShowAddModal(true)}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="add" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>

                {loading && !refreshing ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={Colors.primary} />
                    </View>
                ) : businesses.length === 0 ? (
                    <View style={[styles.emptyState, { backgroundColor: Colors.card }]}>
                        <Ionicons name="business-outline" size={64} color={Colors.textTertiary} />
                        <Text style={[styles.emptyText, { color: Colors.textPrimary }]}>
                            No Saved Businesses
                        </Text>
                        <Text style={[styles.emptySubtext, { color: Colors.textSecondary }]}>
                            Connect with shops to manage your credit and transactions
                        </Text>
                        <TouchableOpacity
                            style={[styles.exploreButton, { backgroundColor: Colors.primary }]}
                            onPress={() => navigation.navigate('Products')}
                        >
                            <Text style={styles.exploreButtonText}>Explore Products</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.businessList}>
                        {businesses.map((business) => {
                            const balance = business.current_balance || 0;
                            const isPositive = balance > 0;

                            return (
                                <TouchableOpacity
                                    key={business.id}
                                    style={[styles.businessCard, { backgroundColor: Colors.card, borderColor: Colors.borderLight }]}
                                    onPress={() => handleBusinessPress(business)}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.businessMain}>
                                        <View style={[styles.businessIcon, { backgroundColor: Colors.primary + '15' }]}>
                                            <Text style={[styles.businessIconText, { color: Colors.primary }]}>
                                                {business.name?.charAt(0).toUpperCase() || 'B'}
                                            </Text>
                                        </View>

                                        <View style={styles.businessInfo}>
                                            <Text style={[styles.businessName, { color: Colors.textPrimary }]}>
                                                {business.name}
                                            </Text>
                                            {business.description && (
                                                <Text style={[styles.businessDesc, { color: Colors.textSecondary }]} numberOfLines={1}>
                                                    {business.description}
                                                </Text>
                                            )}

                                            {/* Balance Badge */}
                                            <View style={styles.balanceRow}>
                                                <View style={[
                                                    styles.balanceBadge,
                                                    { backgroundColor: isPositive ? '#10b981' + '15' : '#ef4444' + '15' }
                                                ]}>
                                                    <Ionicons
                                                        name={isPositive ? 'arrow-up-circle' : 'arrow-down-circle'}
                                                        size={14}
                                                        color={isPositive ? '#10b981' : '#ef4444'}
                                                    />
                                                    <Text style={[
                                                        styles.balanceText,
                                                        { color: isPositive ? '#10b981' : '#ef4444' }
                                                    ]}>
                                                        {formatCurrency(balance)} {isPositive ? "You'll Get" : "You'll Give"}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>

                                        <Ionicons name="chevron-forward" size={20} color={Colors.textTertiary} />
                                    </View>

                                    {/* View Details Button */}
                                    <View style={[styles.detailsButton, { backgroundColor: Colors.backgroundSecondary }]}>
                                        <Ionicons name="list-outline" size={14} color={Colors.textSecondary} />
                                        <Text style={[styles.detailsText, { color: Colors.textSecondary }]}>
                                            View Transaction History
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}
            </ScrollView>

            {/* Add Business Modal */}
            <AddBusinessModal
                visible={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSuccess={() => {
                    setShowAddModal(false);
                    loadMyBusinesses();
                }}
                navigation={navigation}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    header: {
        padding: Spacing.space4,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    title: {
        fontSize: 24,
        fontWeight: '700' as const,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
    },
    loadingContainer: {
        paddingVertical: 60,
        alignItems: 'center',
    },
    emptyState: {
        margin: Spacing.space4,
        padding: Spacing.space8,
        borderRadius: 16,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600' as const,
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 20,
        paddingHorizontal: 20,
        lineHeight: 20,
    },
    exploreButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    exploreButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600' as const,
    },
    businessList: {
        padding: Spacing.space4,
        gap: Spacing.space3,
    },
    businessCard: {
        borderRadius: 12,
        borderWidth: 1,
        padding: Spacing.space3,
        gap: 12,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    businessMain: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    businessIcon: {
        width: 52,
        height: 52,
        borderRadius: 26,
        justifyContent: 'center',
        alignItems: 'center',
    },
    businessIconText: {
        fontSize: 22,
        fontWeight: '700' as const,
    },
    businessInfo: {
        flex: 1,
        gap: 4,
    },
    businessName: {
        fontSize: 16,
        fontWeight: '600' as const,
    },
    businessDesc: {
        fontSize: 13,
    },
    balanceRow: {
        marginTop: 4,
    },
    balanceBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 6,
        gap: 6,
    },
    balanceText: {
        fontSize: 13,
        fontWeight: '600' as const,
    },
    detailsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 8,
        gap: 6,
    },
    detailsText: {
        fontSize: 13,
        fontWeight: '500' as const,
    },
});
