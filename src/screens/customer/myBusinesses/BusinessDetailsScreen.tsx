/**
 * Business Details Screen - Customer View
 * GPay-Inspired Design with Chat Bubbles
 * Shows transactions in a clean timeline format
 */

import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Platform,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getThemedColors, Typography, Spacing, BorderRadius } from '../../../constants/theme';
import { useTheme } from '../../../context/ThemeContext';
import { useFocusEffect } from '@react-navigation/native';
import ApiService from '../../../services/api';

export default function BusinessDetailsScreen({ route, navigation }: any) {
    const { isDark } = useTheme();
    const Colors = getThemedColors(isDark);
    const { businessId } = route.params;
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [business, setBusiness] = useState<any>(null);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [summary, setSummary] = useState<any>({});
    const scrollViewRef = useRef<ScrollView>(null);

    useEffect(() => {
        navigation.setOptions({
            headerTitle: business?.name || 'Business Details',
            headerRight: () => (
                <TouchableOpacity
                    onPress={() => navigation.navigate('BusinessProfile', { businessId })}
                    style={{ marginRight: 8 }}
                >
                    <Ionicons name="information-circle-outline" size={26} color="#fff" />
                </TouchableOpacity>
            ),
        });
    }, [navigation, business, businessId]);

    // Reload data when screen comes into focus (e.g., after adding a transaction)
    useFocusEffect(
        React.useCallback(() => {
            loadBusinessDetails();
        }, [businessId])
    );

    const loadBusinessDetails = async () => {
        try {
            if (!refreshing) {
                setLoading(true);
            }
            const response = await ApiService.getBusinessDetails(businessId);
            setBusiness(response.business);
            setTransactions(response.transactions || []);
            setSummary(response.summary || {});
        } catch (error) {
            console.error('Error loading business details:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadBusinessDetails();
    };

    const formatCurrency = (amount: number) => {
        return `₹${Math.round(amount).toLocaleString('en-IN')}`;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-IN', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    };

    const groupByDate = (txns: any[]) => {
        const groups: { [key: string]: any[] } = {};
        txns.forEach(txn => {
            const date = new Date(txn.created_at).toDateString();
            if (!groups[date]) groups[date] = [];
            groups[date].push(txn);
        });

        return Object.entries(groups)
            .map(([date, items]) => ({
                date,
                displayDate: formatDate(items[0].created_at),
                data: items.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
            }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    };

    const handleTakeCredit = () => {
        navigation.navigate('AddTransaction', {
            businessId: businessId,
            businessName: business.name,
            transactionType: 'credit',
        });
    };

    const handlePayBack = () => {
        navigation.navigate('AddTransaction', {
            businessId: businessId,
            businessName: business.name,
            transactionType: 'payment',
        });
    };

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: Colors.background }]}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            </View>
        );
    }

    if (!business) {
        return (
            <View style={[styles.container, { backgroundColor: Colors.background }]}>
                <View style={styles.errorContainer}>
                    <Text style={[styles.errorText, { color: Colors.textPrimary }]}>Business not found</Text>
                </View>
            </View>
        );
    }

    const currentBalance = summary.current_balance || 0;
    const isPositive = currentBalance > 0;

    return (
        <View style={[styles.container, { backgroundColor: isDark ? Colors.background : '#f5f5f5' }]}>
            {/* Balance Card - Clean & Minimal */}
            <View style={[styles.balanceCard, {
                backgroundColor: Colors.card,
                borderColor: Colors.borderLight,
            }]}>
                <View style={styles.balanceHeader}>
                    <Text style={[styles.balanceLabel, { color: Colors.textSecondary }]}>Current Balance</Text>
                    <View style={[styles.balanceBadge, {
                        backgroundColor: isPositive
                            ? (isDark ? 'rgba(90, 154, 142, 0.2)' : 'rgba(90, 154, 142, 0.1)')
                            : (isDark ? 'rgba(156, 163, 175, 0.2)' : 'rgba(156, 163, 175, 0.1)')
                    }]}>
                        <Text style={[styles.balanceBadgeText, {
                            color: isPositive ? Colors.primary : Colors.textSecondary
                        }]}>
                            {currentBalance > 0 ? "You'll Get" : currentBalance < 0 ? "You Owe" : 'Settled'}
                        </Text>
                    </View>
                </View>
                <Text style={[styles.balanceAmount, { color: Colors.textPrimary }]}>
                    {formatCurrency(Math.abs(currentBalance))}
                </Text>
            </View>

            <ScrollView
                ref={scrollViewRef}
                style={styles.content}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                onContentSizeChange={() => {
                    scrollViewRef.current?.scrollToEnd({ animated: false });
                }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} tintColor={Colors.primary} />
                }
            >
                {/* Transactions - GPay Style */}
                {transactions.length > 0 ? (
                    <View style={styles.transactionsContainer}>
                        {groupByDate(transactions).map((group, groupIndex) => (
                            <View key={groupIndex}>
                                {/* Date Separator */}
                                <View style={styles.dateSeparatorContainer}>
                                    <View style={[styles.dateBadge, {
                                        backgroundColor: isDark ? Colors.card : '#e5e7eb'
                                    }]}>
                                        <Text style={[styles.dateText, { color: Colors.textSecondary }]}>
                                            {group.displayDate}
                                        </Text>
                                    </View>
                                </View>

                                {/* Transactions for this date */}
                                {group.data.map((transaction) => {
                                    const isCredit = transaction.transaction_type === 'credit';
                                    // In customer view: 
                                    // - Business created (left side) = business gave credit or received payment
                                    // - Customer created (right side) = customer took credit or made payment
                                    const isCustomerCreated = transaction.created_by === 'customer';
                                    
                                    console.log('Transaction:', transaction.id, 'created_by:', transaction.created_by, 'isCustomerCreated:', isCustomerCreated);

                                    return (
                                        <View
                                            key={transaction.id}
                                            style={[
                                                styles.transactionRow,
                                                isCustomerCreated ? styles.transactionRowRight : styles.transactionRowLeft
                                            ]}
                                        >
                                            {/* Avatar for business transactions (left) */}
                                            {!isCustomerCreated && business && (
                                                <View style={[styles.avatar, {
                                                    backgroundColor: isDark ? 'rgba(90, 154, 142, 0.2)' : 'rgba(90, 154, 142, 0.15)'
                                                }]}>
                                                    <Text style={[styles.avatarText, { color: Colors.primary }]}>
                                                        {business.name.charAt(0).toUpperCase()}
                                                    </Text>
                                                </View>
                                            )}

                                            {/* Transaction Bubble */}
                                            <View style={[
                                                styles.transactionBubble,
                                                !isCustomerCreated ? styles.bubbleReceived : styles.bubbleSent,
                                                {
                                                    backgroundColor: !isCustomerCreated
                                                        ? (isDark ? '#2a2a2a' : '#f5f5f5')
                                                        : (isDark ? 'rgba(90, 154, 142, 0.15)' : 'rgba(90, 154, 142, 0.08)')
                                                }
                                            ]}>
                                                {/* Amount */}
                                                <Text style={[styles.transactionAmount, { color: Colors.textPrimary }]}>
                                                    {formatCurrency(transaction.amount)}
                                                </Text>

                                                {/* Status Row */}
                                                <View style={styles.statusRow}>
                                                    <Ionicons
                                                        name="checkmark-circle"
                                                        size={16}
                                                        color={isCredit ? '#ef4444' : '#10b981'}
                                                    />
                                                    <Text style={[styles.statusText, { color: isCredit ? '#ef4444' : '#10b981' }]} numberOfLines={1}>
                                                        {isCredit ? 'Credit Taken' : 'Payment Made'}
                                                    </Text>
                                                    <Ionicons name="chevron-forward" size={14} color={Colors.textTertiary} />
                                                </View>

                                                {/* Notes */}
                                                {transaction.notes && (
                                                    <Text style={[styles.notes, { color: Colors.textSecondary }]} numberOfLines={2}>
                                                        {transaction.notes}
                                                    </Text>
                                                )}

                                                {/* Receipt Image */}
                                                {transaction.receipt_image_url && (
                                                    <Image
                                                        source={{ uri: transaction.receipt_image_url }}
                                                        style={styles.receiptImage}
                                                        resizeMode="cover"
                                                    />
                                                )}

                                                {/* Time */}
                                                <Text style={[styles.time, { color: Colors.textTertiary }]}>
                                                    {formatTime(transaction.created_at)}
                                                </Text>
                                            </View>
                                        </View>
                                    );
                                })}
                            </View>
                        ))}
                    </View>
                ) : (
                    <View style={[styles.emptyState, { backgroundColor: Colors.card }]}>
                        <Ionicons name="receipt-outline" size={48} color={Colors.textTertiary} />
                        <Text style={[styles.emptyText, { color: Colors.textSecondary }]}>No transactions yet</Text>
                    </View>
                )}
            </ScrollView>

            {/* Action Buttons */}
            <View style={[styles.actionButtons, { backgroundColor: Colors.card, borderTopColor: Colors.borderLight }]}>
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#10b981' }]}
                    onPress={handleTakeCredit}
                    activeOpacity={0.8}
                >
                    <Ionicons name="add-circle-outline" size={20} color="#fff" />
                    <Text style={styles.actionButtonText}>Take Credit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#3b82f6' }]}
                    onPress={handlePayBack}
                    activeOpacity={0.8}
                >
                    <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                    <Text style={styles.actionButtonText}>Pay Back</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: Typography.fontSm,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    balanceCard: {
        marginHorizontal: Spacing.md,
        marginVertical: Spacing.md,
        padding: Spacing.lg,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        backgroundColor: 'transparent',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
            },
            android: { elevation: 2 },
        }),
    },
    balanceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    balanceLabel: {
        fontSize: Typography.fontSm,
        fontFamily: Typography.fonts.semiBold,
    },
    balanceBadge: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: 4,
        borderRadius: BorderRadius.md,
    },
    balanceBadgeText: {
        fontSize: Typography.font3xs,
        fontFamily: Typography.fonts.bold,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    balanceAmount: {
        fontSize: 32,
        fontWeight: '900',
        letterSpacing: -1,
    },
    transactionsContainer: {
        paddingHorizontal: Spacing.md,
    },
    dateSeparatorContainer: {
        alignItems: 'center',
        marginVertical: Spacing.md,
    },
    dateBadge: {
        paddingHorizontal: Spacing.md,
        paddingVertical: 6,
        borderRadius: BorderRadius.full,
    },
    dateText: {
        fontSize: Typography.fontXs,
        fontFamily: Typography.fonts.semiBold,
    },
    transactionRow: {
        flexDirection: 'row',
        marginBottom: Spacing.md,
        alignItems: 'flex-end',
    },
    transactionRowLeft: {
        justifyContent: 'flex-start',
    },
    transactionRowRight: {
        justifyContent: 'flex-end',
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.xs,
    },
    avatarText: {
        fontSize: 14,
        fontFamily: Typography.fonts.bold,
    },
    transactionBubble: {
        minWidth: '50%',
        maxWidth: '75%',
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.06,
                shadowRadius: 4,
            },
            android: { elevation: 1 },
        }),
    },
    bubbleReceived: {
        alignSelf: 'flex-start',
        borderTopLeftRadius: 4,
    },
    bubbleSent: {
        alignSelf: 'flex-end',
        borderTopRightRadius: 4,
    },
    transactionAmount: {
        fontSize: Typography.fontLg,
        fontWeight: '800',
        marginBottom: Spacing.xs,
        letterSpacing: -0.5,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: Spacing.xs,
    },
    statusText: {
        flex: 1,
        fontSize: Typography.fontSm,
        fontFamily: Typography.fonts.semiBold,
    },
    notes: {
        fontSize: Typography.fontXs,
        marginBottom: Spacing.xs,
        lineHeight: 18,
    },
    receiptImage: {
        width: '100%',
        height: 150,
        borderRadius: BorderRadius.md,
        marginTop: Spacing.xs,
        marginBottom: Spacing.xs,
    },
    time: {
        fontSize: Typography.font3xs,
        textAlign: 'right',
        marginTop: 2,
    },
    emptyState: {
        borderRadius: BorderRadius.md,
        padding: Spacing.space6,
        alignItems: 'center',
        margin: Spacing.md,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 3,
            },
            android: { elevation: 2 },
        }),
    },
    emptyText: {
        fontSize: Typography.fontSm,
        marginTop: Spacing.md,
    },
    bottomActions: {
        padding: Spacing.md,
        paddingBottom: Platform.OS === 'ios' ? Spacing.xl : Spacing.md,
        borderTopWidth: 1,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
            },
            android: { elevation: 4 },
        }),
    },
    actionButtonsRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    creditButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        gap: Spacing.xs,
        backgroundColor: '#ef4444',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 4,
            },
            android: { elevation: 3 },
        }),
    },
    paymentButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        gap: Spacing.xs,
        backgroundColor: '#10b981',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 4,
            },
            android: { elevation: 3 },
        }),
    },
    transactionIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    transactionInfo: {
        flex: 1,
        gap: 6,
    },
    transactionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    transactionType: {
        fontSize: 15,
        fontWeight: '600' as const,
    },
    transactionMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    transactionDate: {
        fontSize: 12,
    },
    transactionTime: {
        fontSize: 12,
    },
    transactionNotes: {
        fontSize: 13,
        lineHeight: 18,
        marginTop: 4,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: '600' as const,
        marginTop: 12,
        marginBottom: 4,
    },
    actionButtons: {
        flexDirection: 'row',
        padding: Spacing.md,
        gap: Spacing.md,
        borderTopWidth: 1,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
            },
            android: { elevation: 4 },
        }),
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.lg,
        gap: Spacing.xs,
    },
    actionButtonText: {
        color: '#fff',
        fontSize: Typography.fontSm,
        fontFamily: Typography.fonts.semiBold,
    },
});
