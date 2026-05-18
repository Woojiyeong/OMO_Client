import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import type { DimensionValue } from 'react-native';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import BookmarkG from '@/assets/icons/bookmark_g.svg';
import BookmarkP from '@/assets/icons/bookmark_p.svg';
import HeartG from '@/assets/icons/heart_g.svg';
import HeartP from '@/assets/icons/heart_p.svg';
import { AuthorProfileCard } from '@/components/ai/author-profile-card';
import { ProductCard } from '@/components/feed/product-card';
import { ScreenHeader } from '@/components/social/screen-header';
import { Palette } from '@/constants/colors';
import { Radius, Spacing } from '@/constants/spacing';
import { FontFamily } from '@/constants/typography';
import { getAiDetailById } from '@/features/ai/mock';

export default function AiDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const detail = useMemo(() => (id ? getAiDetailById(id) : undefined), [id]);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const toggleLike = useCallback(() => setLiked((p) => !p), []);
  const toggleBookmark = useCallback(() => setBookmarked((p) => !p), []);

  if (!detail) {
    return (
      <SafeAreaView edges={['top']} style={styles.safe}>
        <ScreenHeader title="상세 보기" onBack={() => router.back()} />
        <View style={styles.empty}>
          <Text style={styles.emptyText}>코디 정보를 찾을 수 없어요.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const heroImage = detail.images[0];
  const heroPins = detail.items.filter((it) => it.pin);
  const totalImages = detail.images.length;

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <ScreenHeader title="상세 보기" onBack={() => router.back()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.hero}>
          {heroImage ? (
            <Image source={heroImage} style={styles.heroImage} resizeMode="cover" />
          ) : null}
          {heroPins.map((item) => {
            const left: DimensionValue = `${item.pin!.x * 100}%`;
            const top: DimensionValue = `${item.pin!.y * 100}%`;
            return (
              <View key={item.id} style={[styles.pin, { left, top }]}>
                <View style={styles.pinDot} />
              </View>
            );
          })}
          {totalImages >= 2 ? (
            <View style={styles.indicator}>
              <Text style={styles.indicatorText}>1 / {totalImages}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.body}>
          <Text style={styles.title}>{detail.title}</Text>
          <Text style={styles.description}>{detail.description}</Text>

          <View style={styles.hashtagRow}>
            {detail.hashtags.map((tag) => (
              <Text key={tag} style={styles.hashtag}>
                #{tag}
              </Text>
            ))}
          </View>

          <View style={styles.statRow}>
            <Text style={styles.budgetLabel}>총 예산</Text>
            <Text style={styles.budgetValue}>
              {detail.totalBudgetWon.toLocaleString('ko-KR')}원
            </Text>
            <View style={styles.statRight}>
              <Pressable
                onPress={toggleLike}
                hitSlop={8}
                style={styles.statItem}
                accessibilityRole="button"
                accessibilityLabel={liked ? '좋아요 취소' : '좋아요'}
              >
                {liked ? <HeartP width={20} height={20} /> : <HeartG width={20} height={20} />}
                <Text style={styles.statCount}>
                  {(detail.likes + (liked ? 1 : 0)).toLocaleString('ko-KR')}
                </Text>
              </Pressable>
              <Pressable
                onPress={toggleBookmark}
                hitSlop={8}
                style={styles.statItem}
                accessibilityRole="button"
                accessibilityLabel={bookmarked ? '북마크 취소' : '북마크'}
              >
                {bookmarked ? (
                  <BookmarkP width={20} height={20} />
                ) : (
                  <BookmarkG width={20} height={20} />
                )}
              </Pressable>
            </View>
          </View>

          <AuthorProfileCard author={detail.author} />

          <View style={styles.itemsSection}>
            <Text style={styles.sectionTitle}>구성 아이템</Text>
            <Text style={styles.sectionCaption}>클릭하면 구매하러 갈 수 있어요.</Text>
            <View style={styles.itemsList}>
              {detail.items.map((item) => (
                <Pressable key={item.id} onPress={() => undefined}>
                  <ProductCard product={item} width="100%" />
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Palette.white,
  },
  scroll: {
    paddingBottom: Spacing.xxl,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
    color: Palette.gray500,
  },
  hero: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: Palette.gray150,
    position: 'relative',
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  pin: {
    position: 'absolute',
    width: 28,
    height: 28,
    marginLeft: -14,
    marginTop: -14,
    borderRadius: 14,
    backgroundColor: Palette.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  pinDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Palette.pink500,
  },
  indicator: {
    position: 'absolute',
    right: Spacing.base,
    bottom: Spacing.base,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  indicatorText: {
    fontFamily: FontFamily.semibold,
    fontSize: 12,
    color: Palette.white,
  },
  body: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.lg,
    gap: Spacing.base,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: 20,
    color: Palette.textPrimary,
  },
  description: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
    color: Palette.gray600,
    lineHeight: 22,
  },
  hashtagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  hashtag: {
    fontFamily: FontFamily.regular,
    fontSize: 13,
    color: Palette.pink500,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  budgetLabel: {
    fontFamily: FontFamily.regular,
    fontSize: 13,
    color: Palette.gray500,
  },
  budgetValue: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    color: Palette.textPrimary,
  },
  statRight: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.base,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statCount: {
    fontFamily: FontFamily.regular,
    fontSize: 13,
    color: Palette.gray600,
  },
  itemsSection: {
    marginTop: Spacing.md,
  },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    color: Palette.textPrimary,
  },
  sectionCaption: {
    marginTop: 4,
    fontFamily: FontFamily.regular,
    fontSize: 13,
    color: Palette.gray500,
  },
  itemsList: {
    marginTop: Spacing.md,
    gap: Spacing.md,
  },
});
