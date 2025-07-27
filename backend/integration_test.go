package main

import (
	"bytes"
	"coaching-backend/database"
	"coaching-backend/handlers"
	"coaching-backend/tests/testutils"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func setupTestRouter() *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.New()

	api := r.Group("/api")
	{
		members := api.Group("/members")
		{
			members.POST("", handlers.CreateTeamMember)
			members.GET("", handlers.GetTeamMembers)
			members.GET("/:id", handlers.GetTeamMember)
			members.PUT("/:id", handlers.UpdateTeamMember)
			members.DELETE("/:id", handlers.DeleteTeamMember)
		}

		teams := api.Group("/teams")
		{
			teams.POST("", handlers.CreateTeam)
			teams.GET("", handlers.GetTeams)
			teams.GET("/:id", handlers.GetTeam)
			teams.PUT("/:id", handlers.UpdateTeam)
			teams.DELETE("/:id", handlers.DeleteTeam)
		}

		assignments := api.Group("/assignments")
		{
			assignments.POST("", handlers.AssignMemberToTeam)
			assignments.GET("", handlers.GetAssignments)
			assignments.GET("/unassigned", handlers.GetUnassignedMembers)
			assignments.DELETE("/member/:id", handlers.RemoveMemberFromTeam)
		}

		feedback := api.Group("/feedback")
		{
			feedback.POST("", handlers.CreateFeedback)
			feedback.GET("", handlers.GetFeedback)
			feedback.GET("/:id", handlers.GetFeedbackByID)
			feedback.PUT("/:id", handlers.UpdateFeedback)
			feedback.DELETE("/:id", handlers.DeleteFeedback)
		}
	}

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok", "message": "Coaching API is running"})
	})

	return r
}

func TestCompleteWorkflow(t *testing.T) {
	db := testutils.SetupTestDB(t)
	r := setupTestRouter()

	t.Run("Complete Coaching Application Workflow", func(t *testing.T) {
		// Step 1: Create a team member
		memberReq := testutils.TestTeamMemberRequest{
			Name:    "John Doe",
			Email:   "john@example.com",
			Picture: "https://example.com/john.jpg",
		}
		jsonBody, _ := json.Marshal(memberReq)
		req, _ := http.NewRequest("POST", "/api/members", bytes.NewBuffer(jsonBody))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)
		assert.Equal(t, http.StatusCreated, w.Code)

		var memberResponse map[string]interface{}
		json.Unmarshal(w.Body.Bytes(), &memberResponse)
		memberID := uint(memberResponse["id"].(float64))

		// Step 2: Create a team
		teamReq := testutils.TestTeamRequest{
			Name: "Development Team",
			Logo: "https://example.com/logo.png",
		}
		jsonBody, _ = json.Marshal(teamReq)
		req, _ = http.NewRequest("POST", "/api/teams", bytes.NewBuffer(jsonBody))
		req.Header.Set("Content-Type", "application/json")
		w = httptest.NewRecorder()
		r.ServeHTTP(w, req)
		assert.Equal(t, http.StatusCreated, w.Code)

		var teamResponse map[string]interface{}
		json.Unmarshal(w.Body.Bytes(), &teamResponse)
		teamID := uint(teamResponse["id"].(float64))

		// Step 3: Assign member to team
		assignReq := testutils.TestAssignRequest{
			MemberID: memberID,
			TeamID:   teamID,
		}
		jsonBody, _ = json.Marshal(assignReq)
		req, _ = http.NewRequest("POST", "/api/assignments", bytes.NewBuffer(jsonBody))
		req.Header.Set("Content-Type", "application/json")
		w = httptest.NewRecorder()
		r.ServeHTTP(w, req)
		assert.Equal(t, http.StatusOK, w.Code)

		// Step 4: Give feedback to the member
		feedbackReq := testutils.TestFeedbackRequest{
			Content:    "Excellent work on the project!",
			TargetType: "member",
			TargetID:   memberID,
		}
		jsonBody, _ = json.Marshal(feedbackReq)
		req, _ = http.NewRequest("POST", "/api/feedback", bytes.NewBuffer(jsonBody))
		req.Header.Set("Content-Type", "application/json")
		w = httptest.NewRecorder()
		r.ServeHTTP(w, req)
		assert.Equal(t, http.StatusCreated, w.Code)

		// Step 5: Give feedback to the team
		teamFeedbackReq := testutils.TestFeedbackRequest{
			Content:    "Great teamwork!",
			TargetType: "team",
			TargetID:   teamID,
		}
		jsonBody, _ = json.Marshal(teamFeedbackReq)
		req, _ = http.NewRequest("POST", "/api/feedback", bytes.NewBuffer(jsonBody))
		req.Header.Set("Content-Type", "application/json")
		w = httptest.NewRecorder()
		r.ServeHTTP(w, req)
		assert.Equal(t, http.StatusCreated, w.Code)

		// Step 6: Verify all data exists
		// Check members
		req, _ = http.NewRequest("GET", "/api/members", nil)
		w = httptest.NewRecorder()
		r.ServeHTTP(w, req)
		assert.Equal(t, http.StatusOK, w.Code)
		var members []map[string]interface{}
		json.Unmarshal(w.Body.Bytes(), &members)
		assert.Len(t, members, 1)

		// Check teams
		req, _ = http.NewRequest("GET", "/api/teams", nil)
		w = httptest.NewRecorder()
		r.ServeHTTP(w, req)
		assert.Equal(t, http.StatusOK, w.Code)
		var teams []map[string]interface{}
		json.Unmarshal(w.Body.Bytes(), &teams)
		assert.Len(t, teams, 1)

		// Check assignments
		req, _ = http.NewRequest("GET", "/api/assignments", nil)
		w = httptest.NewRecorder()
		r.ServeHTTP(w, req)
		assert.Equal(t, http.StatusOK, w.Code)
		var assignments []map[string]interface{}
		json.Unmarshal(w.Body.Bytes(), &assignments)
		assert.Len(t, assignments, 1)

		// Check feedback
		req, _ = http.NewRequest("GET", "/api/feedback", nil)
		w = httptest.NewRecorder()
		r.ServeHTTP(w, req)
		assert.Equal(t, http.StatusOK, w.Code)
		var feedback []map[string]interface{}
		json.Unmarshal(w.Body.Bytes(), &feedback)
		assert.Len(t, feedback, 2)
	})
}

func TestHealthEndpoint(t *testing.T) {
	r := setupTestRouter()

	t.Run("Health Check", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/health", nil)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		var response map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Equal(t, "ok", response["status"])
		assert.Equal(t, "Coaching API is running", response["message"])
	})
}

func TestCORSHeaders(t *testing.T) {
	gin.SetMode(gin.TestMode)
	r := gin.New()

	r.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	r.GET("/test", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "test"})
	})

	t.Run("CORS Headers Present", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/test", nil)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		assert.Equal(t, "*", w.Header().Get("Access-Control-Allow-Origin"))
		assert.Equal(t, "GET, POST, PUT, DELETE, OPTIONS", w.Header().Get("Access-Control-Allow-Methods"))
		assert.Equal(t, "Content-Type, Authorization", w.Header().Get("Access-Control-Allow-Headers"))
	})

	t.Run("OPTIONS Request", func(t *testing.T) {
		req, _ := http.NewRequest("OPTIONS", "/test", nil)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusNoContent, w.Code)
	})
}

func TestErrorHandling(t *testing.T) {
	db := testutils.SetupTestDB(t)
	r := setupTestRouter()

	t.Run("Database Connection Error Handling", func(t *testing.T) {
		// Close the database connection to simulate error
		sqlDB, _ := database.DB.DB()
		sqlDB.Close()

		req, _ := http.NewRequest("GET", "/api/members", nil)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		// Should handle the error gracefully
		assert.Equal(t, http.StatusInternalServerError, w.Code)

		// Restore the database connection
		testutils.SetupTestDB(t)
	})
}
