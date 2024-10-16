package middlewares

import (
	"main/utils"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "トークンがありません"})
			c.Abort()
			return
		}

		// ヘッダーが "Bearer " で始まるか確認
		if !strings.HasPrefix(authHeader, "Bearer ") {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "トークンの形式が正しくありません"})
			c.Abort()
			return
		}

		// トークン部分を抽出
		tokenStr := strings.TrimPrefix(authHeader, "Bearer ")

		if tokenStr == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "トークンがありません"})
			c.Abort()
			return
		}

		userID, err := utils.ParseToken(tokenStr)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "無効なトークンです"})
			c.Abort()
			return
		}

		c.Set("userID", userID)
		c.Next()
	}
}
