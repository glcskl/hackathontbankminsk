FROM node:20-alpine

# Установка необходимых инструментов
RUN apk add --no-cache git curl

# Установка Expo CLI глобально (опционально, можно использовать npx)
# RUN npm install -g expo-cli@latest

# Создание рабочей директории
WORKDIR /app

# Копирование файлов зависимостей
COPY frontend/package*.json ./

# Установка зависимостей
RUN npm install --legacy-peer-deps

# Установка @expo/ngrok для туннельного режима
RUN npm install -g '@expo/ngrok@^4.1.0' --legacy-peer-deps || true

# Копирование остальных файлов проекта
COPY frontend/ .

# Открытие портов для Expo
EXPOSE 8081 19000 19001 19002

# Запуск Expo в LAN режиме
# --host tunnel позволяет использовать туннель если LAN не работает
# Но сначала пробуем LAN режим
CMD ["npx", "expo", "start", "--lan"]
