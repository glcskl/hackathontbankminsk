#!/bin/bash

# Скрипт для автоматического определения IP адреса и запуска docker-compose

# Определяем IP адрес хоста
# Для macOS
if [[ "$OSTYPE" == "darwin"* ]]; then
    # Пробуем получить IP через en0 (Wi-Fi) или en1 (Ethernet)
    HOST_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null)
    
    # Если не получилось, пробуем через ifconfig
    if [ -z "$HOST_IP" ]; then
        HOST_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -n 1)
    fi
# Для Linux
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Пробуем hostname -I
    HOST_IP=$(hostname -I | awk '{print $1}')
    
    # Если не получилось, пробуем через ip
    if [ -z "$HOST_IP" ]; then
        HOST_IP=$(ip route get 8.8.8.8 2>/dev/null | grep -oP 'src \K\S+' || echo "")
    fi
fi

# Если IP не определен, используем localhost
if [ -z "$HOST_IP" ]; then
    echo "⚠️  Не удалось определить IP адрес, используем localhost"
    HOST_IP="localhost"
else
    echo "✅ Определен IP адрес: $HOST_IP"
fi

# Экспортируем переменную и запускаем docker-compose
export HOST_IP

# Передаем все аргументы в docker-compose
docker-compose "$@"

