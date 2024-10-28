package main

import (
	"log"
	"main/config"
	"main/logger"
	"main/routes"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"go.uber.org/zap"
)

func main() {
	// .envファイルの読み込み
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	// ロガーの初期化
	logger.Init()
	defer logger.Log.Sync()

	// データベース接続
	config.ConnectDatabase()

	// Ginのインスタンス作成
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// ルートの初期化
	routes.InitializeRoutes(r)

	// サーバー起動
	logger.Log.Info("Starting server on :8080")
	if err := r.Run(":8080"); err != nil {
		logger.Log.Fatal("Failed to start server", zap.Error(err))
	}
}
