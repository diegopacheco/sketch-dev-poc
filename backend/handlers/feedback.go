package handlers

import (
	"coaching-backend/database"
	"coaching-backend/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func CreateFeedback(c *gin.Context) {
	var feedback models.Feedback
	if err := c.ShouldBindJSON(&feedback); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if feedback.TargetType == "team" {
		var team models.Team
		if err := database.DB.First(&team, feedback.TargetID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Team not found"})
			return
		}
		feedback.TargetName = team.Name
	} else if feedback.TargetType == "member" {
		var member models.TeamMember
		if err := database.DB.First(&member, feedback.TargetID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Team member not found"})
			return
		}
		feedback.TargetName = member.Name
	}

	if err := database.DB.Create(&feedback).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create feedback"})
		return
	}

	c.JSON(http.StatusCreated, feedback)
}

func GetFeedback(c *gin.Context) {
	var feedback []models.Feedback
	query := database.DB.Order("created_at DESC")

	targetType := c.Query("target_type")
	if targetType != "" {
		query = query.Where("target_type = ?", targetType)
	}

	targetID := c.Query("target_id")
	if targetID != "" {
		query = query.Where("target_id = ?", targetID)
	}

	if err := query.Find(&feedback).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch feedback"})
		return
	}

	c.JSON(http.StatusOK, feedback)
}

func GetFeedbackByID(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	var feedback models.Feedback
	if err := database.DB.First(&feedback, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Feedback not found"})
		return
	}

	c.JSON(http.StatusOK, feedback)
}

func UpdateFeedback(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	var feedback models.Feedback
	if err := database.DB.First(&feedback, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Feedback not found"})
		return
	}

	if err := c.ShouldBindJSON(&feedback); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := database.DB.Save(&feedback).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update feedback"})
		return
	}

	c.JSON(http.StatusOK, feedback)
}

func DeleteFeedback(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	if err := database.DB.Delete(&models.Feedback{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete feedback"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Feedback deleted successfully"})
}
