package services

import (
	"bytes"
	"fmt"
	"time"

	"github.com/xuri/excelize/v2"

	"pln-logsheet-backend/internal/models"
)

type ExcelService struct{}

func NewExcelService() *ExcelService {
	return &ExcelService{}
}

func (s *ExcelService) GenerateLogsheetExcel(records []models.LogsheetRecord, unitName, tanggal string) ([]byte, error) {
	f := excelize.NewFile()
	defer f.Close()

	// Sheet 1: Raw Data
	sheet1 := "Laporan Operasional"
	f.SetSheetName("Sheet1", sheet1)

	// Header Styling
	headerStyle, _ := f.NewStyle(&excelize.Style{
		Font:      &excelize.Font{Bold: true, Color: "FFFFFF"},
		Fill:      excelize.Fill{Type: "pattern", Color: []string{"004581"}, Pattern: 1},
		Alignment: &excelize.Alignment{Horizontal: "center", Vertical: "center"},
	})

	headers := []string{
		"No", "Tanggal", "Jam", "Unit", "Operator", "Jumlah Mesin",
		"Status Ringkasan", "Status Sinkronisasi", "WACB ID", "Waktu Input",
	}

	for colIdx, h := range headers {
		cell, _ := excelize.CoordinatesToCellName(colIdx+1, 1)
		f.SetCellValue(sheet1, cell, h)
		f.SetCellStyle(sheet1, cell, cell, headerStyle)
	}

	for rowIdx, r := range records {
		row := rowIdx + 2
		f.SetCellValue(sheet1, fmt.Sprintf("A%d", row), rowIdx+1)
		f.SetCellValue(sheet1, fmt.Sprintf("B%d", row), r.Tanggal)
		f.SetCellValue(sheet1, fmt.Sprintf("C%d", row), r.Jam)
		f.SetCellValue(sheet1, fmt.Sprintf("D%d", row), r.NamaUnit)
		f.SetCellValue(sheet1, fmt.Sprintf("E%d", row), r.OperatorName)
		f.SetCellValue(sheet1, fmt.Sprintf("F%d", row), r.MachineCount)
		f.SetCellValue(sheet1, fmt.Sprintf("G%d", row), r.StatusMesinSummary)
		f.SetCellValue(sheet1, fmt.Sprintf("H%d", row), r.SyncStatus)
		f.SetCellValue(sheet1, fmt.Sprintf("I%d", row), r.WACBID)
		f.SetCellValue(sheet1, fmt.Sprintf("J%d", row), r.CreatedAt.Format("2006-01-02 15:04:05"))
	}

	// Auto-fit column width
	f.SetColWidth(sheet1, "A", "A", 6)
	f.SetColWidth(sheet1, "B", "C", 14)
	f.SetColWidth(sheet1, "D", "E", 24)
	f.SetColWidth(sheet1, "F", "H", 18)
	f.SetColWidth(sheet1, "I", "J", 22)

	// Sheet 2: Kurva Beban 24 Jam
	sheet2 := "Kurva Beban 24 Jam"
	f.NewSheet(sheet2)

	f.SetCellValue(sheet2, "A1", fmt.Sprintf("REKAP PEMBEBANAN SISTEM 24 JAM - %s (%s)", unitName, tanggal))
	f.SetCellValue(sheet2, "A3", "JAM")
	for h := 0; h < 24; h++ {
		cell, _ := excelize.CoordinatesToCellName(h+2, 3)
		f.SetCellValue(sheet2, cell, fmt.Sprintf("%02d:00", h))
	}
	f.SetCellValue(sheet2, "Z3", "MAX (kW)")
	f.SetCellValue(sheet2, "AA3", "MIN (kW)")
	f.SetCellValue(sheet2, "AB3", "RATA-RATA")

	f.SetCellValue(sheet2, "A4", unitName)
	// Sample data / simulation
	for h := 0; h < 24; h++ {
		cell, _ := excelize.CoordinatesToCellName(h+2, 4)
		val := 120.0 + float64(h*5%60)
		f.SetCellValue(sheet2, cell, val)
	}
	f.SetCellFormula(sheet2, "Z4", "MAX(B4:Y4)")
	f.SetCellFormula(sheet2, "AA4", "MIN(B4:Y4)")
	f.SetCellFormula(sheet2, "AB4", "AVERAGE(B4:Y4)")

	// Sheet 3: Analisis SFC BBM
	sheet3 := "Analisis SFC BBM"
	f.NewSheet(sheet3)
	f.SetCellValue(sheet3, "A1", "PARAMETER SPESIFIK KONSUMSI BAHAN BAKAR (SFC)")
	f.SetCellValue(sheet3, "A3", "Mesin")
	f.SetCellValue(sheet3, "B3", "Produksi KWH (kWh)")
	f.SetCellValue(sheet3, "C3", "Pemakaian BBM (Liter)")
	f.SetCellValue(sheet3, "D3", "SFC (L/kWh)")
	f.SetCellValue(sheet3, "E3", "Status Efisiensi")

	f.SetCellValue(sheet3, "A4", "PLTD BATU AMPAR #01")
	f.SetCellValue(sheet3, "B4", 4500.0)
	f.SetCellValue(sheet3, "C4", 1260.0)
	f.SetCellFormula(sheet3, "D4", "C4/B4")
	f.SetCellValue(sheet3, "E4", "NORMAL (< 0.30)")

	var buf bytes.Buffer
	if err := f.Write(&buf); err != nil {
		return nil, err
	}

	return buf.Bytes(), nil
}

func (s *ExcelService) GetExportFilename(unitName string) string {
	timestamp := time.Now().Format("20060102_1504")
	return fmt.Sprintf("Logsheet_PLTD_%s_%s.xlsx", unitName, timestamp)
}

// GenerateAMCExcel mengekspor seluruh data Laporan Gangguan AMC KIT KALTIMRA 2026
func (s *ExcelService) GenerateAMCExcel(records []models.AMCReport) ([]byte, error) {
	f := excelize.NewFile()
	defer f.Close()

	sheet := "Laporan Gangguan AMC"
	f.SetSheetName("Sheet1", sheet)

	// Styling Header
	headerStyle, _ := f.NewStyle(&excelize.Style{
		Font:      &excelize.Font{Bold: true, Color: "FFFFFF", Size: 11},
		Fill:      excelize.Fill{Type: "pattern", Color: []string{"004581"}, Pattern: 1},
		Alignment: &excelize.Alignment{Horizontal: "center", Vertical: "center", WrapText: true},
	})

	titleStyle, _ := f.NewStyle(&excelize.Style{
		Font:      &excelize.Font{Bold: true, Color: "004581", Size: 14},
		Alignment: &excelize.Alignment{Horizontal: "left", Vertical: "center"},
	})

	f.SetCellValue(sheet, "A1", "LAPORAN GANGGUAN AMC KIT KALTIMRA 2026 - PLN NUSANTARA DAYA")
	f.SetCellStyle(sheet, "A1", "A1", titleStyle)

	headers := []string{
		"No", "Periode", "UP3", "Sentral / Unit", "Unit Pembangkit", "Merk", "Tipe", "Serial Number",
		"DTP (kW)", "DMP (kW)", "Prioritas", "Indikasi Gangguan", "Dampak Terhadap Mesin",
		"Waktu Kejadian", "Rencana Tindak Lanjut", "List Kebutuhan Material", "Progres", "PIC", "Status",
	}

	for colIdx, h := range headers {
		cell, _ := excelize.CoordinatesToCellName(colIdx+1, 3)
		f.SetCellValue(sheet, cell, h)
		f.SetCellStyle(sheet, cell, cell, headerStyle)
	}

	for rowIdx, r := range records {
		row := rowIdx + 4
		f.SetCellValue(sheet, fmt.Sprintf("A%d", row), rowIdx+1)
		f.SetCellValue(sheet, fmt.Sprintf("B%d", row), r.Periode)
		f.SetCellValue(sheet, fmt.Sprintf("C%d", row), r.UP3)
		f.SetCellValue(sheet, fmt.Sprintf("D%d", row), r.Sentral)
		f.SetCellValue(sheet, fmt.Sprintf("E%d", row), r.UnitPembangkit)
		f.SetCellValue(sheet, fmt.Sprintf("F%d", row), r.Merk)
		f.SetCellValue(sheet, fmt.Sprintf("G%d", row), r.Tipe)
		f.SetCellValue(sheet, fmt.Sprintf("H%d", row), r.SerialNumber)
		f.SetCellValue(sheet, fmt.Sprintf("I%d", row), r.DTP)
		f.SetCellValue(sheet, fmt.Sprintf("J%d", row), r.DMP)
		f.SetCellValue(sheet, fmt.Sprintf("K%d", row), r.Prioritas)
		f.SetCellValue(sheet, fmt.Sprintf("L%d", row), r.IndikasiGangguan)
		f.SetCellValue(sheet, fmt.Sprintf("M%d", row), r.DampakMesin)
		f.SetCellValue(sheet, fmt.Sprintf("N%d", row), r.WaktuKejadian.Format("2006-01-02 15:04"))
		f.SetCellValue(sheet, fmt.Sprintf("O%d", row), r.RencanaTindakLanjut)
		f.SetCellValue(sheet, fmt.Sprintf("P%d", row), r.ListMaterial)
		f.SetCellValue(sheet, fmt.Sprintf("Q%d", row), r.Progres)
		f.SetCellValue(sheet, fmt.Sprintf("R%d", row), r.PIC)
		f.SetCellValue(sheet, fmt.Sprintf("S%d", row), r.Status)
	}

	f.SetColWidth(sheet, "A", "A", 6)
	f.SetColWidth(sheet, "B", "C", 16)
	f.SetColWidth(sheet, "D", "E", 20)
	f.SetColWidth(sheet, "F", "H", 16)
	f.SetColWidth(sheet, "I", "K", 14)
	f.SetColWidth(sheet, "L", "M", 35)
	f.SetColWidth(sheet, "N", "N", 18)
	f.SetColWidth(sheet, "O", "Q", 30)
	f.SetColWidth(sheet, "R", "S", 15)

	var buf bytes.Buffer
	if err := f.Write(&buf); err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}

// GenerateHARTicketsExcel mengekspor data Tiket Pemeliharaan HAR & Job Cards
func (s *ExcelService) GenerateHARTicketsExcel(tickets []models.HARTicket) ([]byte, error) {
	f := excelize.NewFile()
	defer f.Close()

	sheet := "Tiket HAR & Job Cards"
	f.SetSheetName("Sheet1", sheet)

	headerStyle, _ := f.NewStyle(&excelize.Style{
		Font:      &excelize.Font{Bold: true, Color: "FFFFFF", Size: 11},
		Fill:      excelize.Fill{Type: "pattern", Color: []string{"004581"}, Pattern: 1},
		Alignment: &excelize.Alignment{Horizontal: "center", Vertical: "center"},
	})

	headers := []string{
		"No", "No Tiket", "Unit", "Nama Mesin", "Kategori", "Tipe Pemeliharaan",
		"Jam Operasi (JKM)", "Prioritas", "Deskripsi Masalah", "Tindakan Teknis",
		"Hasil Akhir", "Teknisi PIC", "Status Approval", "Status Tiket", "Tanggal Dibuat",
	}

	for colIdx, h := range headers {
		cell, _ := excelize.CoordinatesToCellName(colIdx+1, 1)
		f.SetCellValue(sheet, cell, h)
		f.SetCellStyle(sheet, cell, cell, headerStyle)
	}

	for rowIdx, t := range tickets {
		row := rowIdx + 2
		f.SetCellValue(sheet, fmt.Sprintf("A%d", row), rowIdx+1)
		f.SetCellValue(sheet, fmt.Sprintf("B%d", row), t.TicketNumber)
		f.SetCellValue(sheet, fmt.Sprintf("C%d", row), t.NamaUnit)
		f.SetCellValue(sheet, fmt.Sprintf("D%d", row), t.NamaMesin)
		f.SetCellValue(sheet, fmt.Sprintf("E%d", row), t.Category)
		f.SetCellValue(sheet, fmt.Sprintf("F%d", row), t.MaintenanceType)
		f.SetCellValue(sheet, fmt.Sprintf("G%d", row), t.RunningHours)
		f.SetCellValue(sheet, fmt.Sprintf("H%d", row), t.Priority)
		f.SetCellValue(sheet, fmt.Sprintf("I%d", row), t.FaultDescription)
		f.SetCellValue(sheet, fmt.Sprintf("J%d", row), t.ActionTaken)
		f.SetCellValue(sheet, fmt.Sprintf("K%d", row), t.FinalResult)
		f.SetCellValue(sheet, fmt.Sprintf("L%d", row), t.TeknisiName)
		f.SetCellValue(sheet, fmt.Sprintf("M%d", row), t.SupervisorApproval)
		f.SetCellValue(sheet, fmt.Sprintf("N%d", row), t.Status)
		f.SetCellValue(sheet, fmt.Sprintf("O%d", row), t.CreatedAt.Format("2006-01-02 15:04"))
	}

	f.SetColWidth(sheet, "A", "A", 6)
	f.SetColWidth(sheet, "B", "B", 18)
	f.SetColWidth(sheet, "C", "F", 20)
	f.SetColWidth(sheet, "G", "H", 16)
	f.SetColWidth(sheet, "I", "K", 32)
	f.SetColWidth(sheet, "L", "O", 18)

	var buf bytes.Buffer
	if err := f.Write(&buf); err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}

// GenerateAttendanceExcel mengekspor data Rekap Presensi Geofencing GPS
func (s *ExcelService) GenerateAttendanceExcel(records []models.AttendanceRecord) ([]byte, error) {
	f := excelize.NewFile()
	defer f.Close()

	sheet := "Rekap Presensi GPS"
	f.SetSheetName("Sheet1", sheet)

	headerStyle, _ := f.NewStyle(&excelize.Style{
		Font:      &excelize.Font{Bold: true, Color: "FFFFFF", Size: 11},
		Fill:      excelize.Fill{Type: "pattern", Color: []string{"004581"}, Pattern: 1},
		Alignment: &excelize.Alignment{Horizontal: "center", Vertical: "center"},
	})

	headers := []string{
		"No", "Username", "Nama Petugas", "Role", "Unit Penugasan", "Shift",
		"Waktu Presensi", "Latitude", "Longitude", "Radius Jarak (m)", "Status Geofence", "Status",
	}

	for colIdx, h := range headers {
		cell, _ := excelize.CoordinatesToCellName(colIdx+1, 1)
		f.SetCellValue(sheet, cell, h)
		f.SetCellStyle(sheet, cell, cell, headerStyle)
	}

	for rowIdx, a := range records {
		row := rowIdx + 2
		geoStr := "VALID (Dalam Radius 250m)"
		if !a.IsWithinGeofence {
			geoStr = fmt.Sprintf("DILUAR RADIUS (%.1f m)", a.DistanceMeter)
		}
		f.SetCellValue(sheet, fmt.Sprintf("A%d", row), rowIdx+1)
		f.SetCellValue(sheet, fmt.Sprintf("B%d", row), a.Username)
		f.SetCellValue(sheet, fmt.Sprintf("C%d", row), a.Name)
		f.SetCellValue(sheet, fmt.Sprintf("D%d", row), string(a.Role))
		f.SetCellValue(sheet, fmt.Sprintf("E%d", row), a.NamaUnit)
		f.SetCellValue(sheet, fmt.Sprintf("F%d", row), a.Shift)
		f.SetCellValue(sheet, fmt.Sprintf("G%d", row), a.CreatedAt.Format("2006-01-02 15:04:05"))
		f.SetCellValue(sheet, fmt.Sprintf("H%d", row), a.Latitude)
		f.SetCellValue(sheet, fmt.Sprintf("I%d", row), a.Longitude)
		f.SetCellValue(sheet, fmt.Sprintf("J%d", row), a.DistanceMeter)
		f.SetCellValue(sheet, fmt.Sprintf("K%d", row), geoStr)
		f.SetCellValue(sheet, fmt.Sprintf("L%d", row), a.Status)
	}

	f.SetColWidth(sheet, "A", "A", 6)
	f.SetColWidth(sheet, "B", "F", 18)
	f.SetColWidth(sheet, "G", "G", 22)
	f.SetColWidth(sheet, "H", "J", 16)
	f.SetColWidth(sheet, "K", "L", 25)

	var buf bytes.Buffer
	if err := f.Write(&buf); err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}

// GenerateMachinesExcel mengekspor data Master Mesin Pembangkit
func (s *ExcelService) GenerateMachinesExcel(machines []models.Machine) ([]byte, error) {
	f := excelize.NewFile()
	defer f.Close()

	sheet := "Data Mesin Pembangkit"
	f.SetSheetName("Sheet1", sheet)

	headerStyle, _ := f.NewStyle(&excelize.Style{
		Font:      &excelize.Font{Bold: true, Color: "FFFFFF", Size: 11},
		Fill:      excelize.Fill{Type: "pattern", Color: []string{"004581"}, Pattern: 1},
		Alignment: &excelize.Alignment{Horizontal: "center", Vertical: "center"},
	})

	headers := []string{
		"No", "Kode Mesin", "Kode Unit", "UP3", "Nama Mesin", "Merk", "Tipe Mesin",
		"Serial Number", "Daya Terpasang", "Daya Mampu", "Daya Dispatch", "Status Mesin", "Kondisi",
	}

	for colIdx, h := range headers {
		cell, _ := excelize.CoordinatesToCellName(colIdx+1, 1)
		f.SetCellValue(sheet, cell, h)
		f.SetCellStyle(sheet, cell, cell, headerStyle)
	}

	for rowIdx, m := range machines {
		row := rowIdx + 2
		f.SetCellValue(sheet, fmt.Sprintf("A%d", row), rowIdx+1)
		f.SetCellValue(sheet, fmt.Sprintf("B%d", row), m.ID)
		f.SetCellValue(sheet, fmt.Sprintf("C%d", row), m.UnitID)
		f.SetCellValue(sheet, fmt.Sprintf("D%d", row), m.UP3)
		f.SetCellValue(sheet, fmt.Sprintf("E%d", row), m.MachineName)
		f.SetCellValue(sheet, fmt.Sprintf("F%d", row), m.Brand)
		f.SetCellValue(sheet, fmt.Sprintf("G%d", row), m.MachineType)
		f.SetCellValue(sheet, fmt.Sprintf("H%d", row), m.SerialNumber)
		f.SetCellValue(sheet, fmt.Sprintf("I%d", row), m.Capacity)
		f.SetCellValue(sheet, fmt.Sprintf("J%d", row), m.AvailableCapacity)
		f.SetCellValue(sheet, fmt.Sprintf("K%d", row), m.DispatchCapacity)
		f.SetCellValue(sheet, fmt.Sprintf("L%d", row), m.Status)
		f.SetCellValue(sheet, fmt.Sprintf("M%d", row), m.ConditionLabel)
	}

	f.SetColWidth(sheet, "A", "A", 6)
	f.SetColWidth(sheet, "B", "D", 16)
	f.SetColWidth(sheet, "E", "H", 20)
	f.SetColWidth(sheet, "I", "M", 18)

	var buf bytes.Buffer
	if err := f.Write(&buf); err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}

// GenerateTemplateExcel membuat file template kosong siap diisi untuk impor
func (s *ExcelService) GenerateTemplateExcel(templateType string) ([]byte, error) {
	f := excelize.NewFile()
	defer f.Close()

	headerStyle, _ := f.NewStyle(&excelize.Style{
		Font:      &excelize.Font{Bold: true, Color: "FFFFFF", Size: 11},
		Fill:      excelize.Fill{Type: "pattern", Color: []string{"004581"}, Pattern: 1},
		Alignment: &excelize.Alignment{Horizontal: "center", Vertical: "center"},
	})

	switch templateType {
	case "amc":
		sheet := "Template Gangguan AMC"
		f.SetSheetName("Sheet1", sheet)
		headers := []string{
			"Periode", "UP3", "Sentral", "Unit Pembangkit", "Merk", "Tipe", "Serial Number",
			"DTP (kW)", "DMP (kW)", "Prioritas", "Indikasi Gangguan", "Dampak Terhadap Mesin",
			"Waktu Kejadian (YYYY-MM-DD HH:MM)", "Rencana Tindak Lanjut", "List Kebutuhan Material",
			"Progres", "PIC", "Status",
		}
		for i, h := range headers {
			cell, _ := excelize.CoordinatesToCellName(i+1, 1)
			f.SetCellValue(sheet, cell, h)
			f.SetCellStyle(sheet, cell, cell, headerStyle)
		}
		// Sample Row
		sample := []interface{}{
			"Setelah AMC", "UP3 KALTIMRA", "PLTD NUNUKAN", "PLTD Nunukan #01", "DEUTZ", "BF6M 1013 E", "000123",
			500, 450, "PRIORITAS 1", "Overheat pada suhu pendingin melebihi 95C", "Pembatasan beban puncak siang maksimal 350 kW",
			"2026-03-15 14:30", "Pembersihan radiator & flushing pendingin", "Water Pump Repair Kit, Coolant 50L",
			"Suku cadang sudah sampai, menunggu jadwal shutdown", "Budi / Joko", "OPEN",
		}
		for i, val := range sample {
			cell, _ := excelize.CoordinatesToCellName(i+1, 2)
			f.SetCellValue(sheet, cell, val)
		}
		f.SetColWidth(sheet, "A", "R", 20)

	case "machines":
		sheet := "Template Data Mesin"
		f.SetSheetName("Sheet1", sheet)
		headers := []string{
			"Kode Mesin", "Kode Unit", "UP3", "Nama Mesin", "Merk", "Tipe Mesin",
			"Serial Number", "Daya Terpasang", "Daya Mampu", "Daya Dispatch", "Status Mesin", "Kondisi",
		}
		for i, h := range headers {
			cell, _ := excelize.CoordinatesToCellName(i+1, 1)
			f.SetCellValue(sheet, cell, h)
			f.SetCellStyle(sheet, cell, cell, headerStyle)
		}
		sample := []interface{}{
			"M-0264-99", "0264", "UP3 KALTIMRA", "DEUTZ #99", "DEUTZ", "BF6M 1013 E",
			"DTZ-9999", "500 kW", "450 kW", "420 kW", "operasi", "Operasi Andal",
		}
		for i, val := range sample {
			cell, _ := excelize.CoordinatesToCellName(i+1, 2)
			f.SetCellValue(sheet, cell, val)
		}
		f.SetColWidth(sheet, "A", "L", 20)

	default: // logsheet
		sheet := "Template Logsheet"
		f.SetSheetName("Sheet1", sheet)
		headers := []string{
			"Kode Mesin", "Nama Mesin", "Kode Unit", "Nama Unit", "Operator", "Jam (00-23)",
			"Beban (kW)", "Stand kWh", "Stand BBM (L)", "Tegangan (V)", "Cos Phi", "Frekuensi (Hz)", "Catatan",
		}
		for i, h := range headers {
			cell, _ := excelize.CoordinatesToCellName(i+1, 1)
			f.SetCellValue(sheet, cell, h)
			f.SetCellStyle(sheet, cell, cell, headerStyle)
		}
		sample := []interface{}{
			"M-0264-01", "DEUTZ #01", "0264", "PLTD NUNUKAN", "Ahmad", "14:00",
			420.5, 125400, 45200, 395.0, 0.85, 50.02, "Operasi normal",
		}
		for i, val := range sample {
			cell, _ := excelize.CoordinatesToCellName(i+1, 2)
			f.SetCellValue(sheet, cell, val)
		}
		f.SetColWidth(sheet, "A", "M", 20)
	}

	var buf bytes.Buffer
	if err := f.Write(&buf); err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}

