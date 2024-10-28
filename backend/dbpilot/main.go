package main

import (
	"dbpilot/internal/config"
	"dbpilot/internal/database"
	"dbpilot/internal/database/migrations"
	"dbpilot/internal/graphql/generated"
	"dbpilot/internal/graphql/resolvers"
	"fmt"
	"log"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/gin-gonic/gin"
)

func graphqlHandler(r *resolvers.Resolver) gin.HandlerFunc {
	config := generated.Config{
		Resolvers: r,
	}
	h := handler.NewDefaultServer(generated.NewExecutableSchema(config))

	return func(c *gin.Context) {
		h.ServeHTTP(c.Writer, c.Request)
	}
}

func playgroundHandler() gin.HandlerFunc {
	h := playground.Handler("GraphQL Playground", "/query")
	return func(c *gin.Context) {
		h.ServeHTTP(c.Writer, c.Request)
	}
}

func main() {
	// 設定の読み込み
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	// データベースの初期化
	err = database.InitDB(cfg)
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	// マイグレーションの実行
	if err := migrations.RunMigrations(database.DB); err != nil {
		log.Fatalf("Failed to run migrations: %v", err)
	}

	// マイグレーション履歴の表示
	history, err := migrations.GetMigrationHistory(database.DB)
	if err != nil {
		log.Printf("Warning: Failed to get migration history: %v", err)
	} else {
		log.Printf("Applied migrations:")
		for _, m := range history {
			log.Printf("- %s (applied at: %v)", m.Name, m.AppliedAt)
		}
	}

	// Initialize resolver with database connection
	resolver := &resolvers.Resolver{
		DB: database.DB,
	}

	// Initialize Gin router
	r := gin.Default()

	// GraphQL endpoints
	r.POST("/query", graphqlHandler(resolver))
	r.GET("/playground", playgroundHandler())

	// Start server
	port := cfg.ServerPort
	if port == "" {
		port = "8081"
	}

	serverAddr := fmt.Sprintf(":%s", port)
	log.Printf("Server running at http://localhost%s", serverAddr)
	log.Printf("GraphQL Playground available at http://localhost%s/playground", serverAddr)

	if err := r.Run(serverAddr); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
