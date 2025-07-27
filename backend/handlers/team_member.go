package handlers

import (
	"coaching-backend/database"
	"coaching-backend/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func CreateTeamMember(c *gin.Context) {
	var member models.TeamMember
	if err := c.ShouldBindJSON(&member); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := database.DB.Create(&member).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create team member"})
		return
	}

	c.JSON(http.StatusCreated, member)
}

func GetTeamMembers(c *gin.Context) {
	var members []models.TeamMember
	if err := database.DB.Preload("Team").Find(&members).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch team members"})
		return
	}

	c.JSON(http.StatusOK, members)
}

func GetTeamMember(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	var member models.TeamMember
	if err := database.DB.Preload("Team").First(&member, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Team member not found"})
		return
	}

	c.JSON(http.StatusOK, member)
}

func UpdateTeamMember(c *gin.Context) {
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

	if err := c.ShouldBindJSON(&member); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := database.DB.Save(&member).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update team member"})
		return
	}

	c.JSON(http.StatusOK, member)
}

func DeleteTeamMember(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	if err := database.DB.Delete(&models.TeamMember{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete team member"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Team member deleted successfully"})
}
