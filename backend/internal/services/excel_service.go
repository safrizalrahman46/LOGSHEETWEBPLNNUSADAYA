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
