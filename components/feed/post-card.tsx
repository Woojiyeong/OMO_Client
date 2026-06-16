import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import BookmarkG from '@/assets/icons/bookmark_g.svg';
import BookmarkP from '@/assets/icons/bookmark_p.svg';
import HeartG from '@/assets/icons/heart_g.svg';
import HeartP from '@/assets/icons/heart_p.svg';
import More from '@/assets/icons/more.svg';
import { KeywordAvatar } from '@/components/profile/keyword-avatar';
import { FollowButton } from '@/components/social/follow-button';
import { ReportSheet, type ReportReason } from '@/components/social/report-sheet';
import { Palette } from '@/constants/colors';
import { Radius, Spacing } from '@/constants/spacing';
import { FontFamily } from '@/constants/typography';
import { reportPost, togglePostBookmark, togglePostLike } from '@/features/feed/api';
import { STYLE_OPTIONS } from '@/features/onboarding/styles';
import { useSocialStore } from '@/features/social/store';
import type { FeedPost } from '@/features/feed/types';

import { PostMoreSheet, type PostMoreVariant } from './post-more-sheet';
import { ProductCard } from './product-card';
import { ProductsSheet } from './products-sheet';

const PRODUCT_GAP = 12;
const TOGGLE_SIZE = 36;
const TOGGLE_GUTTER = 16;

const STYLE_LABEL = Object.fromEntries(STYLE_OPTIONS.map((opt) => [opt.value, opt.label])) as Record<
  (typeof STYLE_OPTIONS)[number]['value'],
  string
>;

type Props = {
  post: FeedPost;
  moreVariant?: PostMoreVariant;
  onMoreAction?: (post: FeedPost) => void;
};

export function PostCard({ post, moreVariant = 'report', onMoreAction }: Props) {
  const { width } = useWindowDimensions();
  const [liked, setLiked] = useState(post.liked ?? false);
  const [bookmarked, setBookmarked] = useState(post.bookmarked ?? false);
  const [moreSheetVisible, setMoreSheetVisible] = useState(false);
  const [productsSheetVisible, setProductsSheetVisible] = useState(false);
  const [reportSheetVisible, setReportSheetVisible] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);

  const authorId = post.author.id;
  const following = useSocialStore((s) => s.following.some((u) => u.id === authorId));
  const followPending = useSocialStore((s) => !!s.pendingFollowOps[authorId]);
  const followAction = useSocialStore((s) => s.follow);
  const unfollowAction = useSocialStore((s) => s.unfollow);

  const imageWidth = width - Spacing.base * 2;
  const imageHeight = imageWidth * (5 / 4);
  const likeCount = liked ? post.likes + 1 : post.likes;
  const handle = useMemo(
    () => `${STYLE_LABEL[post.author.keyword]}_${post.author.name}`,
    [post.author.keyword, post.author.name],
  );

  const isSelf = authorId === 'me';

  useEffect(() => {
    setAvatarFailed(false);
  }, [post.author.avatarUri]);

  const handleToggleFollow = () => {
    if (following) {
      unfollowAction(post.author.id).catch(() => {});
    } else {
      followAction({
        id: post.author.id,
        name: post.author.name,
        keyword: post.author.keyword,
        avatarUri: post.author.avatarUri,
        bio: '',
      }).catch(() => {});
    }
  };

  const handleToggleLike = () => {
    setLiked((v) => !v);
    togglePostLike(post.id)
      .then(({ liked: nextLiked }) => setLiked(nextLiked))
      .catch(() => setLiked((v) => !v));
  };

  const handleToggleBookmark = () => {
    setBookmarked((v) => !v);
    togglePostBookmark(post.id)
      .then(({ bookmarked: nextBookmarked }) => setBookmarked(nextBookmarked))
      .catch(() => setBookmarked((v) => !v));
  };

  const handleMoreConfirm = () => {
    setMoreSheetVisible(false);
    if (moreVariant === 'report') {
      setReportSheetVisible(true);
      return;
    }
    onMoreAction?.(post);
  };

  const handleReport = (payload: {
    reason: ReportReason;
    description?: string;
  }) => {
    setReporting(true);
    reportPost(post.id, payload)
      .then(() => {
        setReportSheetVisible(false);
        Alert.alert('신고 완료', '게시글 신고가 접수되었어요.');
      })
      .catch((error) => {
        Alert.alert(
          '신고 실패',
          error instanceof Error ? error.message : '게시글을 신고하지 못했어요.',
        );
      })
      .finally(() => setReporting(false));
  };

  return (
    <View style={styles.card}>
      <View style={styles.profileRow}>
        <Pressable
          style={styles.profileTrigger}
          onPress={() =>
            isSelf
              ? router.push('/(tabs)/my')
              : router.push({
                  pathname: '/user-profile',
                  params: {
                    userId: post.author.id,
                    name: post.author.name,
                    keyword: post.author.keyword,
                    avatarUri: post.author.avatarUri ?? '',
                  },
                })
          }
          accessibilityRole="button"
          accessibilityLabel={`${handle} 프로필 보기`}
          hitSlop={4}
        >
          <View style={styles.avatar}>
            {post.author.avatarUri && !avatarFailed ? (
              <Image
                source={{ uri: post.author.avatarUri }}
                style={styles.avatarImage}
                resizeMode="cover"
                onError={() => setAvatarFailed(true)}
              />
            ) : (
              <KeywordAvatar keyword={post.author.keyword} seed={post.author.id} size={36} />
            )}
          </View>
          <Text style={styles.handle} numberOfLines={1}>
            {handle}
          </Text>
        </Pressable>
        {!isSelf ? (
          <View style={styles.followWrap}>
            <FollowButton
              following={following}
              pending={followPending}
              onPress={handleToggleFollow}
              variant="compact"
            />
          </View>
        ) : null}
        <Pressable
          style={styles.moreButton}
          onPress={() => setMoreSheetVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="더보기"
          hitSlop={8}
        >
          <More width={20} height={20} />
        </Pressable>
      </View>

      <Image
        source={post.image}
        style={[styles.postImage, { width: imageWidth, height: imageHeight }]}
        resizeMode="cover"
      />

      <View style={styles.actionRow}>
        <Pressable
          style={styles.likeWrap}
          onPress={handleToggleLike}
          accessibilityRole="button"
          accessibilityLabel={liked ? '좋아요 취소' : '좋아요'}
          hitSlop={8}
        >
          {liked ? <HeartP width={24} height={24} /> : <HeartG width={24} height={24} />}
          <Text style={styles.likeCount}>{likeCount.toLocaleString('ko-KR')}</Text>
        </Pressable>
        <Pressable
          onPress={handleToggleBookmark}
          accessibilityRole="button"
          accessibilityLabel={bookmarked ? '북마크 취소' : '북마크'}
          hitSlop={8}
        >
          {bookmarked ? <BookmarkP width={24} height={24} /> : <BookmarkG width={24} height={24} />}
        </Pressable>
      </View>

      <View style={styles.body}>
        <Text style={styles.title}>{post.title}</Text>
        <Text style={styles.description}>{post.description}</Text>
        <Text style={styles.hashtags}>
          {post.hashtags.map((tag) => `#${tag}`).join(' ')}
        </Text>
      </View>

      {post.products.length === 1 ? (
        <View style={styles.singleProductWrap}>
          <ProductCard product={post.products[0]} width="100%" />
        </View>
      ) : post.products.length >= 2 ? (
        <View style={styles.productsRow}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productsScrollContent}
          >
            {post.products.map((product, index, arr) => (
              <View
                key={product.id}
                style={index < arr.length - 1 ? styles.cardSpacing : undefined}
              >
                <ProductCard product={product} />
              </View>
            ))}
          </ScrollView>
          <Pressable
            style={[styles.toggleBtn, productsSheetVisible && styles.toggleBtnExpanded]}
            onPress={() => setProductsSheetVisible((v) => !v)}
            accessibilityRole="button"
            accessibilityLabel={productsSheetVisible ? '상품 목록 접기' : '상품 목록 펼치기'}
            accessibilityState={{ expanded: productsSheetVisible }}
            hitSlop={8}
          >
            <Svg width={16} height={16} viewBox="0 0 16 16">
              <Path
                d="M4 6L8 10L12 6"
                stroke={Palette.gray500}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </Svg>
          </Pressable>
        </View>
      ) : null}

      <PostMoreSheet
        visible={moreSheetVisible}
        variant={moreVariant}
        onClose={() => setMoreSheetVisible(false)}
        onConfirm={handleMoreConfirm}
      />

      <ProductsSheet
        visible={productsSheetVisible}
        products={post.products}
        onClose={() => setProductsSheetVisible(false)}
      />

      <ReportSheet
        visible={reportSheetVisible}
        title="게시글 신고"
        submitting={reporting}
        onClose={() => setReportSheetVisible(false)}
        onSubmit={handleReport}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingBottom: Spacing.xl,
    backgroundColor: Palette.white,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: Spacing.base,
  },
  profileTrigger: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    marginRight: Spacing.md,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    backgroundColor: Palette.gray150,
  },
  handle: {
    flex: 1,
    fontFamily: FontFamily.semibold,
    fontSize: 14,
    color: Palette.textPrimary,
  },
  followWrap: {
    marginRight: Spacing.sm,
  },
  moreButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postImage: {
    marginHorizontal: Spacing.base,
    borderRadius: Radius.md,
    backgroundColor: Palette.white,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 44,
    paddingHorizontal: Spacing.base,
  },
  likeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  likeCount: {
    fontFamily: FontFamily.regular,
    fontSize: 13,
    color: Palette.textPrimary,
  },
  body: {
    paddingHorizontal: Spacing.base,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: 15,
    color: Palette.textPrimary,
    marginBottom: 4,
  },
  description: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
    color: Palette.gray500,
    marginBottom: 8,
  },
  hashtags: {
    fontFamily: FontFamily.regular,
    fontSize: 13,
    color: Palette.pink500,
  },
  singleProductWrap: {
    marginTop: Spacing.md,
    marginHorizontal: Spacing.base,
  },
  productsRow: {
    marginTop: Spacing.md,
    marginHorizontal: Spacing.base,
    position: 'relative',
  },
  productsScrollContent: {
    paddingRight: TOGGLE_SIZE + TOGGLE_GUTTER,
  },
  cardSpacing: {
    marginRight: PRODUCT_GAP,
  },
  toggleBtn: {
    position: 'absolute',
    right: 0,
    top: '50%',
    marginTop: -TOGGLE_SIZE / 2,
    width: TOGGLE_SIZE,
    height: TOGGLE_SIZE,
    borderRadius: TOGGLE_SIZE / 2,
    backgroundColor: Palette.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleBtnExpanded: {
    transform: [{ rotate: '180deg' }],
  },
});
