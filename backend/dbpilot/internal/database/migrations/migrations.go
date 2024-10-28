package migrations

import (
	"dbpilot/internal/models"
	"fmt"
	"log"
	"time"

	"gorm.io/gorm"
)

// Migration はマイグレーション情報を管理する構造体
type Migration struct {
	ID        uint      `gorm:"primaryKey"`
	Name      string    `gorm:"size:255;not null;unique"`
	AppliedAt time.Time `gorm:"not null"`
}

// MigrationHistory はマイグレーション履歴を表す構造体
type MigrationHistory struct {
	Name      string    `json:"name"`
	AppliedAt time.Time `json:"applied_at"`
}

// GetMigrationHistory はマイグレーション履歴を取得する
func GetMigrationHistory(db *gorm.DB) ([]MigrationHistory, error) {
	var migrations []Migration
	if err := db.Order("applied_at ASC").Find(&migrations).Error; err != nil {
		return nil, fmt.Errorf("failed to get migration history: %v", err)
	}

	history := make([]MigrationHistory, len(migrations))
	for i, m := range migrations {
		history[i] = MigrationHistory{
			Name:      m.Name,
			AppliedAt: m.AppliedAt,
		}
	}

	return history, nil
}

// RunMigrations はマイグレーションを実行する
func RunMigrations(db *gorm.DB) error {
	// マイグレーション履歴テーブルの作成
	err := db.AutoMigrate(&Migration{})
	if err != nil {
		return fmt.Errorf("failed to create migrations table: %v", err)
	}

	// マイグレーションの定義
	migrations := []struct {
		Name     string
		Migrate  func(*gorm.DB) error
		Rollback func(*gorm.DB) error
	}{
		{
			Name: "create_incidents_table",
			Migrate: func(db *gorm.DB) error {
				return db.AutoMigrate(&models.Incident{})
			},
			Rollback: func(db *gorm.DB) error {
				return db.Migrator().DropTable(&models.Incident{})
			},
		},
		{
			Name: "create_responses_table",
			Migrate: func(db *gorm.DB) error {
				return db.AutoMigrate(&models.Response{})
			},
			Rollback: func(db *gorm.DB) error {
				return db.Migrator().DropTable(&models.Response{})
			},
		},
		{
			Name: "create_incident_relations_table",
			Migrate: func(db *gorm.DB) error {
				if err := db.AutoMigrate(&models.IncidentRelation{}); err != nil {
					return err
				}

				// ユニークインデックスの作成
				return db.Exec(`
                    CREATE UNIQUE INDEX IF NOT EXISTS idx_incident_relations_unique_pair 
                    ON incident_relations (LEAST(incident_id, related_incident_id), GREATEST(incident_id, related_incident_id))
                    WHERE incident_id != related_incident_id;
                `).Error
			},
			Rollback: func(db *gorm.DB) error {
				if err := db.Exec(`DROP INDEX IF EXISTS idx_incident_relations_unique_pair;`).Error; err != nil {
					return err
				}
				return db.Migrator().DropTable(&models.IncidentRelation{})
			},
		},
	}

	// マイグレーションの実行
	for _, m := range migrations {
		var count int64
		db.Model(&Migration{}).Where("name = ?", m.Name).Count(&count)
		if count > 0 {
			log.Printf("Skipping migration '%s' as it was already applied", m.Name)
			continue
		}

		log.Printf("Applying migration '%s'", m.Name)
		if err := m.Migrate(db); err != nil {
			log.Printf("Failed to apply migration '%s': %v", m.Name, err)
			if rollbackErr := m.Rollback(db); rollbackErr != nil {
				log.Printf("Failed to rollback migration '%s': %v", m.Name, rollbackErr)
			}
			return fmt.Errorf("migration '%s' failed: %v", m.Name, err)
		}

		// マイグレーション履歴の記録
		migration := Migration{
			Name:      m.Name,
			AppliedAt: time.Now(),
		}
		if err := db.Create(&migration).Error; err != nil {
			return fmt.Errorf("failed to record migration history: %v", err)
		}

		log.Printf("Successfully applied migration '%s'", m.Name)
	}

	return nil
}

// RollbackLastMigration は最後に適用したマイグレーションをロールバックする
func RollbackLastMigration(db *gorm.DB) error {
	var lastMigration Migration
	if err := db.Order("applied_at DESC").First(&lastMigration).Error; err != nil {
		return fmt.Errorf("no migrations to rollback: %v", err)
	}

	// マイグレーションの定義を検索
	migrations := []struct {
		Name     string
		Rollback func(*gorm.DB) error
	}{
		{
			Name: "create_incident_relations_table",
			Rollback: func(db *gorm.DB) error {
				if err := db.Exec(`DROP INDEX IF EXISTS idx_incident_relations_unique_pair;`).Error; err != nil {
					return err
				}
				return db.Migrator().DropTable(&models.IncidentRelation{})
			},
		},
		{
			Name: "create_responses_table",
			Rollback: func(db *gorm.DB) error {
				return db.Migrator().DropTable(&models.Response{})
			},
		},
		{
			Name: "create_incidents_table",
			Rollback: func(db *gorm.DB) error {
				return db.Migrator().DropTable(&models.Incident{})
			},
		},
	}

	// 該当するロールバック処理を実行
	for _, m := range migrations {
		if m.Name == lastMigration.Name {
			log.Printf("Rolling back migration '%s'", m.Name)
			if err := m.Rollback(db); err != nil {
				return fmt.Errorf("failed to rollback migration '%s': %v", m.Name, err)
			}

			// マイグレーション履歴から削除
			if err := db.Delete(&lastMigration).Error; err != nil {
				return fmt.Errorf("failed to delete migration history: %v", err)
			}

			log.Printf("Successfully rolled back migration '%s'", m.Name)
			return nil
		}
	}

	return fmt.Errorf("migration '%s' not found in rollback definitions", lastMigration.Name)
}
