package main

import (
	"coaching-backend/database"
	"coaching-backend/handlers"
	"log"
	"os"

	"github.com/gin-gonic/gin"
)

func main() {
	database.Connect()

	r := gin.Default()

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

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Starting server on port %s", port)
	log.Fatal(r.Run(":" + port))
}
