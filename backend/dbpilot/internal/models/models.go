package models

import (
	"time"
)

// Incident はインシデント情報を表す構造体
type Incident struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	DateTime  time.Time `json:"datetime"`
	Status    string    `gorm:"size:50;not null" json:"status"`
	Judgment  string    `gorm:"size:50;not null" json:"judgment"`
	Content   string    `gorm:"type:text;not null" json:"content"`
	Assignee  string    `gorm:"size:100;not null" json:"assignee"`
	Priority  string    `gorm:"size:10;not null" json:"priority"`
	FromEmail string    `gorm:"size:100;not null" json:"from_email"`
	ToEmail   string    `gorm:"size:100;not null" json:"to_email"`
	Subject   string    `gorm:"size:200;not null" json:"subject"`

	// 1:N関係 - インシデントと対応履歴
	Responses []Response `gorm:"foreignKey:IncidentID;constraint:OnDelete:CASCADE" json:"responses,omitempty"`

	// N:N関係 - インシデント間の関連（自己参照）
	RelatedToIncidents   []IncidentRelation `gorm:"foreignKey:IncidentID;constraint:OnDelete:CASCADE" json:"related_to_incidents,omitempty"`
	RelatedFromIncidents []IncidentRelation `gorm:"foreignKey:RelatedIncidentID;constraint:OnDelete:CASCADE" json:"related_from_incidents,omitempty"`

	CreatedAt time.Time `gorm:"not null" json:"created_at"`
	UpdatedAt time.Time `gorm:"not null" json:"updated_at"`
}

// Response は対応履歴を表す構造体
type Response struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	IncidentID uint      `gorm:"not null;index" json:"incident_id"`
	DateTime   time.Time `gorm:"not null" json:"datetime"`
	Responder  string    `gorm:"size:100;not null" json:"responder"`
	Content    string    `gorm:"type:text;not null" json:"content"`

	// N:1関係 - 対応履歴とインシデント
	Incident Incident `gorm:"foreignKey:IncidentID" json:"-"`

	CreatedAt time.Time `gorm:"not null" json:"created_at"`
	UpdatedAt time.Time `gorm:"not null" json:"updated_at"`
}

// IncidentRelation はインシデント間の関連を表す構造体
type IncidentRelation struct {
	ID                uint `gorm:"primaryKey" json:"id"`
	IncidentID        uint `gorm:"not null;index" json:"incident_id"`
	RelatedIncidentID uint `gorm:"not null;index" json:"related_incident_id"`

	// N:1関係 - 関連元インシデント
	Incident Incident `gorm:"foreignKey:IncidentID" json:"incident"`
	// N:1関係 - 関連先インシデント
	RelatedIncident Incident `gorm:"foreignKey:RelatedIncidentID" json:"related_incident"`

	CreatedAt time.Time `gorm:"not null" json:"created_at"`
	UpdatedAt time.Time `gorm:"not null" json:"updated_at"`
}
