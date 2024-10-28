package middlewares

import (
	"main/logger"
	"main/utils"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			logger.Log.Warn("Missing Authorization header")
			c.JSON(http.StatusUnauthorized, gin.H{"error": "トークンがありません"})
			c.Abort()
			return
		}

		// ヘッダーが "Bearer " で始まるか確認
		if !strings.HasPrefix(authHeader, "Bearer ") {
			logger.Log.Warn("Invalid token format")
			c.JSON(http.StatusUnauthorized, gin.H{"error": "トークンの形式が正しくありません"})
			c.Abort()
			return
		}

		// トークン部分を抽出
		tokenStr := strings.TrimPrefix(authHeader, "Bearer ")

		if tokenStr == "" {
			logger.Log.Warn("Empty token")
			c.JSON(http.StatusUnauthorized, gin.H{"error": "トークンがありません"})
			c.Abort()
			return
		}

		userID, err := utils.ParseToken(tokenStr)
		if err != nil {
			logger.Log.Warn("Invalid token", zap.Error(err))
			c.JSON(http.StatusUnauthorized, gin.H{"error": "無効なトークンです"})
			c.Abort()
			return
		}

		logger.Log.Debug("User authenticated", zap.Uint("userID", userID))
		c.Set("userID", userID)
		c.Next()
	}
}
