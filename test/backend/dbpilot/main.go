package main

import (
	"fmt"
	"log"
	"os"

	"dbpilot/config"
	"dbpilot/handlers"
	"dbpilot/middleware"
	"dbpilot/models"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Fatal("Error loading .env file")
	}

	// データベース接続
	config.ConnectDatabase()
	db := config.DB

	// マイグレーション
	db.AutoMigrate(&models.User{}, &models.Profile{}, &models.Session{}, &models.Incident{}, &models.Response{}, &models.IncidentRelation{})

	r := gin.Default()
	protected := r.Group("/")
	protected.Use(middleware.VerifySession(db)) // ミドルウェア適用
	{
		protected.POST("/profile", handlers.RegisterProfile(db))
		protected.GET("/get-profile", handlers.GetProfile(db))
		// incidents
		protected.GET("/incidents/:id", handlers.GetIncident(db))

		// incident_relations
		protected.POST("/incident-relations", handlers.CreateIncidentRelation(db))

		// responses
		protected.POST("/responses", handlers.CreateResponse(db))
	}
	// エンドポイント設定
	r.POST("/create-user", handlers.SaveUser(db))
	r.POST("/create-session", handlers.CreateSession(db))
	r.POST("/queryUser", handlers.QueryUser(db))
	r.POST("/incidents", handlers.CreateIncident(db))

	// サーバー起動
	serverPort := os.Getenv("SERVER_PORT")
	if serverPort == "" {
		serverPort = "3002" // デフォルトポート
	}

	r.Run(fmt.Sprintf(":%s", serverPort))
}
