package models

import "time"

// NotificationRequest 対応履歴の通知リクエスト構造体
type NotificationRequest struct {
	IncidentID uint      `json:"incident_id"`
	Datetime   time.Time `json:"datetime"`
	Responder  string    `json:"responder"`
	Content    string    `json:"content"`
}
