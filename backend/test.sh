#!/bin/bash

echo "Running Backend Test Suite..."
echo "============================"

echo "1. Running unit tests..."
go test ./models -v
if [ $? -ne 0 ]; then
    echo "Model tests failed!"
    exit 1
fi

echo "\n2. Running handler tests..."
go test ./handlers -v
if [ $? -ne 0 ]; then
    echo "Handler tests failed!"
    exit 1
fi

echo "\n3. Running integration tests..."
go test . -v -run TestComplete
if [ $? -ne 0 ]; then
    echo "Integration tests failed!"
    exit 1
fi

echo "\n4. Running all tests with coverage..."
go test ./... -cover
if [ $? -ne 0 ]; then
    echo "Coverage tests failed!"
    exit 1
fi

echo "\n5. Building application..."
./build.sh
if [ $? -ne 0 ]; then
    echo "Build failed!"
    exit 1
fi

echo "\n6. Running syntax check..."
go vet ./...
if [ $? -eq 0 ]; then
    echo "✓ Code syntax is valid"
else
    echo "✗ Code syntax issues found"
    exit 1
fi

echo "\n✅ All backend tests passed!"
echo "\nTest Coverage Summary:"
go test ./... -cover | grep "coverage:"

echo "\nTo start the backend:"
echo "  ./run.sh"
echo "\nAPI will be available at: http://localhost:8080"
echo "Health check: http://localhost:8080/health"
