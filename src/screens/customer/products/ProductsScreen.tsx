/**
 * Products Screen - Customer Browse Products
 * Beautiful product catalog - Browse only (no editing)
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    Platform,
    RefreshControl,
    ScrollView,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import ApiService from '../../../services/api';
import { Spacing, Typography, BorderRadius } from '../../../constants/theme';
import { getThemedColors } from '../../../constants/theme';
import { useTheme } from '../../../context/ThemeContext';
import { SkeletonCard } from '../../../components/Skeletons';

export default function ProductsScreen({ navigation }: any) {
    const { isDark } = useTheme();
    const Colors = getThemedColors(isDark);
    const [products, setProducts] = useState<any[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [categories, setCategories] = useState<string[]>(['All']);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState({ totalProducts: 0, availableShops: 0 });

    useFocusEffect(
        useCallback(() => {
            loadProducts();
        }, [])
    );

    useEffect(() => {
        filterProducts();
    }, [searchQuery, selectedCategory, products]);

    const loadProducts = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await ApiService.getPublicProducts(searchQuery);
            console.log('📋 Products loaded:', data.products?.length || 0);
            setProducts(data.products || []);

            // Extract unique categories
            const uniqueCategories = ['All', ...new Set(data.products?.map((p: any) => p.category) || [])];
            setCategories(uniqueCategories as string[]);

            // Calculate stats
            const totalProducts = data.products?.length || 0;
            const availableShops = new Set(data.products?.map((p: any) => p.business_id)).size || 0;
            setStats({ totalProducts, availableShops });
        } catch (error: any) {
            console.error('❌ Load products error:', error);
            setError(error.message || 'Failed to load products');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const filterProducts = () => {
        let filtered = products;

        if (selectedCategory !== 'All') {
            filtered = filtered.filter(p => p.category === selectedCategory);
        }

        if (searchQuery.trim()) {
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredProducts(filtered);
    };

    const formatCurrency = (amount: number) => {
        return `₹${amount?.toLocaleString('en-IN') || 0}`;
    };

    const renderProduct = ({ item }: any) => {
        const hasStock = item.stock_quantity > 0;

        return (
            <TouchableOpacity
                style={[styles.productCard, { backgroundColor: Colors.card, borderColor: Colors.borderLight }]}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('ProductDetail', { product: item })}
            >
                <View style={styles.cardMain}>
                    <View style={styles.productContent}>
                        <View style={styles.contentHeader}>
                            <View style={[styles.productIconSmall, { backgroundColor: getCategoryColor(item.category) + '15' }]}>
                                <Ionicons name={getCategoryIcon(item.category)} size={18} color={getCategoryColor(item.category)} />
                            </View>
                            <View style={styles.headerTexts}>
                                <Text style={[styles.productName, { color: Colors.textPrimary }]} numberOfLines={1}>{item.name}</Text>
                                <Text style={[styles.categoryText, { color: Colors.textSecondary }]} numberOfLines={1}>{item.category}</Text>
                            </View>
                        </View>

                        <View style={styles.priceRow}>
                            <Text style={[styles.productPrice, { color: Colors.primary }]}>{formatCurrency(item.price)}</Text>
                            <Text style={[styles.unitText, { color: Colors.textTertiary }]}>/{item.unit || 'unit'}</Text>
                        </View>

                        <View style={styles.stockRow}>
                            <Ionicons name="business-outline" size={14} color={Colors.textSecondary} />
                            <Text style={[styles.shopText, { color: Colors.textSecondary }]}>
                                {item.business_name || 'Available'}
                            </Text>
                            {hasStock && <Ionicons name="checkmark-circle" size={14} color={Colors.creditGreen} style={{ marginLeft: Spacing.space1 }} />}
                        </View>
                    </View>

                    {item.product_image_url && (
                        <View style={styles.productRight}>
                            <Image
                                source={{ uri: item.product_image_url }}
                                style={[styles.productImage, { borderColor: Colors.borderLight }]}
                                resizeMode="cover"
                            />
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    const getCategoryIcon = (category: string) => {
        const icons: any = {
            'Food & Groceries': 'fast-food',
            'Beverages': 'water',
            'Personal Care': 'body',
            'Electronics': 'phone-portrait',
            'Clothing & Textiles': 'shirt',
        };
        return icons[category] || 'cube';
    };

    const getCategoryColor = (category: string) => {
        const colors: any = {
            'Food & Groceries': '#10b981',
            'Beverages': '#3b82f6',
            'Personal Care': '#ec4899',
            'Electronics': '#8b5cf6',
            'Clothing & Textiles': '#f59e0b',
        };
        return colors[category] || Colors.primary;
    };

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={64} color={Colors.textTertiary} />
            <Text style={[styles.emptyTitle, { color: Colors.textPrimary }]}>No Products Found</Text>
            <Text style={[styles.emptyText, { color: Colors.textSecondary }]}>
                {searchQuery ? 'No products match your search' : 'Browse available products from shops'}
            </Text>
            {!searchQuery && (
                <TouchableOpacity
                    style={[styles.refreshButton, { backgroundColor: Colors.primary }]}
                    onPress={loadProducts}
                >
                    <Ionicons name="refresh" size={20} color="#fff" />
                    <Text style={styles.refreshButtonText}>Refresh</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    if (loading && !refreshing) {
        return (
            <View style={[styles.container, { backgroundColor: Colors.backgroundSecondary }]}>
                <View style={[styles.statsHeader, { backgroundColor: Colors.card, borderBottomColor: Colors.borderLight }]}>
                    <View style={[styles.statBox, { backgroundColor: isDark ? '#2a2a2a' : '#e5e7eb', height: 60, borderRadius: 8 }]} />
                    <View style={[styles.statBox, { backgroundColor: isDark ? '#2a2a2a' : '#e5e7eb', height: 60, borderRadius: 8 }]} />
                </View>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ color: Colors.textSecondary }}>Loading products...</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: Colors.backgroundSecondary }]}>
            {/* Stats Header */}
            <View style={[styles.statsHeader, { backgroundColor: Colors.card, borderBottomColor: Colors.borderLight }]}>
                <View style={[styles.statBox, { backgroundColor: Colors.primary + '15', borderColor: Colors.primary + '30' }]}>
                    <Text style={[styles.statLabel, { color: Colors.textSecondary }]}>Available Products</Text>
                    <Text style={[styles.statValue, { color: Colors.primary }]}>{stats.totalProducts}</Text>
                </View>
                <View style={[styles.statBox, { backgroundColor: Colors.creditGreen + '15', borderColor: Colors.creditGreen + '30' }]}>
                    <Text style={[styles.statLabel, { color: Colors.textSecondary }]}>Shops Offering</Text>
                    <Text style={[styles.statValue, { color: Colors.creditGreen }]}>{stats.availableShops}</Text>
                </View>
            </View>

            {/* Search Bar */}
            <View style={[styles.searchContainer, { backgroundColor: Colors.card, borderBottomColor: Colors.borderLight }]}>
                <View style={[styles.searchBar, { backgroundColor: isDark ? '#2a2a2a' : '#f3f4f6' }]}>
                    <Ionicons name="search" size={14} color={Colors.textTertiary} />
                    <TextInput
                        style={[styles.searchInput, { color: Colors.textPrimary }]}
                        placeholder="Search products..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor={Colors.textTertiary}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={14} color={Colors.textTertiary} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Category Filter */}
            <View style={styles.categoriesWrapper}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoriesContainer}
                >
                    {categories.map(category => (
                        <TouchableOpacity
                            key={category}
                            style={[
                                styles.categoryChip,
                                { backgroundColor: Colors.backgroundSecondary, borderColor: 'transparent' },
                                selectedCategory === category && { ...styles.categoryChipActive, backgroundColor: Colors.primary, borderColor: Colors.primary }
                            ]}
                            onPress={() => setSelectedCategory(category)}
                        >
                            <Text style={[
                                styles.categoryChipText,
                                { color: selectedCategory === category ? '#fff' : Colors.textPrimary },
                                selectedCategory === category && styles.categoryChipTextActive
                            ]}>
                                {category}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Product List */}
            <FlatList
                data={filteredProducts}
                renderItem={renderProduct}
                keyExtractor={(item) => item.id || item.$id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={renderEmpty}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => { setRefreshing(true); loadProducts(); }}
                        colors={[Colors.primary]}
                        tintColor={Colors.primary}
                    />
                }
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    statsHeader: {
        flexDirection: 'row',
        paddingVertical: Spacing.space3,
        paddingHorizontal: Spacing.space4,
        gap: Spacing.space3,
        borderBottomWidth: 1,
    },
    statBox: {
        flex: 1,
        padding: Spacing.space3,
        borderRadius: 8,
        borderWidth: 1,
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 11,
        marginBottom: 4,
    },
    statValue: {
        fontSize: 24,
        fontWeight: '700' as const,
    },
    searchContainer: {
        paddingHorizontal: Spacing.space4,
        paddingVertical: Spacing.space3,
        borderBottomWidth: 1,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        padding: 0,
    },
    categoriesWrapper: {
        backgroundColor: 'transparent',
    },
    categoriesContainer: {
        paddingHorizontal: Spacing.space4,
        paddingVertical: Spacing.space3,
        gap: Spacing.space2,
    },
    categoryChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
    },
    categoryChipActive: {
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 4,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    categoryChipText: {
        fontSize: 13,
        fontWeight: '500' as const,
    },
    categoryChipTextActive: {
        fontWeight: '600' as const,
    },
    listContent: {
        padding: Spacing.space4,
        gap: Spacing.space3,
    },
    productCard: {
        borderRadius: 12,
        borderWidth: 1,
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    cardMain: {
        flexDirection: 'row',
        padding: 12,
    },
    productContent: {
        flex: 1,
        gap: 8,
    },
    contentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    productIconSmall: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTexts: {
        flex: 1,
    },
    productName: {
        fontSize: 15,
        fontWeight: '600' as const,
        marginBottom: 2,
    },
    categoryText: {
        fontSize: 12,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 4,
    },
    productPrice: {
        fontSize: 18,
        fontWeight: '700' as const,
    },
    unitText: {
        fontSize: 12,
    },
    stockRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    shopText: {
        fontSize: 12,
        flex: 1,
    },
    productRight: {
        marginLeft: 12,
    },
    productImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        borderWidth: 1,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
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
        paddingHorizontal: 40,
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
