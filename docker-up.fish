# Скрипт для fish shell для автоматического определения IP адреса и запуска docker-compose

# Определяем IP адрес хоста
# Для macOS
if test (uname) = "Darwin"
    # Пробуем получить IP через en0 (Wi-Fi) или en1 (Ethernet)
    set HOST_IP (ipconfig getifaddr en0 2>/dev/null; or ipconfig getifaddr en1 2>/dev/null)
    
    # Если не получилось, пробуем через ifconfig
    if test -z "$HOST_IP"
        set HOST_IP (ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -n 1)
    end
# Для Linux
else if test (uname) = "Linux"
    # Пробуем hostname -I
    set HOST_IP (hostname -I | awk '{print $1}')
    
    # Если не получилось, пробуем через ip
    if test -z "$HOST_IP"
        set HOST_IP (ip route get 8.8.8.8 2>/dev/null | grep -oP 'src \K\S+'; or echo "")
    end
end

# Если IP не определен, используем localhost
if test -z "$HOST_IP"
    echo "⚠️  Не удалось определить IP адрес, используем localhost"
    set HOST_IP "localhost"
else
    echo "✅ Определен IP адрес: $HOST_IP"
end

# Экспортируем переменную и запускаем docker-compose
set -x HOST_IP $HOST_IP

# Передаем все аргументы в docker-compose
docker-compose $argv

