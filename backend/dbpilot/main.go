package main

import (
	"dbpilot/internal/config"
	"dbpilot/internal/database"
	"dbpilot/internal/graphql/generated"
	"dbpilot/internal/graphql/resolvers"
	"dbpilot/internal/models"
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
	// Load configuration
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	// Initialize database
	err = database.InitDB(cfg)
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	// Auto migrate database models
	err = database.DB.AutoMigrate(
		&models.Incident{},
		&models.IncidentRelation{},
		&models.Response{},
	)
	if err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
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
