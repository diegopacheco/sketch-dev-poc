package models

import (
	"time"
)

type TeamMember struct {
	ID        uint32    `json:"id" gorm:"primaryKey;type:int unsigned"`
	Name      string    `json:"name" binding:"required" gorm:"type:varchar(255);index"`
	Email     string    `json:"email" binding:"required,email" gorm:"type:varchar(255);unique"`
	Picture   string    `json:"picture" gorm:"type:text"`
	TeamID    *uint32   `json:"team_id" gorm:"type:int unsigned"`
	Team      *Team     `json:"team,omitempty" gorm:"foreignKey:TeamID"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type Team struct {
	ID        uint32       `json:"id" gorm:"primaryKey;type:int unsigned"`
	Name      string       `json:"name" binding:"required" gorm:"type:varchar(255);unique;index"`
	Logo      string       `json:"logo" gorm:"type:text"`
	Members   []TeamMember `json:"members,omitempty" gorm:"foreignKey:TeamID"`
	CreatedAt time.Time    `json:"created_at"`
	UpdatedAt time.Time    `json:"updated_at"`
}

type Feedback struct {
	ID         uint32    `json:"id" gorm:"primaryKey;type:int unsigned"`
	Content    string    `json:"content" binding:"required" gorm:"type:text"`
	TargetType string    `json:"target_type" binding:"required,oneof=team member" gorm:"type:varchar(50);index:idx_feedback_target"`
	TargetID   uint32    `json:"target_id" binding:"required" gorm:"type:int unsigned;index:idx_feedback_target"`
	TargetName string    `json:"target_name" gorm:"type:varchar(255)"`
	CreatedAt  time.Time `json:"created_at" gorm:"index"`
	UpdatedAt  time.Time `json:"updated_at"`
}

type AssignRequest struct {
	MemberID uint32 `json:"member_id" binding:"required"`
	TeamID   uint32 `json:"team_id" binding:"required"`
}
