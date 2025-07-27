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

func TestCreateTeam(t *testing.T) {
	db := testutils.SetupTestDB(t)
	r := setupGin()
	r.POST("/teams", CreateTeam)

	t.Run("Valid Team Creation", func(t *testing.T) {
		reqBody := testutils.TestTeamRequest{
			Name: "Development Team",
			Logo: "https://example.com/logo.png",
		}

		jsonBody, _ := json.Marshal(reqBody)
		req, _ := http.NewRequest("POST", "/teams", bytes.NewBuffer(jsonBody))
		req.Header.Set("Content-Type", "application/json")

		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusCreated, w.Code)

		var response map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Equal(t, "Development Team", response["name"])
		assert.Equal(t, "https://example.com/logo.png", response["logo"])
	})

	t.Run("Invalid Team - Missing Name", func(t *testing.T) {
		reqBody := map[string]string{
			"logo": "https://example.com/logo.png",
		}

		jsonBody, _ := json.Marshal(reqBody)
		req, _ := http.NewRequest("POST", "/teams", bytes.NewBuffer(jsonBody))
		req.Header.Set("Content-Type", "application/json")

		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusBadRequest, w.Code)
	})

	t.Run("Team Creation with Empty Logo", func(t *testing.T) {
		reqBody := testutils.TestTeamRequest{
			Name: "Team Without Logo",
			Logo: "",
		}

		jsonBody, _ := json.Marshal(reqBody)
		req, _ := http.NewRequest("POST", "/teams", bytes.NewBuffer(jsonBody))
		req.Header.Set("Content-Type", "application/json")

		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusCreated, w.Code)

		var response map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Equal(t, "Team Without Logo", response["name"])
	})
}

func TestGetTeams(t *testing.T) {
	db := testutils.SetupTestDB(t)
	r := setupGin()
	r.GET("/teams", GetTeams)

	t.Run("Get Empty Teams List", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/teams", nil)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		var response []map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Len(t, response, 0)
	})

	t.Run("Get Teams with Data", func(t *testing.T) {
		testutils.CreateTestTeam(db)
		testutils.CreateTestTeam(db)

		req, _ := http.NewRequest("GET", "/teams", nil)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		var response []map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Len(t, response, 2)
	})

	t.Run("Get Teams with Members", func(t *testing.T) {
		team := testutils.CreateTestTeam(db)
		member := testutils.CreateTestTeamMember(db)
		member.TeamID = &team.ID
		db.Save(member)

		req, _ := http.NewRequest("GET", "/teams", nil)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		var response []map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Greater(t, len(response), 0)
	})
}

func TestGetTeam(t *testing.T) {
	db := testutils.SetupTestDB(t)
	r := setupGin()
	r.GET("/teams/:id", GetTeam)

	t.Run("Get Existing Team", func(t *testing.T) {
		team := testutils.CreateTestTeam(db)

		req, _ := http.NewRequest("GET", "/teams/"+strconv.Itoa(int(team.ID)), nil)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		var response map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Equal(t, "Development Team", response["name"])
	})

	t.Run("Get Non-existent Team", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/teams/999", nil)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusNotFound, w.Code)
	})

	t.Run("Get Team with Invalid ID", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/teams/invalid", nil)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusBadRequest, w.Code)
	})
}

func TestUpdateTeam(t *testing.T) {
	db := testutils.SetupTestDB(t)
	r := setupGin()
	r.PUT("/teams/:id", UpdateTeam)

	t.Run("Update Existing Team", func(t *testing.T) {
		team := testutils.CreateTestTeam(db)

		updateBody := map[string]string{
			"name": "Updated Team Name",
			"logo": "https://example.com/updated-logo.png",
		}

		jsonBody, _ := json.Marshal(updateBody)
		req, _ := http.NewRequest("PUT", "/teams/"+strconv.Itoa(int(team.ID)), bytes.NewBuffer(jsonBody))
		req.Header.Set("Content-Type", "application/json")

		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		var response map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Equal(t, "Updated Team Name", response["name"])
		assert.Equal(t, "https://example.com/updated-logo.png", response["logo"])
	})

	t.Run("Update Non-existent Team", func(t *testing.T) {
		updateBody := map[string]string{
			"name": "Updated Team Name",
		}

		jsonBody, _ := json.Marshal(updateBody)
		req, _ := http.NewRequest("PUT", "/teams/999", bytes.NewBuffer(jsonBody))
		req.Header.Set("Content-Type", "application/json")

		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusNotFound, w.Code)
	})
}

func TestDeleteTeam(t *testing.T) {
	db := testutils.SetupTestDB(t)
	r := setupGin()
	r.DELETE("/teams/:id", DeleteTeam)

	t.Run("Delete Existing Team", func(t *testing.T) {
		team := testutils.CreateTestTeam(db)

		req, _ := http.NewRequest("DELETE", "/teams/"+strconv.Itoa(int(team.ID)), nil)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		var response map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Equal(t, "Team deleted successfully", response["message"])
	})

	t.Run("Delete Non-existent Team", func(t *testing.T) {
		req, _ := http.NewRequest("DELETE", "/teams/999", nil)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
	})

	t.Run("Delete Team with Invalid ID", func(t *testing.T) {
		req, _ := http.NewRequest("DELETE", "/teams/invalid", nil)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusBadRequest, w.Code)
	})
}
