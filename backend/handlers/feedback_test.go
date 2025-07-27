package handlers

import (
	"bytes"
	"coaching-backend/tests/testutils"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strconv"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func TestCreateFeedback(t *testing.T) {
	db := testutils.SetupTestDB(t)
	r := setupGin()
	r.POST("/feedback", CreateFeedback)

	t.Run("Create Feedback for Team Member", func(t *testing.T) {
		member := testutils.CreateTestTeamMember(db)

		reqBody := testutils.TestFeedbackRequest{
			Content:    "Great work on the project!",
			TargetType: "member",
			TargetID:   member.ID,
		}

		jsonBody, _ := json.Marshal(reqBody)
		req, _ := http.NewRequest("POST", "/feedback", bytes.NewBuffer(jsonBody))
		req.Header.Set("Content-Type", "application/json")

		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusCreated, w.Code)

		var response map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Equal(t, "Great work on the project!", response["content"])
		assert.Equal(t, "member", response["target_type"])
		assert.Equal(t, "John Doe", response["target_name"])
	})

	t.Run("Create Feedback for Team", func(t *testing.T) {
		team := testutils.CreateTestTeam(db)

		reqBody := testutils.TestFeedbackRequest{
			Content:    "Excellent teamwork!",
			TargetType: "team",
			TargetID:   team.ID,
		}

		jsonBody, _ := json.Marshal(reqBody)
		req, _ := http.NewRequest("POST", "/feedback", bytes.NewBuffer(jsonBody))
		req.Header.Set("Content-Type", "application/json")

		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusCreated, w.Code)

		var response map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Equal(t, "Excellent teamwork!", response["content"])
		assert.Equal(t, "team", response["target_type"])
		assert.Equal(t, "Development Team", response["target_name"])
	})

	t.Run("Create Feedback for Non-existent Member", func(t *testing.T) {
		reqBody := testutils.TestFeedbackRequest{
			Content:    "Feedback for non-existent member",
			TargetType: "member",
			TargetID:   999,
		}

		jsonBody, _ := json.Marshal(reqBody)
		req, _ := http.NewRequest("POST", "/feedback", bytes.NewBuffer(jsonBody))
		req.Header.Set("Content-Type", "application/json")

		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusNotFound, w.Code)
	})

	t.Run("Create Feedback for Non-existent Team", func(t *testing.T) {
		reqBody := testutils.TestFeedbackRequest{
			Content:    "Feedback for non-existent team",
			TargetType: "team",
			TargetID:   999,
		}

		jsonBody, _ := json.Marshal(reqBody)
		req, _ := http.NewRequest("POST", "/feedback", bytes.NewBuffer(jsonBody))
		req.Header.Set("Content-Type", "application/json")

		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusNotFound, w.Code)
	})

	t.Run("Create Feedback with Invalid Target Type", func(t *testing.T) {
		reqBody := map[string]interface{}{
			"content":     "Invalid feedback",
			"target_type": "invalid",
			"target_id":   1,
		}

		jsonBody, _ := json.Marshal(reqBody)
		req, _ := http.NewRequest("POST", "/feedback", bytes.NewBuffer(jsonBody))
		req.Header.Set("Content-Type", "application/json")

		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusBadRequest, w.Code)
	})

	t.Run("Create Feedback with Missing Content", func(t *testing.T) {
		reqBody := map[string]interface{}{
			"target_type": "member",
			"target_id":   1,
		}

		jsonBody, _ := json.Marshal(reqBody)
		req, _ := http.NewRequest("POST", "/feedback", bytes.NewBuffer(jsonBody))
		req.Header.Set("Content-Type", "application/json")

		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusBadRequest, w.Code)
	})
}

func TestGetFeedback(t *testing.T) {
	db := testutils.SetupTestDB(t)
	r := setupGin()
	r.GET("/feedback", GetFeedback)

	t.Run("Get Empty Feedback List", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/feedback", nil)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		var response []map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Len(t, response, 0)
	})

	t.Run("Get Feedback with Data", func(t *testing.T) {
		testutils.CreateTestFeedback(db, "member", 1)
		testutils.CreateTestFeedback(db, "team", 2)

		req, _ := http.NewRequest("GET", "/feedback", nil)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		var response []map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Len(t, response, 2)
	})

	t.Run("Get Feedback Filtered by Target Type", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/feedback?target_type=member", nil)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		var response []map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Greater(t, len(response), 0)
		for _, feedback := range response {
			assert.Equal(t, "member", feedback["target_type"])
		}
	})

	t.Run("Get Feedback Filtered by Target ID", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/feedback?target_id=1", nil)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		var response []map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Greater(t, len(response), 0)
		for _, feedback := range response {
			assert.Equal(t, float64(1), feedback["target_id"])
		}
	})
}

func TestGetFeedbackByID(t *testing.T) {
	db := testutils.SetupTestDB(t)
	r := setupGin()
	r.GET("/feedback/:id", GetFeedbackByID)

	t.Run("Get Existing Feedback", func(t *testing.T) {
		feedback := testutils.CreateTestFeedback(db, "member", 1)

		req, _ := http.NewRequest("GET", "/feedback/"+strconv.Itoa(int(feedback.ID)), nil)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		var response map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Equal(t, "Great work!", response["content"])
	})

	t.Run("Get Non-existent Feedback", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/feedback/999", nil)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusNotFound, w.Code)
	})

	t.Run("Get Feedback with Invalid ID", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/feedback/invalid", nil)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusBadRequest, w.Code)
	})
}

func TestUpdateFeedback(t *testing.T) {
	db := testutils.SetupTestDB(t)
	r := setupGin()
	r.PUT("/feedback/:id", UpdateFeedback)

	t.Run("Update Existing Feedback", func(t *testing.T) {
		feedback := testutils.CreateTestFeedback(db, "member", 1)

		updateBody := map[string]interface{}{
			"content":     "Updated feedback content",
			"target_type": "member",
			"target_id":   1,
		}

		jsonBody, _ := json.Marshal(updateBody)
		req, _ := http.NewRequest("PUT", "/feedback/"+strconv.Itoa(int(feedback.ID)), bytes.NewBuffer(jsonBody))
		req.Header.Set("Content-Type", "application/json")

		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		var response map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Equal(t, "Updated feedback content", response["content"])
	})

	t.Run("Update Non-existent Feedback", func(t *testing.T) {
		updateBody := map[string]string{
			"content": "Updated content",
		}

		jsonBody, _ := json.Marshal(updateBody)
		req, _ := http.NewRequest("PUT", "/feedback/999", bytes.NewBuffer(jsonBody))
		req.Header.Set("Content-Type", "application/json")

		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusNotFound, w.Code)
	})
}

func TestDeleteFeedback(t *testing.T) {
	db := testutils.SetupTestDB(t)
	r := setupGin()
	r.DELETE("/feedback/:id", DeleteFeedback)

	t.Run("Delete Existing Feedback", func(t *testing.T) {
		feedback := testutils.CreateTestFeedback(db, "member", 1)

		req, _ := http.NewRequest("DELETE", "/feedback/"+strconv.Itoa(int(feedback.ID)), nil)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		var response map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Equal(t, "Feedback deleted successfully", response["message"])
	})

	t.Run("Delete Non-existent Feedback", func(t *testing.T) {
		req, _ := http.NewRequest("DELETE", "/feedback/999", nil)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
	})

	t.Run("Delete Feedback with Invalid ID", func(t *testing.T) {
		req, _ := http.NewRequest("DELETE", "/feedback/invalid", nil)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusBadRequest, w.Code)
	})
}
