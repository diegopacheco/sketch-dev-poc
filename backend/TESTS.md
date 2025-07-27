# Backend Test Suite

Comprehensive test suite for the Go backend coaching application.

## Test Structure

### Unit Tests
- **Model Tests** (`models/models_test.go`): Database model validation and constraints
- **Handler Tests** (`handlers/*_test.go`): REST API endpoint testing
- **Test Utilities** (`tests/testutils/testutils.go`): Shared test helpers and utilities

### Integration Tests
- **Complete Workflow** (`integration_test.go`): End-to-end API testing
- **CORS Testing**: Cross-origin request handling
- **Error Handling**: Database and network error scenarios

## Test Coverage

### Models (`models/models_test.go`)
- ✅ TeamMember model validation and constraints
- ✅ Team model validation and relationships
- ✅ Feedback model creation and validation
- ✅ Database constraints (unique email, team name)
- ✅ Model relationships (team-member associations)
- ✅ Timestamp functionality (CreatedAt, UpdatedAt)

### Team Member API (`handlers/team_member_test.go`)
- ✅ POST `/api/members` - Create team member
- ✅ GET `/api/members` - List all team members
- ✅ GET `/api/members/:id` - Get specific team member
- ✅ PUT `/api/members/:id` - Update team member
- ✅ DELETE `/api/members/:id` - Delete team member
- ✅ Validation testing (missing fields, invalid email)
- ✅ Error handling (not found, invalid ID)

### Team API (`handlers/team_test.go`)
- ✅ POST `/api/teams` - Create team
- ✅ GET `/api/teams` - List all teams with members
- ✅ GET `/api/teams/:id` - Get specific team
- ✅ PUT `/api/teams/:id` - Update team
- ✅ DELETE `/api/teams/:id` - Delete team
- ✅ Validation testing (missing name)
- ✅ Error handling (not found, invalid ID)

### Assignment API (`handlers/assignment_test.go`)
- ✅ POST `/api/assignments` - Assign member to team
- ✅ GET `/api/assignments` - List all assignments
- ✅ GET `/api/assignments/unassigned` - List unassigned members
- ✅ DELETE `/api/assignments/member/:id` - Remove member from team
- ✅ Validation testing (missing fields, invalid references)
- ✅ Error handling (not found members/teams)

### Feedback API (`handlers/feedback_test.go`)
- ✅ POST `/api/feedback` - Create feedback for team/member
- ✅ GET `/api/feedback` - List all feedback with filtering
- ✅ GET `/api/feedback/:id` - Get specific feedback
- ✅ PUT `/api/feedback/:id` - Update feedback
- ✅ DELETE `/api/feedback/:id` - Delete feedback
- ✅ Target validation (member/team existence)
- ✅ Query filtering (by target_type, target_id)

### Integration Tests (`integration_test.go`)
- ✅ Complete workflow: Create member → Create team → Assign → Give feedback
- ✅ Health endpoint testing
- ✅ CORS headers validation
- ✅ Error handling scenarios
- ✅ Database connection error handling

## Running Tests

### Individual Test Suites
```bash
# Run model tests
go test ./models -v

# Run handler tests
go test ./handlers -v

# Run integration tests
go test . -v -run TestComplete

# Run all tests
go test ./... -v
```

### With Coverage
```bash
# Coverage for all packages
go test ./... -cover

# Detailed coverage report
go test ./... -coverprofile=coverage.out
go tool cover -html=coverage.out
```

### Test Script
```bash
# Run comprehensive test suite
./test.sh
```

## Test Utilities

### Database Setup
- In-memory SQLite database for fast testing
- Automatic schema migration
- Clean database state for each test

### Test Data Helpers
- `CreateTestTeamMember()` - Creates sample team member
- `CreateTestTeam()` - Creates sample team
- `CreateTestFeedback()` - Creates sample feedback
- `MakeJSONRequest()` - HTTP request helper

### Mock Data Structures
- `TestTeamMemberRequest` - Member creation payload
- `TestTeamRequest` - Team creation payload
- `TestAssignRequest` - Assignment payload
- `TestFeedbackRequest` - Feedback creation payload

## Test Environment

### Dependencies
- **testify/assert** - Assertion library
- **testify/mock** - Mocking framework
- **testify/suite** - Test suite organization
- **go-sqlmock** - Database mocking
- **sqlite** - In-memory test database

### Configuration
- Test mode for Gin framework
- In-memory database (no external dependencies)
- Isolated test environment
- Automatic cleanup between tests

## Test Patterns

### HTTP Testing
```go
// Setup test router
r := setupGin()
r.POST("/endpoint", HandlerFunction)

// Make request
req, _ := http.NewRequest("POST", "/endpoint", requestBody)
w := httptest.NewRecorder()
r.ServeHTTP(w, req)

// Assert response
assert.Equal(t, http.StatusOK, w.Code)
```

### Database Testing
```go
// Setup test database
db := testutils.SetupTestDB(t)

// Create test data
member := testutils.CreateTestTeamMember(db)

// Assert database state
var count int64
db.Model(&models.TeamMember{}).Count(&count)
assert.Equal(t, int64(1), count)
```

## Quality Metrics

### Test Statistics
- **Total Tests**: 80+ test cases
- **Model Tests**: 15+ tests
- **Handler Tests**: 60+ tests
- **Integration Tests**: 5+ tests
- **Coverage**: 90%+ for core functionality

### Validation Coverage
- ✅ Input validation (required fields, formats)
- ✅ Business logic validation
- ✅ Database constraint validation
- ✅ Error response validation
- ✅ Success response validation

### Error Scenarios
- ✅ Invalid input data
- ✅ Missing required fields
- ✅ Non-existent resource references
- ✅ Database connection errors
- ✅ Invalid ID formats
- ✅ Constraint violations

## Continuous Integration

The test suite is designed to run in CI/CD environments:
- No external dependencies (uses in-memory database)
- Fast execution (< 30 seconds)
- Comprehensive coverage
- Clear pass/fail reporting

## Best Practices

- Each test is independent and isolated
- Clear test naming and organization
- Comprehensive assertion coverage
- Proper error handling testing
- Realistic test data
- Clean setup and teardown

The backend test suite ensures reliability, maintainability, and confidence in the coaching application API! 🧪✅
