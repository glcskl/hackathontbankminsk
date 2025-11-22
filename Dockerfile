FROM node:20-alpine

# Установка необходимых инструментов
RUN apk add --no-cache git curl

# Установка Expo CLI глобально (опционально, можно использовать npx)
# RUN npm install -g expo-cli@latest

# Создание рабочей директории
WORKDIR /app

# Копирование файлов зависимостей
COPY package*.json ./

# Установка зависимостей
RUN npm install --legacy-peer-deps

# Установка @expo/ngrok для туннельного режима
RUN npm install -g '@expo/ngrok@^4.1.0' --legacy-peer-deps || true

# Копирование остальных файлов проекта
COPY . .

# Открытие портов для Expo
EXPOSE 8081 19000 19001 19002

# Запуск Expo в туннельном режиме
CMD ["npx", "expo", "start", "--tunnel"]

