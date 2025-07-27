#!/bin/bash

echo "Running Frontend Tests..."
echo "========================"

echo "1. Running unit tests..."
npm test -- --watchAll=false --coverage --testPathIgnorePatterns=integration.test.tsx

echo "\n2. Running integration tests..."
npm test -- --watchAll=false --testNamePattern="Integration Tests"

echo "\n3. Running all tests together..."
npm test -- --watchAll=false

echo "\n✅ All frontend tests completed!"
