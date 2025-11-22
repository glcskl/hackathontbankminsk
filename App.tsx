import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  TextInput,
  Alert 
} from 'react-native';

export default function App() {
  const [count, setCount] = useState(0);
  const [inputText, setInputText] = useState('');
  const [items, setItems] = useState<string[]>([]);

  const handleIncrement = () => {
    setCount(count + 1);
  };

  const handleDecrement = () => {
    setCount(count - 1);
  };

  const handleReset = () => {
    setCount(0);
  };

  const handleAddItem = () => {
    if (inputText.trim()) {
      setItems([...items, inputText.trim()]);
      setInputText('');
    }
  };

  const handleClearItems = () => {
    setItems([]);
  };

  const handleShowAlert = () => {
    Alert.alert('Тестовое уведомление', 'Это тестовое сообщение!');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <StatusBar style="auto" />
      
      {/* Заголовок */}
      <View style={styles.header}>
        <Text style={styles.title}>Тестовая страница</Text>
        <Text style={styles.subtitle}>React Native + Expo SDK 54</Text>
      </View>

      {/* Счетчик */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Счетчик</Text>
        <Text style={styles.counter}>{count}</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.button, styles.buttonPrimary]} onPress={handleIncrement}>
            <Text style={styles.buttonText}>+1</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={handleDecrement}>
            <Text style={styles.buttonText}>-1</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.buttonDanger]} onPress={handleReset}>
            <Text style={styles.buttonText}>Сброс</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Ввод текста */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Добавить элемент</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Введите текст..."
            value={inputText}
            onChangeText={setInputText}
          />
          <TouchableOpacity style={[styles.button, styles.buttonPrimary]} onPress={handleAddItem}>
            <Text style={styles.buttonText}>Добавить</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Список элементов */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Список элементов ({items.length})</Text>
          {items.length > 0 && (
            <TouchableOpacity onPress={handleClearItems}>
              <Text style={styles.clearText}>Очистить</Text>
            </TouchableOpacity>
          )}
        </View>
        {items.length === 0 ? (
          <Text style={styles.emptyText}>Список пуст</Text>
        ) : (
          items.map((item, index) => (
            <View key={index} style={styles.listItem}>
              <Text style={styles.listItemText}>{index + 1}. {item}</Text>
            </View>
          ))
        )}
      </View>

      {/* Кнопка Alert */}
      <View style={styles.section}>
        <TouchableOpacity style={[styles.button, styles.buttonAlert]} onPress={handleShowAlert}>
          <Text style={styles.buttonText}>Показать Alert</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  counter: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#007AFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 10,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#007AFF',
  },
  buttonSecondary: {
    backgroundColor: '#34C759',
  },
  buttonDanger: {
    backgroundColor: '#FF3B30',
  },
  buttonAlert: {
    backgroundColor: '#FF9500',
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  inputContainer: {
    gap: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  listItem: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  listItemText: {
    fontSize: 16,
    color: '#333',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },
  clearText: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: '600',
  },
});

