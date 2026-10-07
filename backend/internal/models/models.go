package models

import (
	"time"

	"gorm.io/gorm"
)

type Role string

const (
	RoleSuperadmin Role = "SUPERADMIN"
	RoleAdmin      Role = "ADMIN"
	RoleManager    Role = "MANAGER"
	RoleSupervisor Role = "SUPERVISOR"
	RoleTeknisi    Role = "TEKNISI"
	RoleOperator   Role = "OPERATOR"
)

type User struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Username  string         `gorm:"unique;not null" json:"username"`
	Password  string         `gorm:"not null" json:"-"`
	Name      string         `gorm:"not null" json:"name"`
	Email     string         `json:"email"`
	Role      Role           `gorm:"type:varchar(20);not null;default:'OPERATOR'" json:"role"`
	KdRegion  string         `gorm:"default:'05'" json:"kd_region"`
	KdUnit    string         `json:"kd_unit"`
	NamaUnit  string         `json:"nama_unit"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

type LogsheetRecord struct {
	ID                 uint           `gorm:"primaryKey" json:"id"`
	LocalID            string         `gorm:"unique" json:"local_id"`
	KdRegion           string         `gorm:"index;default:'05'" json:"kd_region"`
	KdUnit             string         `gorm:"index" json:"kd_unit"`
	NamaUnit           string         `json:"nama_unit"`
	Tanggal            string         `gorm:"index" json:"tanggal"`
	Jam                string         `gorm:"index" json:"jam"`
	OperatorName       string         `json:"operator_name"`
	MachineCount       int            `json:"machine_count"`
	MessageText        string         `gorm:"type:text" json:"message_text"`
	StatusMesinSummary string         `json:"status_mesin_summary"`
	SyncStatus         string         `gorm:"default:'SYNCED'" json:"sync_status"` // SYNCED, PENDING, FAILED
	WACBID             string         `json:"wacb_id"`
	CreatedAt          time.Time      `json:"created_at"`
	UpdatedAt          time.Time      `json:"updated_at"`
	DeletedAt          gorm.DeletedAt `gorm:"index" json:"-"`
}

type HARTicket struct {
	ID                 uint           `gorm:"primaryKey" json:"id"`
	TicketNumber       string         `gorm:"unique;not null" json:"ticket_number"`
	KdUnit             string         `gorm:"index" json:"kd_unit"`
	NamaUnit           string         `json:"nama_unit"`
	IdMesin            string         `gorm:"index" json:"id_mesin"`
	NamaMesin          string         `json:"nama_mesin"`
	Category           string         `json:"category"`         // Bahan Bakar, Pelumasan, Pendingin, Udara, Elektrikal, Mekanikal
	MaintenanceType    string         `json:"maintenance_type"` // PREVENTIVE, CORRECTIVE, OVERHAUL
	RunningHours       float64        `json:"running_hours"`    // JKM
	FaultDescription   string         `gorm:"type:text" json:"fault_description"`
	ActionTaken        string         `gorm:"type:text" json:"action_taken"`
	Status             string         `gorm:"default:'DRAFT'" json:"status"` // DRAFT, SUBMITTED, IN_PROGRESS, RESOLVED, APPROVED
	TeknisiName        string         `json:"teknisi_name"`
	SupervisorApproval string         `json:"supervisor_approval"`
	CreatedAt          time.Time      `json:"created_at"`
	UpdatedAt          time.Time      `json:"updated_at"`
	DeletedAt          gorm.DeletedAt `gorm:"index" json:"-"`
}

type SystemAuditLog struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `json:"user_id"`
	Username  string    `json:"username"`
	Role      Role      `json:"role"`
	Action    string    `json:"action"`
	Details   string    `gorm:"type:text" json:"details"`
	IPAddress string    `json:"ip_address"`
	CreatedAt time.Time `json:"created_at"`
}

type UnitLocation struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	KdUnit      string    `gorm:"uniqueIndex;not null" json:"kd_unit"`
	NamaUnit    string    `gorm:"not null" json:"nama_unit"`
	Latitude    float64   `gorm:"not null" json:"latitude"`
	Longitude   float64   `gorm:"not null" json:"longitude"`
	RadiusMeter float64   `gorm:"default:250" json:"radius_meter"`
	IsActive    bool      `gorm:"default:true" json:"is_active"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type AttendanceRecord struct {
	ID               uint           `gorm:"primaryKey" json:"id"`
	UserID           uint           `gorm:"index" json:"user_id"`
	Username         string         `gorm:"index" json:"username"`
	Name             string         `json:"name"`
	Role             Role           `json:"role"`
	KdUnit           string         `gorm:"index" json:"kd_unit"`
	NamaUnit         string         `json:"nama_unit"`
	Shift            string         `json:"shift"` // PAGI, SIANG, MALAM
	Latitude         float64        `json:"latitude"`
	Longitude        float64        `json:"longitude"`
	AccuracyMeter    float64        `json:"accuracy_meter"`
	DistanceMeter    float64        `json:"distance_meter"`
	IsWithinGeofence bool           `json:"is_within_geofence"`
	Status           string         `gorm:"default:'VALID'" json:"status"` // VALID, ANOMALY
	Remarks          string         `json:"remarks"`
	PhotoURL         string         `json:"photo_url"`
	CreatedAt        time.Time      `json:"created_at"`
	UpdatedAt        time.Time      `json:"updated_at"`
	DeletedAt        gorm.DeletedAt `gorm:"index" json:"-"`
}

type Article struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Title     string         `gorm:"not null" json:"title"`
	Slug      string         `gorm:"uniqueIndex;not null" json:"slug"`
	Category  string         `gorm:"index;default:'Operasional'" json:"category"` // Operasional, Pemeliharaan, K3, Berita Korporat
	Excerpt   string         `gorm:"type:text" json:"excerpt"`
	Content   string         `gorm:"type:text" json:"content"`
	ImageURL  string         `json:"image_url"`
	Status    string         `gorm:"index;default:'PUBLISHED'" json:"status"` // PUBLISHED, DRAFT
	Author    string         `json:"author"`
	Views     int            `gorm:"default:0" json:"views"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

