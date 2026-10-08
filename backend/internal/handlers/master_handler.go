package handlers

import (
	"strconv"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"

	"pln-logsheet-backend/internal/models"
)

type MasterHandler struct {
	db *gorm.DB
}

func NewMasterHandler(db *gorm.DB) *MasterHandler {
	return &MasterHandler{db: db}
}

func allowedSyncStatus(s string) string {
	switch strings.ToLower(strings.TrimSpace(s)) {
	case "pendingsync":
		return "pendingSync"
	case "pendingedit":
		return "pendingEdit"
	case "synced", "failed":
		return strings.ToLower(strings.TrimSpace(s))
	default:
		return "draft"
	}
}

func allowedReportStatus(s string) string {
	switch strings.ToLower(strings.TrimSpace(s)) {
	case "late", "missing", "abnormal":
		return strings.ToLower(strings.TrimSpace(s))
	default:
		return "onTime"
	}
}

func allowedApprovalStatus(s string) string {
	switch strings.ToLower(strings.TrimSpace(s)) {
	case "approved":
		return "approved"
	case "rejected":
		return "rejected"
	default:
		return "pendingReview"
	}
}

// ListLogsheets menampilkan data master logsheet (tabel logsheets).
// GET /api/admin/logsheets?search=&unit_id=&tanggal=&approval=&limit=
func (h *MasterHandler) ListLogsheets(c *fiber.Ctx) error {
	query := h.db.Model(&models.LogsheetDetail{})

	if s := strings.TrimSpace(c.Query("search")); s != "" {
		like := "%" + s + "%"
		query = query.Where(
			"unit_name ILIKE ? OR machine_name ILIKE ? OR operator_name ILIKE ? OR id ILIKE ?",
			like, like, like, like,
		)
	}
	if u := c.Query("unit_id"); u != "" {
		query = query.Where("unit_id = ?", u)
	}
	if t := c.Query("tanggal"); t != "" {
		if start, err := time.Parse("2006-01-02", t); err == nil {
			query = query.Where("submitted_at >= ? AND submitted_at < ?", start, start.AddDate(0, 0, 1))
		}
	}
	if a := c.Query("approval"); a != "" {
		query = query.Where("approval_status = ?", a)
	}

	limit := 100
	if q := c.Query("limit"); q != "" {
		if n, err := strconv.Atoi(q); err == nil && n > 0 && n <= 500 {
			limit = n
		}
	}

	var items []models.LogsheetDetail
	if err := query.Order("submitted_at desc").Limit(limit).Find(&items).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal memuat data logsheet: " + err.Error(),
		})
	}

	var total int64
	query.Count(&total)

	return c.JSON(fiber.Map{
		"success": true,
		"data":    items,
		"total":   total,
	})
}

type LogsheetMasterRequest struct {
	ID             string  `json:"id"`
	UnitID         string  `json:"unit_id"`
	UnitName       string  `json:"unit_name"`
	MachineID      string  `json:"machine_id"`
	MachineName    string  `json:"machine_name"`
	MachineStatus  string  `json:"machine_status"`
	OperatorName   string  `json:"operator_name"`
	Tanggal        string  `json:"tanggal"` // YYYY-MM-DD
	Jam            string  `json:"jam"`     // HH:MM
	BebanMesin     float64 `json:"beban_mesin"`
	StandKWh       float64 `json:"stand_kwh"`
	StandBBM       float64 `json:"stand_bbm"`
	Tegangan       float64 `json:"tegangan"`
	CosPhi         float64 `json:"cos_phi"`
	Frequency      float64 `json:"frequency"`
	SyncStatus     string  `json:"sync_status"`
	ReportStatus   string  `json:"report_status"`
	ApprovalStatus string  `json:"approval_status"`
	Notes          string  `json:"notes"`
}

// CreateLogsheet menambah satu baris logsheet master.
// POST /api/admin/logsheets
func (h *MasterHandler) CreateLogsheet(c *fiber.Ctx) error {
	var req LogsheetMasterRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "Data logsheet tidak valid"})
	}
	if strings.TrimSpace(req.UnitID) == "" || strings.TrimSpace(req.MachineID) == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "Unit dan mesin wajib diisi"})
	}

	tanggal := req.Tanggal
	if tanggal == "" {
		tanggal = time.Now().Format("2006-01-02")
	}
	jam := req.Jam
	if jam == "" {
		jam = time.Now().Format("15:04")
	}
	submittedAt, err := time.ParseInLocation("2006-01-02 15:04", tanggal+" "+jam, time.Local)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "Format tanggal/jam tidak valid"})
	}

	machineStatus := allowedMachineStatus(req.MachineStatus)
	row := models.LogsheetDetail{
		ID:             strings.TrimSpace(req.ID),
		LocalID:        "LOC-" + time.Now().Format("060102150405"),
		OperatorID:     LocalUserID(c), // FK logsheets.operator_id -> users.id
		OperatorName:   strings.TrimSpace(req.OperatorName),
		UnitID:         strings.TrimSpace(req.UnitID),
		UnitName:       strings.TrimSpace(req.UnitName),
		MachineID:      strings.TrimSpace(req.MachineID),
		MachineName:    strings.TrimSpace(req.MachineName),
		MachineStatus:  machineStatus,
		BebanMesin:     req.BebanMesin,
		StandKWh:       req.StandKWh,
		StandBBM:       req.StandBBM,
		Tegangan:       req.Tegangan,
		CosPhi:         req.CosPhi,
		Frequency:      req.Frequency,
		SubmittedAt:    submittedAt,
		SyncStatus:     allowedSyncStatus(req.SyncStatus),
		ReportStatus:   allowedReportStatus(req.ReportStatus),
		ApprovalStatus: allowedApprovalStatus(req.ApprovalStatus),
		Notes:          strings.TrimSpace(req.Notes),
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}
	if row.ID == "" {
		row.ID = "LGS-" + time.Now().Format("060102150405")
	}
	if row.MachineStatus == "" {
		row.MachineStatus = "operasi"
	}

	if err := h.db.Create(&row).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal menyimpan logsheet: " + err.Error(),
		})
	}
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "Data logsheet berhasil ditambahkan",
		"data":    row,
	})
}

// UpdateLogsheet memperbarui satu baris logsheet master (hanya field yang dikirim).
// PUT /api/admin/logsheets/:id
func (h *MasterHandler) UpdateLogsheet(c *fiber.Ctx) error {
	id := c.Params("id")
	var row models.LogsheetDetail
	if err := h.db.First(&row, "id = ?", id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"success": false, "message": "Data logsheet tidak ditemukan"})
	}

	var req LogsheetMasterRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "Data logsheet tidak valid"})
	}

	if v := strings.TrimSpace(req.UnitID); v != "" {
		row.UnitID = v
	}
	if v := strings.TrimSpace(req.UnitName); v != "" {
		row.UnitName = v
	}
	if v := strings.TrimSpace(req.MachineID); v != "" {
		row.MachineID = v
	}
	if v := strings.TrimSpace(req.MachineName); v != "" {
		row.MachineName = v
	}
	if v := strings.TrimSpace(req.OperatorName); v != "" {
		row.OperatorName = v
	}
	if req.MachineStatus != "" {
		row.MachineStatus = allowedMachineStatus(req.MachineStatus)
	}
	if req.BebanMesin != 0 {
		row.BebanMesin = req.BebanMesin
	}
	if req.StandKWh != 0 {
		row.StandKWh = req.StandKWh
	}
	if req.StandBBM != 0 {
		row.StandBBM = req.StandBBM
	}
	if req.Tegangan != 0 {
		row.Tegangan = req.Tegangan
	}
	if req.CosPhi != 0 {
		row.CosPhi = req.CosPhi
	}
	if req.Frequency != 0 {
		row.Frequency = req.Frequency
	}
	if req.Tanggal != "" || req.Jam != "" {
		tanggal := req.Tanggal
		if tanggal == "" {
			tanggal = row.SubmittedAt.Format("2006-01-02")
		}
		jam := req.Jam
		if jam == "" {
			jam = row.SubmittedAt.Format("15:04")
		}
		if parsed, err := time.ParseInLocation("2006-01-02 15:04", tanggal+" "+jam, time.Local); err == nil {
			row.SubmittedAt = parsed
		}
	}
	if req.SyncStatus != "" {
		row.SyncStatus = allowedSyncStatus(req.SyncStatus)
	}
	if req.ReportStatus != "" {
		row.ReportStatus = allowedReportStatus(req.ReportStatus)
	}
	if req.ApprovalStatus != "" {
		row.ApprovalStatus = allowedApprovalStatus(req.ApprovalStatus)
	}
	if req.Notes != "" {
		row.Notes = strings.TrimSpace(req.Notes)
	}
	row.UpdatedAt = time.Now()

	if err := h.db.Save(&row).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"success": false, "message": "Gagal memperbarui logsheet: " + err.Error()})
	}
	return c.JSON(fiber.Map{"success": true, "message": "Data logsheet diperbarui", "data": row})
}

// DeleteLogsheet menghapus satu baris logsheet master.
// DELETE /api/admin/logsheets/:id
func (h *MasterHandler) DeleteLogsheet(c *fiber.Ctx) error {
	id := c.Params("id")
	res := h.db.Where("id = ?", id).Delete(&models.LogsheetDetail{})
	if res.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"success": false, "message": "Gagal menghapus logsheet"})
	}
	if res.RowsAffected == 0 {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"success": false, "message": "Data logsheet tidak ditemukan"})
	}
	return c.JSON(fiber.Map{"success": true, "message": "Data logsheet dihapus"})
}

type MatrixCell struct {
	Jam           string  `json:"jam"`
	UnitID        string  `json:"unit_id"`
	UnitName      string  `json:"unit_name"`
	MachineID     string  `json:"machine_id"`
	MachineName   string  `json:"machine_name"`
	MachineStatus string  `json:"machine_status"`
	BebanMesin    float64 `json:"beban_mesin"`
	Approval      string  `json:"approval_status"`
	Operator      string  `json:"operator_name"`
}

// GetMatrixMaster menampilkan baris logsheet per jam untuk tanggal tertentu
// (bahan dasar matriks 24 jam di halaman master).
// GET /api/admin/matrix-master?tanggal=&unit_id=
func (h *MasterHandler) GetMatrixMaster(c *fiber.Ctx) error {
	tanggal := c.Query("tanggal", time.Now().Format("2006-01-02"))
	start, err := time.ParseInLocation("2006-01-02", tanggal, time.Local)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "Format tanggal tidak valid"})
	}

	query := h.db.Where("submitted_at >= ? AND submitted_at < ?", start, start.AddDate(0, 0, 1))
	if u := c.Query("unit_id"); u != "" {
		query = query.Where("unit_id = ?", u)
	}

	var rows []models.LogsheetDetail
	if err := query.Order("submitted_at asc").Find(&rows).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal memuat matriks: " + err.Error(),
		})
	}

	cells := make([]MatrixCell, 0, len(rows))
	unitsMap := map[string]string{}
	for _, r := range rows {
		unitsMap[r.UnitID] = r.UnitName
		cells = append(cells, MatrixCell{
			Jam:           r.SubmittedAt.Format("15"),
			UnitID:        r.UnitID,
			UnitName:      r.UnitName,
			MachineID:     r.MachineID,
			MachineName:   r.MachineName,
			MachineStatus: r.MachineStatus,
			BebanMesin:    r.BebanMesin,
			Approval:      r.ApprovalStatus,
			Operator:      r.OperatorName,
		})
	}

	units := []map[string]string{}
	for id, name := range unitsMap {
		units = append(units, map[string]string{"id": id, "name": name})
	}

	return c.JSON(fiber.Map{
		"success":  true,
		"tanggal":  tanggal,
		"cells":    cells,
		"units":    units,
		"total":    len(cells),
		"messages": []string{},
	})
}
