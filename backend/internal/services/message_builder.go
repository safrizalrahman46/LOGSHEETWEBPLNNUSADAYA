package services

import (
	"fmt"
	"strings"

	"pln-logsheet-backend/internal/models"
)

type MessageBuilder struct{}

func NewMessageBuilder() *MessageBuilder {
	return &MessageBuilder{}
}

func (mb *MessageBuilder) BuildMessageText(req *models.BatchLogsheetRequest) string {
	var sb strings.Builder

	// Header Laporan
	sb.WriteString("LAPORAN LOGSHEET PLTD\n")
	sb.WriteString(fmt.Sprintf("%s\n", req.NamaUnit))
	sb.WriteString(fmt.Sprintf("id unit: %s\n", req.KdUnit))
	sb.WriteString(fmt.Sprintf("tgl : %s\n", req.Tanggal))
	sb.WriteString(fmt.Sprintf("jam : %s\n", req.Jam))
	sb.WriteString(fmt.Sprintf("nama operator: %s\n", req.OperatorName))

	// Detail Tiap Mesin
	for i, m := range req.Machines {
		sb.WriteString("\n")
		nomor := m.Nomor
		if nomor <= 0 {
			nomor = i + 1
		}

		status := strings.ToUpper(strings.TrimSpace(m.StatusMesin))
		if status == "" {
			status = "OPERASI"
		} else if strings.Contains(status, "GANGGUAN") || strings.Contains(status, "RUSAK") {
			status = "GANGGUAN"
		} else if strings.Contains(status, "STANDBY") {
			status = "STANDBY"
		}

		fuel := m.KdJenisBahanBakar
		if fuel == "" {
			fuel = "B35"
		}

		sb.WriteString(fmt.Sprintf("%d. %s\n", nomor, m.NamaMesin))
		sb.WriteString(fmt.Sprintf("id mesin: %s\n", m.IdMesin))
		sb.WriteString(fmt.Sprintf("kode mesin: %s\n", m.KodeMesinSilm))
		sb.WriteString(fmt.Sprintf("sn: %s\n", m.Sn))
		sb.WriteString(fmt.Sprintf("dt: %d\n", m.Dt))

		dayaMampu := m.DayaMampu
		if dayaMampu == "" {
			dayaMampu = fmt.Sprintf("%d", m.Dt)
		}
		sb.WriteString(fmt.Sprintf("daya mampu: %s\n", dayaMampu))

		if status == "STANDBY" || status == "GANGGUAN" {
			sb.WriteString("beban: 0\n")
			sb.WriteString(fmt.Sprintf("stand kwh: %.1f\n", m.StandKwh))
			sb.WriteString(fmt.Sprintf("stand bbm: %.1f\n", m.StandBbm))
			sb.WriteString("phasa r: 0\n")
			sb.WriteString("phasa s: 0\n")
			sb.WriteString("phasa t: 0\n")
			sb.WriteString("tek oli: 0\n")
			sb.WriteString("temp air pendingin: 0\n")
			sb.WriteString("tegangan: 0\n")
			sb.WriteString("frequency: 0\n")
			sb.WriteString("cos phi: 0\n")
		} else {
			sb.WriteString(fmt.Sprintf("beban: %.1f\n", m.Beban))
			sb.WriteString(fmt.Sprintf("stand kwh: %.1f\n", m.StandKwh))
			sb.WriteString(fmt.Sprintf("stand bbm: %.1f\n", m.StandBbm))
			sb.WriteString(fmt.Sprintf("phasa r: %.1f\n", m.PhasaR))
			sb.WriteString(fmt.Sprintf("phasa s: %.1f\n", m.PhasaS))
			sb.WriteString(fmt.Sprintf("phasa t: %.1f\n", m.PhasaT))
			sb.WriteString(fmt.Sprintf("tek oli: %.2f\n", m.TekOli))
			sb.WriteString(fmt.Sprintf("temp air pendingin: %.1f\n", m.TempAir))
			sb.WriteString(fmt.Sprintf("tegangan: %.1f\n", m.Tegangan))
			sb.WriteString(fmt.Sprintf("frequency: %.2f\n", m.Frequency))
			sb.WriteString(fmt.Sprintf("cos phi: %.2f\n", m.CosPhi))
		}

		jkmStr := ""
		if m.JamKerjaMesin > 0 {
			jkmStr = fmt.Sprintf("%.1f", m.JamKerjaMesin)
		}
		sb.WriteString(fmt.Sprintf("jam kerja mesin: %s\n", jkmStr))
		sb.WriteString(fmt.Sprintf("status mesin: %s\n", status))
		sb.WriteString("Kwh produksi : \n")
		sb.WriteString("pemakaian bbm : \n")
		sb.WriteString(fmt.Sprintf("jenis bahan bakar : %s\n", fuel))

		notes := strings.TrimSpace(m.Keterangan)
		if notes == "" {
			if status == "STANDBY" {
				notes = "Mesin Siaga"
			} else if status == "GANGGUAN" {
				notes = "Mesin Gangguan"
			} else {
				notes = "Beroperasi Normal"
			}
		}
		sb.WriteString(fmt.Sprintf("ket: %s", notes))
	}

	return sb.String()
}
