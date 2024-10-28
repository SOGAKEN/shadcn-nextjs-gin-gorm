package models

import "time"

type User struct {
	ID       uint   `gorm:"primaryKey"`
	Email    string `gorm:"unique"`
	Password string
	Profile  Profile `gorm:"foreignKey:UserID"` // ユーザーとプロフィールの関連付け
}

type Profile struct {
	ID       uint `gorm:"primaryKey"`
	UserID   uint `gorm:"unique"` // ユーザーIDとの一意の関連
	Name     string
	ImageURL string
}

type Session struct {
	ID        uint `gorm:"primaryKey"`
	UserID    uint
	Email     string
	SessionID string `gorm:"unique"`
	ExpiresAt time.Time
}

// incidents テーブル
type Incident struct {
	ID        uint               `gorm:"primaryKey"`
	Datetime  time.Time          `gorm:"not null"`
	Status    string             `gorm:"size:50;not null"`
	Judgment  string             `gorm:"size:50;not null"`
	Content   string             `gorm:"type:text;not null"`
	Assignee  string             `gorm:"size:100;not null"`
	Priority  string             `gorm:"size:10;not null"`
	FromEmail string             `gorm:"size:100;not null"`
	ToEmail   string             `gorm:"size:100;not null"`
	Subject   string             `gorm:"size:200;not null"`
	Responses []Response         `gorm:"foreignKey:IncidentID"` // 1対多の関係
	Relations []IncidentRelation `gorm:"foreignKey:IncidentID"` // 自己参照関係
}

// incident_relations テーブル
type IncidentRelation struct {
	ID                uint     `gorm:"primaryKey"`
	IncidentID        uint     `gorm:"not null"`                     // 元のインシデントID
	RelatedIncident   Incident `gorm:"foreignKey:RelatedIncidentID"` // 関連インシデントへの自己参照
	RelatedIncidentID uint     `gorm:"not null"`
}

// responses テーブル
type Response struct {
	ID         uint      `gorm:"primaryKey"`
	IncidentID uint      `gorm:"not null"` // incidentsテーブルへの外部キー
	Datetime   time.Time `gorm:"not null"`
	Responder  string    `gorm:"size:100;not null"`
	Content    string    `gorm:"type:text;not null"`
}
