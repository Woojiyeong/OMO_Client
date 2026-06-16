import { zodResolver } from '@hookform/resolvers/zod';
import * as ImagePicker from 'expo-image-picker';
import { router, useNavigation } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { KeywordAvatar } from '@/components/profile/keyword-avatar';
import { Button } from '@/components/ui/button';
import { StyleDropdown } from '@/components/ui/style-dropdown';
import { TextField } from '@/components/ui/text-field';
import { Palette } from '@/constants/colors';
import { Radius, Spacing } from '@/constants/spacing';
import { FontFamily, Typography } from '@/constants/typography';
import { updateMyProfile, uploadProfileImage } from '@/features/auth/api';
import { useAuthStore } from '@/features/auth/store';
import { profileEditSchema, type ProfileEditForm } from '@/features/profile/schema';
import { useProfileStore } from '@/features/profile/store';

const BIO_MAX = 60;
const MAX_PROFILE_IMAGE_BYTES = 10 * 1024 * 1024;

type PickedProfileImage = {
  uri: string;
  name?: string;
  type?: string;
  size?: number;
};

export default function ProfileEditScreen() {
  const profile = useProfileStore();
  const currentId = useAuthStore((s) => s.currentId);
  const navigation = useNavigation();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isDirty },
  } = useForm<ProfileEditForm>({
    resolver: zodResolver(profileEditSchema),
    mode: 'onChange',
    defaultValues: {
      keyword: profile.keyword,
      name: profile.name,
      heightCm: String(profile.heightCm),
      weightKg: String(profile.weightKg),
      bio: profile.bio,
    },
  });

  const watchedKeyword = useWatch({ control, name: 'keyword' });

  const savingRef = useRef(false);
  const [selectedImage, setSelectedImage] = useState<PickedProfileImage | null>(null);
  const imageDirty = selectedImage !== null;
  const previewUri = selectedImage?.uri ?? profile.avatarUri;

  useEffect(() => {
    const unsub = navigation.addListener('beforeRemove', (e: any) => {
      if ((!isDirty && !imageDirty) || savingRef.current) return;
      e.preventDefault();
      Alert.alert(
        '변경사항을 저장하지 않고 나갈까요?',
        '입력한 내용이 사라져요.',
        [
          { text: '계속 편집', style: 'cancel' },
          {
            text: '나가기',
            style: 'destructive',
            onPress: () => navigation.dispatch(e.data.action),
          },
        ],
        { cancelable: true },
      );
    });
    return unsub;
  }, [navigation, isDirty, imageDirty]);

  const pickProfileImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('권한이 필요해요', '프로필 이미지를 선택하려면 사진 접근 권한이 필요해요.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    });
    if (result.canceled) return;

    const asset = result.assets[0];
    if (!asset) return;
    if (asset.fileSize && asset.fileSize > MAX_PROFILE_IMAGE_BYTES) {
      Alert.alert('이미지 용량 초과', '10MB 이하의 이미지를 선택해주세요.');
      return;
    }

    setSelectedImage({
      uri: asset.uri,
      name: asset.fileName ?? 'profile.jpg',
      type: asset.mimeType ?? 'image/jpeg',
      size: asset.fileSize,
    });
  };

  const onSubmit = handleSubmit(async (values) => {
    const nextProfile = {
      keyword: values.keyword,
      name: values.name.trim(),
      heightCm: Number(values.heightCm),
      weightKg: Number(values.weightKg),
      bio: values.bio,
    };

    try {
      await updateMyProfile({
        nickname: nextProfile.name,
        styleKeyword: nextProfile.keyword,
        height: nextProfile.heightCm,
        weight: nextProfile.weightKg,
        bio: nextProfile.bio,
        profileImage: profile.avatarUri,
      });
      if (selectedImage) {
        await uploadProfileImage(selectedImage);
      }
      profile.setProfile(nextProfile);
      savingRef.current = true;
      router.back();
    } catch (e) {
      Alert.alert(
        '저장 실패',
        e instanceof Error ? e.message : '프로필 저장에 실패했어요.',
      );
    }
  });

  const canSave = isValid && (isDirty || imageDirty);

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="뒤로 가기"
          style={styles.headerSide}
        >
          <ChevronLeft />
        </Pressable>
        <Text style={styles.headerTitle}>프로필 편집</Text>
        <View style={styles.headerSide} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 24 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.avatarSection}>
            <Pressable
              onPress={pickProfileImage}
              accessibilityRole="button"
              accessibilityLabel="프로필 이미지 변경"
              style={({ pressed }) => [styles.avatarButton, pressed && styles.avatarButtonPressed]}
            >
              {previewUri ? (
                <Image source={{ uri: previewUri }} style={styles.avatarImage} resizeMode="cover" />
              ) : (
                <KeywordAvatar
                  keyword={watchedKeyword ?? profile.keyword}
                  seed={profile.name}
                  size={96}
                />
              )}
            </Pressable>
            <Pressable onPress={pickProfileImage} hitSlop={10}>
              <Text style={styles.avatarActionText}>사진 변경</Text>
            </Pressable>
          </View>

          <Section title="프로필 정보">
            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.fieldLabel}>키워드</Text>
                <Controller
                  control={control}
                  name="keyword"
                  render={({ field: { onChange, value } }) => (
                    <StyleDropdown
                      value={value ?? null}
                      onChange={onChange}
                      error={errors.keyword?.message}
                    />
                  )}
                />
              </View>
              <View style={styles.col}>
                <Controller
                  control={control}
                  name="name"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextField
                      label="이름"
                      placeholder="이름"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.name?.message}
                      maxLength={16}
                      returnKeyType="done"
                    />
                  )}
                />
              </View>
            </View>
          </Section>

          <Section title="신체 정보">
            <View style={styles.row}>
              <View style={styles.col}>
                <Controller
                  control={control}
                  name="heightCm"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextField
                      label="키"
                      placeholder="0"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.heightCm?.message}
                      keyboardType="number-pad"
                      maxLength={3}
                      rightSlot={<UnitText text="cm" />}
                    />
                  )}
                />
              </View>
              <View style={styles.col}>
                <Controller
                  control={control}
                  name="weightKg"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextField
                      label="몸무게"
                      placeholder="0"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.weightKg?.message}
                      keyboardType="number-pad"
                      maxLength={3}
                      rightSlot={<UnitText text="kg" />}
                    />
                  )}
                />
              </View>
            </View>
          </Section>

          <Section title="계정 정보">
            <View style={styles.settingsCard}>
              <SettingRow
                label="아이디"
                value={currentId}
                onPress={() => router.push('/account-id-edit')}
              />
              <View style={styles.settingsDivider} />
              <SettingRow
                label="비밀번호"
                value="••••••••"
                onPress={() => router.push('/account-password-edit')}
              />
            </View>
          </Section>

          <View style={styles.bioSection}>
            <Controller
              control={control}
              name="bio"
              render={({ field: { onChange, onBlur, value } }) => (
                <View>
                  <View style={styles.bioLabelRow}>
                    <Text style={styles.bioLabel}>소개글</Text>
                    <Text style={styles.charCounter}>
                      <Text style={styles.charCounterCurrent}>{(value ?? '').length}</Text>
                      <Text> / {BIO_MAX}</Text>
                    </Text>
                  </View>
                  <View style={[styles.bioBox, errors.bio && styles.bioBoxError]}>
                    <TextInput
                      multiline
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="자신을 자유롭게 소개해주세요"
                      placeholderTextColor={Palette.gray400}
                      maxLength={BIO_MAX}
                      textAlignVertical="top"
                      style={styles.bioInput}
                    />
                  </View>
                  {errors.bio?.message ? (
                    <Text style={styles.errorText}>{errors.bio.message}</Text>
                  ) : null}
                </View>
              )}
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button onPress={onSubmit} disabled={!canSave}>
            저장
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function UnitText({ text }: { text: string }) {
  return <Text style={styles.unitText}>{text}</Text>;
}

function SettingRow({
  label,
  value,
  onPress,
}: {
  label: string;
  value: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.settingRow, pressed && styles.settingRowPressed]}
      accessibilityRole="button"
      accessibilityLabel={`${label} 변경`}
    >
      <Text style={styles.settingLabel}>{label}</Text>
      <View style={styles.settingRight}>
        <Text style={styles.settingValue} numberOfLines={1}>
          {value}
        </Text>
        <ChevronRight />
      </View>
    </Pressable>
  );
}

function ChevronLeft() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M15 18L9 12L15 6"
        stroke={Palette.textPrimary}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ChevronRight() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 6L15 12L9 18"
        stroke={Palette.gray400}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Palette.white,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Palette.borderSubtle,
  },
  headerSide: {
    minWidth: 48,
    height: 44,
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    color: Palette.textPrimary,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
  avatarSection: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  avatarButton: {
    width: 96,
    height: 96,
    borderRadius: 48,
    overflow: 'hidden',
    backgroundColor: Palette.gray50,
  },
  avatarButtonPressed: {
    opacity: 0.8,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarActionText: {
    fontFamily: FontFamily.semibold,
    fontSize: 12,
    color: Palette.pink500,
  },
  section: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.lg,
    gap: Spacing.md,
  },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 14,
    color: Palette.gray500,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  col: {
    flex: 1,
  },
  fieldLabel: {
    ...Typography.label,
    color: Palette.gray800,
    marginBottom: Spacing.sm,
  },
  unitText: {
    fontFamily: FontFamily.semibold,
    fontSize: 14,
    color: Palette.gray500,
  },
  settingsCard: {
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    borderRadius: Radius.lg,
    backgroundColor: Palette.white,
    overflow: 'hidden',
  },
  settingsDivider: {
    height: 1,
    backgroundColor: Palette.borderSubtle,
    marginHorizontal: Spacing.base,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    height: 52,
  },
  settingRowPressed: {
    backgroundColor: Palette.gray50,
  },
  settingLabel: {
    fontFamily: FontFamily.semibold,
    fontSize: 14,
    color: Palette.textPrimary,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    maxWidth: '60%',
  },
  settingValue: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
    color: Palette.gray500,
  },
  bioSection: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.lg,
  },
  bioLabelRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  bioLabel: {
    ...Typography.label,
    color: Palette.textPrimary,
  },
  charCounter: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    color: Palette.gray400,
  },
  charCounterCurrent: {
    color: Palette.textPrimary,
    fontFamily: FontFamily.semibold,
  },
  bioBox: {
    minHeight: 112,
    borderWidth: 1,
    borderColor: Palette.gray150,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    backgroundColor: Palette.white,
  },
  bioBoxError: {
    borderColor: Palette.pink500,
  },
  bioInput: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: 15,
    color: Palette.textPrimary,
    minHeight: 80,
    padding: 0,
    margin: 0,
  },
  errorText: {
    marginTop: Spacing.xs,
    fontFamily: FontFamily.regular,
    fontSize: 12,
    color: Palette.pink500,
  },
  footer: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Palette.borderSubtle,
    backgroundColor: Palette.white,
  },
});
