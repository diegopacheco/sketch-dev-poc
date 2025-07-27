package models

import (
	"time"
)

type TeamMember struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Name      string    `json:"name" binding:"required"`
	Email     string    `json:"email" binding:"required,email" gorm:"unique"`
	Picture   string    `json:"picture"`
	TeamID    *uint     `json:"team_id"`
	Team      *Team     `json:"team,omitempty" gorm:"foreignKey:TeamID"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type Team struct {
	ID        uint         `json:"id" gorm:"primaryKey"`
	Name      string       `json:"name" binding:"required" gorm:"unique"`
	Logo      string       `json:"logo"`
	Members   []TeamMember `json:"members,omitempty" gorm:"foreignKey:TeamID"`
	CreatedAt time.Time    `json:"created_at"`
	UpdatedAt time.Time    `json:"updated_at"`
}

type Feedback struct {
	ID         uint      `json:"id" gorm:"primaryKey"`
	Content    string    `json:"content" binding:"required"`
	TargetType string    `json:"target_type" binding:"required,oneof=team member"`
	TargetID   uint      `json:"target_id" binding:"required"`
	TargetName string    `json:"target_name"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

type AssignRequest struct {
	MemberID uint `json:"member_id" binding:"required"`
	TeamID   uint `json:"team_id" binding:"required"`
}
