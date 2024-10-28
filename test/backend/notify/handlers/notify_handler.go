// notificationpilot/handlers/notify_handler.go
package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"notify/models"
)

type NotificationResponse struct {
	DBPilotStatus string `json:"db_pilot_status"`
	TeamsStatus   string `json:"teams_status"`
	Message       string `json:"message"`
}

func NotifyHandler(c *gin.Context) {
	var req models.NotificationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	// クッキーからsession_idを取得
	sessionID, err := c.Cookie("session_id")
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Session ID not found"})
		return
	}

	// 1. DB Pilotに対応履歴を保存するリクエストを送信
	dbPilotURL := os.Getenv("DB_PILOT_URL") + "/responses"
	dbReq, _ := json.Marshal(req)
	dbReqBody := bytes.NewBuffer(dbReq)

	// DB Pilotへのリクエストにsession_idをヘッダーとして追加
	dbClient := &http.Client{}
	dbRequest, _ := http.NewRequest("POST", dbPilotURL, dbReqBody)
	dbRequest.Header.Set("Content-Type", "application/json")
	dbRequest.Header.Set("Cookie", "session_id="+sessionID)

	dbResp, err := dbClient.Do(dbRequest)
	dbPilotStatus := "Success"
	if err != nil || dbResp.StatusCode != http.StatusOK {
		dbPilotStatus = "Failed"
	}

	// 2. Teams Webhookに通知を送信
	teamsWebhookURL := os.Getenv("TEAMS_WEBHOOK_URL")
	teamsReq := map[string]interface{}{
		"title":       "新しい対応履歴が追加されました",
		"text":        req.Content,
		"incident_id": req.IncidentID,
		"responder":   req.Responder,
		"datetime":    req.Datetime.Format(time.RFC3339),
	}
	teamsReqJSON, _ := json.Marshal(teamsReq)
	teamsResp, err := http.Post(teamsWebhookURL, "application/json", bytes.NewBuffer(teamsReqJSON))
	teamsStatus := "Success"
	if err != nil || teamsResp.StatusCode != http.StatusOK {
		teamsStatus = "Failed"
	}

	// レスポンス作成
	response := NotificationResponse{
		DBPilotStatus: dbPilotStatus,
		TeamsStatus:   teamsStatus,
	}

	// 両方成功した場合
	if dbPilotStatus == "Success" && teamsStatus == "Success" {
		response.Message = "Notification sent successfully to both DB Pilot and Teams."
		c.JSON(http.StatusOK, response)
		return
	}

	// 片方または両方が失敗した場合
	if dbPilotStatus == "Failed" && teamsStatus == "Failed" {
		response.Message = "Notification failed for both DB Pilot and Teams."
		c.JSON(http.StatusInternalServerError, response)
	} else if dbPilotStatus == "Failed" {
		response.Message = "Notification to DB Pilot failed."
		c.JSON(http.StatusInternalServerError, response)
	} else if teamsStatus == "Failed" {
		response.Message = "Notification to Teams failed."
		c.JSON(http.StatusInternalServerError, response)
	}
}
