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

func TestAssignMemberToTeam(t *testing.T) {
	db := testutils.SetupTestDB(t)
	r := setupGin()
	r.POST("/assignments", AssignMemberToTeam)

	t.Run("Valid Member Assignment", func(t *testing.T) {
		member := testutils.CreateTestTeamMember(db)
		team := testutils.CreateTestTeam(db)

		reqBody := testutils.TestAssignRequest{
			MemberID: member.ID,
			TeamID:   team.ID,
		}

		jsonBody, _ := json.Marshal(reqBody)
		req, _ := http.NewRequest("POST", "/assignments", bytes.NewBuffer(jsonBody))
		req.Header.Set("Content-Type", "application/json")

		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		var response map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Equal(t, "Member assigned to team successfully", response["message"])
	})

	t.Run("Assign Non-existent Member", func(t *testing.T) {
		team := testutils.CreateTestTeam(db)

		reqBody := testutils.TestAssignRequest{
			MemberID: 999,
			TeamID:   team.ID,
		}

		jsonBody, _ := json.Marshal(reqBody)
		req, _ := http.NewRequest("POST", "/assignments", bytes.NewBuffer(jsonBody))
		req.Header.Set("Content-Type", "application/json")

		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusNotFound, w.Code)
	})

	t.Run("Assign Member to Non-existent Team", func(t *testing.T) {
		member := testutils.CreateTestTeamMember(db)

		reqBody := testutils.TestAssignRequest{
			MemberID: member.ID,
			TeamID:   999,
		}

		jsonBody, _ := json.Marshal(reqBody)
		req, _ := http.NewRequest("POST", "/assignments", bytes.NewBuffer(jsonBody))
		req.Header.Set("Content-Type", "application/json")

		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusNotFound, w.Code)
	})

	t.Run("Invalid Assignment Request - Missing Fields", func(t *testing.T) {
		reqBody := map[string]interface{}{
			"member_id": nil,
		}

		jsonBody, _ := json.Marshal(reqBody)
		req, _ := http.NewRequest("POST", "/assignments", bytes.NewBuffer(jsonBody))
		req.Header.Set("Content-Type", "application/json")

		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusBadRequest, w.Code)
	})
}

func TestRemoveMemberFromTeam(t *testing.T) {
	db := testutils.SetupTestDB(t)
	r := setupGin()
	r.DELETE("/assignments/member/:id", RemoveMemberFromTeam)

	t.Run("Remove Member from Team", func(t *testing.T) {
		member := testutils.CreateTestTeamMember(db)
		team := testutils.CreateTestTeam(db)
		member.TeamID = &team.ID
		db.Save(member)

		req, _ := http.NewRequest("DELETE", "/assignments/member/"+strconv.Itoa(int(member.ID)), nil)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		var response map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Equal(t, "Member removed from team successfully", response["message"])
	})

	t.Run("Remove Non-existent Member", func(t *testing.T) {
		req, _ := http.NewRequest("DELETE", "/assignments/member/999", nil)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusNotFound, w.Code)
	})

	t.Run("Remove Member with Invalid ID", func(t *testing.T) {
		req, _ := http.NewRequest("DELETE", "/assignments/member/invalid", nil)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusBadRequest, w.Code)
	})
}

func TestGetAssignments(t *testing.T) {
	db := testutils.SetupTestDB(t)
	r := setupGin()
	r.GET("/assignments", GetAssignments)

	t.Run("Get Empty Assignments", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/assignments", nil)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		var response []map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Len(t, response, 0)
	})

	t.Run("Get Assignments with Data", func(t *testing.T) {
		member := testutils.CreateTestTeamMember(db)
		team := testutils.CreateTestTeam(db)
		member.TeamID = &team.ID
		db.Save(member)

		req, _ := http.NewRequest("GET", "/assignments", nil)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		var response []map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Len(t, response, 1)
	})
}

func TestGetUnassignedMembers(t *testing.T) {
	db := testutils.SetupTestDB(t)
	r := setupGin()
	r.GET("/assignments/unassigned", GetUnassignedMembers)

	t.Run("Get Unassigned Members", func(t *testing.T) {
		unassignedMember := testutils.CreateTestTeamMember(db)
		assignedMember := testutils.CreateTestTeamMember(db)
		team := testutils.CreateTestTeam(db)
		assignedMember.TeamID = &team.ID
		db.Save(assignedMember)

		req, _ := http.NewRequest("GET", "/assignments/unassigned", nil)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		var response []map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Len(t, response, 1)
		assert.Equal(t, float64(unassignedMember.ID), response[0]["id"])
	})

	t.Run("Get Empty Unassigned Members", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/assignments/unassigned", nil)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		var response []map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Len(t, response, 0)
	})
}
