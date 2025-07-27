package handlers

import (
	"coaching-backend/database"
	"coaching-backend/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func AssignMemberToTeam(c *gin.Context) {
	var request models.AssignRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var member models.TeamMember
	if err := database.DB.First(&member, request.MemberID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Team member not found"})
		return
	}

	var team models.Team
	if err := database.DB.First(&team, request.TeamID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Team not found"})
		return
	}

	member.TeamID = &request.TeamID
	if err := database.DB.Save(&member).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to assign member to team"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Member assigned to team successfully", "member": member})
}

func RemoveMemberFromTeam(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	var member models.TeamMember
	if err := database.DB.First(&member, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Team member not found"})
		return
	}

	member.TeamID = nil
	if err := database.DB.Save(&member).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove member from team"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Member removed from team successfully", "member": member})
}

func GetAssignments(c *gin.Context) {
	var members []models.TeamMember
	if err := database.DB.Preload("Team").Where("team_id IS NOT NULL").Find(&members).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch assignments"})
		return
	}

	c.JSON(http.StatusOK, members)
}

func GetUnassignedMembers(c *gin.Context) {
	var members []models.TeamMember
	if err := database.DB.Where("team_id IS NULL").Find(&members).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch unassigned members"})
		return
	}

	c.JSON(http.StatusOK, members)
}
