/**
 * Offers Screen - Grouped by Business
 * Modern, clean UI without emojis
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

export default function OffersScreen({ navigation }: any) {
    const { isDark } = useTheme();
    const Colors = getThemedColors(isDark);

    const [offers, setOffers] = useState<any[]>([]);
    const [groupedOffers, setGroupedOffers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [expandedBusinesses, setExpandedBusinesses] = useState<Set<string>>(new Set());

    useEffect(() => {
        loadOffers();
    }, []);

    const loadOffers = async () => {
        try {
            if (!refreshing) setLoading(true);
            setError(null);
            const response = await ApiService.getOffers();
            console.log('📦 Offers API Response:', JSON.stringify(response, null, 2));
            const offersData = response.offers || response.data || response || [];
            console.log('📦 Offers Data:', offersData.length, 'offers');
            setOffers(offersData);
            groupOffersByBusiness(offersData);
        } catch (error: any) {
            console.error('Failed to load offers:', error);
            setError(error.message || 'Failed to load offers');
            setOffers([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const groupOffersByBusiness = (offersData: any[]) => {
        const groups: { [key: string]: any } = {};

        offersData.forEach((offer) => {
            const businessId = offer.business_id;
            if (!groups[businessId]) {
                groups[businessId] = {
                    businessId,
                    businessName: offer.business_name || 'Unknown Business',
                    offers: [],
                };
            }
            groups[businessId].offers.push(offer);
        });

        const grouped = Object.values(groups);
        setGroupedOffers(grouped);
    };

    const toggleBusiness = (businessId: string) => {
        const newExpanded = new Set(expandedBusinesses);
        if (newExpanded.has(businessId)) {
            newExpanded.delete(businessId);
        } else {
            newExpanded.add(businessId);
        }
        setExpandedBusinesses(newExpanded);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'No expiry';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadOffers();
    };

    if (loading && !refreshing) {
        return (
            <View style={[styles.container, { backgroundColor: Colors.background }]}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={[styles.loadingText, { color: Colors.textSecondary }]}>Loading offers...</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: Colors.background }]}>
            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} tintColor={Colors.primary} />
                }
            >
                {/* Stats Header */}
                <View style={[styles.statsHeader, { backgroundColor: Colors.card }]}>
                    <View style={[styles.statBox, { backgroundColor: Colors.primary + '15' }]}>
                        <Ionicons name="pricetag" size={20} color={Colors.primary} />
                        <Text style={[styles.statValue, { color: Colors.primary }]}>{offers.length}</Text>
                        <Text style={[styles.statLabel, { color: Colors.textSecondary }]}>Active Offers</Text>
                    </View>
                    <View style={[styles.statBox, { backgroundColor: '#8b5cf6' + '15' }]}>
                        <Ionicons name="business" size={20} color="#8b5cf6" />
                        <Text style={[styles.statValue, { color: '#8b5cf6' }]}>{groupedOffers.length}</Text>
                        <Text style={[styles.statLabel, { color: Colors.textSecondary }]}>Businesses</Text>
                    </View>
                </View>

                {groupedOffers.length > 0 ? (
                    <View style={styles.businessesContainer}>
                        {groupedOffers.map((group) => {
                            const isExpanded = expandedBusinesses.has(group.businessId);
                            return (
                                <View key={group.businessId} style={styles.businessGroup}>
                                    {/* Business Header */}
                                    <TouchableOpacity
                                        style={[styles.businessHeader, { backgroundColor: Colors.card, borderColor: Colors.borderLight }]}
                                        onPress={() => toggleBusiness(group.businessId)}
                                        activeOpacity={0.7}
                                    >
                                        <View style={styles.businessLeft}>
                                            <View style={[styles.businessIcon, { backgroundColor: Colors.primary + '15' }]}>
                                                <Ionicons name="storefront" size={22} color={Colors.primary} />
                                            </View>
                                            <View style={styles.businessInfo}>
                                                <Text style={[styles.businessName, { color: Colors.textPrimary }]}>{group.businessName}</Text>
                                                <Text style={[styles.offerCount, { color: Colors.textSecondary }]}>
                                                    {group.offers.length} {group.offers.length === 1 ? 'offer' : 'offers'} available
                                                </Text>
                                            </View>
                                        </View>
                                        <Ionicons
                                            name={isExpanded ? 'chevron-up' : 'chevron-down'}
                                            size={20}
                                            color={Colors.textSecondary}
                                        />
                                    </TouchableOpacity>

                                    {/* Expanded Offers */}
                                    {isExpanded && (
                                        <View style={styles.offersContainer}>
                                            {group.offers.map((offer: any) => (
                                                <TouchableOpacity
                                                    key={offer.id}
                                                    style={[styles.offerCard, { backgroundColor: Colors.card, borderColor: Colors.borderLight }]}
                                                    onPress={() => navigation.navigate('OfferDetail', { offer: { ...offer, business_name: group.businessName } })}
                                                    activeOpacity={0.7}
                                                >
                                                    <View style={styles.offerHeader}>
                                                        <View style={[styles.discountBadge, { backgroundColor: '#10b981' + '15' }]}>
                                                            <Ionicons name="gift" size={16} color="#10b981" />
                                                            <Text style={[styles.discountText, { color: '#10b981' }]}>
                                                                {offer.discount_percentage}% OFF
                                                            </Text>
                                                        </View>
                                                        <View style={[styles.validBadge, { backgroundColor: Colors.backgroundSecondary }]}>
                                                            <Ionicons name="time-outline" size={12} color={Colors.textSecondary} />
                                                            <Text style={[styles.validText, { color: Colors.textSecondary }]}>
                                                                Valid until {formatDate(offer.valid_until)}
                                                            </Text>
                                                        </View>
                                                    </View>

                                                    <Text style={[styles.offerTitle, { color: Colors.textPrimary }]}>{offer.title}</Text>

                                                    {offer.description && (
                                                        <Text style={[styles.offerDescription, { color: Colors.textSecondary }]}>
                                                            {offer.description}
                                                        </Text>
                                                    )}

                                                    {offer.terms && (
                                                        <View style={styles.termsContainer}>
                                                            <Ionicons name="information-circle-outline" size={14} color={Colors.textTertiary} />
                                                            <Text style={[styles.termsText, { color: Colors.textTertiary }]}>
                                                                {offer.terms}
                                                            </Text>
                                                        </View>
                                                    )}
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    )}
                                </View>
                            );
                        })}
                    </View>
                ) : (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="pricetag-outline" size={64} color={Colors.textTertiary} />
                        <Text style={[styles.emptyTitle, { color: Colors.textPrimary }]}>No Offers Available</Text>
                        <Text style={[styles.emptyText, { color: Colors.textSecondary }]}>
                            Check back later for exciting offers from businesses
                        </Text>
                        <TouchableOpacity
                            style={[styles.refreshButton, { backgroundColor: Colors.primary }]}
                            onPress={loadOffers}
                        >
                            <Ionicons name="refresh" size={20} color="#fff" />
                            <Text style={styles.refreshButtonText}>Refresh</Text>
                        </TouchableOpacity>
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
    content: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
    },
    statsHeader: {
        flexDirection: 'row',
        padding: Spacing.space4,
        gap: Spacing.space3,
    },
    statBox: {
        flex: 1,
        padding: Spacing.space4,
        borderRadius: 12,
        alignItems: 'center',
        gap: 6,
    },
    statValue: {
        fontSize: 24,
        fontWeight: '700' as const,
    },
    statLabel: {
        fontSize: 12,
    },
    businessesContainer: {
        padding: Spacing.space4,
        gap: Spacing.space3,
    },
    businessGroup: {
        gap: Spacing.space2,
    },
    businessHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: Spacing.space3,
        borderRadius: 12,
        borderWidth: 1,
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
    businessLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 12,
    },
    businessIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    businessInfo: {
        flex: 1,
    },
    businessName: {
        fontSize: 16,
        fontWeight: '600' as const,
        marginBottom: 2,
    },
    offerCount: {
        fontSize: 13,
    },
    offersContainer: {
        paddingLeft: 56,
        gap: Spacing.space2,
    },
    offerCard: {
        padding: Spacing.space3,
        borderRadius: 10,
        borderWidth: 1,
        gap: 10,
    },
    offerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 8,
    },
    discountBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 6,
        gap: 4,
    },
    discountText: {
        fontSize: 14,
        fontWeight: '700' as const,
    },
    validBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        gap: 4,
    },
    validText: {
        fontSize: 11,
    },
    offerTitle: {
        fontSize: 15,
        fontWeight: '600' as const,
    },
    offerDescription: {
        fontSize: 13,
        lineHeight: 19,
    },
    termsContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 6,
        marginTop: 4,
    },
    termsText: {
        fontSize: 11,
        flex: 1,
        lineHeight: 16,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 80,
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700' as const,
        marginTop: 16,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
    refreshButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        marginTop: 20,
        gap: 8,
    },
    refreshButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600' as const,
    },
});
