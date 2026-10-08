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
	ID        string         `gorm:"primaryKey;type:varchar(64)" json:"id"`
	Username  string         `gorm:"unique;not null" json:"username"`
	Password  string         `gorm:"not null" json:"-"`
	Name      string         `gorm:"not null" json:"name"`
	Email     string         `json:"email"`
	Avatar    string         `gorm:"type:text" json:"avatar"`
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
	SelfieURL          string         `json:"selfie_url"`
	FotoMesinURL       string         `json:"foto_mesin_url"`
	FotoURLs           string         `gorm:"type:text" json:"foto_urls"` // dipisah koma
	LocationLat        float64        `json:"location_lat"`
	LocationLng        float64        `json:"location_lng"`
	LocationAccuracy   float64        `json:"location_accuracy"`
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

// Notification merepresentasikan tabel notifications (uuid, enum priority/target).
type Notification struct {
	ID          string    `gorm:"primaryKey;type:uuid;default:uuid_generate_v4()" json:"id"`
	Title       string    `gorm:"not null" json:"title"`
	Description string    `gorm:"type:text" json:"description"`
	Time        time.Time `gorm:"default:now()" json:"time"`
	Priority    string    `gorm:"type:notification_priority;default:'sedang'" json:"priority"` // tinggi, sedang, rendah
	Type        string    `gorm:"type:varchar(32);default:'general'" json:"type"`              // logsheet, sync, presensi, har, auth, error, general
	TargetType  string    `gorm:"type:notification_target;default:'general'" json:"target_type"`
	IsRead      bool      `gorm:"default:false" json:"is_read"`
	UserID      string    `gorm:"type:varchar(64);index" json:"user_id"` // username penerima; "" / NULL = siapa saja
	UnitID      string    `gorm:"type:varchar(32)" json:"unit_id"`
	Payload     string    `gorm:"type:jsonb;default:'{}'" json:"payload"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// LogsheetDetail merepresentasikan tabel logsheets (data master logsheet WACB).
type LogsheetDetail struct {
	ID             string    `gorm:"primaryKey;type:varchar(32)" json:"id"`
	LocalID        string    `gorm:"type:varchar(64)" json:"local_id"`
	OperatorID     string    `gorm:"type:varchar(64)" json:"operator_id"`
	OperatorName   string    `gorm:"type:varchar(128)" json:"operator_name"`
	UnitID         string    `gorm:"type:varchar(32);index" json:"unit_id"`
	UnitName       string    `gorm:"type:varchar(128)" json:"unit_name"`
	MachineID      string    `gorm:"type:varchar(32);index" json:"machine_id"`
	MachineName    string    `gorm:"type:varchar(128)" json:"machine_name"`
	MachineStatus  string    `gorm:"type:machine_status" json:"machine_status"` // operasi, standby, gangguan-rusak
	BebanMesin     float64   `json:"beban_mesin"`
	StandKWh       float64   `gorm:"column:stand_kwh" json:"stand_kwh"`
	StandBBM       float64   `json:"stand_bbm"`
	Tegangan       float64   `json:"tegangan"`
	CosPhi         float64   `json:"cos_phi"`
	Frequency      float64   `json:"frequency"`
	SubmittedAt    time.Time `gorm:"default:now()" json:"submitted_at"`
	SyncStatus     string    `gorm:"type:logsheet_sync_status;default:'draft'" json:"sync_status"`             // draft, pendingSync, pendingEdit, synced, failed
	ReportStatus   string    `gorm:"type:logsheet_report_status;default:'onTime'" json:"report_status"`         // onTime, late, missing, abnormal
	ApprovalStatus string    `gorm:"type:logsheet_approval_status;default:'pendingReview'" json:"approval_status"` // pendingReview, approved, rejected
	Notes          string    `gorm:"type:text" json:"notes"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

// Machine merepresentasikan tabel machines (data master mesin).
type Machine struct {
	ID                string    `gorm:"primaryKey;type:varchar(32)" json:"id"`
	UnitID            string    `gorm:"type:varchar(32);not null" json:"unit_id"`
	UP3               string    `gorm:"type:varchar(64)" json:"up3"`
	MachineName       string    `gorm:"type:varchar(128);not null" json:"machine_name"`
	Brand             string    `gorm:"type:varchar(64)" json:"brand"`
	MachineType       string    `gorm:"type:varchar(64)" json:"machine_type"`
	SerialNumber      string    `gorm:"type:varchar(64)" json:"serial_number"`
	GeneratorCode     string    `gorm:"type:varchar(64)" json:"generator_code"`
	OwnershipStatus   string    `gorm:"type:varchar(8);default:'P'" json:"ownership_status"`
	PerformanceLabel  string    `gorm:"type:varchar(64)" json:"performance_label"`
	Capacity          string    `gorm:"type:varchar(32)" json:"capacity"`
	AvailableCapacity string    `gorm:"type:varchar(32)" json:"available_capacity"`
	DispatchCapacity  string    `gorm:"type:varchar(32)" json:"dispatch_capacity"`
	Status            string    `gorm:"type:machine_status;default:'operasi'" json:"status"` // operasi, standby, gangguan-rusak
	ConditionLabel    string    `gorm:"type:varchar(64)" json:"condition_label"`
	CreatedAt         time.Time `json:"created_at"`
	UpdatedAt         time.Time `json:"updated_at"`
}

// Unit merepresentasikan tabel units (master unit PLTD).
type Unit struct {
	ID           string    `gorm:"primaryKey;type:varchar(32)" json:"id"`
	Name         string    `gorm:"type:varchar(128);not null" json:"name"`
	LocationName string    `gorm:"type:varchar(128)" json:"location_name"`
	Latitude     float64   `json:"latitude"`
	Longitude    float64   `json:"longitude"`
	RadiusMeter  float64   `gorm:"default:250" json:"radius_meter"`
	Status       string    `gorm:"type:unit_status;default:'active'" json:"status"` // active, inactive
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
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


// TableName memetakan LogsheetDetail ke tabel logsheets yang sudah ada di DB
// (GORM default akan membuat logsheet_details, padahal tabel riil bernama logsheets).
func (LogsheetDetail) TableName() string {
	return "logsheets"
}
