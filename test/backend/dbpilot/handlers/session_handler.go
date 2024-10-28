// db-pilot-service/handlers/session_handler.go
package handlers

import (
	"net/http"
	"time"

	"dbpilot/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type CreateSessionRequest struct {
	UserID    uint      `json:"user_id"`
	Email     string    `json:"email"`
	SessionID string    `json:"session_id"`
	ExpiresAt time.Time `json:"expires_at"`
}

// CreateSession は新しいセッションをDBに保存します
func CreateSession(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req CreateSessionRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
			return
		}

		// セッション情報を保存
		session := models.Session{
			UserID:    req.UserID,
			Email:     req.Email,
			SessionID: req.SessionID,
			ExpiresAt: req.ExpiresAt,
		}
		if err := db.Create(&session).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create session"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Session created successfully"})
	}
}
