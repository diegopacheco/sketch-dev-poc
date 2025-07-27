package testutils

import (
	"bytes"
	"coaching-backend/database"
	"coaching-backend/models"
	"encoding/json"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"net/http"
	"net/http/httptest"
	"testing"
)

func SetupTestDB(t *testing.T) *gorm.DB {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatalf("Failed to connect to test database: %v", err)
	}

	err = db.AutoMigrate(&models.TeamMember{}, &models.Team{}, &models.Feedback{})
	if err != nil {
		t.Fatalf("Failed to migrate test database: %v", err)
	}

	database.DB = db
	return db
}

func CreateTestTeamMember(db *gorm.DB) *models.TeamMember {
	member := &models.TeamMember{
		Name:    "John Doe",
		Email:   "john@example.com",
		Picture: "https://example.com/john.jpg",
	}
	db.Create(member)
	return member
}

func CreateTestTeam(db *gorm.DB) *models.Team {
	team := &models.Team{
		Name: "Development Team",
		Logo: "https://example.com/logo.png",
	}
	db.Create(team)
	return team
}

func CreateTestFeedback(db *gorm.DB, targetType string, targetID uint) *models.Feedback {
	feedback := &models.Feedback{
		Content:    "Great work!",
		TargetType: targetType,
		TargetID:   targetID,
		TargetName: "Test Target",
	}
	db.Create(feedback)
	return feedback
}

func MakeJSONRequest(method, url string, body interface{}) (*httptest.ResponseRecorder, error) {
	var reqBody *bytes.Buffer
	if body != nil {
		jsonBody, err := json.Marshal(body)
		if err != nil {
			return nil, err
		}
		reqBody = bytes.NewBuffer(jsonBody)
	} else {
		reqBody = bytes.NewBuffer([]byte{})
	}

	req, err := http.NewRequest(method, url, reqBody)
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")
	rr := httptest.NewRecorder()
	return rr, nil
}

type TestTeamMemberRequest struct {
	Name    string `json:"name"`
	Email   string `json:"email"`
	Picture string `json:"picture"`
}

type TestTeamRequest struct {
	Name string `json:"name"`
	Logo string `json:"logo"`
}

type TestAssignRequest struct {
	MemberID uint `json:"member_id"`
	TeamID   uint `json:"team_id"`
}

type TestFeedbackRequest struct {
	Content    string `json:"content"`
	TargetType string `json:"target_type"`
	TargetID   uint   `json:"target_id"`
}
