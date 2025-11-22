import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Alert,
  Image,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../constants/colors';
import * as api from '../services/api';

interface CreateRecipeProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CATEGORIES = ['Завтрак', 'Обед', 'Ужин', 'Десерт', 'Закуски'];
const UNITS = ['г', 'кг', 'мл', 'л', 'шт', 'ст.л.', 'ч.л.', 'стакан'];

export function CreateRecipe({ visible, onClose, onSuccess }: CreateRecipeProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Завтрак');
  const [cookTime, setCookTime] = useState('');
  const [servings, setServings] = useState('');
  const [calories, setCalories] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [ingredients, setIngredients] = useState<Array<{ name: string; amount: string; unit: string }>>([]);
  const [steps, setSteps] = useState<Array<{ number: number; instruction: string; image: string | null }>>([]);
  const [loading, setLoading] = useState(false);
  const [currentIngredient, setCurrentIngredient] = useState({ name: '', amount: '', unit: 'г' });
  const [currentStep, setCurrentStep] = useState({ instruction: '', image: null as string | null });

  const pickImage = async (forStep: boolean = false) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Ошибка', 'Нужно разрешение на доступ к галерее');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      if (forStep) {
        setCurrentStep({ ...currentStep, image: result.assets[0].uri });
      } else {
        setImage(result.assets[0].uri);
      }
    }
  };

  const addIngredient = () => {
    if (!currentIngredient.name.trim()) {
      Alert.alert('Ошибка', 'Введите название ингредиента');
      return;
    }
    setIngredients([...ingredients, { ...currentIngredient }]);
    setCurrentIngredient({ name: '', amount: '', unit: 'г' });
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const addStep = () => {
    if (!currentStep.instruction.trim()) {
      Alert.alert('Ошибка', 'Введите описание шага');
      return;
    }
    setSteps([...steps, { number: steps.length + 1, ...currentStep }]);
    setCurrentStep({ instruction: '', image: null });
  };

  const removeStep = (index: number) => {
    const newSteps = steps.filter((_, i) => i !== index).map((step, i) => ({ ...step, number: i + 1 }));
    setSteps(newSteps);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Ошибка', 'Введите название рецепта');
      return;
    }
    if (!cookTime || isNaN(Number(cookTime))) {
      Alert.alert('Ошибка', 'Введите время приготовления');
      return;
    }
    if (!servings || isNaN(Number(servings))) {
      Alert.alert('Ошибка', 'Введите количество порций');
      return;
    }
    if (ingredients.length === 0) {
      Alert.alert('Ошибка', 'Добавьте хотя бы один ингредиент');
      return;
    }
    if (steps.length === 0) {
      Alert.alert('Ошибка', 'Добавьте хотя бы один шаг');
      return;
    }

    setLoading(true);
    try {
      // ВАЖНО: В текущей реализации локальные URI изображений не будут работать на сервере
      // В реальном приложении нужно:
      // 1. Конвертировать изображения в base64 и отправлять на сервер
      // 2. Или загружать изображения на сервер через отдельный endpoint и получать URL
      // Для демо-версии оставляем как есть
      const recipeData: api.RecipeCreate = {
        title: title.trim(),
        category,
        cook_time: Number(cookTime),
        servings: Number(servings),
        calories_per_serving: calories ? Number(calories) : undefined,
        image: image || undefined, // Локальный URI - в продакшене нужно загружать на сервер
        user_id: 'default', // В реальном приложении использовать реальный user_id
        ingredients: ingredients.map(ing => ({
          name: ing.name.trim(),
          amount: ing.amount.trim(),
          unit: ing.unit,
        })),
        steps: steps.map(step => ({
          number: step.number,
          instruction: step.instruction.trim(),
          image: step.image || undefined,
        })),
      };

      await api.createRecipe(recipeData);
      Alert.alert('Успех', 'Рецепт успешно создан!', [
        { text: 'OK', onPress: () => {
          handleReset();
          onSuccess();
          onClose();
        }}
      ]);
    } catch (error) {
      console.error('Error creating recipe:', error);
      Alert.alert('Ошибка', 'Не удалось создать рецепт. Попробуйте еще раз.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setTitle('');
    setCategory('Завтрак');
    setCookTime('');
    setServings('');
    setCalories('');
    setImage(null);
    setIngredients([]);
    setSteps([]);
    setCurrentIngredient({ name: '', amount: '', unit: 'г' });
    setCurrentStep({ instruction: '', image: null });
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Создать рецепт</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Основная информация */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Основная информация</Text>
            
            <Text style={styles.label}>Название рецепта *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Введите название"
            />

            <Text style={styles.label}>Категория *</Text>
            <View style={styles.categoryContainer}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryButton, category === cat && styles.categoryButtonActive]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[styles.categoryButtonText, category === cat && styles.categoryButtonTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.label} numberOfLines={1}>Время приготовления (мин) *</Text>
                <TextInput
                  style={styles.input}
                  value={cookTime}
                  onChangeText={setCookTime}
                  placeholder="30"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.label} numberOfLines={1}>Количество порций *</Text>
                <TextInput
                  style={styles.input}
                  value={servings}
                  onChangeText={setServings}
                  placeholder="4"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <Text style={styles.label}>Калорийность на порцию</Text>
            <TextInput
              style={styles.input}
              value={calories}
              onChangeText={setCalories}
              placeholder="250"
              keyboardType="numeric"
            />

            <Text style={styles.label}>Фото рецепта</Text>
            <TouchableOpacity style={styles.imagePicker} onPress={() => pickImage(false)}>
              {image ? (
                <Image source={{ uri: image }} style={styles.previewImage} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="camera-outline" size={32} color={colors.black} />
                  <Text style={styles.imagePlaceholderText}>Добавить фото</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Ингредиенты */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ингредиенты *</Text>
            
            {ingredients.length > 0 && (
              <View style={styles.ingredientsList}>
                {ingredients.map((ing, index) => (
                  <View key={index} style={styles.ingredientItem}>
                    <View style={styles.ingredientContent}>
                      <Text style={styles.ingredientName}>{ing.name}</Text>
                      <Text style={styles.ingredientAmount}>
                        {ing.amount} {ing.unit}
                      </Text>
                    </View>
                    <TouchableOpacity 
                      onPress={() => removeIngredient(index)}
                      style={styles.removeButton}
                    >
                      <Ionicons name="close-circle" size={24} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.addIngredientForm}>
              <Text style={styles.formLabel}>Добавить ингредиент</Text>
              
              <Text style={styles.fieldLabel}>Название *</Text>
              <TextInput
                style={styles.input}
                value={currentIngredient.name}
                onChangeText={(text) => setCurrentIngredient({ ...currentIngredient, name: text })}
                placeholder="Например: Мука"
                placeholderTextColor={colors.textSecondary}
              />

              <View style={styles.amountRow}>
                <View style={styles.amountColumn}>
                  <Text style={styles.fieldLabel}>Количество *</Text>
                  <TextInput
                    style={styles.input}
                    value={currentIngredient.amount}
                    onChangeText={(text) => setCurrentIngredient({ ...currentIngredient, amount: text })}
                    placeholder="200"
                    keyboardType="numeric"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
                
                <View style={styles.unitColumn}>
                  <Text style={styles.fieldLabel}>Единица измерения</Text>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    style={styles.unitScrollView}
                    contentContainerStyle={styles.unitScrollContent}
                  >
                    {UNITS.map((unit) => (
                      <TouchableOpacity
                        key={unit}
                        style={[
                          styles.unitButton,
                          currentIngredient.unit === unit && styles.unitButtonActive
                        ]}
                        onPress={() => setCurrentIngredient({ ...currentIngredient, unit })}
                      >
                        <Text style={[
                          styles.unitButtonText,
                          currentIngredient.unit === unit && styles.unitButtonTextActive
                        ]}>
                          {unit}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>

              <TouchableOpacity 
                style={[
                  styles.addIngredientButton,
                  (!currentIngredient.name.trim() || !currentIngredient.amount.trim()) && styles.addIngredientButtonDisabled
                ]} 
                onPress={addIngredient}
                disabled={!currentIngredient.name.trim() || !currentIngredient.amount.trim()}
              >
                <Ionicons name="add-circle-outline" size={20} color={colors.black} />
                <Text style={styles.addIngredientButtonText}>Добавить ингредиент</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Шаги приготовления */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Шаги приготовления *</Text>
            
            {steps.map((step, index) => (
              <View key={index} style={styles.stepItem}>
                <View style={styles.stepHeader}>
                  <Text style={styles.stepNumber}>Шаг {step.number}</Text>
                  <TouchableOpacity onPress={() => removeStep(index)}>
                    <Ionicons name="close-circle" size={24} color={colors.error} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.stepInstruction}>{step.instruction}</Text>
                {step.image && (
                  <Image source={{ uri: step.image }} style={styles.stepImage} />
                )}
              </View>
            ))}

            <View style={styles.addStepContainer}>
              <TextInput
                style={[styles.input, styles.stepInput]}
                value={currentStep.instruction}
                onChangeText={(text) => setCurrentStep({ ...currentStep, instruction: text })}
                placeholder="Описание шага"
                multiline
                numberOfLines={3}
              />
              <TouchableOpacity style={styles.imagePickerButton} onPress={() => pickImage(true)}>
                <Ionicons name="camera-outline" size={20} color={colors.black} />
                <Text style={styles.imagePickerButtonText}>Добавить фото</Text>
              </TouchableOpacity>
              {currentStep.image && (
                <Image source={{ uri: currentStep.image }} style={styles.stepPreviewImage} />
              )}
              <TouchableOpacity style={styles.addStepButton} onPress={addStep}>
                <Text style={styles.addStepButtonText}>Добавить шаг</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.submitContainer}>
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.submitButtonText}>Создать рецепт</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.grayBg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray300,
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  placeholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: colors.grayBg,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.gray300,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  halfInput: {
    flex: 1,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: colors.grayBg,
    borderWidth: 1,
    borderColor: colors.gray300,
  },
  categoryButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  categoryButtonTextActive: {
    color: colors.black,
  },
  imagePicker: {
    marginTop: 8,
  },
  imagePlaceholder: {
    height: 200,
    backgroundColor: colors.grayBg,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.gray300,
    borderStyle: 'dashed',
  },
  imagePlaceholderText: {
    marginTop: 8,
    fontSize: 14,
    color: colors.black,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  ingredientsList: {
    marginBottom: 16,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    backgroundColor: colors.grayBg,
    borderRadius: 12,
    marginBottom: 8,
  },
  ingredientContent: {
    flex: 1,
    marginRight: 12,
  },
  ingredientName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  ingredientAmount: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  removeButton: {
    padding: 4,
  },
  addIngredientForm: {
    backgroundColor: colors.grayBg,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.gray300,
    borderStyle: 'dashed',
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
    marginTop: 12,
  },
  amountRow: {
    flexDirection: 'row',
    gap: 12,
  },
  amountColumn: {
    flex: 1,
  },
  unitColumn: {
    flex: 1,
  },
  unitScrollView: {
    maxHeight: 50,
  },
  unitScrollContent: {
    gap: 8,
    paddingRight: 8,
  },
  unitButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray300,
    marginRight: 8,
  },
  unitButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  unitButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text,
  },
  unitButtonTextActive: {
    color: colors.black,
    fontWeight: '600',
  },
  addIngredientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    padding: 14,
    backgroundColor: colors.primary,
    borderRadius: 12,
  },
  addIngredientButtonDisabled: {
    opacity: 0.5,
  },
  addIngredientButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
  },
  stepItem: {
    backgroundColor: colors.grayBg,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  stepInstruction: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  stepImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginTop: 8,
  },
  addStepContainer: {
    marginTop: 8,
  },
  stepInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  imagePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    padding: 12,
    backgroundColor: colors.grayBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray300,
  },
  imagePickerButtonText: {
    fontSize: 14,
    color: colors.black,
    fontWeight: '500',
  },
  stepPreviewImage: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    marginTop: 8,
  },
  addStepButton: {
    marginTop: 12,
    padding: 12,
    backgroundColor: colors.primary,
    borderRadius: 12,
    alignItems: 'center',
  },
  addStepButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
  },
  submitContainer: {
    marginTop: 16,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
  },
  error: {
    color: colors.error || '#FF3B30',
  },
});

