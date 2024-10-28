package routes

import (
	"main/controllers"
	"main/middlewares"

	"github.com/gin-gonic/gin"
)

func InitializeRoutes(r *gin.Engine) {
	authRoutes := r.Group("/auth")
	{
		authRoutes.POST("/register", controllers.Register)
		authRoutes.POST("/login", controllers.Login)
	}

	userRoutes := r.Group("/user")
	userRoutes.Use(middlewares.AuthMiddleware())
	{
		userRoutes.GET("/", controllers.GetUser)
	}
}
