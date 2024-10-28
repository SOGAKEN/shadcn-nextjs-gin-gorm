package handlers

import (
	"dbpilot/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"net/http"
	"time"
)

type CreateIncidentRequest struct {
	Datetime  time.Time `json:"datetime"`
	Status    string    `json:"status"`
	Judgment  string    `json:"judgment"`
	Content   string    `json:"content"`
	Assignee  string    `json:"assignee"`
	Priority  string    `json:"priority"`
	FromEmail string    `json:"from_email"`
	ToEmail   string    `json:"to_email"`
	Subject   string    `json:"subject"`
}

func CreateIncident(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req CreateIncidentRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
			return
		}

		incident := models.Incident{
			Datetime:  req.Datetime,
			Status:    req.Status,
			Judgment:  req.Judgment,
			Content:   req.Content,
			Assignee:  req.Assignee,
			Priority:  req.Priority,
			FromEmail: req.FromEmail,
			ToEmail:   req.ToEmail,
			Subject:   req.Subject,
		}

		if err := db.Create(&incident).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create incident"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Incident created successfully", "id": incident.ID})
	}
}

func GetIncident(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")
		var incident models.Incident

		if err := db.Preload("Responses").Preload("Relations.RelatedIncident").First(&incident, id).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Incident not found"})
			return
		}

		c.JSON(http.StatusOK, incident)
	}
}

type CreateIncidentRelationRequest struct {
	IncidentID        uint `json:"incident_id"`
	RelatedIncidentID uint `json:"related_incident_id"`
}

func CreateIncidentRelation(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req CreateIncidentRelationRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
			return
		}

		relation := models.IncidentRelation{
			IncidentID:        req.IncidentID,
			RelatedIncidentID: req.RelatedIncidentID,
		}

		if err := db.Create(&relation).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create incident relation"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Incident relation created successfully", "id": relation.ID})
	}
}

type CreateResponseRequest struct {
	IncidentID uint      `json:"incident_id"`
	Datetime   time.Time `json:"datetime"`
	Responder  string    `json:"responder"`
	Content    string    `json:"content"`
}

func CreateResponse(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req CreateResponseRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
			return
		}

		response := models.Response{
			IncidentID: req.IncidentID,
			Datetime:   req.Datetime,
			Responder:  req.Responder,
			Content:    req.Content,
		}

		if err := db.Create(&response).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create response"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Response created successfully", "id": response.ID})
	}
}
