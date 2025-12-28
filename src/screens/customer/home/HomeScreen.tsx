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
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import { getThemedColors, Typography, Spacing, BorderRadius } from '../../../constants/theme';
import ApiService from '../../../services/api';
import { SkeletonCard } from '../../../components/Skeletons';

export default function HomeScreen({ navigation }: any) {
    const { isDark } = useTheme();
    const Colors = getThemedColors(isDark);

    const [dashboardData, setDashboardData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            if (!refreshing) setLoading(true);
            setError(null);
            const response = await ApiService.getDashboard();
            setDashboardData(response);
        } catch (error: any) {
            console.error('Failed to load dashboard:', error);
            setError(error.message || 'Failed to load dashboard');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const formatCurrency = (amount: number) => `₹${amount?.toLocaleString('en-IN') || 0}`;

    const onRefresh = () => {
        setRefreshing(true);
        loadDashboard();
    };

    if (loading && !dashboardData) {
        return (
            <View style={[styles.container, { backgroundColor: Colors.background }]}>
                <LinearGradient
                    colors={['#5A9A8E', '#4A7D73', '#3A6A60', '#2A5550']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    locations={[0, 0.4, 0.7, 1]}
                    style={styles.gradientHeader}
                >
                    <SafeAreaView>
                        <View style={styles.headerTitle}>
                            <Text style={styles.appTitle}>Ekthaa</Text>
                            <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.3)' }} />
                        </View>
                    </SafeAreaView>
                </LinearGradient>
                <ScrollView style={{ flex: 1, backgroundColor: Colors.background }} contentContainerStyle={{ padding: Spacing.lg }}>
                    <SkeletonCard isDark={isDark} />
                    <SkeletonCard isDark={isDark} />
                    <SkeletonCard isDark={isDark} />
                    <SkeletonCard isDark={isDark} />
                </ScrollView>
            </View>
        );
    }

    if (error) {
        return (
            <View style={[styles.container, { backgroundColor: Colors.background }]}>
                <LinearGradient
                    colors={['#5A9A8E', '#4A7D73', '#3A6A60', '#2A5550']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    locations={[0, 0.4, 0.7, 1]}
                    style={styles.gradientHeader}
                >
                    <SafeAreaView>
                        <View style={styles.headerTitle}>
                            <Text style={styles.appTitle}>Ekthaa</Text>
                            <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.3)' }} />
                        </View>
                    </SafeAreaView>
                </LinearGradient>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl }}>
                    <Ionicons name="cloud-offline" size={64} color={Colors.textTertiary} />
                    <Text style={[styles.errorTitle, { color: Colors.textPrimary, marginTop: Spacing.lg }]}>Unable to Load Dashboard</Text>
                    <Text style={[styles.errorText, { color: Colors.textSecondary, marginTop: Spacing.sm }]}>{error}</Text>
                    <TouchableOpacity
                        style={[styles.retryButton, { backgroundColor: Colors.primary, marginTop: Spacing.xl }]}
                        onPress={loadDashboard}
                    >
                        <Ionicons name="refresh" size={20} color="#fff" />
                        <Text style={{ color: '#fff', marginLeft: Spacing.sm, fontWeight: '600' }}>Retry</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    const customer = dashboardData?.customer;
    const summary = dashboardData?.summary || {};
    const businesses = dashboardData?.businesses || [];
    const recentTransactions = dashboardData?.recent_transactions || [];

    // Calculate credits and payments manually
    const totalCredit = recentTransactions
        .filter((t: any) => t.transaction_type === 'credit')
        .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
    const totalPayment = recentTransactions
        .filter((t: any) => t.transaction_type === 'payment')
        .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);

    const netBalance = summary.total_balance || 0;

    return (
        <View style={[styles.container, { backgroundColor: Colors.background }]}>
            <LinearGradient
                colors={['#5A9A8E', '#4A7D73', '#3A6A60', '#2A5550']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                locations={[0, 0.4, 0.7, 1]}
                style={styles.gradientHeader}
            >
                <SafeAreaView>
                    <View style={styles.headerTitle}>
                        <Text style={styles.appTitle}>Ekthaa</Text>
                        <View style={styles.headerActions}>
                            <TouchableOpacity
                                style={styles.qrButton}
                                onPress={() => navigation.navigate('QRScanner')}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="qr-code-outline" size={26} color="#ffffff" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.profileButton}
                                onPress={() => navigation.navigate('Profile')}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="person-circle-outline" size={28} color="#ffffff" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </SafeAreaView>

                <View style={styles.header}>
                    <View style={styles.headerTop}>
                        <Text style={styles.accountLabel}>{customer?.name || 'Customer Account'}</Text>
                    </View>
                    <Text style={styles.balanceAmount}>{formatCurrency(Math.abs(netBalance))}</Text>
                    <Text style={styles.balanceSubtext}>{netBalance >= 0 ? 'You will get' : 'You will give'}</Text>

                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>To Get</Text>
                            <Text style={styles.statValue}>{formatCurrency(totalPayment)}</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>To Give</Text>
                            <Text style={styles.statValue}>{formatCurrency(totalCredit)}</Text>
                        </View>
                    </View>
                </View>
            </LinearGradient>

            <ScrollView
                style={[styles.content, { backgroundColor: Colors.background }]}
                contentContainerStyle={styles.contentContainer}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadDashboard} colors={[Colors.primary]} tintColor={Colors.primary} />}
                showsVerticalScrollIndicator={false}
            >
                {/* Action Cards - 4 columns */}
                <View style={styles.actionCards}>
                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => navigation.navigate('Products')}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.cardIcon, { backgroundColor: isDark ? 'rgba(90, 154, 142, 0.15)' : '#E8F5F3' }]}>
                            <Ionicons name="storefront-outline" size={22} color={Colors.primary} />
                        </View>
                        <Text style={[styles.cardLabel, { color: Colors.textPrimary }]}>Explore</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => navigation.navigate('My Businesses')}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.cardIcon, { backgroundColor: isDark ? 'rgba(90, 154, 142, 0.15)' : '#E8F5F3' }]}>
                            <Ionicons name="business-outline" size={22} color={Colors.primary} />
                        </View>
                        <Text style={[styles.cardLabel, { color: Colors.textPrimary }]}>My Shops</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => navigation.navigate('Products')}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.cardIcon, { backgroundColor: isDark ? 'rgba(90, 154, 142, 0.15)' : '#E8F5F3' }]}>
                            <Ionicons name="grid-outline" size={22} color={Colors.primary} />
                        </View>
                        <Text style={[styles.cardLabel, { color: Colors.textPrimary }]}>Products</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => navigation.navigate('Offers')}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.cardIcon, { backgroundColor: isDark ? 'rgba(90, 154, 142, 0.15)' : '#E8F5F3' }]}>
                            <Ionicons name="pricetag-outline" size={22} color={Colors.primary} />
                        </View>
                        <Text style={[styles.cardLabel, { color: Colors.textPrimary }]}>Offers</Text>
                    </TouchableOpacity>
                </View>

                {/* Today's Activity */}
                <View style={[styles.modernSummaryCard, { backgroundColor: Colors.card }]}>
                    <View style={styles.summaryTitleRow}>
                        <View>
                            <Text style={[styles.modernSummaryTitle, { color: Colors.textPrimary }]}>Today's Activity</Text>
                            <Text style={[styles.modernSummarySubtitle, { color: Colors.textSecondary }]}>
                                {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.modernStatsGrid}>
                        {/* Transactions Count */}
                        <View style={[styles.modernStatCard, { backgroundColor: isDark ? 'rgba(90, 154, 142, 0.12)' : '#E8F5F3' }]}>
                            <View style={[styles.modernStatIconContainer, { backgroundColor: Colors.primary }]}>
                                <Ionicons name="swap-horizontal" size={16} color="#fff" />
                            </View>
                            <Text style={[styles.modernStatValue, { color: Colors.primary }]}>
                                {recentTransactions.filter((t: any) => {
                                    const today = new Date().toDateString();
                                    const txDate = new Date(t.created_at).toDateString();
                                    return today === txDate;
                                }).length}
                            </Text>
                            <Text style={[styles.modernStatLabel, { color: Colors.textSecondary }]}>Transactions</Text>
                        </View>

                        {/* Shops */}
                        <View style={[styles.modernStatCard, { backgroundColor: isDark ? 'rgba(147, 51, 234, 0.12)' : '#F3E8FF' }]}>
                            <View style={[styles.modernStatIconContainer, { backgroundColor: '#9333ea' }]}>
                                <Ionicons name="business" size={16} color="#fff" />
                            </View>
                            <Text style={[styles.modernStatValue, { color: '#9333ea' }]}>
                                {summary.business_count || businesses.length || 0}
                            </Text>
                            <Text style={[styles.modernStatLabel, { color: Colors.textSecondary }]}>Shops</Text>
                        </View>

                        {/* Balance */}
                        <View style={[styles.modernStatCard, { backgroundColor: isDark ? 'rgba(34, 197, 94, 0.12)' : '#DCFCE7' }]}>
                            <View style={[styles.modernStatIconContainer, { backgroundColor: '#22c55e' }]}>
                                <Ionicons name="wallet" size={16} color="#fff" />
                            </View>
                            <Text style={[styles.modernStatValue, { color: '#22c55e' }]}>
                                {formatCurrency(Math.abs(netBalance))}
                            </Text>
                            <Text style={[styles.modernStatLabel, { color: Colors.textSecondary }]}>Balance</Text>
                        </View>
                    </View>
                </View>

                {/* Recent Activity */}
                {recentTransactions.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHead}>
                            <Text style={[styles.sectionTitle, { color: Colors.textPrimary }]}>Recent Activity</Text>
                            <TouchableOpacity
                                onPress={() => navigation.navigate('Transactions')}
                                style={styles.viewAllButton}
                            >
                                <Text style={[styles.viewAllText, { color: Colors.primary }]}>View All</Text>
                                <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.activityList}>
                            {recentTransactions.slice(0, 5).map((transaction: any, index: number) => (
                                <View
                                    key={`${transaction.id}-${index}`}
                                    style={[styles.activityItem, { backgroundColor: Colors.card }]}
                                >
                                    <View style={styles.activityLeft}>
                                        <View
                                            style={[
                                                styles.activityIcon,
                                                {
                                                    backgroundColor:
                                                        transaction.transaction_type === 'payment' ? '#DCFCE7' : '#FEE2E2',
                                                },
                                            ]}
                                        >
                                            <Ionicons
                                                name={transaction.transaction_type === 'payment' ? 'arrow-down' : 'arrow-up'}
                                                size={18}
                                                color={transaction.transaction_type === 'payment' ? '#22c55e' : '#dc2626'}
                                            />
                                        </View>
                                        <View>
                                            <Text style={[styles.activityTitle, { color: Colors.textPrimary }]}>
                                                {transaction.business_name || 'Business'}
                                            </Text>
                                            <Text style={[styles.activityDate, { color: Colors.textSecondary }]}>
                                                {new Date(transaction.created_at).toLocaleDateString()}
                                            </Text>
                                        </View>
                                    </View>
                                    <Text
                                        style={[
                                            styles.activityAmount,
                                            { color: transaction.transaction_type === 'payment' ? '#22c55e' : '#dc2626' },
                                        ]}
                                    >
                                        {transaction.transaction_type === 'payment' ? '+' : '-'}₹{transaction.amount.toFixed(2)}
                                    </Text>
                                </View>
                            ))}
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
    gradientHeader: {
        paddingBottom: Spacing.space6,
    },
    headerTitle: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.space4,
        paddingTop: Platform.OS === 'ios' ? 0 : Spacing.space4,
        paddingBottom: Spacing.space4,
    },
    appTitle: {
        fontSize: 22,
        fontFamily: Typography.fonts.bold,
        color: '#ffffff',
        letterSpacing: 0.5,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
    },
    qrButton: {
        padding: Spacing.space2,
    },
    profileButton: {
        padding: Spacing.space2,
    },
    header: {
        paddingHorizontal: Spacing.space4,
        paddingBottom: Spacing.space4,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.space2,
    },
    accountLabel: {
        fontSize: 14,
        fontFamily: Typography.fonts.regular,
        color: 'rgba(255, 255, 255, 0.85)',
    },
    balanceAmount: {
        fontSize: 36,
        fontFamily: Typography.fonts.bold,
        color: '#ffffff',
        marginBottom: 4,
    },
    balanceSubtext: {
        fontSize: 12,
        fontFamily: Typography.fonts.regular,
        color: 'rgba(255, 255, 255, 0.85)',
        marginBottom: Spacing.space4,
    },
    statsRow: {
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: BorderRadius.lg,
        paddingVertical: Spacing.space3,
        paddingHorizontal: Spacing.space4,
    },
    statItem: {
        flex: 1,
        alignItems: 'flex-start',
    },
    statDivider: {
        width: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        marginHorizontal: Spacing.space4,
    },
    statLabel: {
        fontSize: 11,
        fontFamily: Typography.fonts.regular,
        color: 'rgba(255, 255, 255, 0.75)',
        marginBottom: 4,
    },
    statValue: {
        fontSize: 16,
        fontFamily: Typography.fonts.bold,
        color: '#ffffff',
    },
    content: {
        flex: 1,
        borderTopLeftRadius: BorderRadius.xl,
        borderTopRightRadius: BorderRadius.xl,
        marginTop: -20,
    },
    contentContainer: {
        paddingBottom: 100,
    },
    actionCards: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: Spacing.space4,
        paddingVertical: Spacing.space6,
    },
    actionCard: {
        alignItems: 'center',
        gap: Spacing.space2,
    },
    cardIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
            android: { elevation: 3 },
        }),
    },
    cardLabel: {
        fontSize: 12,
        fontFamily: Typography.fonts.semiBold,
    },
    modernSummaryCard: {
        marginHorizontal: Spacing.space4,
        marginBottom: Spacing.space4,
        padding: Spacing.space4,
        borderRadius: BorderRadius.lg,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 8 },
            android: { elevation: 2 },
        }),
    },
    summaryTitleRow: {
        marginBottom: Spacing.space4,
    },
    modernSummaryTitle: {
        fontSize: 18,
        fontFamily: Typography.fonts.bold,
        marginBottom: 4,
    },
    modernSummarySubtitle: {
        fontSize: 12,
        fontFamily: Typography.fonts.regular,
    },
    modernStatsGrid: {
        flexDirection: 'row',
        gap: Spacing.space3,
    },
    modernStatCard: {
        flex: 1,
        padding: Spacing.space3,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
    },
    modernStatIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.space2,
    },
    modernStatValue: {
        fontSize: 18,
        fontFamily: Typography.fonts.bold,
        marginBottom: 2,
    },
    modernStatLabel: {
        fontSize: 11,
        fontFamily: Typography.fonts.regular,
    },
    errorTitle: {
        fontSize: 18,
        fontFamily: Typography.fonts.bold,
        textAlign: 'center',
    },
    errorText: {
        fontSize: 14,
        fontFamily: Typography.fonts.regular,
        textAlign: 'center',
    },
    retryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    section: {
        paddingHorizontal: Spacing.space4,
        paddingTop: Spacing.space4,
    },
    sectionHead: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.space3,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: Typography.fonts.bold,
    },
    viewAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    viewAllText: {
        fontSize: 14,
        fontFamily: Typography.fonts.semiBold,
    },
    activityList: {
        gap: Spacing.space2,
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: Spacing.space3,
        borderRadius: BorderRadius.md,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 8 },
            android: { elevation: 1 },
        }),
    },
    activityLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: Spacing.space3,
    },
    activityIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    activityTitle: {
        fontSize: 14,
        fontFamily: Typography.fonts.semiBold,
    },
    activityDate: {
        fontSize: 12,
        fontFamily: Typography.fonts.regular,
        marginTop: 2,
    },
    activityAmount: {
        fontSize: 14,
        fontFamily: Typography.fonts.bold,
    },
});
