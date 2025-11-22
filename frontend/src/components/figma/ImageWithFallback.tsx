import React, { useState } from 'react';
import { Image, View, StyleSheet, ImageProps } from 'react-native';

const ERROR_IMG_SRC = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg==';

interface ImageWithFallbackProps extends ImageProps {
  src?: string;
  alt?: string;
  fallbackStyle?: ImageProps['style'];
}

export function ImageWithFallback({ src, alt, style, fallbackStyle, ...rest }: ImageWithFallbackProps) {
  const [didError, setDidError] = useState(false);

  const handleError = () => {
    setDidError(true);
  };

  if (didError || !src) {
    return (
      <View style={[styles.errorContainer, fallbackStyle || style]}>
        <Image 
          source={{ uri: ERROR_IMG_SRC }} 
          style={styles.errorImage}
          {...rest}
        />
      </View>
    );
  }

  return (
    <Image
      source={{ uri: src }}
      style={style}
      onError={handleError}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorImage: {
    width: '100%',
    height: '100%',
  },
});

