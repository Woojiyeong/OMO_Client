import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChipSelector } from '@/components/upload/chip-selector';
import { DescriptionInput } from '@/components/upload/description-input';
import { EditProductSheet } from '@/components/upload/edit-product-sheet';
import { FloatingTotalPill } from '@/components/upload/floating-total-pill';
import { PinProductCard } from '@/components/upload/pin-product-card';
import { UploadImageArea } from '@/components/upload/upload-image-area';
import { TabHeader } from '@/components/ui/tab-header';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';
import { useMyPostsStore } from '@/features/feed/store';
import type { FeedPost } from '@/features/feed/types';
import { useProfileStore } from '@/features/profile/store';
import { MOCK_UPLOAD_PRODUCTS } from '@/features/upload/mock';
import {
  MAX_SELECTIONS,
  SITUATION_OPTIONS,
  STYLE_OPTIONS,
  type SituationOption,
  type StyleOption,
} from '@/features/upload/options';
import type {
  CategoryOption,
  UploadProduct,
  UploadStatus,
} from '@/features/upload/types';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function UploadScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [products, setProducts] = useState<UploadProduct[]>([]);
  const [editTargetId, setEditTargetId] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [styleSel, setStyleSel] = useState<StyleOption[]>([]);
  const [situationSel, setSituationSel] = useState<SituationOption[]>([]);
  const [atBottom, setAtBottom] = useState(false);
  const addPost = useMyPostsStore((s) => s.addPost);
  const profileName = useProfileStore((s) => s.name);
  const profileKeyword = useProfileStore((s) => s.keyword);
  const analyzeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  const ctaScale = useSharedValue(1);
  const ctaStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ctaScale.value }],
  }));

  const publishScale = useSharedValue(1);
  const publishStyle = useAnimatedStyle(() => ({
    transform: [{ scale: publishScale.value }],
  }));

  const totalWon = useMemo(
    () => products.reduce((sum, p) => sum + p.priceWon, 0),
    [products],
  );

  const editTarget = useMemo(
    () => products.find((p) => p.id === editTargetId) ?? null,
    [products, editTargetId],
  );

  const handlePickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
      aspect: [3, 4],
    });
    if (result.canceled || !result.assets?.[0]) return;
    setImageUri(result.assets[0].uri);
    setStatus('picked');
    setProducts([]);
  };

  const handleAnalyze = () => {
    if (status !== 'picked') return;
    setStatus('analyzing');
    scrollRef.current?.scrollTo({ y: 0, animated: true });
    if (analyzeTimer.current) clearTimeout(analyzeTimer.current);
    analyzeTimer.current = setTimeout(() => {
      setProducts(MOCK_UPLOAD_PRODUCTS);
      setStatus('completed');
    }, 2000);
  };

  const handlePinPress = (productId: string) => {
    setEditTargetId(productId);
  };

  const handleCloseSheet = () => setEditTargetId(null);

  const handleSubmitEdit = ({
    category,
    link,
  }: {
    category: CategoryOption;
    link: string;
  }) => {
    if (!editTargetId) return;
    setProducts((prev) =>
      prev.map((p) =>
        p.id === editTargetId ? { ...p, category, link: link || undefined } : p,
      ),
    );
    setEditTargetId(null);
  };

  const resetUpload = () => {
    if (analyzeTimer.current) {
      clearTimeout(analyzeTimer.current);
      analyzeTimer.current = null;
    }
    setImageUri(null);
    setStatus('idle');
    setProducts([]);
    setEditTargetId(null);
    setDescription('');
    setStyleSel([]);
    setSituationSel([]);
    setAtBottom(false);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  };

  const handlePublish = () => {
    if (!imageUri) return;
    const trimmed = description.trim();
    const newPost: FeedPost = {
      id: `my-${Date.now()}`,
      author: {
        id: 'me',
        name: profileName,
        keyword: profileKeyword,
      },
      image: { uri: imageUri },
      likes: 0,
      title: trimmed.slice(0, 24) || '내 코디',
      description: trimmed,
      hashtags: [...styleSel, ...situationSel],
      products: products.map(({ pin: _pin, link: _link, ...rest }) => rest),
    };
    addPost(newPost);
    Alert.alert('게시 완료', '상품 핀이 포함된 코디가 게시되었어요.', [
      { text: '확인', onPress: resetUpload },
    ]);
  };

  useEffect(() => {
    return () => {
      if (analyzeTimer.current) clearTimeout(analyzeTimer.current);
    };
  }, []);

  const isFormComplete =
    imageUri !== null &&
    description.trim().length > 0 &&
    styleSel.length > 0 &&
    situationSel.length > 0;

  const ctaAnalyzing = status === 'analyzing';
  const ctaActive = status === 'picked' && isFormComplete;
  const canPublish = status === 'completed' && products.length > 0;

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <TabHeader title="업로드" />
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onScroll={(e) => {
          const { contentOffset, contentSize, layoutMeasurement } =
            e.nativeEvent;
          const next =
            contentOffset.y + layoutMeasurement.height >=
            contentSize.height - 80;
          if (next !== atBottom) setAtBottom(next);
        }}
        scrollEventThrottle={32}
      >
        <UploadImageArea
          imageUri={imageUri}
          status={status}
          pins={products}
          onPickImage={handlePickImage}
          onPinPress={handlePinPress}
        />

        {status !== 'completed' ? (
          <>
            <View style={styles.descSection}>
              <Text style={styles.descTitle}>
                코디에 대해 짧게 소개 해주세요.
                <Text style={styles.required}> *</Text>
              </Text>
              <DescriptionInput value={description} onChange={setDescription} />
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  어떤 스타일의 코디인가요?
                  <Text style={styles.required}> *</Text>
                </Text>
                <Text style={styles.sectionMax}>(최대 두개)</Text>
              </View>
              <ChipSelector
                options={STYLE_OPTIONS}
                selected={styleSel}
                onChange={setStyleSel}
                max={MAX_SELECTIONS}
              />
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  이런 상황에 어울려요
                  <Text style={styles.required}> *</Text>
                </Text>
                <Text style={styles.sectionMax}>(최대 두개)</Text>
              </View>
              <ChipSelector
                options={SITUATION_OPTIONS}
                selected={situationSel}
                onChange={setSituationSel}
                max={MAX_SELECTIONS}
              />
            </View>

            <AnimatedPressable
              onPress={ctaActive ? handleAnalyze : undefined}
              disabled={!ctaActive}
              onPressIn={() => {
                ctaScale.value = withTiming(0.97, { duration: 80 });
              }}
              onPressOut={() => {
                ctaScale.value = withTiming(1, { duration: 120 });
              }}
              accessibilityRole="button"
              accessibilityLabel={ctaAnalyzing ? '분석중' : 'AI 의상 핀 생성'}
              accessibilityState={{ disabled: !ctaActive, busy: ctaAnalyzing }}
              style={[
                styles.cta,
                ctaActive
                  ? styles.ctaActive
                  : ctaAnalyzing
                    ? styles.ctaAnalyzing
                    : styles.ctaDisabled,
                ctaStyle,
              ]}
            >
              <Text style={styles.ctaText}>
                {ctaAnalyzing ? '분석중' : 'AI 의상 핀 생성'}
              </Text>
              {!ctaAnalyzing ? (
                <MaterialIcons name="chevron-right" size={20} color="#fff" />
              ) : null}
            </AnimatedPressable>
          </>
        ) : (
          <View style={styles.itemsSection}>
            <Text style={styles.itemsTitle}>구성 아이템</Text>
            <Text style={styles.itemsDesc}>클릭하면 상품을 수정할 수 있어요</Text>

            <View style={styles.listWrap}>
              {products.map((p) => (
                <PinProductCard
                  key={p.id}
                  product={p}
                  onPress={() => handlePinPress(p.id)}
                />
              ))}
            </View>
            {atBottom ? <FloatingTotalPill totalWon={totalWon} /> : null}

            <AnimatedPressable
              onPress={canPublish ? handlePublish : undefined}
              disabled={!canPublish}
              onPressIn={() => {
                publishScale.value = withTiming(0.97, { duration: 80 });
              }}
              onPressOut={() => {
                publishScale.value = withTiming(1, { duration: 120 });
              }}
              accessibilityRole="button"
              accessibilityLabel="게시하기"
              style={[
                styles.publish,
                !canPublish && styles.publishDisabled,
                publishStyle,
              ]}
            >
              <Text style={styles.publishText}>게시하기</Text>
            </AnimatedPressable>
          </View>
        )}
      </ScrollView>

      <EditProductSheet
        visible={editTargetId !== null}
        product={editTarget}
        onClose={handleCloseSheet}
        onSubmit={handleSubmitEdit}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Palette.white,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  descSection: {
    marginTop: 24,
  },
  descTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: 16,
    color: '#111',
    marginBottom: 12,
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: 14,
    color: '#111',
  },
  sectionMax: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    color: '#b5b5b5',
  },
  required: {
    color: '#FF3B30',
  },
  cta: {
    marginTop: 28,
    width: '100%',
    height: 48,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  ctaActive: {
    backgroundColor: '#ff007f',
  },
  ctaAnalyzing: {
    backgroundColor: '#cfcfcf',
  },
  ctaDisabled: {
    backgroundColor: '#FFDDEC',
  },
  ctaText: {
    fontFamily: FontFamily.semibold,
    fontSize: 14,
    color: '#fff',
  },
  itemsSection: {
    marginTop: 28,
  },
  itemsTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 18,
    color: '#111',
  },
  itemsDesc: {
    marginTop: 4,
    fontFamily: FontFamily.regular,
    fontSize: 13,
    color: '#999',
  },
  listWrap: {
    marginTop: 4,
  },
  publish: {
    marginTop: 16,
    width: '100%',
    height: 48,
    borderRadius: 12,
    backgroundColor: '#ff007f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  publishDisabled: {
    backgroundColor: '#ffd1e6',
  },
  publishText: {
    fontFamily: FontFamily.semibold,
    fontSize: 14,
    color: '#fff',
  },
});
