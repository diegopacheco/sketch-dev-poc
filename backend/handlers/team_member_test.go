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

func setupGin() *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.New()
	return r
}

func TestCreateTeamMember(t *testing.T) {
	db := testutils.SetupTestDB(t)
	r := setupGin()
	r.POST("/members", CreateTeamMember)

	t.Run("Valid Team Member Creation", func(t *testing.T) {
		reqBody := testutils.TestTeamMemberRequest{
			Name:    "John Doe",
			Email:   "john@example.com",
			Picture: "https://example.com/john.jpg",
		}

		jsonBody, _ := json.Marshal(reqBody)
		req, _ := http.NewRequest("POST", "/members", bytes.NewBuffer(jsonBody))
		req.Header.Set("Content-Type", "application/json")

		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusCreated, w.Code)

		var response map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Equal(t, "John Doe", response["name"])
		assert.Equal(t, "john@example.com", response["email"])
	})

	t.Run("Invalid Team Member - Missing Name", func(t *testing.T) {
		reqBody := map[string]string{
			"email":   "invalid@example.com",
			"picture": "https://example.com/pic.jpg",
		}

		jsonBody, _ := json.Marshal(reqBody)
		req, _ := http.NewRequest("POST", "/members", bytes.NewBuffer(jsonBody))
		req.Header.Set("Content-Type", "application/json")

		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusBadRequest, w.Code)
	})

	t.Run("Invalid Team Member - Missing Email", func(t *testing.T) {
		reqBody := map[string]string{
			"name":    "John Doe",
			"picture": "https://example.com/pic.jpg",
		}

		jsonBody, _ := json.Marshal(reqBody)
		req, _ := http.NewRequest("POST", "/members", bytes.NewBuffer(jsonBody))
		req.Header.Set("Content-Type", "application/json")

		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusBadRequest, w.Code)
	})

	t.Run("Invalid Team Member - Invalid Email", func(t *testing.T) {
		reqBody := map[string]string{
			"name":    "John Doe",
			"email":   "invalid-email",
			"picture": "https://example.com/pic.jpg",
		}

		jsonBody, _ := json.Marshal(reqBody)
		req, _ := http.NewRequest("POST", "/members", bytes.NewBuffer(jsonBody))
		req.Header.Set("Content-Type", "application/json")

		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusBadRequest, w.Code)
	})
}

func TestGetTeamMembers(t *testing.T) {
	db := testutils.SetupTestDB(t)
	r := setupGin()
	r.GET("/members", GetTeamMembers)

	t.Run("Get Empty Team Members List", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/members", nil)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		var response []map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Len(t, response, 0)
	})

	t.Run("Get Team Members with Data", func(t *testing.T) {
		testutils.CreateTestTeamMember(db)
		testutils.CreateTestTeamMember(db)

		req, _ := http.NewRequest("GET", "/members", nil)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		var response []map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Len(t, response, 2)
	})
}

func TestGetTeamMember(t *testing.T) {
	db := testutils.SetupTestDB(t)
	r := setupGin()
	r.GET("/members/:id", GetTeamMember)

	t.Run("Get Existing Team Member", func(t *testing.T) {
		member := testutils.CreateTestTeamMember(db)

		req, _ := http.NewRequest("GET", "/members/"+strconv.Itoa(int(member.ID)), nil)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		var response map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Equal(t, "John Doe", response["name"])
	})

	t.Run("Get Non-existent Team Member", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/members/999", nil)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusNotFound, w.Code)
	})

	t.Run("Get Team Member with Invalid ID", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/members/invalid", nil)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusBadRequest, w.Code)
	})
}

func TestUpdateTeamMember(t *testing.T) {
	db := testutils.SetupTestDB(t)
	r := setupGin()
	r.PUT("/members/:id", UpdateTeamMember)

	t.Run("Update Existing Team Member", func(t *testing.T) {
		member := testutils.CreateTestTeamMember(db)

		updateBody := map[string]string{
			"name":    "Updated Name",
			"email":   "updated@example.com",
			"picture": "https://example.com/updated.jpg",
		}

		jsonBody, _ := json.Marshal(updateBody)
		req, _ := http.NewRequest("PUT", "/members/"+strconv.Itoa(int(member.ID)), bytes.NewBuffer(jsonBody))
		req.Header.Set("Content-Type", "application/json")

		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		var response map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Equal(t, "Updated Name", response["name"])
		assert.Equal(t, "updated@example.com", response["email"])
	})

	t.Run("Update Non-existent Team Member", func(t *testing.T) {
		updateBody := map[string]string{
			"name":  "Updated Name",
			"email": "updated@example.com",
		}

		jsonBody, _ := json.Marshal(updateBody)
		req, _ := http.NewRequest("PUT", "/members/999", bytes.NewBuffer(jsonBody))
		req.Header.Set("Content-Type", "application/json")

		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusNotFound, w.Code)
	})
}

func TestDeleteTeamMember(t *testing.T) {
	db := testutils.SetupTestDB(t)
	r := setupGin()
	r.DELETE("/members/:id", DeleteTeamMember)

	t.Run("Delete Existing Team Member", func(t *testing.T) {
		member := testutils.CreateTestTeamMember(db)

		req, _ := http.NewRequest("DELETE", "/members/"+strconv.Itoa(int(member.ID)), nil)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		var response map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Equal(t, "Team member deleted successfully", response["message"])
	})

	t.Run("Delete Non-existent Team Member", func(t *testing.T) {
		req, _ := http.NewRequest("DELETE", "/members/999", nil)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
	})

	t.Run("Delete Team Member with Invalid ID", func(t *testing.T) {
		req, _ := http.NewRequest("DELETE", "/members/invalid", nil)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusBadRequest, w.Code)
	})
}
