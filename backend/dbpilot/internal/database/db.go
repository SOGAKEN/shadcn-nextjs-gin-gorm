package database

import (
	"dbpilot/internal/config"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB(cfg *config.Config) error {
	var err error
	DB, err = gorm.Open(postgres.Open(cfg.GetDBConnString()), &gorm.Config{})
	if err != nil {
		return err
	}

	// Auto Migrate all models
	err = migrateModels()
	if err != nil {
		return err
	}

	return nil
}

func migrateModels() error {
	// ここにモデルのマイグレーションを追加
	// 例: return DB.AutoMigrate(&models.User{})
	return nil
}

func GetDB() *gorm.DB {
	return DB
}
