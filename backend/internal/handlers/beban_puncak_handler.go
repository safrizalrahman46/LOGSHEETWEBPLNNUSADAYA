package handlers

import (
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"

	"pln-logsheet-backend/internal/models"
)

type BebanPuncakHandler struct {
	db *gorm.DB
}

func NewBebanPuncakHandler(db *gorm.DB) *BebanPuncakHandler {
	return &BebanPuncakHandler{db: db}
}

// List menampilkan riwayat Laporan Beban Puncak (WBP).
// GET /api/beban-puncak?tanggal=&up3=&unit_id=&kondisi=
func (h *BebanPuncakHandler) List(c *fiber.Ctx) error {
	query := h.db.Model(&models.PeakLoadReport{})

	if t := strings.TrimSpace(c.Query("tanggal")); t != "" {
		query = query.Where("tanggal = ?", t)
	}
	if u := strings.TrimSpace(c.Query("up3")); u != "" && u != "ALL" {
		query = query.Where("up3 ILIKE ?", "%"+u+"%")
	}
	if uid := strings.TrimSpace(c.Query("unit_id")); uid != "" && uid != "ALL" {
		query = query.Where("unit_id = ?", uid)
	}
	if k := strings.TrimSpace(c.Query("kondisi")); k != "" && k != "ALL" {
		query = query.Where("kondisi = ?", strings.ToUpper(k))
	}

	var reports []models.PeakLoadReport
	if err := query.Order("tanggal desc, id desc").Limit(200).Find(&reports).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal memuat laporan beban puncak: " + err.Error(),
		})
	}

	var total int64
	h.db.Model(&models.PeakLoadReport{}).Count(&total)

	return c.JSON(fiber.Map{
		"success": true,
		"data":    reports,
		"total":   total,
	})
}

// Summary mengembalikan ringkasan status kelistrikan sistem & gangguan saat beban puncak
// GET /api/beban-puncak/summary
func (h *BebanPuncakHandler) Summary(c *fiber.Ctx) error {
	var reports []models.PeakLoadReport
	todayStr := time.Now().Format("2006-01-02")
	h.db.Where("tanggal = ?", todayStr).Find(&reports)

	// Jika hari ini belum banyak data, ambil 30 data terbaru
	if len(reports) == 0 {
		h.db.Order("tanggal desc, id desc").Limit(30).Find(&reports)
	}

	var totalDTP, totalDMP, totalBP, totalCadangan float64
	var countNormal, countSiaga, countDefisit, countGangguan int

	// Hitung per unit unik (ambil entri terbaru per unit)
	unitSeen := make(map[string]bool)
	for _, r := range reports {
		if unitSeen[r.UnitName] {
			continue
		}
		unitSeen[r.UnitName] = true

		totalDTP += r.DTP
		totalDMP += r.DMP
		totalBP += r.BebanPuncak
		cadangan := r.DMP - r.BebanPuncak
		totalCadangan += cadangan

		switch strings.ToUpper(r.Kondisi) {
		case "DEFISIT":
			countDefisit++
		case "SIAGA":
			countSiaga++
		default:
			countNormal++
		}
		countGangguan += r.MesinGangguan
	}

	// Status keseluruhan sistem
	statusSistem := "NORMAL"
	if countDefisit > 0 || (totalDMP > 0 && totalBP > totalDMP) {
		statusSistem = "DEFISIT"
	} else if countSiaga > 0 || (totalDMP > 0 && totalCadangan < (totalDMP*0.15)) {
		statusSistem = "SIAGA"
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"status_sistem":      statusSistem,
			"daya_terpasang":    totalDTP,
			"daya_mampu_pasok":  totalDMP,
			"beban_puncak":      totalBP,
			"cadangan_daya":     totalCadangan,
			"persen_cadangan":   func() float64 {
				if totalDMP > 0 {
					return (totalCadangan / totalDMP) * 100
				}
				return 0
			}(),
			"unit_normal":       countNormal,
			"unit_siaga":        countSiaga,
			"unit_defisit":      countDefisit,
			"total_unit_lapor":  len(unitSeen),
			"mesin_gangguan":    countGangguan,
		},
	})
}

type MachineStatusUpdate struct {
	MachineID   string `json:"machine_id"`
	MachineName string `json:"machine_name"`
	Status      string `json:"status"` // operasi, standby, gangguan-rusak
	Notes       string `json:"notes"`
}

type CreatePeakLoadRequest struct {
	Tanggal        string                `json:"tanggal"`
	WaktuBeban     string                `json:"waktu_beban"`
	UP3            string                `json:"up3"`
	UnitID         string                `json:"unit_id"`
	UnitName       string                `json:"unit_name"`
	DTP            float64               `json:"dtp"`
	DMP            float64               `json:"dmp"`
	BebanPuncak    float64               `json:"beban_puncak"`
	MesinOperasi   int                   `json:"mesin_operasi"`
	MesinStandby   int                   `json:"mesin_standby"`
	MesinGangguan  int                   `json:"mesin_gangguan"`
	DaftarGangguan string                `json:"daftar_gangguan"`
	OperatorName   string                `json:"operator_name"`
	Catatan        string                `json:"catatan"`
	Machines       []MachineStatusUpdate `json:"machines"`
}

// Create menyimpan laporan beban puncak baru
// POST /api/beban-puncak
func (h *BebanPuncakHandler) Create(c *fiber.Ctx) error {
	var req CreatePeakLoadRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Data laporan beban puncak tidak valid: " + err.Error(),
		})
	}

	if req.Tanggal == "" {
		req.Tanggal = time.Now().Format("2006-01-02")
	}
	if req.WaktuBeban == "" {
		req.WaktuBeban = "WBP_MALAM"
	}
	if req.UnitName == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Nama Unit Pembangkit wajib diisi",
		})
	}

	cadangan := req.DMP - req.BebanPuncak
	var persen float64
	if req.DMP > 0 {
		persen = (cadangan / req.DMP) * 100
	}

	kondisi := "NORMAL"
	if cadangan < 0 {
		kondisi = "DEFISIT"
	} else if persen < 15.0 {
		kondisi = "SIAGA"
	}

	report := models.PeakLoadReport{
		Tanggal:        req.Tanggal,
		WaktuBeban:     req.WaktuBeban,
		UP3:            req.UP3,
		UnitID:         req.UnitID,
		UnitName:       req.UnitName,
		DTP:            req.DTP,
		DMP:            req.DMP,
		BebanPuncak:    req.BebanPuncak,
		CadanganDaya:   cadangan,
		PersenCadangan: persen,
		Kondisi:        kondisi,
		MesinOperasi:   req.MesinOperasi,
		MesinStandby:   req.MesinStandby,
		MesinGangguan:  req.MesinGangguan,
		DaftarGangguan: req.DaftarGangguan,
		OperatorName:   req.OperatorName,
		Catatan:        req.Catatan,
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}

	if err := h.db.Create(&report).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal menyimpan laporan beban puncak: " + err.Error(),
		})
	}

	// Sinkronisasi status mesin jika dikirim dalam payload
	for _, m := range req.Machines {
		st := strings.ToLower(strings.TrimSpace(m.Status))
		if st == "standby" || st == "gangguan-rusak" || st == "operasi" {
			cond := "Operasi Normal"
			if st == "standby" {
				cond = "Standby Siap Operasi"
			} else if st == "gangguan-rusak" {
				cond = "Gangguan Operasional"
			}
			h.db.Model(&models.Machine{}).
				Where("id = ? OR (unit_id = ? AND machine_name ILIKE ?)", m.MachineID, req.UnitID, "%"+m.MachineName+"%").
				Updates(map[string]interface{}{
					"status":          st,
					"condition_label": cond,
					"updated_at":      time.Now(),
				})
		}
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "Laporan Beban Puncak berhasil dicatat dan status mesin disinkronkan",
		"data":    report,
	})
}

// Delete menghapus data laporan beban puncak
// DELETE /api/beban-puncak/:id
func (h *BebanPuncakHandler) Delete(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := h.db.Where("id = ?", id).Delete(&models.PeakLoadReport{}).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal menghapus laporan beban puncak: " + err.Error(),
		})
	}
	return c.JSON(fiber.Map{
		"success": true,
		"message": "Laporan beban puncak berhasil dihapus",
	})
}
