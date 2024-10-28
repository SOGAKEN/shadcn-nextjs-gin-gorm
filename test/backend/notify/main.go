package main

import (
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"log"
	"notify/handlers"
)

func main() {
	// 環境変数のロード
	if err := godotenv.Load(); err != nil {
		log.Fatal("Error loading .env file")
	}

	r := gin.Default()

	// Notificationエンドポイントの設定
	r.POST("/notify", handlers.NotifyHandler)

	// サーバーの起動
	r.Run(":8083") // Notification Pilot のポート番号
}
