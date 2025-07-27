#!/bin/bash

echo "Building coaching backend..."

go mod tidy
go build -o coaching-backend .

if [ $? -eq 0 ]; then
    echo "Build successful! Binary created: coaching-backend"
else
    echo "Build failed!"
    exit 1
fi
