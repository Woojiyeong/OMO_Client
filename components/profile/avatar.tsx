import { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { Palette } from '@/constants/colors';

type Props = {
  uri?: string;
  size?: number;
};

export function Avatar({ uri, size = 80 }: Props) {
  const [failed, setFailed] = useState(false);
  const dim = { width: size, height: size, borderRadius: size / 2 };

  useEffect(() => {
    setFailed(false);
  }, [uri]);

  if (!uri || failed) {
    return <View style={[styles.placeholder, dim]} />;
  }

  return (
    <Image
      source={{ uri }}
      style={[styles.image, dim]}
      onError={() => setFailed(true)}
    />
  );
}

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: Palette.grayBorder,
  },
  image: {
    backgroundColor: Palette.grayBorder,
  },
});
