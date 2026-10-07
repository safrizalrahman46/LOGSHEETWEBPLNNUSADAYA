package models

// WACB Login Response
type WACBLoginResponse struct {
	User      WACBUser `json:"user"`
	Token     string   `json:"token"`
	TokenType string   `json:"token_type"`
}

type WACBUser struct {
	ID       int    `json:"id"`
	Name     string `json:"name"`
	Username string `json:"username"`
	Email    string `json:"email"`
	KdRegion string `json:"kd_region"`
}

// WACB Format Logsheet
type WACBFormatResponse struct {
	Message string          `json:"message"`
	Filters WACBFilters     `json:"filters"`
	Units   []WACBUnitItem  `json:"units,omitempty"`
	Unit    *WACBUnitItem   `json:"unit,omitempty"`
	Format  *WACBFormatData `json:"format,omitempty"`
}

type WACBFilters struct {
	KdRegion string  `json:"kd_region"`
	KdArea   *string `json:"kd_area"`
	KdUnit   *string `json:"kd_unit"`
}

type WACBUnitItem struct {
	KdUnit   string `json:"kd_unit"`
	NamaUnit string `json:"nama_unit"`
	KdRegion string `json:"kd_region"`
	KdArea   string `json:"kd_area"`
	NamaArea string `json:"nama_area"`
}

type WACBFormatData struct {
	Title        string            `json:"title"`
	UnitName     string            `json:"unit_name"`
	UnitCode     string            `json:"unit_code"`
	Date         string            `json:"date"`
	Time         string            `json:"time"`
	OperatorName string            `json:"operator_name"`
	Mesin        []WACBMachineItem `json:"mesin"`
	Text         string            `json:"text"`
}

type WACBMachineItem struct {
	Nomor             int    `json:"nomor"`
	NamaMesin         string `json:"nama_mesin"`
	IdMesin           string `json:"id_mesin"`
	KodeMesinSilm     string `json:"kode_mesin_silm"`
	Sn                string `json:"sn"`
	Dt                int    `json:"dt"`
	KdJenisBahanBakar string `json:"kd_jenis_bahan_bakar"`
}

// WACB Submit Logsheet
type WACBSubmitResponse struct {
	Success bool            `json:"success"`
	Message string          `json:"message"`
	Data    *WACBSubmitData `json:"data,omitempty"`
}

type WACBSubmitData struct {
	ID       int    `json:"id"`
	KdRegion string `json:"kd_region"`
	KdUnit   string `json:"kd_unit"`
	NamaUnit string `json:"nama_unit"`
}

// WACB Matrix Logsheet
type WACBMatrixResponse struct {
	Success bool             `json:"success"`
	Data    []WACBMatrixUnit `json:"data"`
}

type WACBMatrixUnit struct {
	ID             int                           `json:"id"`
	KdRegion       string                        `json:"kd_region"`
	KdUnit         string                        `json:"kd_unit"`
	NamaUnit       string                        `json:"nama_unit"`
	JamOperasional int                           `json:"jam_operasional"`
	LogsheetPLTD   map[string]WACBTimeSlotStatus `json:"logsheet_pltd"`
}

type WACBTimeSlotStatus struct {
	Status  string  `json:"status"` // "done" | "not done"
	IdBeban *string `json:"id_beban"`
}

// WACB Detail Report
type WACBDetailReportResponse struct {
	Success bool                  `json:"success"`
	Data    *WACBDetailReportData `json:"data"`
}

type WACBDetailReportData struct {
	BebanUld   *WACBBebanUld    `json:"beban_uld"`
	BebanMesin []WACBBebanMesin `json:"beban_mesin"`
}

type WACBBebanUld struct {
	IdBeban  string `json:"id_beban"`
	KdUnit   string `json:"kd_unit"`
	NamaUnit string `json:"nama_unit"`
	Tanggal  string `json:"tanggal"`
	Jam      string `json:"jam"`
}

type WACBBebanMesin struct {
	IdBeban       string   `json:"id_beban"`
	IdMesin       string   `json:"id_mesin"`
	NamaMesin     string   `json:"nama_mesin"`
	NoSeri        string   `json:"no_seri"`
	KodeMesinSilm *string  `json:"kode_mesin_silm"`
	KdStatus      string   `json:"kd_status"` // "01": OPERASI, "02": STANDBY, "03": GANGGUAN, "04": PEMELIHARAAN
	DayaMampu     *float64 `json:"daya_mampu"`
	Beban         *float64 `json:"beban"`
	StandKwh      *float64 `json:"stand_kwh"`
	StandBbm      *float64 `json:"stand_bbm"`
	Jkm           *string  `json:"jkm"`
	TekOli        *float64 `json:"tek_oli"`
	TemAir        *float64 `json:"tem_air"`
	ArusR         *float64 `json:"arus_r"`
	ArusS         *float64 `json:"arus_s"`
	ArusT         *float64 `json:"arus_t"`
	Teg           *float64 `json:"teg"`
	CosPhi        *string  `json:"cos_phi"`
	Frequency     *float64 `json:"frequency"`
	Keterangan    string   `json:"keterangan"`
	Operator      string   `json:"operator"`
}

// DTOs between Next.js frontend and Go backend
type BatchLogsheetRequest struct {
	LocalID      string             `json:"local_id"`
	KdRegion     string             `json:"kd_region"`
	KdUnit       string             `json:"kd_unit"`
	NamaUnit     string             `json:"nama_unit"`
	Tanggal      string             `json:"tanggal"`
	Jam          string             `json:"jam"`
	OperatorName string             `json:"operator_name"`
	Machines     []MachineFormEntry `json:"machines"`
}

type MachineFormEntry struct {
	Nomor             int     `json:"nomor"`
	IdMesin           string  `json:"id_mesin"`
	NamaMesin         string  `json:"nama_mesin"`
	KodeMesinSilm     string  `json:"kode_mesin_silm"`
	Sn                string  `json:"sn"`
	Dt                int     `json:"dt"`
	DayaMampu         string  `json:"daya_mampu"`
	StatusMesin       string  `json:"status_mesin"` // "OPERASI", "STANDBY", "GANGGUAN"
	Beban             float64 `json:"beban"`
	StandKwh          float64 `json:"stand_kwh"`
	StandBbm          float64 `json:"stand_bbm"`
	PhasaR            float64 `json:"phasa_r"`
	PhasaS            float64 `json:"phasa_s"`
	PhasaT            float64 `json:"phasa_t"`
	TekOli            float64 `json:"tek_oli"`
	TempAir           float64 `json:"temp_air"`
	Tegangan          float64 `json:"tegangan"`
	Frequency         float64 `json:"frequency"`
	CosPhi            float64 `json:"cos_phi"`
	JamKerjaMesin     float64 `json:"jam_kerja_mesin"`
	KdJenisBahanBakar string  `json:"kd_jenis_bahan_bakar"`
	Keterangan        string  `json:"keterangan"`
}
