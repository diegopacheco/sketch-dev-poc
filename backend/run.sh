#!/bin/bash

echo "Starting coaching backend..."

if [ ! -f "coaching-backend" ]; then
    echo "Binary not found. Building first..."
    ./build.sh
fi

echo "Starting MySQL database..."
docker run --name coaching-mysql -e MYSQL_ROOT_PASSWORD=password -e MYSQL_DATABASE=coaching_db -p 3306:3306 -d mysql:8.0 || echo "MySQL container may already be running"

echo "Waiting for MySQL to be ready..."
sleep 10

echo "Starting coaching backend server..."
export DATABASE_URL="root:password@tcp(localhost:3306)/coaching_db?charset=utf8mb4&parseTime=True&loc=Local"
export PORT=8080

./coaching-backend
