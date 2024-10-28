// auth-service/handlers/register_handler.go
package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"

	"os"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

type RegisterRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func RegisterUser(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	// パスワードのハッシュ化
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Password encryption failed"})
		return
	}

	// DB Pilot Serviceにハッシュ化済みパスワードを保存リクエスト
	baseURL := os.Getenv("DB_PILOT_SERVICE_URL")
	saveUserReq := map[string]string{
		"email":    req.Email,
		"password": string(hashedPassword),
	}
	saveUserReqJSON, _ := json.Marshal(saveUserReq)
	fmt.Println(saveUserReqJSON)
	resp, err := http.Post(baseURL+"/create-user", "application/json", bytes.NewBuffer(saveUserReqJSON))
	if err != nil || resp.StatusCode != http.StatusOK {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save user to DB Pilot Service"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User registered successfully"})
}
