package main

import (
	"log"
	"os"

	"auth/handlers"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// 環境変数のロード
	if err := godotenv.Load(); err != nil {
		log.Fatal("Error loading .env file")
	}

	r := gin.Default()

	// エンドポイント設定
	r.POST("/register", handlers.RegisterUser)
	r.POST("/login", handlers.LoginUser)
	r.GET("/verify-session", handlers.VerifySession)

	// サーバー起動
	serverPort := os.Getenv("PORT")
	if serverPort == "" {
		serverPort = "3001" // デフォルトポート
	}
	r.Run(":" + serverPort)
}
