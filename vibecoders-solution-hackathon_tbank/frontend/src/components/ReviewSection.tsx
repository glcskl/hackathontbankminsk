import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { colors } from '../constants/colors';
import { Review } from '../types';
import * as ImagePicker from 'expo-image-picker';

interface ReviewSectionProps {
  reviews: Review[];
  averageRating: number;
  onAddReview: (rating: number, comment: string, image?: string) => void;
}

export function ReviewSection({ reviews, averageRating, onAddReview }: ReviewSectionProps) {
  const [isWritingReview, setIsWritingReview] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [newImage, setNewImage] = useState<string | null>(null);

  const handleSubmitReview = () => {
    if (newComment.trim()) {
      onAddReview(newRating, newComment.trim(), newImage || undefined);
      setNewComment('');
      setNewImage(null);
      setNewRating(5);
      setIsWritingReview(false);
    }
  };

  const handleImagePick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setNewImage(result.assets[0].uri);
    }
  };

  const renderStars = (rating: number, size: 'sm' | 'lg' = 'sm', interactive = false) => {
    const starSize = size === 'sm' ? 16 : 24;
    const currentRating = interactive ? newRating : rating;

    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= currentRating;
          return (
            <TouchableOpacity
              key={star}
              disabled={!interactive}
              onPress={() => interactive && setNewRating(star)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={filled ? 'star' : 'star-outline'}
                size={starSize}
                color={filled ? colors.primary : colors.textLight}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Рейтинг и отзывы</Text>
        
        <View style={styles.ratingContainer}>
          <View style={styles.ratingValue}>
            <Text style={styles.ratingNumber}>{averageRating.toFixed(1)}</Text>
            <Text style={styles.ratingMax}>/ 5</Text>
          </View>
          {renderStars(averageRating, 'lg')}
          <Text style={styles.reviewsCount}>
            ({reviews.length} {reviews.length === 1 ? 'отзыв' : reviews.length < 5 ? 'отзыва' : 'отзывов'})
          </Text>
        </View>

        {!isWritingReview && (
          <TouchableOpacity
            style={styles.writeButton}
            onPress={() => setIsWritingReview(true)}
          >
            <Text style={styles.writeButtonText}>Написать отзыв</Text>
          </TouchableOpacity>
        )}
      </View>

      {isWritingReview && (
        <View style={styles.formContainer}>
          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Ваша оценка</Text>
            {renderStars(newRating, 'lg', true)}
          </View>

          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Ваш отзыв</Text>
            <TextInput
              style={styles.textArea}
              value={newComment}
              onChangeText={setNewComment}
              placeholder="Поделитесь своим мнением о рецепте..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Фото блюда (необязательно)</Text>
            {newImage ? (
              <View style={styles.imagePreview}>
                <Image source={{ uri: newImage }} style={styles.previewImage} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => setNewImage(null)}
                >
                  <Ionicons name="close-circle" size={24} color={colors.white} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.uploadButton} onPress={handleImagePick}>
                <Ionicons name="image-outline" size={24} color={colors.textSecondary} />
                <Text style={styles.uploadText}>Загрузить</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.formActions}>
            <TouchableOpacity
              style={[styles.submitButton, !newComment.trim() && styles.submitButtonDisabled]}
              onPress={handleSubmitReview}
              disabled={!newComment.trim()}
            >
              <Text style={styles.submitButtonText}>Отправить</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setIsWritingReview(false);
                setNewComment('');
                setNewImage(null);
                setNewRating(5);
              }}
            >
              <Text style={styles.cancelButtonText}>Отмена</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <ScrollView style={styles.reviewsList}>
        {reviews.length === 0 ? (
          <Text style={styles.emptyText}>Пока нет отзывов. Будьте первым!</Text>
        ) : (
          reviews.map((review) => (
            <View key={review.id} style={styles.reviewItem}>
              <View style={styles.reviewHeader}>
                <View style={styles.avatar}>
                  <Ionicons name="person" size={20} color={colors.textSecondary} />
                </View>
                <View style={styles.reviewInfo}>
                  <Text style={styles.reviewAuthor}>{review.author}</Text>
                  <Text style={styles.reviewDate}>{review.date}</Text>
                </View>
              </View>
              {renderStars(review.rating)}
              <Text style={styles.reviewComment}>{review.comment}</Text>
              {review.image && (
                <ImageWithFallback
                  src={review.image}
                  alt="Review"
                  style={styles.reviewImage}
                />
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  ratingValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  ratingNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.black,
  },
  ratingMax: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  reviewsCount: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  writeButton: {
    backgroundColor: colors.black,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  writeButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  formContainer: {
    backgroundColor: colors.grayBg,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 16,
  },
  formSection: {
    gap: 8,
  },
  formLabel: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  textArea: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  uploadButton: {
    width: 128,
    height: 128,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.gray300,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  uploadText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  imagePreview: {
    position: 'relative',
    width: 128,
    height: 128,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.black,
    borderRadius: 12,
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
  },
  submitButton: {
    flex: 1,
    backgroundColor: colors.black,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.white,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray300,
  },
  cancelButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  reviewsList: {
    maxHeight: 400,
  },
  reviewItem: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
    gap: 8,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.grayBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewInfo: {
    flex: 1,
  },
  reviewAuthor: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  reviewDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  reviewComment: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  reviewImage: {
    width: 160,
    height: 160,
    borderRadius: 12,
    marginTop: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textSecondary,
    paddingVertical: 32,
  },
});

