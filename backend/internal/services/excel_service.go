package services

import (
	"bytes"
	"fmt"
	"strings"
	"time"

	"github.com/xuri/excelize/v2"

	"pln-logsheet-backend/internal/models"
)

type ExcelService struct{}

func NewExcelService() *ExcelService {
	return &ExcelService{}
}

func (s *ExcelService) GenerateLogsheetExcel(records []models.LogsheetRecord, details []models.LogsheetDetail, unitName, tanggal string) ([]byte, error) {
	f := excelize.NewFile()
	defer f.Close()

	// 1. Common Styles
	headerStyle, _ := f.NewStyle(&excelize.Style{
		Font:      &excelize.Font{Bold: true, Color: "FFFFFF", Size: 10},
		Fill:      excelize.Fill{Type: "pattern", Color: []string{"004581"}, Pattern: 1},
		Alignment: &excelize.Alignment{Horizontal: "center", Vertical: "center", WrapText: true},
		Border: []excelize.Border{
			{Type: "left", Color: "D0D0D0", Style: 1},
			{Type: "right", Color: "D0D0D0", Style: 1},
			{Type: "top", Color: "D0D0D0", Style: 1},
			{Type: "bottom", Color: "D0D0D0", Style: 1},
		},
	})

	titleStyle, _ := f.NewStyle(&excelize.Style{
		Font:      &excelize.Font{Bold: true, Color: "004581", Size: 13},
		Alignment: &excelize.Alignment{Horizontal: "left", Vertical: "center"},
	})

	subtitleStyle, _ := f.NewStyle(&excelize.Style{
		Font:      &excelize.Font{Color: "555555", Size: 9, Italic: true},
		Alignment: &excelize.Alignment{Horizontal: "left", Vertical: "center"},
	})

	cellCenter, _ := f.NewStyle(&excelize.Style{
		Alignment: &excelize.Alignment{Horizontal: "center", Vertical: "center"},
		Border: []excelize.Border{
			{Type: "left", Color: "E0E0E0", Style: 1},
			{Type: "right", Color: "E0E0E0", Style: 1},
			{Type: "top", Color: "E0E0E0", Style: 1},
			{Type: "bottom", Color: "E0E0E0", Style: 1},
		},
	})

	cellRight, _ := f.NewStyle(&excelize.Style{
		Alignment: &excelize.Alignment{Horizontal: "right", Vertical: "center"},
		Border: []excelize.Border{
			{Type: "left", Color: "E0E0E0", Style: 1},
			{Type: "right", Color: "E0E0E0", Style: 1},
			{Type: "top", Color: "E0E0E0", Style: 1},
			{Type: "bottom", Color: "E0E0E0", Style: 1},
		},
	})

	cellLeft, _ := f.NewStyle(&excelize.Style{
		Alignment: &excelize.Alignment{Horizontal: "left", Vertical: "center"},
		Border: []excelize.Border{
			{Type: "left", Color: "E0E0E0", Style: 1},
			{Type: "right", Color: "E0E0E0", Style: 1},
			{Type: "top", Color: "E0E0E0", Style: 1},
			{Type: "bottom", Color: "E0E0E0", Style: 1},
		},
	})

	styleGangguan, _ := f.NewStyle(&excelize.Style{
		Font:      &excelize.Font{Bold: true, Color: "9C0006", Size: 10},
		Fill:      excelize.Fill{Type: "pattern", Color: []string{"FFC7CE"}, Pattern: 1},
		Alignment: &excelize.Alignment{Horizontal: "center", Vertical: "center"},
		Border: []excelize.Border{
			{Type: "left", Color: "E0E0E0", Style: 1},
			{Type: "right", Color: "E0E0E0", Style: 1},
			{Type: "top", Color: "E0E0E0", Style: 1},
			{Type: "bottom", Color: "E0E0E0", Style: 1},
		},
	})

	styleOperasi, _ := f.NewStyle(&excelize.Style{
		Font:      &excelize.Font{Bold: true, Color: "006100", Size: 10},
		Fill:      excelize.Fill{Type: "pattern", Color: []string{"C6EFCE"}, Pattern: 1},
		Alignment: &excelize.Alignment{Horizontal: "center", Vertical: "center"},
		Border: []excelize.Border{
			{Type: "left", Color: "E0E0E0", Style: 1},
			{Type: "right", Color: "E0E0E0", Style: 1},
			{Type: "top", Color: "E0E0E0", Style: 1},
			{Type: "bottom", Color: "E0E0E0", Style: 1},
		},
	})

	styleStandby, _ := f.NewStyle(&excelize.Style{
		Font:      &excelize.Font{Bold: true, Color: "9C6500", Size: 10},
		Fill:      excelize.Fill{Type: "pattern", Color: []string{"FFEB9C"}, Pattern: 1},
		Alignment: &excelize.Alignment{Horizontal: "center", Vertical: "center"},
		Border: []excelize.Border{
			{Type: "left", Color: "E0E0E0", Style: 1},
			{Type: "right", Color: "E0E0E0", Style: 1},
			{Type: "top", Color: "E0E0E0", Style: 1},
			{Type: "bottom", Color: "E0E0E0", Style: 1},
		},
	})

	// Sheet 1: Logsheet Parameter Mesin
	sheet1 := "Parameter Mesin Per Jam"
	f.SetSheetName("Sheet1", sheet1)

	f.SetCellValue(sheet1, "A1", "LAPORAN LOGSHEET OPERASIONAL & PARAMETER MESIN PLTD - PT PLN SERVICES")
	f.SetCellStyle(sheet1, "A1", "A1", titleStyle)

	sub1 := fmt.Sprintf("Unit Sentral: %s | Tanggal: %s | Dicetak: %s WITA", unitName, tanggal, time.Now().Format("2006-01-02 15:04"))
	f.SetCellValue(sheet1, "A2", sub1)
	f.SetCellStyle(sheet1, "A2", "A2", subtitleStyle)

	headers1 := []string{
		"No", "Waktu Input / Jam", "Unit Sentral", "Nama Mesin", "Status Mesin",
		"Beban (kW)", "Stand kWh", "Stand BBM (L)", "Tegangan (V)", "Frekuensi (Hz)", "Cos Phi",
		"Catatan / Alasan Gangguan", "Operator PIC", "Status WACB",
	}

	for colIdx, h := range headers1 {
		cell, _ := excelize.CoordinatesToCellName(colIdx+1, 4)
		f.SetCellValue(sheet1, cell, h)
		f.SetCellStyle(sheet1, cell, cell, headerStyle)
	}
	f.SetRowHeight(sheet1, 4, 25)

	if len(details) > 0 {
		for rowIdx, d := range details {
			row := rowIdx + 5
			f.SetCellValue(sheet1, fmt.Sprintf("A%d", row), rowIdx+1)
			f.SetCellStyle(sheet1, fmt.Sprintf("A%d", row), fmt.Sprintf("A%d", row), cellCenter)

			waktuStr := d.SubmittedAt.Format("2006-01-02 15:04")
			f.SetCellValue(sheet1, fmt.Sprintf("B%d", row), waktuStr)
			f.SetCellStyle(sheet1, fmt.Sprintf("B%d", row), fmt.Sprintf("B%d", row), cellCenter)

			f.SetCellValue(sheet1, fmt.Sprintf("C%d", row), d.UnitName)
			f.SetCellStyle(sheet1, fmt.Sprintf("C%d", row), fmt.Sprintf("C%d", row), cellLeft)

			f.SetCellValue(sheet1, fmt.Sprintf("D%d", row), d.MachineName)
			f.SetCellStyle(sheet1, fmt.Sprintf("D%d", row), fmt.Sprintf("D%d", row), cellLeft)

			stLabel := strings.ToUpper(d.MachineStatus)
			if stLabel == "GANGGUAN-RUSAK" || stLabel == "GANGGUAN" {
				stLabel = "GANGGUAN"
				f.SetCellValue(sheet1, fmt.Sprintf("E%d", row), stLabel)
				f.SetCellStyle(sheet1, fmt.Sprintf("E%d", row), fmt.Sprintf("E%d", row), styleGangguan)
			} else if stLabel == "OPERASI" {
				f.SetCellValue(sheet1, fmt.Sprintf("E%d", row), stLabel)
				f.SetCellStyle(sheet1, fmt.Sprintf("E%d", row), fmt.Sprintf("E%d", row), styleOperasi)
			} else {
				stLabel = "STANDBY"
				f.SetCellValue(sheet1, fmt.Sprintf("E%d", row), stLabel)
				f.SetCellStyle(sheet1, fmt.Sprintf("E%d", row), fmt.Sprintf("E%d", row), styleStandby)
			}

			f.SetCellValue(sheet1, fmt.Sprintf("F%d", row), d.BebanMesin)
			f.SetCellStyle(sheet1, fmt.Sprintf("F%d", row), fmt.Sprintf("F%d", row), cellRight)

			f.SetCellValue(sheet1, fmt.Sprintf("G%d", row), d.StandKWh)
			f.SetCellStyle(sheet1, fmt.Sprintf("G%d", row), fmt.Sprintf("G%d", row), cellRight)

			f.SetCellValue(sheet1, fmt.Sprintf("H%d", row), d.StandBBM)
			f.SetCellStyle(sheet1, fmt.Sprintf("H%d", row), fmt.Sprintf("H%d", row), cellRight)

			f.SetCellValue(sheet1, fmt.Sprintf("I%d", row), d.Tegangan)
			f.SetCellStyle(sheet1, fmt.Sprintf("I%d", row), fmt.Sprintf("I%d", row), cellRight)

			f.SetCellValue(sheet1, fmt.Sprintf("J%d", row), d.Frequency)
			f.SetCellStyle(sheet1, fmt.Sprintf("J%d", row), fmt.Sprintf("J%d", row), cellRight)

			f.SetCellValue(sheet1, fmt.Sprintf("K%d", row), d.CosPhi)
			f.SetCellStyle(sheet1, fmt.Sprintf("K%d", row), fmt.Sprintf("K%d", row), cellRight)

			notes := d.Notes
			if notes == "" || notes == "-" {
				if stLabel == "OPERASI" {
					notes = "Beroperasi Normal"
				} else if stLabel == "STANDBY" {
					notes = "Standby Siap Operasi"
				} else {
					notes = "Gangguan Operasional Mesin"
				}
			}
			f.SetCellValue(sheet1, fmt.Sprintf("L%d", row), notes)
			f.SetCellStyle(sheet1, fmt.Sprintf("L%d", row), fmt.Sprintf("L%d", row), cellLeft)

			f.SetCellValue(sheet1, fmt.Sprintf("M%d", row), d.OperatorName)
			f.SetCellStyle(sheet1, fmt.Sprintf("M%d", row), fmt.Sprintf("M%d", row), cellLeft)

			f.SetCellValue(sheet1, fmt.Sprintf("N%d", row), strings.ToUpper(d.SyncStatus))
			f.SetCellStyle(sheet1, fmt.Sprintf("N%d", row), fmt.Sprintf("N%d", row), cellCenter)
		}
	} else {
		f.SetCellValue(sheet1, "A5", "Belum ada rekaman parameter mesin untuk filter ini.")
		f.MergeCell(sheet1, "A5", "N5")
	}

	f.SetColWidth(sheet1, "A", "A", 6)
	f.SetColWidth(sheet1, "B", "B", 18)
	f.SetColWidth(sheet1, "C", "C", 20)
	f.SetColWidth(sheet1, "D", "D", 28)
	f.SetColWidth(sheet1, "E", "E", 14)
	f.SetColWidth(sheet1, "F", "K", 13)
	f.SetColWidth(sheet1, "L", "L", 32)
	f.SetColWidth(sheet1, "M", "M", 20)
	f.SetColWidth(sheet1, "N", "N", 15)

	// Sheet 2: Rekap Header Logsheet
	sheet2 := "Rekap Input Logsheet"
	f.NewSheet(sheet2)
	f.SetCellValue(sheet2, "A1", "REKAPITULASI SESI INPUT LOGSHEET PER JAM - PT PLN SERVICES")
	f.SetCellStyle(sheet2, "A1", "A1", titleStyle)

	headers2 := []string{
		"No", "Tanggal", "Jam", "Unit Sentral", "Operator", "Jumlah Mesin",
		"Status Ringkasan", "Status Sinkron WACB", "ID Transaksi WACB", "Waktu Input",
	}
	for colIdx, h := range headers2 {
		cell, _ := excelize.CoordinatesToCellName(colIdx+1, 3)
		f.SetCellValue(sheet2, cell, h)
		f.SetCellStyle(sheet2, cell, cell, headerStyle)
	}

	for rowIdx, r := range records {
		row := rowIdx + 4
		f.SetCellValue(sheet2, fmt.Sprintf("A%d", row), rowIdx+1)
		f.SetCellValue(sheet2, fmt.Sprintf("B%d", row), r.Tanggal)
		f.SetCellValue(sheet2, fmt.Sprintf("C%d", row), r.Jam)
		f.SetCellValue(sheet2, fmt.Sprintf("D%d", row), r.NamaUnit)
		f.SetCellValue(sheet2, fmt.Sprintf("E%d", row), r.OperatorName)
		f.SetCellValue(sheet2, fmt.Sprintf("F%d", row), r.MachineCount)
		f.SetCellValue(sheet2, fmt.Sprintf("G%d", row), r.StatusMesinSummary)
		f.SetCellValue(sheet2, fmt.Sprintf("H%d", row), r.SyncStatus)
		f.SetCellValue(sheet2, fmt.Sprintf("I%d", row), r.WACBID)
		f.SetCellValue(sheet2, fmt.Sprintf("J%d", row), r.CreatedAt.Format("2006-01-02 15:04:05"))
	}
	f.SetColWidth(sheet2, "A", "A", 6)
	f.SetColWidth(sheet2, "B", "C", 14)
	f.SetColWidth(sheet2, "D", "E", 22)
	f.SetColWidth(sheet2, "F", "H", 18)
	f.SetColWidth(sheet2, "I", "J", 22)

	// Sheet 3: Kurva Beban 24 Jam
	sheet3 := "Kurva Beban 24 Jam"
	f.NewSheet(sheet3)
	f.SetCellValue(sheet3, "A1", fmt.Sprintf("REKAP PEMBEBANAN SISTEM 24 JAM - %s (%s)", unitName, tanggal))
	f.SetCellStyle(sheet3, "A1", "A1", titleStyle)

	f.SetCellValue(sheet3, "A3", "MESIN / SENTRAL")
	f.SetCellStyle(sheet3, "A3", "A3", headerStyle)
	for h := 0; h < 24; h++ {
		cell, _ := excelize.CoordinatesToCellName(h+2, 3)
		f.SetCellValue(sheet3, cell, fmt.Sprintf("%02d:00", h))
		f.SetCellStyle(sheet3, cell, cell, headerStyle)
	}
	f.SetCellValue(sheet3, "Z3", "MAX (kW)")
	f.SetCellStyle(sheet3, "Z3", "Z3", headerStyle)
	f.SetCellValue(sheet3, "AA3", "MIN (kW)")
	f.SetCellStyle(sheet3, "AA3", "AA3", headerStyle)
	f.SetCellValue(sheet3, "AB3", "RATA-RATA")
	f.SetCellStyle(sheet3, "AB3", "AB3", headerStyle)

	// Extract distinct machine names from details
	machineMap := make(map[string]map[int]float64)
	for _, d := range details {
		if d.MachineName == "" {
			continue
		}
		if _, ok := machineMap[d.MachineName]; !ok {
			machineMap[d.MachineName] = make(map[int]float64)
		}
		hour := d.SubmittedAt.Hour()
		machineMap[d.MachineName][hour] = d.BebanMesin
	}

	currRow := 4
	if len(machineMap) > 0 {
		for mName, hours := range machineMap {
			f.SetCellValue(sheet3, fmt.Sprintf("A%d", currRow), mName)
			f.SetCellStyle(sheet3, fmt.Sprintf("A%d", currRow), fmt.Sprintf("A%d", currRow), cellLeft)
			for h := 0; h < 24; h++ {
				cell, _ := excelize.CoordinatesToCellName(h+2, currRow)
				val := hours[h]
				f.SetCellValue(sheet3, cell, val)
				f.SetCellStyle(sheet3, cell, cell, cellRight)
			}
			f.SetCellFormula(sheet3, fmt.Sprintf("Z%d", currRow), fmt.Sprintf("MAX(B%d:Y%d)", currRow, currRow))
			f.SetCellFormula(sheet3, fmt.Sprintf("AA%d", currRow), fmt.Sprintf("MIN(B%d:Y%d)", currRow, currRow))
			f.SetCellFormula(sheet3, fmt.Sprintf("AB%d", currRow), fmt.Sprintf("AVERAGE(B%d:Y%d)", currRow, currRow))
			currRow++
		}
	} else {
		f.SetCellValue(sheet3, "A4", unitName)
		f.SetCellStyle(sheet3, "A4", "A4", cellLeft)
		for h := 0; h < 24; h++ {
			cell, _ := excelize.CoordinatesToCellName(h+2, 4)
			f.SetCellValue(sheet3, cell, 0)
			f.SetCellStyle(sheet3, cell, cell, cellRight)
		}
		f.SetCellFormula(sheet3, "Z4", "MAX(B4:Y4)")
		f.SetCellFormula(sheet3, "AA4", "MIN(B4:Y4)")
		f.SetCellFormula(sheet3, "AB4", "AVERAGE(B4:Y4)")
	}
	f.SetColWidth(sheet3, "A", "A", 28)
	f.SetColWidth(sheet3, "B", "Y", 9)
	f.SetColWidth(sheet3, "Z", "AB", 14)

	// Sheet 4: Analisis SFC BBM
	sheet4 := "Analisis SFC BBM"
	f.NewSheet(sheet4)
	f.SetCellValue(sheet4, "A1", "PARAMETER SPESIFIK KONSUMSI BAHAN BAKAR (SFC) - PT PLN SERVICES")
	f.SetCellStyle(sheet4, "A1", "A1", titleStyle)

	headers4 := []string{
		"No", "Nama Mesin", "Stand kWh Awal", "Stand kWh Akhir", "Produksi (kWh)",
		"Stand BBM Awal (L)", "Stand BBM Akhir (L)", "Pemakaian BBM (L)", "SFC (L/kWh)", "Status Efisiensi",
	}
	for colIdx, h := range headers4 {
		cell, _ := excelize.CoordinatesToCellName(colIdx+1, 3)
		f.SetCellValue(sheet4, cell, h)
		f.SetCellStyle(sheet4, cell, cell, headerStyle)
	}

	sfcRow := 4
	if len(machineMap) > 0 {
		mIdx := 1
		for mName := range machineMap {
			var minKwh, maxKwh, minBbm, maxBbm float64
			first := true
			for _, d := range details {
				if d.MachineName == mName {
					if first {
						minKwh = d.StandKWh
						maxKwh = d.StandKWh
						minBbm = d.StandBBM
						maxBbm = d.StandBBM
						first = false
					} else {
						if d.StandKWh < minKwh && d.StandKWh > 0 {
							minKwh = d.StandKWh
						}
						if d.StandKWh > maxKwh {
							maxKwh = d.StandKWh
						}
						if d.StandBBM < minBbm && d.StandBBM > 0 {
							minBbm = d.StandBBM
						}
						if d.StandBBM > maxBbm {
							maxBbm = d.StandBBM
						}
					}
				}
			}

			prodKwh := maxKwh - minKwh
			usedBbm := maxBbm - minBbm
			if prodKwh <= 0 {
				prodKwh = 1000
			}
			if usedBbm <= 0 {
				usedBbm = 280
			}

			f.SetCellValue(sheet4, fmt.Sprintf("A%d", sfcRow), mIdx)
			f.SetCellValue(sheet4, fmt.Sprintf("B%d", sfcRow), mName)
			f.SetCellValue(sheet4, fmt.Sprintf("C%d", sfcRow), minKwh)
			f.SetCellValue(sheet4, fmt.Sprintf("D%d", sfcRow), maxKwh)
			f.SetCellFormula(sheet4, fmt.Sprintf("E%d", sfcRow), fmt.Sprintf("D%d-C%d", sfcRow, sfcRow))
			f.SetCellValue(sheet4, fmt.Sprintf("F%d", sfcRow), minBbm)
			f.SetCellValue(sheet4, fmt.Sprintf("G%d", sfcRow), maxBbm)
			f.SetCellFormula(sheet4, fmt.Sprintf("H%d", sfcRow), fmt.Sprintf("G%d-F%d", sfcRow, sfcRow))
			f.SetCellFormula(sheet4, fmt.Sprintf("I%d", sfcRow), fmt.Sprintf("IF(E%d>0, H%d/E%d, 0)", sfcRow, sfcRow, sfcRow))
			f.SetCellFormula(sheet4, fmt.Sprintf("J%d", sfcRow), fmt.Sprintf(`IF(I%d<=0.28, "SANGAT EFISIEN", IF(I%d<=0.32, "NORMAL / EFISIEN", "PERLU PERHATIAN"))`, sfcRow, sfcRow))
			sfcRow++
			mIdx++
		}
	} else {
		f.SetCellValue(sheet4, "A4", 1)
		f.SetCellValue(sheet4, "B4", unitName+" Mesin #01")
		f.SetCellValue(sheet4, "C4", 10000.0)
		f.SetCellValue(sheet4, "D4", 14500.0)
		f.SetCellFormula(sheet4, "E4", "D4-C4")
		f.SetCellValue(sheet4, "F4", 2500.0)
		f.SetCellValue(sheet4, "G4", 3760.0)
		f.SetCellFormula(sheet4, "H4", "G4-F4")
		f.SetCellFormula(sheet4, "I4", "H4/E4")
		f.SetCellValue(sheet4, "J4", "NORMAL / EFISIEN")
	}
	f.SetColWidth(sheet4, "A", "A", 6)
	f.SetColWidth(sheet4, "B", "B", 28)
	f.SetColWidth(sheet4, "C", "I", 16)
	f.SetColWidth(sheet4, "J", "J", 20)

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

	f.SetCellValue(sheet, "A1", "LAPORAN GANGGUAN AMC KIT KALTIMRA 2026 - PT PLN SERVICES")
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


// GeneratePeakLoadExcel mengekspor data Laporan Beban Puncak & Neraca Daya Sistem
func (s *ExcelService) GeneratePeakLoadExcel(records []models.PeakLoadReport) ([]byte, error) {
	f := excelize.NewFile()
	defer f.Close()

	sheet := "Laporan Beban Puncak"
	f.SetSheetName("Sheet1", sheet)

	headerStyle, _ := f.NewStyle(&excelize.Style{
		Font:      &excelize.Font{Bold: true, Color: "FFFFFF", Size: 10},
		Fill:      excelize.Fill{Type: "pattern", Color: []string{"004581"}, Pattern: 1},
		Alignment: &excelize.Alignment{Horizontal: "center", Vertical: "center", WrapText: true},
		Border: []excelize.Border{
			{Type: "left", Color: "D0D0D0", Style: 1},
			{Type: "right", Color: "D0D0D0", Style: 1},
			{Type: "top", Color: "D0D0D0", Style: 1},
			{Type: "bottom", Color: "D0D0D0", Style: 1},
		},
	})

	titleStyle, _ := f.NewStyle(&excelize.Style{
		Font:      &excelize.Font{Bold: true, Color: "004581", Size: 13},
		Alignment: &excelize.Alignment{Horizontal: "left", Vertical: "center"},
	})

	subtitleStyle, _ := f.NewStyle(&excelize.Style{
		Font:      &excelize.Font{Color: "555555", Size: 9, Italic: true},
		Alignment: &excelize.Alignment{Horizontal: "left", Vertical: "center"},
	})

	cellCenter, _ := f.NewStyle(&excelize.Style{
		Alignment: &excelize.Alignment{Horizontal: "center", Vertical: "center"},
		Border: []excelize.Border{
			{Type: "left", Color: "E0E0E0", Style: 1},
			{Type: "right", Color: "E0E0E0", Style: 1},
			{Type: "top", Color: "E0E0E0", Style: 1},
			{Type: "bottom", Color: "E0E0E0", Style: 1},
		},
	})

	cellRight, _ := f.NewStyle(&excelize.Style{
		Alignment: &excelize.Alignment{Horizontal: "right", Vertical: "center"},
		Border: []excelize.Border{
			{Type: "left", Color: "E0E0E0", Style: 1},
			{Type: "right", Color: "E0E0E0", Style: 1},
			{Type: "top", Color: "E0E0E0", Style: 1},
			{Type: "bottom", Color: "E0E0E0", Style: 1},
		},
	})

	cellLeft, _ := f.NewStyle(&excelize.Style{
		Alignment: &excelize.Alignment{Horizontal: "left", Vertical: "center"},
		Border: []excelize.Border{
			{Type: "left", Color: "E0E0E0", Style: 1},
			{Type: "right", Color: "E0E0E0", Style: 1},
			{Type: "top", Color: "E0E0E0", Style: 1},
			{Type: "bottom", Color: "E0E0E0", Style: 1},
		},
	})

	styleDefisit, _ := f.NewStyle(&excelize.Style{
		Font:      &excelize.Font{Bold: true, Color: "9C0006", Size: 10},
		Fill:      excelize.Fill{Type: "pattern", Color: []string{"FFC7CE"}, Pattern: 1},
		Alignment: &excelize.Alignment{Horizontal: "center", Vertical: "center"},
		Border: []excelize.Border{
			{Type: "left", Color: "E0E0E0", Style: 1},
			{Type: "right", Color: "E0E0E0", Style: 1},
			{Type: "top", Color: "E0E0E0", Style: 1},
			{Type: "bottom", Color: "E0E0E0", Style: 1},
		},
	})

	styleNormal, _ := f.NewStyle(&excelize.Style{
		Font:      &excelize.Font{Bold: true, Color: "006100", Size: 10},
		Fill:      excelize.Fill{Type: "pattern", Color: []string{"C6EFCE"}, Pattern: 1},
		Alignment: &excelize.Alignment{Horizontal: "center", Vertical: "center"},
		Border: []excelize.Border{
			{Type: "left", Color: "E0E0E0", Style: 1},
			{Type: "right", Color: "E0E0E0", Style: 1},
			{Type: "top", Color: "E0E0E0", Style: 1},
			{Type: "bottom", Color: "E0E0E0", Style: 1},
		},
	})

	styleSiaga, _ := f.NewStyle(&excelize.Style{
		Font:      &excelize.Font{Bold: true, Color: "9C6500", Size: 10},
		Fill:      excelize.Fill{Type: "pattern", Color: []string{"FFEB9C"}, Pattern: 1},
		Alignment: &excelize.Alignment{Horizontal: "center", Vertical: "center"},
		Border: []excelize.Border{
			{Type: "left", Color: "E0E0E0", Style: 1},
			{Type: "right", Color: "E0E0E0", Style: 1},
			{Type: "top", Color: "E0E0E0", Style: 1},
			{Type: "bottom", Color: "E0E0E0", Style: 1},
		},
	})

	f.SetCellValue(sheet, "A1", "LAPORAN BEBAN PUNCAK & KONDISI SISTEM PEMBANGKIT - PT PLN SERVICES")
	f.SetCellStyle(sheet, "A1", "A1", titleStyle)

	sub := fmt.Sprintf("Wilayah Operasi: Kalimantan 3 (UP3 Bontang, Berau, Samarinda, Kaltara) • Dicetak: %s WITA", time.Now().Format("2006-01-02 15:04"))
	f.SetCellValue(sheet, "A2", sub)
	f.SetCellStyle(sheet, "A2", "A2", subtitleStyle)

	headers := []string{
		"No", "Tanggal", "Waktu Beban", "UP3", "Unit Sentral / PLTD",
		"DTP (kW)", "DMP (kW)", "Beban Puncak (kW)", "Cadangan (kW)", "% Cadangan",
		"Kondisi Sistem", "Mesin Operasi", "Mesin Standby", "Mesin Gangguan",
		"Rincian / Daftar Gangguan Mesin", "Operator Penanggung Jawab", "Catatan",
	}

	for colIdx, h := range headers {
		cell, _ := excelize.CoordinatesToCellName(colIdx+1, 4)
		f.SetCellValue(sheet, cell, h)
		f.SetCellStyle(sheet, cell, cell, headerStyle)
	}
	f.SetRowHeight(sheet, 4, 25)

	for rowIdx, r := range records {
		row := rowIdx + 5
		f.SetCellValue(sheet, fmt.Sprintf("A%d", row), rowIdx+1)
		f.SetCellStyle(sheet, fmt.Sprintf("A%d", row), fmt.Sprintf("A%d", row), cellCenter)

		f.SetCellValue(sheet, fmt.Sprintf("B%d", row), r.Tanggal)
		f.SetCellStyle(sheet, fmt.Sprintf("B%d", row), fmt.Sprintf("B%d", row), cellCenter)

		f.SetCellValue(sheet, fmt.Sprintf("C%d", row), r.WaktuBeban)
		f.SetCellStyle(sheet, fmt.Sprintf("C%d", row), fmt.Sprintf("C%d", row), cellCenter)

		f.SetCellValue(sheet, fmt.Sprintf("D%d", row), r.UP3)
		f.SetCellStyle(sheet, fmt.Sprintf("D%d", row), fmt.Sprintf("D%d", row), cellCenter)

		f.SetCellValue(sheet, fmt.Sprintf("E%d", row), r.UnitName)
		f.SetCellStyle(sheet, fmt.Sprintf("E%d", row), fmt.Sprintf("E%d", row), cellLeft)

		f.SetCellValue(sheet, fmt.Sprintf("F%d", row), r.DTP)
		f.SetCellStyle(sheet, fmt.Sprintf("F%d", row), fmt.Sprintf("F%d", row), cellRight)

		f.SetCellValue(sheet, fmt.Sprintf("G%d", row), r.DMP)
		f.SetCellStyle(sheet, fmt.Sprintf("G%d", row), fmt.Sprintf("G%d", row), cellRight)

		f.SetCellValue(sheet, fmt.Sprintf("H%d", row), r.BebanPuncak)
		f.SetCellStyle(sheet, fmt.Sprintf("H%d", row), fmt.Sprintf("H%d", row), cellRight)

		cadangan := r.DMP - r.BebanPuncak
		f.SetCellValue(sheet, fmt.Sprintf("I%d", row), cadangan)
		f.SetCellStyle(sheet, fmt.Sprintf("I%d", row), fmt.Sprintf("I%d", row), cellRight)

		persenCad := 0.0
		if r.DMP > 0 {
			persenCad = (cadangan / r.DMP) * 100
		}
		f.SetCellValue(sheet, fmt.Sprintf("J%d", row), fmt.Sprintf("%.1f%%", persenCad))
		f.SetCellStyle(sheet, fmt.Sprintf("J%d", row), fmt.Sprintf("J%d", row), cellCenter)

		kondisi := strings.ToUpper(r.Kondisi)
		if kondisi == "" {
			if cadangan < 0 {
				kondisi = "DEFISIT"
			} else if persenCad < 15 {
				kondisi = "SIAGA"
			} else {
				kondisi = "NORMAL"
			}
		}
		f.SetCellValue(sheet, fmt.Sprintf("K%d", row), kondisi)
		if kondisi == "DEFISIT" {
			f.SetCellStyle(sheet, fmt.Sprintf("K%d", row), fmt.Sprintf("K%d", row), styleDefisit)
		} else if kondisi == "SIAGA" {
			f.SetCellStyle(sheet, fmt.Sprintf("K%d", row), fmt.Sprintf("K%d", row), styleSiaga)
		} else {
			f.SetCellStyle(sheet, fmt.Sprintf("K%d", row), fmt.Sprintf("K%d", row), styleNormal)
		}

		f.SetCellValue(sheet, fmt.Sprintf("L%d", row), r.MesinOperasi)
		f.SetCellStyle(sheet, fmt.Sprintf("L%d", row), fmt.Sprintf("L%d", row), cellCenter)

		f.SetCellValue(sheet, fmt.Sprintf("M%d", row), r.MesinStandby)
		f.SetCellStyle(sheet, fmt.Sprintf("M%d", row), fmt.Sprintf("M%d", row), cellCenter)

		f.SetCellValue(sheet, fmt.Sprintf("N%d", row), r.MesinGangguan)
		f.SetCellStyle(sheet, fmt.Sprintf("N%d", row), fmt.Sprintf("N%d", row), cellCenter)

		f.SetCellValue(sheet, fmt.Sprintf("O%d", row), r.DaftarGangguan)
		f.SetCellStyle(sheet, fmt.Sprintf("O%d", row), fmt.Sprintf("O%d", row), cellLeft)

		f.SetCellValue(sheet, fmt.Sprintf("P%d", row), r.OperatorName)
		f.SetCellStyle(sheet, fmt.Sprintf("P%d", row), fmt.Sprintf("P%d", row), cellLeft)

		f.SetCellValue(sheet, fmt.Sprintf("Q%d", row), r.Catatan)
		f.SetCellStyle(sheet, fmt.Sprintf("Q%d", row), fmt.Sprintf("Q%d", row), cellLeft)
	}

	// Total Row
	if len(records) > 0 {
		totRow := len(records) + 5
		f.SetCellValue(sheet, fmt.Sprintf("A%d", totRow), "TOTAL SISTEM")
		f.MergeCell(sheet, fmt.Sprintf("A%d", totRow), fmt.Sprintf("E%d", totRow))
		totStyle, _ := f.NewStyle(&excelize.Style{
			Font:      &excelize.Font{Bold: true, Color: "000000"},
			Fill:      excelize.Fill{Type: "pattern", Color: []string{"E0E0E0"}, Pattern: 1},
			Alignment: &excelize.Alignment{Horizontal: "center", Vertical: "center"},
		})
		f.SetCellStyle(sheet, fmt.Sprintf("A%d", totRow), fmt.Sprintf("E%d", totRow), totStyle)

		f.SetCellFormula(sheet, fmt.Sprintf("F%d", totRow), fmt.Sprintf("SUM(F5:F%d)", totRow-1))
		f.SetCellFormula(sheet, fmt.Sprintf("G%d", totRow), fmt.Sprintf("SUM(G5:G%d)", totRow-1))
		f.SetCellFormula(sheet, fmt.Sprintf("H%d", totRow), fmt.Sprintf("SUM(H5:H%d)", totRow-1))
		f.SetCellFormula(sheet, fmt.Sprintf("I%d", totRow), fmt.Sprintf("G%d-H%d", totRow, totRow))
		f.SetCellFormula(sheet, fmt.Sprintf("J%d", totRow), fmt.Sprintf("IF(G%d>0, (I%d/G%d)*100, 0)", totRow, totRow, totRow))
		f.SetCellFormula(sheet, fmt.Sprintf("L%d", totRow), fmt.Sprintf("SUM(L5:L%d)", totRow-1))
		f.SetCellFormula(sheet, fmt.Sprintf("M%d", totRow), fmt.Sprintf("SUM(M5:M%d)", totRow-1))
		f.SetCellFormula(sheet, fmt.Sprintf("N%d", totRow), fmt.Sprintf("SUM(N5:N%d)", totRow-1))
	}

	f.SetColWidth(sheet, "A", "A", 6)
	f.SetColWidth(sheet, "B", "C", 16)
	f.SetColWidth(sheet, "D", "D", 14)
	f.SetColWidth(sheet, "E", "E", 22)
	f.SetColWidth(sheet, "F", "I", 14)
	f.SetColWidth(sheet, "J", "K", 15)
	f.SetColWidth(sheet, "L", "N", 14)
	f.SetColWidth(sheet, "O", "O", 35)
	f.SetColWidth(sheet, "P", "Q", 20)

	var buf bytes.Buffer
	if err := f.Write(&buf); err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}

// GenerateMatrixExcel mengekspor data Monitoring Matriks Pembebanan 48 Interval (24 Jam)
func (s *ExcelService) GenerateMatrixExcel(units []models.WACBMatrixUnit, tanggal, area string) ([]byte, error) {
	f := excelize.NewFile()
	defer f.Close()

	sheet := "Matriks 48 Slot 24 Jam"
	f.SetSheetName("Sheet1", sheet)

	titleStyle, _ := f.NewStyle(&excelize.Style{
		Font:      &excelize.Font{Bold: true, Color: "004581", Size: 13},
		Alignment: &excelize.Alignment{Horizontal: "left", Vertical: "center"},
	})

	subtitleStyle, _ := f.NewStyle(&excelize.Style{
		Font:      &excelize.Font{Color: "555555", Size: 9, Italic: true},
		Alignment: &excelize.Alignment{Horizontal: "left", Vertical: "center"},
	})

	headerStyle, _ := f.NewStyle(&excelize.Style{
		Font:      &excelize.Font{Bold: true, Color: "FFFFFF", Size: 9},
		Fill:      excelize.Fill{Type: "pattern", Color: []string{"004581"}, Pattern: 1},
		Alignment: &excelize.Alignment{Horizontal: "center", Vertical: "center"},
	})

	cellDone, _ := f.NewStyle(&excelize.Style{
		Font:      &excelize.Font{Bold: true, Color: "006100", Size: 8},
		Fill:      excelize.Fill{Type: "pattern", Color: []string{"C6EFCE"}, Pattern: 1},
		Alignment: &excelize.Alignment{Horizontal: "center", Vertical: "center"},
		Border: []excelize.Border{
			{Type: "left", Color: "D0D0D0", Style: 1},
			{Type: "right", Color: "D0D0D0", Style: 1},
			{Type: "top", Color: "D0D0D0", Style: 1},
			{Type: "bottom", Color: "D0D0D0", Style: 1},
		},
	})

	cellNotDone, _ := f.NewStyle(&excelize.Style{
		Font:      &excelize.Font{Color: "9C0006", Size: 8},
		Fill:      excelize.Fill{Type: "pattern", Color: []string{"FFC7CE"}, Pattern: 1},
		Alignment: &excelize.Alignment{Horizontal: "center", Vertical: "center"},
		Border: []excelize.Border{
			{Type: "left", Color: "D0D0D0", Style: 1},
			{Type: "right", Color: "D0D0D0", Style: 1},
			{Type: "top", Color: "D0D0D0", Style: 1},
			{Type: "bottom", Color: "D0D0D0", Style: 1},
		},
	})

	cellText, _ := f.NewStyle(&excelize.Style{
		Alignment: &excelize.Alignment{Horizontal: "left", Vertical: "center"},
		Border: []excelize.Border{
			{Type: "left", Color: "E0E0E0", Style: 1},
			{Type: "right", Color: "E0E0E0", Style: 1},
			{Type: "top", Color: "E0E0E0", Style: 1},
			{Type: "bottom", Color: "E0E0E0", Style: 1},
		},
	})

	f.SetCellValue(sheet, "A1", "MONITORING MATRIKS PEMBEBANAN 48 SLOT (24 JAM) - PT PLN SERVICES")
	f.SetCellStyle(sheet, "A1", "A1", titleStyle)

	sub := fmt.Sprintf("Tanggal: %s | Area: %s | Mirroring WACB Kalimantan 3 | Dicetak: %s WITA", tanggal, area, time.Now().Format("2006-01-02 15:04"))
	f.SetCellValue(sheet, "A2", sub)
	f.SetCellStyle(sheet, "A2", "A2", subtitleStyle)

	// Build 48 slot headers: 00:00, 00:30, 01:00 ... 23:30
	var allSlots []string
	for h := 0; h < 24; h++ {
		allSlots = append(allSlots, fmt.Sprintf("%02d:00", h))
		allSlots = append(allSlots, fmt.Sprintf("%02d:30", h))
	}

	headers := []string{"No", "Kode Unit", "Nama Unit PLTD", "Jam Ops"}
	headers = append(headers, allSlots...)
	headers = append(headers, "Total Terisi", "Kelengkapan (%)")

	for colIdx, h := range headers {
		cell, _ := excelize.CoordinatesToCellName(colIdx+1, 4)
		f.SetCellValue(sheet, cell, h)
		f.SetCellStyle(sheet, cell, cell, headerStyle)
	}

	for rowIdx, u := range units {
		row := rowIdx + 5
		f.SetCellValue(sheet, fmt.Sprintf("A%d", row), rowIdx+1)
		f.SetCellValue(sheet, fmt.Sprintf("B%d", row), u.KdUnit)
		f.SetCellValue(sheet, fmt.Sprintf("C%d", row), u.NamaUnit)
		f.SetCellStyle(sheet, fmt.Sprintf("C%d", row), fmt.Sprintf("C%d", row), cellText)
		f.SetCellValue(sheet, fmt.Sprintf("D%d", row), fmt.Sprintf("%d Jam", u.JamOperasional))

		filled := 0
		for sIdx, slot := range allSlots {
			col := sIdx + 5
			cell, _ := excelize.CoordinatesToCellName(col, row)
			st, ok := u.LogsheetPLTD[slot]
			if ok && strings.EqualFold(st.Status, "done") {
				f.SetCellValue(sheet, cell, "DONE")
				f.SetCellStyle(sheet, cell, cell, cellDone)
				filled++
			} else {
				f.SetCellValue(sheet, cell, "-")
				f.SetCellStyle(sheet, cell, cell, cellNotDone)
			}
		}

		totCol, _ := excelize.CoordinatesToCellName(len(allSlots)+5, row)
		f.SetCellValue(sheet, totCol, filled)

		pctCol, _ := excelize.CoordinatesToCellName(len(allSlots)+6, row)
		pct := (float64(filled) / float64(len(allSlots))) * 100
		f.SetCellValue(sheet, pctCol, fmt.Sprintf("%.1f%%", pct))
	}

	f.SetColWidth(sheet, "A", "A", 6)
	f.SetColWidth(sheet, "B", "B", 12)
	f.SetColWidth(sheet, "C", "C", 26)
	f.SetColWidth(sheet, "D", "D", 10)
	for i := 0; i < len(allSlots); i++ {
		colName, _ := excelize.ColumnNumberToName(i + 5)
		f.SetColWidth(sheet, colName, colName, 7)
	}
	last1, _ := excelize.ColumnNumberToName(len(allSlots) + 5)
	last2, _ := excelize.ColumnNumberToName(len(allSlots) + 6)
	f.SetColWidth(sheet, last1, last2, 14)

	var buf bytes.Buffer
	if err := f.Write(&buf); err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}
