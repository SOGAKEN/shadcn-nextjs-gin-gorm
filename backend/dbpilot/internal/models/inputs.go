package models

// IncidentInput はインシデント作成/更新時の入力データを表す構造体
type IncidentInput struct {
	DateTime  string `json:"datetime"`
	Status    string `json:"status"`
	Judgment  string `json:"judgment"`
	Content   string `json:"content"`
	Assignee  string `json:"assignee"`
	Priority  string `json:"priority"`
	FromEmail string `json:"from_email"`
	ToEmail   string `json:"to_email"`
	Subject   string `json:"subject"`
}

// ResponseInput は対応履歴作成時の入力データを表す構造体
type ResponseInput struct {
	IncidentID uint   `json:"incident_id"`
	DateTime   string `json:"datetime"`
	Responder  string `json:"responder"`
	Content    string `json:"content"`
}

// IncidentRelationInput はインシデント関連作成時の入力データを表す構造体
type IncidentRelationInput struct {
	IncidentID        uint `json:"incident_id"`
	RelatedIncidentID uint `json:"related_incident_id"`
}
