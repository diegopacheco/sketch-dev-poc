package models

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupTestDB(t *testing.T) *gorm.DB {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	assert.NoError(t, err)

	err = db.AutoMigrate(&TeamMember{}, &Team{}, &Feedback{})
	assert.NoError(t, err)

	return db
}

func TestTeamMemberModel(t *testing.T) {
	db := setupTestDB(t)

	t.Run("Create TeamMember", func(t *testing.T) {
		member := TeamMember{
			Name:    "John Doe",
			Email:   "john@example.com",
			Picture: "https://example.com/john.jpg",
		}

		err := db.Create(&member).Error
		assert.NoError(t, err)
		assert.NotZero(t, member.ID)
		assert.Equal(t, "John Doe", member.Name)
		assert.Equal(t, "john@example.com", member.Email)
		assert.False(t, member.CreatedAt.IsZero())
	})

	t.Run("TeamMember Unique Email Constraint", func(t *testing.T) {
		member1 := TeamMember{
			Name:  "John Doe",
			Email: "unique@example.com",
		}
		err := db.Create(&member1).Error
		assert.NoError(t, err)

		member2 := TeamMember{
			Name:  "Jane Doe",
			Email: "unique@example.com",
		}
		err = db.Create(&member2).Error
		assert.Error(t, err)
	})

	t.Run("TeamMember with Team Assignment", func(t *testing.T) {
		team := Team{
			Name: "Development Team",
		}
		db.Create(&team)

		member := TeamMember{
			Name:   "Assigned Member",
			Email:  "assigned@example.com",
			TeamID: &team.ID,
		}
		db.Create(&member)

		var retrievedMember TeamMember
		db.Preload("Team").First(&retrievedMember, member.ID)

		assert.Equal(t, team.ID, *retrievedMember.TeamID)
		assert.Equal(t, "Development Team", retrievedMember.Team.Name)
	})
}

func TestTeamModel(t *testing.T) {
	db := setupTestDB(t)

	t.Run("Create Team", func(t *testing.T) {
		team := Team{
			Name: "Development Team",
			Logo: "https://example.com/logo.png",
		}

		err := db.Create(&team).Error
		assert.NoError(t, err)
		assert.NotZero(t, team.ID)
		assert.Equal(t, "Development Team", team.Name)
		assert.False(t, team.CreatedAt.IsZero())
	})

	t.Run("Team Unique Name Constraint", func(t *testing.T) {
		team1 := Team{
			Name: "Unique Team",
		}
		err := db.Create(&team1).Error
		assert.NoError(t, err)

		team2 := Team{
			Name: "Unique Team",
		}
		err = db.Create(&team2).Error
		assert.Error(t, err)
	})

	t.Run("Team with Members", func(t *testing.T) {
		team := Team{
			Name: "Team with Members",
		}
		db.Create(&team)

		member1 := TeamMember{
			Name:   "Member 1",
			Email:  "member1@example.com",
			TeamID: &team.ID,
		}
		member2 := TeamMember{
			Name:   "Member 2",
			Email:  "member2@example.com",
			TeamID: &team.ID,
		}
		db.Create(&member1)
		db.Create(&member2)

		var retrievedTeam Team
		db.Preload("Members").First(&retrievedTeam, team.ID)

		assert.Len(t, retrievedTeam.Members, 2)
		assert.Equal(t, "Member 1", retrievedTeam.Members[0].Name)
		assert.Equal(t, "Member 2", retrievedTeam.Members[1].Name)
	})
}

func TestFeedbackModel(t *testing.T) {
	db := setupTestDB(t)

	t.Run("Create Feedback", func(t *testing.T) {
		feedback := Feedback{
			Content:    "Great work on the project!",
			TargetType: "member",
			TargetID:   1,
			TargetName: "John Doe",
		}

		err := db.Create(&feedback).Error
		assert.NoError(t, err)
		assert.NotZero(t, feedback.ID)
		assert.Equal(t, "Great work on the project!", feedback.Content)
		assert.Equal(t, "member", feedback.TargetType)
		assert.Equal(t, uint(1), feedback.TargetID)
		assert.False(t, feedback.CreatedAt.IsZero())
	})

	t.Run("Feedback Target Types", func(t *testing.T) {
		// Create a fresh database for this test
		testDB := setupTestDB(t)
		
		memberFeedback := Feedback{
			Content:    "Member feedback",
			TargetType: "member",
			TargetID:   1,
			TargetName: "John Doe",
		}
		err := testDB.Create(&memberFeedback).Error
		assert.NoError(t, err)

		teamFeedback := Feedback{
			Content:    "Team feedback",
			TargetType: "team",
			TargetID:   1,
			TargetName: "Dev Team",
		}
		err = testDB.Create(&teamFeedback).Error
		assert.NoError(t, err)

		var feedbacks []Feedback
		testDB.Find(&feedbacks)
		assert.Len(t, feedbacks, 2)
	})
}

func TestAssignRequest(t *testing.T) {
	t.Run("AssignRequest Structure", func(t *testing.T) {
		request := AssignRequest{
			MemberID: 1,
			TeamID:   2,
		}

		assert.Equal(t, uint(1), request.MemberID)
		assert.Equal(t, uint(2), request.TeamID)
	})
}

func TestModelTimestamps(t *testing.T) {
	db := setupTestDB(t)

	t.Run("CreatedAt and UpdatedAt Timestamps", func(t *testing.T) {
		before := time.Now()

		member := TeamMember{
			Name:  "Timestamp Test",
			Email: "timestamp@example.com",
		}
		db.Create(&member)

		after := time.Now()

		assert.True(t, member.CreatedAt.After(before) || member.CreatedAt.Equal(before))
		assert.True(t, member.CreatedAt.Before(after) || member.CreatedAt.Equal(after))
		assert.True(t, member.UpdatedAt.After(before) || member.UpdatedAt.Equal(before))
		assert.True(t, member.UpdatedAt.Before(after) || member.UpdatedAt.Equal(after))

		updateBefore := time.Now()
		member.Name = "Updated Name"
		db.Save(&member)
		updateAfter := time.Now()

		assert.True(t, member.UpdatedAt.After(updateBefore) || member.UpdatedAt.Equal(updateBefore))
		assert.True(t, member.UpdatedAt.Before(updateAfter) || member.UpdatedAt.Equal(updateAfter))
	})
}
