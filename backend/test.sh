#!/bin/bash

echo "Testing coaching backend build and basic functionality..."

echo "1. Building application..."
./build.sh

if [ $? -ne 0 ]; then
    echo "Build failed!"
    exit 1
fi

echo "2. Testing binary exists..."
if [ -f "coaching-backend" ]; then
    echo "✓ Binary created successfully"
else
    echo "✗ Binary not found"
    exit 1
fi

echo "3. Testing Go modules..."
go mod verify
if [ $? -eq 0 ]; then
    echo "✓ Go modules verified"
else
    echo "✗ Go modules verification failed"
    exit 1
fi

echo "4. Running syntax check..."
go vet ./...
if [ $? -eq 0 ]; then
    echo "✓ Code syntax is valid"
else
    echo "✗ Code syntax issues found"
    exit 1
fi

echo "\n✅ All tests passed! Backend is ready to run."
echo "\nTo start the backend with MySQL:"
echo "  ./run.sh"
echo "\nAPI will be available at: http://localhost:8080"
echo "Health check: http://localhost:8080/health"
