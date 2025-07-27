package database

import (
	"coaching-backend/models"
	"log"
	"os"
	"time"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Connect() {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		// Default for Docker Compose environment
		dsn = "coaching_user:coaching_password@tcp(mysql:3306)/coaching_db?charset=utf8mb4&parseTime=True&loc=Local"
	}

	// Retry connection with backoff
	var err error
	maxRetries := 30
	for i := 0; i < maxRetries; i++ {
		DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})
		if err == nil {
			break
		}
		log.Printf("Failed to connect to database (attempt %d/%d): %v", i+1, maxRetries, err)
		if i < maxRetries-1 {
			time.Sleep(time.Duration(i+1) * time.Second)
		}
	}
	
	if err != nil {
		log.Fatal("Failed to connect to database after retries:", err)
	}

	err = DB.AutoMigrate(&models.TeamMember{}, &models.Team{}, &models.Feedback{})
	if err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	log.Println("Database connected and migrated successfully")
}
