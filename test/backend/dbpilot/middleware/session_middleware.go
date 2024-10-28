package middleware

import (
	"net/http"
	"time"

	"dbpilot/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// セッション有効性を確認するミドルウェア
func VerifySession(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// CookieからセッションIDを取得
		sessionID, err := c.Cookie("session_id")
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Session not found"})
			c.Abort() // 次の処理を中止
			return
		}

		// セッション情報をデータベースから取得
		var session models.Session
		if err := db.Where("session_id = ?", sessionID).First(&session).Error; err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid session"})
			c.Abort()
			return
		}

		// 有効期限確認
		if time.Now().After(session.ExpiresAt) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Session expired"})
			c.Abort()
			return
		}

		// セッションが有効な場合はリクエストを次に進める
		c.Next()
	}
}
