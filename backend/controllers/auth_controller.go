package controllers

import (
	"errors"
	"main/config"
	"main/logger"
	"main/models"
	"main/utils"
	"net/http"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

func Register(c *gin.Context) {
	var input struct {
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required,min=6"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		logger.Log.Warn("Invalid input for registration", zap.Error(err))
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// メールアドレスの存在確認
	var existingUser models.User
	if err := config.DB.Where("email = ?", input.Email).First(&existingUser).Error; err == nil {
		logger.Log.Info("Attempt to register with existing email", zap.String("email", input.Email))
		c.JSON(http.StatusBadRequest, gin.H{"error": "このメールアドレスは既に登録されています"})
		return
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		logger.Log.Error("Database error during registration", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "サーバーエラーが発生しました"})
		return
	}

	// パスワードのハッシュ化
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		logger.Log.Error("Failed to hash password", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "パスワードのハッシュ化に失敗しました"})
		return
	}

	user := models.User{
		Email:    input.Email,
		Password: string(hashedPassword),
	}

	// ユーザーの作成
	if err := config.DB.Create(&user).Error; err != nil {
		logger.Log.Error("Failed to create user", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ユーザーの作成に失敗しました"})
		return
	}

	logger.Log.Info("User registered successfully", zap.String("email", user.Email))
	c.JSON(http.StatusOK, gin.H{"message": "ユーザー登録が完了しました"})
}

func Login(c *gin.Context) {
	var input struct {
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		logger.Log.Warn("Invalid input for login", zap.Error(err))
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User

	// ユーザーの検索
	if err := config.DB.Where("email = ?", input.Email).First(&user).Error; err != nil {
		logger.Log.Info("Login attempt with non-existent email", zap.String("email", input.Email))
		c.JSON(http.StatusUnauthorized, gin.H{"error": "メールアドレスまたはパスワードが間違っています"})
		return
	}

	// パスワードの検証
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)); err != nil {
		logger.Log.Info("Login attempt with incorrect password", zap.String("email", input.Email))
		c.JSON(http.StatusUnauthorized, gin.H{"error": "メールアドレスまたはパスワードが間違っています"})
		return
	}

	// トークンの生成
	token, err := utils.GenerateToken(user.ID)
	if err != nil {
		logger.Log.Error("Failed to generate token", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "トークンの生成に失敗しました"})
		return
	}

	logger.Log.Info("User logged in successfully", zap.String("email", user.Email))
	c.JSON(http.StatusOK, gin.H{"token": token, "id": user.ID, "email": user.Email})
}

func GetUser(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		logger.Log.Warn("User ID not found in context")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "ユーザーIDが見つかりません"})
		return
	}

	var user models.User

	if err := config.DB.First(&user, userID).Error; err != nil {
		logger.Log.Warn("User not found", zap.Any("userID", userID))
		c.JSON(http.StatusNotFound, gin.H{"error": "ユーザーが見つかりません"})
		return
	}

	logger.Log.Debug("User retrieved", zap.Uint("userID", user.ID))
	c.JSON(http.StatusOK, gin.H{"user": gin.H{
		"id":    user.ID,
		"email": user.Email,
	}})
}
