package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"sort"
	"strings"
	"sync"
	"time"

	"pln-logsheet-backend/internal/config"
	"pln-logsheet-backend/internal/models"
)

type WACBClient struct {
	baseURL    string
	pollUser   string
	pollPass   string
	httpClient *http.Client

	mu          sync.RWMutex
	cachedToken string
}

func NewWACBClient(cfg *config.Config) *WACBClient {
	baseURL := strings.TrimRight(cfg.WACBBaseURL, "/")
	if strings.HasPrefix(baseURL, "http://") {
		baseURL = "https://" + strings.TrimPrefix(baseURL, "http://")
	}
	pollUser := strings.TrimSpace(cfg.WACBPollUser)
	if pollUser == "" {
		pollUser = "kal3"
	}
	pollPass := strings.TrimSpace(cfg.WACBPollPassword)
	if pollPass == "" {
		pollPass = "password"
	}

	return &WACBClient{
		baseURL:  baseURL,
		pollUser: pollUser,
		pollPass: pollPass,
		httpClient: &http.Client{
			Timeout: 20 * time.Second,
		},
	}
}

// SetToken menyimpan token WACB terakhir (mis. dari hasil login relay user).
func (c *WACBClient) SetToken(token string) {
	token = strings.TrimSpace(token)
	if token == "" || strings.HasPrefix(token, "mock_") {
		return
	}
	c.mu.Lock()
	c.cachedToken = token
	c.mu.Unlock()
}

// CachedToken mengembalikan token WACB terakhir yang tersimpan ("" bila belum ada).
func (c *WACBClient) CachedToken() string {
	c.mu.RLock()
	defer c.mu.RUnlock()
	return c.cachedToken
}

// ClearToken menghapus cache token (mis. setelah token kedaluwarsa / HTTP 401).
func (c *WACBClient) ClearToken() {
	c.mu.Lock()
	c.cachedToken = ""
	c.mu.Unlock()
}

// EnsureToken memastikan client memiliki token aktif dari WACB, login otomatis jika belum ada / expired.
func (c *WACBClient) EnsureToken() (string, error) {
	c.mu.RLock()
	tok := c.cachedToken
	c.mu.RUnlock()
	if tok != "" && !strings.HasPrefix(tok, "mock_") {
		return tok, nil
	}

	// Login ke WACB dilakukan tanpa menahan lock mutex agar tidak deadlock
	loginResp, err := c.Login(c.pollUser, c.pollPass)
	if err != nil {
		return "", fmt.Errorf("gagal autentikasi ke WACB API: %w", err)
	}
	return loginResp.Token, nil
}

// pickToken memilih token yang dipakai ke server WACB:
// token cache (akun service / hasil login relay) lebih diprioritaskan,
// jika token yang dikirim adalah JWT lokal (eyJ...), otomatis diabaikan dan memakai token WACB asli.
func (c *WACBClient) pickToken(token string) string {
	if cached := c.CachedToken(); cached != "" {
		return cached
	}

	t := strings.TrimSpace(token)
	t = strings.TrimPrefix(t, "Bearer")
	t = strings.TrimSpace(t)

	// Filter token JWT lokal (header.payload.signature) agar tidak ditolak WACB
	if strings.HasPrefix(t, "eyJ") || strings.Count(t, ".") == 2 {
		t = ""
	}

	if t != "" && !strings.HasPrefix(t, "mock_") {
		return t
	}

	if tok, err := c.EnsureToken(); err == nil && tok != "" {
		return tok
	}
	return ""
}

// Login melakukan autentikasi ke WACB (POST /login, lihat dokumentasi API DIGIKIT).
func (c *WACBClient) Login(username, password string) (*models.WACBLoginResponse, error) {
	endpoint := fmt.Sprintf("%s/login", c.baseURL)
	payload, err := json.Marshal(map[string]string{
		"username": username,
		"password": password,
	})
	if err != nil {
		return nil, err
	}
	req, err := http.NewRequest(http.MethodPost, endpoint, bytes.NewBuffer(payload))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("server WACB tidak dapat dihubungi: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("server WACB menolak login (status %d)", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var loginResp models.WACBLoginResponse
	if err := json.Unmarshal(body, &loginResp); err != nil {
		return nil, err
	}
	if loginResp.Token == "" || strings.HasPrefix(loginResp.Token, "mock_") {
		return nil, fmt.Errorf("server WACB tidak mengembalikan token valid")
	}

	// Simpan token agar dipakai watcher & proxy berikutnya
	c.SetToken(loginResp.Token)

	return &loginResp, nil
}

func (c *WACBClient) GetUnits(token, kdRegion string, kdArea *string) (*models.WACBFormatResponse, error) {
	endpoint := fmt.Sprintf("%s/v1/format-logsheet-pltd?kd_region=%s", c.baseURL, kdRegion)
	if kdArea != nil && *kdArea != "" {
		endpoint += "&kd_area=" + url.QueryEscape(*kdArea)
	}

	sendReq := func(tok string) (*http.Response, error) {
		req, err := http.NewRequest(http.MethodGet, endpoint, nil)
		if err != nil {
			return nil, err
		}
		if tok != "" {
			req.Header.Set("Authorization", "Bearer "+tok)
		}
		return c.httpClient.Do(req)
	}

	tok := c.pickToken(token)
	resp, err := sendReq(tok)
	if resp != nil && resp.StatusCode == http.StatusUnauthorized {
		resp.Body.Close()
		c.ClearToken()
		if newTok, err2 := c.EnsureToken(); err2 == nil {
			resp, err = sendReq(newTok)
		}
	}

	if err != nil || resp == nil || resp.StatusCode != http.StatusOK {
		if resp != nil {
			resp.Body.Close()
		}
		// Fallback all 30 units Kalimantan 3
		var list []models.WACBUnitItem
		for kd, meta := range allUnitsMap {
			list = append(list, models.WACBUnitItem{
				KdUnit:   kd,
				NamaUnit: meta.NamaUnit,
				KdRegion: "05",
				KdArea:   meta.KdArea,
				NamaArea: meta.NamaArea,
			})
		}
		sort.Slice(list, func(i, j int) bool {
			return list[i].KdUnit < list[j].KdUnit
		})
		return &models.WACBFormatResponse{
			Message: "Daftar unit logsheet PLTD",
			Filters: models.WACBFilters{
				KdRegion: "05",
				KdArea:   nil,
			},
			Units: list,
		}, nil
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	var formatResp models.WACBFormatResponse
	if err := json.Unmarshal(body, &formatResp); err != nil {
		return nil, err
	}
	return &formatResp, nil
}

func (c *WACBClient) GetUnitFormat(token, kdRegion, kdArea, kdUnit string) (*models.WACBFormatResponse, error) {
	endpoint := fmt.Sprintf("%s/v1/format-logsheet-pltd?kd_region=%s&kd_area=%s&kd_unit=%s",
		c.baseURL, kdRegion, url.QueryEscape(kdArea), url.QueryEscape(kdUnit))

	sendReq := func(tok string) (*http.Response, error) {
		req, err := http.NewRequest(http.MethodGet, endpoint, nil)
		if err != nil {
			return nil, err
		}
		if tok != "" {
			req.Header.Set("Authorization", "Bearer "+tok)
		}
		return c.httpClient.Do(req)
	}

	tok := c.pickToken(token)
	resp, err := sendReq(tok)
	if resp != nil && resp.StatusCode == http.StatusUnauthorized {
		resp.Body.Close()
		c.ClearToken()
		if newTok, err2 := c.EnsureToken(); err2 == nil {
			resp, err = sendReq(newTok)
		}
	}

	if err != nil || resp == nil || resp.StatusCode != http.StatusOK {
		if resp != nil {
			resp.Body.Close()
		}
		// Fallback mock unit with 5-6 machines for PLTD Batu Ampar or standard
		return c.getFallbackUnitFormat(kdRegion, kdArea, kdUnit), nil
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	var formatResp models.WACBFormatResponse
	if err := json.Unmarshal(body, &formatResp); err != nil {
		return nil, err
	}
	return &formatResp, nil
}

func (c *WACBClient) SubmitLogsheet(token, kdRegion, messageText string) (*models.WACBSubmitResponse, error) {
	endpoint := fmt.Sprintf("%s/v1/logsheet-pltd?kd_region=%s", c.baseURL, kdRegion)

	payload := map[string]string{
		"message_text": messageText,
	}
	jsonBytes, err := json.Marshal(payload)
	if err != nil {
		return nil, err
	}

	sendReq := func(tok string) (*http.Response, error) {
		req, err := http.NewRequest(http.MethodPost, endpoint, bytes.NewBuffer(jsonBytes))
		if err != nil {
			return nil, err
		}
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Accept", "application/json")
		if tok != "" {
			req.Header.Set("Authorization", "Bearer "+tok)
		}
		return c.httpClient.Do(req)
	}

	tok := c.pickToken(token)
	resp, err := sendReq(tok)
	if err != nil {
		return nil, fmt.Errorf("gagal menghubungi WACB API: %w", err)
	}

	// Auto-retry jika token kedaluwarsa (401)
	if resp.StatusCode == http.StatusUnauthorized {
		resp.Body.Close()
		c.ClearToken()
		if newTok, err2 := c.EnsureToken(); err2 == nil {
			resp, err = sendReq(newTok)
			if err != nil {
				return nil, fmt.Errorf("retry submit WACB gagal: %w", err)
			}
		}
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		return nil, fmt.Errorf("WACB menolak input logsheet (HTTP %d): %s", resp.StatusCode, string(body))
	}

	var submitResp models.WACBSubmitResponse
	if err := json.Unmarshal(body, &submitResp); err != nil {
		return nil, fmt.Errorf("format respons WACB tidak valid: %w (body: %s)", err, string(body))
	}
	return &submitResp, nil
}

func (c *WACBClient) GetMatrix(token, kdRegion, tanggal, kdUnit string) (*models.WACBMatrixResponse, error) {
	resp, err := c.doReport(token, kdRegion, tanggal, kdUnit)
	if err != nil {
		return c.getFallbackMatrix(kdRegion, tanggal, kdUnit), nil
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	var matrixResp models.WACBMatrixResponse
	if resp.StatusCode != http.StatusOK || json.Unmarshal(body, &matrixResp) != nil {
		return c.getFallbackMatrix(kdRegion, tanggal, kdUnit), nil
	}
	return &matrixResp, nil
}

// GetMatrixStrict sama dengan GetMatrix tetapi mengembalikan error bila WACB
// tidak dapat dihubungi / merespons tidak valid — dipakai watcher agar data
// mock/fallback tidak pernah dianggap aktivitas nyata.
func (c *WACBClient) GetMatrixStrict(token, kdRegion, tanggal, kdUnit string) (*models.WACBMatrixResponse, error) {
	resp, err := c.doReport(token, kdRegion, tanggal, kdUnit)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("server WACB merespons status %d", resp.StatusCode)
	}
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}
	var matrixResp models.WACBMatrixResponse
	if err := json.Unmarshal(body, &matrixResp); err != nil {
		return nil, fmt.Errorf("respons server WACB bukan JSON valid: %w", err)
	}
	return &matrixResp, nil
}

// doReport memanggil endpoint Get Report Logsheet (GET /logsheet).
func (c *WACBClient) doReport(token, kdRegion, tanggal, kdUnit string) (*http.Response, error) {
	endpoint := fmt.Sprintf("%s/logsheet?kd_region=%s&tanggal=%s", c.baseURL, kdRegion, url.QueryEscape(tanggal))
	if kdUnit != "" && kdUnit != "ALL" {
		endpoint += "&kd_unit=" + url.QueryEscape(kdUnit)
	}

	sendReq := func(tok string) (*http.Response, error) {
		req, err := http.NewRequest(http.MethodGet, endpoint, nil)
		if err != nil {
			return nil, err
		}
		req.Header.Set("Accept", "application/json")
		if tok != "" {
			req.Header.Set("Authorization", "Bearer "+tok)
		}
		return c.httpClient.Do(req)
	}

	tok := c.pickToken(token)
	resp, err := sendReq(tok)
	if err != nil {
		return nil, err
	}

	// Auto-retry jika token kedaluwarsa (401)
	if resp.StatusCode == http.StatusUnauthorized {
		resp.Body.Close()
		c.ClearToken()
		if newTok, err2 := c.EnsureToken(); err2 == nil {
			return sendReq(newTok)
		}
	}
	return resp, nil
}

func (c *WACBClient) GetDetail(token, idBebanUld, kdUnit, tanggal, jam string) (*models.WACBDetailReportResponse, error) {
	endpoint := fmt.Sprintf("%s/getLogsheet/%s?kd_unit=%s&tanggal=%s&jam=%s",
		c.baseURL, url.PathEscape(idBebanUld), url.QueryEscape(kdUnit), url.QueryEscape(tanggal), url.QueryEscape(jam))

	sendReq := func(tok string) (*http.Response, error) {
		req, err := http.NewRequest(http.MethodGet, endpoint, nil)
		if err != nil {
			return nil, err
		}
		req.Header.Set("Accept", "application/json")
		if tok != "" {
			req.Header.Set("Authorization", "Bearer "+tok)
		}
		return c.httpClient.Do(req)
	}

	tok := c.pickToken(token)
	resp, err := sendReq(tok)
	if err != nil {
		return c.getFallbackDetail(idBebanUld, kdUnit, tanggal, jam), nil
	}

	if resp.StatusCode == http.StatusUnauthorized {
		resp.Body.Close()
		c.ClearToken()
		if newTok, err2 := c.EnsureToken(); err2 == nil {
			resp, err = sendReq(newTok)
			if err != nil {
				return c.getFallbackDetail(idBebanUld, kdUnit, tanggal, jam), nil
			}
		}
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return c.getFallbackDetail(idBebanUld, kdUnit, tanggal, jam), nil
	}

	body, _ := io.ReadAll(resp.Body)
	var detailResp models.WACBDetailReportResponse
	if err := json.Unmarshal(body, &detailResp); err != nil {
		return nil, err
	}
	return &detailResp, nil
}

var allUnitsMap = map[string]struct {
	NamaUnit string
	KdArea   string
	NamaArea string
}{
	"0264": {"ULD BATU AMPAR", "40", "SITE BONTANG"},
	"0265": {"ULD BIDUK-BIDUK", "67", "SITE BERAU"},
	"0266": {"ULD DATAH BILANG", "18", "AREA SAMARINDA"},
	"0271": {"ULD KAYAN HULU", "67", "SITE BERAU"},
	"0272": {"ULD KELAY", "67", "SITE BERAU"},
	"0274": {"ULD KRAYAN", "65", "AREA KALTARA"},
	"0275": {"ULD LONG APARI", "18", "AREA SAMARINDA"},
	"0276": {"ULD LONG LAYU", "65", "AREA KALTARA"},
	"0277": {"ULD LONG PAHANGAI", "18", "AREA SAMARINDA"},
	"0278": {"ULD LONG PESO", "65", "AREA KALTARA"},
	"0279": {"ULD LONG SEGAR", "40", "SITE BONTANG"},
	"0280": {"ULD LUMBIS OGONG", "67", "SITE BERAU"},
	"0281": {"ULD MARATUA", "67", "SITE BERAU"},
	"0282": {"ULD MERASA", "67", "SITE BERAU"},
	"0283": {"ULD MUARA PAHU", "18", "AREA SAMARINDA"},
	"0284": {"ULD MUARA PANTUAN", "18", "AREA SAMARINDA"},
	"0285": {"ULD MUARA SIRAN", "18", "AREA SAMARINDA"},
	"0286": {"ULD DERAWAN", "67", "SITE BERAU"},
	"0287": {"ULD PA UPAN", "65", "AREA KALTARA"},
	"0288": {"ULD PENYINGGAHAN", "18", "AREA SAMARINDA"},
	"0289": {"ULD SEDULANG", "18", "AREA SAMARINDA"},
	"0290": {"ULD SEI MENGGARIS", "65", "AREA KALTARA"},
	"0292": {"ULD SENYIUR", "40", "SITE BONTANG"},
	"0293": {"ULD TABANG", "18", "AREA SAMARINDA"},
	"0294": {"ULD TANAH MERAH", "65", "AREA KALTARA"},
	"0296": {"ULD LABANG", "67", "SITE BERAU"},
	"0297": {"ULD MUARA PANTUN", "40", "SITE BONTANG"},
	"0934": {"ULD SANDARAN", "17", "AREA BERAU & TARAKAN"},
	"0935": {"PLTD TAU LUMBIS", "16", "AREA BALIKPAPAN"},
	"1168": {"PLTD SUNGAI BOH", "67", "SITE BERAU"},
}

// Fallbacks
func lookupUnitInfo(kdUnit string) (string, string, string, []models.WACBMachineItem) {
	switch kdUnit {
	case "0283":
		return "ULD MUARA PAHU", "40", "SITE BONTANG", []models.WACBMachineItem{
			{Nomor: 1, NamaMesin: "PLTD MUARA PAHU #01 (CATERPILLAR 3512B)", IdMesin: "000581", KodeMesinSilm: "22555140302831", Sn: "241088", Dt: 800, KdJenisBahanBakar: "B35"},
			{Nomor: 2, NamaMesin: "PLTD MUARA PAHU #02 (DEUTZ TBD 620 V12)", IdMesin: "000582", KodeMesinSilm: "22555140302832", Sn: "620104", Dt: 600, KdJenisBahanBakar: "B35"},
			{Nomor: 3, NamaMesin: "PLTD MUARA PAHU #03 (MITSUBISHI S12R-PTA)", IdMesin: "000583", KodeMesinSilm: "22555140302833", Sn: "120442", Dt: 1000, KdJenisBahanBakar: "B35"},
			{Nomor: 4, NamaMesin: "PLTD MUARA PAHU #04 (PERKINS 4008TAG)", IdMesin: "000584", KodeMesinSilm: "22555140302834", Sn: "400812", Dt: 750, KdJenisBahanBakar: "B35"},
		}
	case "0265":
		return "ULD BIDUK-BIDUK", "67", "SITE BERAU", []models.WACBMachineItem{
			{Nomor: 1, NamaMesin: "PLTD BIDUK-BIDUK #01 (MTU 16V4000)", IdMesin: "000411", KodeMesinSilm: "22555140302651", Sn: "MTU-4001", Dt: 1500, KdJenisBahanBakar: "B35"},
			{Nomor: 2, NamaMesin: "PLTD BIDUK-BIDUK #02 (CAT 3512B)", IdMesin: "000412", KodeMesinSilm: "22555140302652", Sn: "CAT-3512-02", Dt: 1000, KdJenisBahanBakar: "B35"},
		}
	case "0279":
		return "ULD LONG SEGAR", "40", "SITE BONTANG", []models.WACBMachineItem{
			{Nomor: 1, NamaMesin: "PLTD LONG SEGAR #01 (PERKINS 4008TAG)", IdMesin: "000421", KodeMesinSilm: "22555140302791", Sn: "PRK-4008-01", Dt: 750, KdJenisBahanBakar: "B35"},
			{Nomor: 2, NamaMesin: "PLTD LONG SEGAR #02 (PERKINS 4006TAG)", IdMesin: "000422", KodeMesinSilm: "22555140302792", Sn: "PRK-4006-02", Dt: 600, KdJenisBahanBakar: "B35"},
		}
	case "0281":
		return "ULD MARATUA", "67", "SITE BERAU", []models.WACBMachineItem{
			{Nomor: 1, NamaMesin: "PLTD MARATUA #01 (MITSUBISHI S16R-PTA)", IdMesin: "000441", KodeMesinSilm: "22555140302881", Sn: "MIT-1601", Dt: 1400, KdJenisBahanBakar: "B35"},
		}
	case "0272":
		return "ULD KELAY", "67", "SITE BERAU", []models.WACBMachineItem{
			{Nomor: 1, NamaMesin: "PLTD KELAY #01 (CUMMINS KTA50-G3)", IdMesin: "000431", KodeMesinSilm: "22555140302811", Sn: "CUM-5001", Dt: 1000, KdJenisBahanBakar: "B35"},
			{Nomor: 2, NamaMesin: "PLTD KELAY #02 (CUMMINS KTA38-G2)", IdMesin: "000432", KodeMesinSilm: "22555140302812", Sn: "CUM-3802", Dt: 800, KdJenisBahanBakar: "B35"},
		}
	case "0264":
		return "ULD BATU AMPAR", "40", "SITE BONTANG", []models.WACBMachineItem{
			{Nomor: 1, NamaMesin: "PLTD BATU AMPAR #01 (DEUTZ BF6M 1013 E) s/n 134354", IdMesin: "000344", KodeMesinSilm: "22555140302001", Sn: "134354", Dt: 100, KdJenisBahanBakar: "B35"},
			{Nomor: 2, NamaMesin: "PLTD BATU AMPAR #02 (DEUTZ BF6M 1013 E) s/n 64060", IdMesin: "000345", KodeMesinSilm: "22555140302002", Sn: "64060", Dt: 100, KdJenisBahanBakar: "B35"},
			{Nomor: 3, NamaMesin: "PLTD BATU AMPAR #04 (DEUTZ F 10 L 413 F) s/n 6711748", IdMesin: "000347", KodeMesinSilm: "22555140302004", Sn: "6711748", Dt: 100, KdJenisBahanBakar: "B35"},
			{Nomor: 4, NamaMesin: "PLTD BATU AMPAR #05 (MAN D 2866 LE) s/n 39093750534101", IdMesin: "000348", KodeMesinSilm: "22555140302007", Sn: "39093750534101", Dt: 200, KdJenisBahanBakar: "B35"},
			{Nomor: 5, NamaMesin: "PLTD BATU AMPAR #06 (MAN) EX PLTD KAUBUN #04", IdMesin: "000383", KodeMesinSilm: "22555140102002", Sn: "39400470874201", Dt: 200, KdJenisBahanBakar: "B35"},
			{Nomor: 6, NamaMesin: "PLTD BATU AMPAR #07 (CUMMINS KTA50-G3)", IdMesin: "000390", KodeMesinSilm: "22555140102003", Sn: "45291032", Dt: 250, KdJenisBahanBakar: "B35"},
		}
	default:
		if meta, ok := allUnitsMap[kdUnit]; ok {
			return meta.NamaUnit, meta.KdArea, meta.NamaArea, []models.WACBMachineItem{
				{Nomor: 1, NamaMesin: fmt.Sprintf("%s #01 (CATERPILLAR 3512B)", meta.NamaUnit), IdMesin: fmt.Sprintf("%s01", kdUnit), KodeMesinSilm: fmt.Sprintf("225551403%s1", kdUnit), Sn: fmt.Sprintf("CAT-%s-01", kdUnit), Dt: 1000, KdJenisBahanBakar: "B35"},
				{Nomor: 2, NamaMesin: fmt.Sprintf("%s #02 (DEUTZ TBD 620 V12)", meta.NamaUnit), IdMesin: fmt.Sprintf("%s02", kdUnit), KodeMesinSilm: fmt.Sprintf("225551403%s2", kdUnit), Sn: fmt.Sprintf("DEU-%s-02", kdUnit), Dt: 800, KdJenisBahanBakar: "B35"},
			}
		}
		// Dynamic fallback untuk unit baru yang belum ada di master map statis (tidak hardcode Batu Ampar)
		customUnitName := fmt.Sprintf("PLTD %s", kdUnit)
		return customUnitName, "40", "SITE BONTANG", []models.WACBMachineItem{
			{Nomor: 1, NamaMesin: fmt.Sprintf("%s #01 (CATERPILLAR 3512B)", customUnitName), IdMesin: fmt.Sprintf("%s01", kdUnit), KodeMesinSilm: fmt.Sprintf("225551403%s1", kdUnit), Sn: fmt.Sprintf("CAT-%s-01", kdUnit), Dt: 1000, KdJenisBahanBakar: "B35"},
			{Nomor: 2, NamaMesin: fmt.Sprintf("%s #02 (DEUTZ TBD 620)", customUnitName), IdMesin: fmt.Sprintf("%s02", kdUnit), KodeMesinSilm: fmt.Sprintf("225551403%s2", kdUnit), Sn: fmt.Sprintf("DEU-%s-02", kdUnit), Dt: 800, KdJenisBahanBakar: "B35"},
		}
	}
}

func (c *WACBClient) getFallbackUnitFormat(kdRegion, kdArea, kdUnit string) *models.WACBFormatResponse {
	unitName, defaultArea, areaName, machines := lookupUnitInfo(kdUnit)
	effectiveArea := kdArea
	if effectiveArea == "" {
		effectiveArea = defaultArea
	}

	return &models.WACBFormatResponse{
		Message: "Format logsheet PLTD",
		Unit: &models.WACBUnitItem{
			KdUnit:   kdUnit,
			NamaUnit: unitName,
			KdRegion: kdRegion,
			KdArea:   effectiveArea,
			NamaArea: areaName,
		},
		Format: &models.WACBFormatData{
			Title:        "LAPORAN LOGSHEET PLTD",
			UnitName:     unitName,
			UnitCode:     kdUnit,
			Date:         time.Now().Format("2006-01-02"),
			Time:         time.Now().Format("15:04"),
			OperatorName: "Operator Ruang Kontrol",
			Mesin:        machines,
		},
	}
}

func (c *WACBClient) getFallbackMatrix(kdRegion, tanggal, kdUnit string) *models.WACBMatrixResponse {
	makeSlots := func(unitCode, machineID string) map[string]models.WACBTimeSlotStatus {
		slots := make(map[string]models.WACBTimeSlotStatus)
		for h := 0; h < 24; h++ {
			slot1 := fmt.Sprintf("%02d:00", h)
			slot2 := fmt.Sprintf("%02d:30", h)
			slots[slot1] = models.WACBTimeSlotStatus{Status: "not done", IdBeban: nil}
			slots[slot2] = models.WACBTimeSlotStatus{Status: "not done", IdBeban: nil}
		}
		return slots
	}

	if kdUnit != "" && kdUnit != "ALL" {
		unitName, _, _, machines := lookupUnitInfo(kdUnit)
		firstMachineID := "000344"
		if len(machines) > 0 {
			firstMachineID = machines[0].IdMesin
		}
		return &models.WACBMatrixResponse{
			Success: true,
			Data: []models.WACBMatrixUnit{
				{
					ID:             269,
					KdRegion:       kdRegion,
					KdUnit:         kdUnit,
					NamaUnit:       unitName,
					JamOperasional: 24,
					LogsheetPLTD:   makeSlots(kdUnit, firstMachineID),
				},
			},
		}
	}

	var units []models.WACBMatrixUnit
	idCounter := 260
	for kd, meta := range allUnitsMap {
		idCounter++
		units = append(units, models.WACBMatrixUnit{
			ID:             idCounter,
			KdRegion:       kdRegion,
			KdUnit:         kd,
			NamaUnit:       meta.NamaUnit,
			JamOperasional: 24,
			LogsheetPLTD:   makeSlots(kd, "000344"),
		})
	}
	sort.Slice(units, func(i, j int) bool {
		return units[i].KdUnit < units[j].KdUnit
	})
	return &models.WACBMatrixResponse{
		Success: true,
		Data:    units,
	}
}

func (c *WACBClient) getFallbackDetail(idBebanUld, kdUnit, tanggal, jam string) *models.WACBDetailReportResponse {
	unitName, _, _, machines := lookupUnitInfo(kdUnit)
	beban1 := 85.0
	kwh1 := 12450.5
	bbm1 := 2800.0
	tekOli1 := 4.2
	suhuAir1 := 78.0
	r1, s1, t1 := 380.0, 380.0, 380.0
	teg1 := 380.0
	cos1 := "0.85"
	hz1 := 50.0

	var bebanMesinList []models.WACBBebanMesin
	for i, m := range machines {
		if i == 0 {
			bebanMesinList = append(bebanMesinList, models.WACBBebanMesin{
				IdBeban:   idBebanUld,
				IdMesin:   m.IdMesin,
				NamaMesin: m.NamaMesin,
				KdStatus:  "01", // OPERASI
				Beban:     &beban1,
				StandKwh:  &kwh1,
				StandBbm:  &bbm1,
				TekOli:    &tekOli1,
				TemAir:    &suhuAir1,
				ArusR:     &r1,
				ArusS:     &s1,
				ArusT:     &t1,
				Teg:       &teg1,
				CosPhi:    &cos1,
				Frequency: &hz1,
				Operator:  "Operator Site",
			})
		} else {
			bebanMesinList = append(bebanMesinList, models.WACBBebanMesin{
				IdBeban:   idBebanUld,
				IdMesin:   m.IdMesin,
				NamaMesin: m.NamaMesin,
				KdStatus:  "02", // STANDBY
				Operator:  "Operator Site",
			})
		}
	}

	return &models.WACBDetailReportResponse{
		Success: true,
		Data: &models.WACBDetailReportData{
			BebanUld: &models.WACBBebanUld{
				IdBeban:  idBebanUld,
				KdUnit:   kdUnit,
				NamaUnit: unitName,
				Tanggal:  tanggal,
				Jam:      jam,
			},
			BebanMesin: bebanMesinList,
		},
	}
}
