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

	// Relations
	Relations []IncidentRelation `gorm:"foreignKey:IncidentID" json:"relations,omitempty"`
	Responses []Response         `gorm:"foreignKey:IncidentID" json:"responses,omitempty"`
}

// IncidentRelation はインシデント間の関連を表す構造体
type IncidentRelation struct {
	ID                uint     `gorm:"primaryKey" json:"id"`
	IncidentID        uint     `gorm:"not null" json:"incident_id"`
	RelatedIncidentID uint     `gorm:"not null" json:"related_incident_id"`
	Incident          Incident `gorm:"foreignKey:IncidentID" json:"-"`
	RelatedIncident   Incident `gorm:"foreignKey:RelatedIncidentID" json:"related_incident,omitempty"`
}

// Response は対応履歴を表す構造体
type Response struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	IncidentID uint      `gorm:"not null" json:"incident_id"`
	DateTime   time.Time `json:"datetime"`
	Responder  string    `gorm:"size:100;not null" json:"responder"`
	Content    string    `gorm:"type:text;not null" json:"content"`
	Incident   Incident  `gorm:"foreignKey:IncidentID" json:"-"`
}
