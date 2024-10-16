package utils

import (
	"os"
	"strconv"
	"time"

	"github.com/golang-jwt/jwt"
)

var jwtKey = []byte(os.Getenv("JWT_SECRET"))

func GenerateToken(userID uint) (string, error) {
	claims := jwt.MapClaims{}
	claims["authorized"] = true
	claims["user_id"] = strconv.FormatUint(uint64(userID), 10)
	claims["exp"] = time.Now().Add(time.Hour * 72).Unix()

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	return token.SignedString(jwtKey)
}

func ParseToken(tokenStr string) (uint, error) {
	token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
		return jwtKey, nil
	})

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		userIDStr := claims["user_id"].(string)
		userID, err := strconv.ParseUint(userIDStr, 10, 32)
		if err != nil {
			return 0, err
		}
		return uint(userID), nil
	} else {
		return 0, err
	}
}
