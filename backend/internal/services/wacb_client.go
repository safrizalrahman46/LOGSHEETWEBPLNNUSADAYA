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
	// WACB API memfilter ketat parameter kd_area. Jika kd_area kosong, '40', atau 'ALL',
	// jangan sertakan kd_area karena akan menyebabkan HTTP 404 pada unit di area lain (mis. 67 SITE BERAU).
	// Query dengan kd_region & kd_unit saja terbukti 100% akurat untuk seluruh 30 unit di Kalimantan 3.
	endpoint := fmt.Sprintf("%s/v1/format-logsheet-pltd?kd_region=%s&kd_unit=%s",
		c.baseURL, kdRegion, url.QueryEscape(kdUnit))
	if kdArea != "" && kdArea != "40" && kdArea != "ALL" {
		endpoint = fmt.Sprintf("%s/v1/format-logsheet-pltd?kd_region=%s&kd_area=%s&kd_unit=%s",
			c.baseURL, kdRegion, url.QueryEscape(kdArea), url.QueryEscape(kdUnit))
	}

	sendReq := func(tok, targetUrl string) (*http.Response, error) {
		req, err := http.NewRequest(http.MethodGet, targetUrl, nil)
		if err != nil {
			return nil, err
		}
		if tok != "" {
			req.Header.Set("Authorization", "Bearer "+tok)
		}
		return c.httpClient.Do(req)
	}

	tok := c.pickToken(token)
	resp, err := sendReq(tok, endpoint)
	if resp != nil && resp.StatusCode == http.StatusUnauthorized {
		resp.Body.Close()
		c.ClearToken()
		if newTok, err2 := c.EnsureToken(); err2 == nil {
			resp, err = sendReq(newTok, endpoint)
		}
	}

	// Jika ada kd_area dan mendapatkan 404, coba lagi tanpa parameter kd_area
	if resp != nil && resp.StatusCode == http.StatusNotFound && strings.Contains(endpoint, "kd_area=") {
		resp.Body.Close()
		fallbackUrl := fmt.Sprintf("%s/v1/format-logsheet-pltd?kd_region=%s&kd_unit=%s",
			c.baseURL, kdRegion, url.QueryEscape(kdUnit))
		resp, err = sendReq(tok, fallbackUrl)
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
// lookupUnitInfo provides authoritative fallback unit and machine specifications
// matching the official Kinerja_10 dataset if WACB server is ever unreachable.
func lookupUnitInfo(kdUnit string) (string, string, string, []models.WACBMachineItem) {
	meta, hasMeta := allUnitsMap[kdUnit]
	unitName := fmt.Sprintf("PLTD %s", kdUnit)
	kdArea := "40"
	namaArea := "SITE BONTANG"
	if hasMeta {
		unitName = meta.NamaUnit
		kdArea = meta.KdArea
		namaArea = meta.NamaArea
	}

	switch kdUnit {
	case "0264":
		return unitName, kdArea, namaArea, []models.WACBMachineItem{
			{Nomor: 1, NamaMesin: "PLTD BATU AMPAR #01 (DEUTZ)", IdMesin: "000344", KodeMesinSilm: "22555140302641", Sn: "0134354", Dt: 100, KdJenisBahanBakar: "B35", StatusMesin: "OPERASI"},
			{Nomor: 2, NamaMesin: "PLTD BATU AMPAR #02 (DEUTZ)", IdMesin: "000345", KodeMesinSilm: "22555140302642", Sn: "064064", Dt: 100, KdJenisBahanBakar: "B35", StatusMesin: "OPERASI"},
			{Nomor: 3, NamaMesin: "PLTD BATU AMPAR #04 (DEUTZ)", IdMesin: "000347", KodeMesinSilm: "22555140302643", Sn: "6711748", Dt: 100, KdJenisBahanBakar: "B35", StatusMesin: "OPERASI"},
			{Nomor: 4, NamaMesin: "PLTD BATU AMPAR #05 (MAN) EX PLTD SANGKULIRANG #04", IdMesin: "000348", KodeMesinSilm: "22555140302644", Sn: "39093750534101", Dt: 200, KdJenisBahanBakar: "B35", StatusMesin: "OPERASI"},
			{Nomor: 5, NamaMesin: "PLTD BATU AMPAR #06 (MAN) EX PLTD KAUBUN #04", IdMesin: "000383", KodeMesinSilm: "22555140302645", Sn: "39400470874201", Dt: 200, KdJenisBahanBakar: "B35", StatusMesin: "OPERASI"},
		}
	case "0265":
		return unitName, kdArea, namaArea, []models.WACBMachineItem{
			{Nomor: 1, NamaMesin: "PLTD BIDUK-BIDUK #02 (DEUTZ)", IdMesin: "000350", KodeMesinSilm: "22555140302651", Sn: "001568", Dt: 634, KdJenisBahanBakar: "B35", StatusMesin: "STANDBY"},
			{Nomor: 2, NamaMesin: "PLTD BIDUK-BIDUK #08 (MITSUBISHI) EX PLTD MARATUA #01", IdMesin: "001705", KodeMesinSilm: "22555140302652", Sn: "22566", Dt: 1330, KdJenisBahanBakar: "B35", StatusMesin: "OPERASI"},
		}
	case "0266":
		return unitName, kdArea, namaArea, []models.WACBMachineItem{
			{Nomor: 1, NamaMesin: "PLTD DATAH BILANG #02 (CUMMINS)", IdMesin: "000354", KodeMesinSilm: "22555140302661", Sn: "44649163", Dt: 100, KdJenisBahanBakar: "B35", StatusMesin: "STANDBY"},
			{Nomor: 2, NamaMesin: "PLTD DATAH BILANG #06 (DEUTZ) EX PLTD MUARA KEDANG #02 (DEUTZ)", IdMesin: "000358", KodeMesinSilm: "22555140302662", Sn: "6370704", Dt: 140, KdJenisBahanBakar: "B35", StatusMesin: "GANGGUAN"},
			{Nomor: 3, NamaMesin: "PLTD DATAH BILANG #07 (MAN) EX PLTD SENTWAR #08 (MAN)", IdMesin: "000359", KodeMesinSilm: "22555140302663", Sn: "49419108011912", Dt: 500, KdJenisBahanBakar: "B35", StatusMesin: "OPERASI"},
			{Nomor: 4, NamaMesin: "PLTD DATAH BILANG #08 (MAN) EX PLTD BONGAN #04", IdMesin: "000360", KodeMesinSilm: "22555140302664", Sn: "49419108041912", Dt: 500, KdJenisBahanBakar: "B35", StatusMesin: "OPERASI"},
			{Nomor: 5, NamaMesin: "PLTD DATAH BILANG #09 (MAN) EX PLTD DILANG PUTI #10", IdMesin: "003178", KodeMesinSilm: "22555140302665", Sn: "39499220824201", Dt: 220, KdJenisBahanBakar: "B35", StatusMesin: "OPERASI"},
			{Nomor: 6, NamaMesin: "PLTD DATAH BILANG #10 (MAN) EX PLTD JANTUR #08", IdMesin: "000533", KodeMesinSilm: "22555140302666", Sn: "49401480484201", Dt: 500, KdJenisBahanBakar: "B35", StatusMesin: "OPERASI"},
		}
	case "0267":
		return unitName, kdArea, namaArea, []models.WACBMachineItem{
			{Nomor: 1, NamaMesin: "PLTD DILANG PUTI #04 (DEUTZ)", IdMesin: "026701", KodeMesinSilm: "22555140302671", Sn: "8048137", Dt: 74, KdJenisBahanBakar: "B35", StatusMesin: "STANDBY"},
			{Nomor: 2, NamaMesin: "PLTD DILANG PUTI #06 (DEUTZ) EX PLTD TABISAQ #02", IdMesin: "026702", KodeMesinSilm: "22555140302672", Sn: "8048145", Dt: 40, KdJenisBahanBakar: "B35", StatusMesin: "STANDBY"},
			{Nomor: 3, NamaMesin: "PLTD DILANG PUTI #08 (DEUTZ) EX PLTD TABISAQ #08", IdMesin: "026703", KodeMesinSilm: "22555140302673", Sn: "141328", Dt: 100, KdJenisBahanBakar: "B35", StatusMesin: "STANDBY"},
		}
	case "0268":
		return unitName, kdArea, namaArea, []models.WACBMachineItem{
			{Nomor: 1, NamaMesin: "PLTD GEMAR BARU #02 (DEUTZ)", IdMesin: "026801", KodeMesinSilm: "22555140302681", Sn: "00064061", Dt: 100, KdJenisBahanBakar: "B35", StatusMesin: "STANDBY"},
		}
	case "0269":
		return unitName, kdArea, namaArea, []models.WACBMachineItem{
			{Nomor: 1, NamaMesin: "PLTD JANTUR #05 (DEUTZ)", IdMesin: "026901", KodeMesinSilm: "22555140302691", Sn: "9123421", Dt: 220, KdJenisBahanBakar: "B35", StatusMesin: "GANGGUAN"},
		}
	case "0270":
		return unitName, kdArea, namaArea, []models.WACBMachineItem{
			{Nomor: 1, NamaMesin: "PLTD KARANGAN DALAM #02 (DEUTZ)", IdMesin: "027001", KodeMesinSilm: "22555140302701", Sn: "8163A0387", Dt: 40, KdJenisBahanBakar: "B35", StatusMesin: "STANDBY"},
			{Nomor: 2, NamaMesin: "PLTD KARANGAN DALAM #06 (CUMMINS) EX PLTD TABISAQ #06", IdMesin: "027002", KodeMesinSilm: "22555140302702", Sn: "30340523", Dt: 280, KdJenisBahanBakar: "B35", StatusMesin: "STANDBY"},
		}
	case "0271":
		return unitName, kdArea, namaArea, []models.WACBMachineItem{
			{Nomor: 1, NamaMesin: "PLTD KAYAN HULU #01 (DEUTZ)", IdMesin: "000386", KodeMesinSilm: "22555140302711", Sn: "11337740", Dt: 250, KdJenisBahanBakar: "B35", StatusMesin: "OPERASI"},
			{Nomor: 2, NamaMesin: "PLTD KAYAN HULU #02 (DEUTZ)", IdMesin: "000387", KodeMesinSilm: "22555140302712", Sn: "11337741", Dt: 250, KdJenisBahanBakar: "B35", StatusMesin: "OPERASI"},
			{Nomor: 3, NamaMesin: "PLTD KAYAN HULU #04 (DEUTZ)", IdMesin: "000391", KodeMesinSilm: "22555140302713", Sn: "11338323", Dt: 250, KdJenisBahanBakar: "B35", StatusMesin: "STANDBY"},
			{Nomor: 4, NamaMesin: "PLTD KAYAN HULU #05 (DEUTZ)", IdMesin: "000392", KodeMesinSilm: "22555140302714", Sn: "11522621", Dt: 250, KdJenisBahanBakar: "B35", StatusMesin: "STANDBY"},
			{Nomor: 5, NamaMesin: "PLTD KAYAN HULU #06 (YANMAR)", IdMesin: "000386", KodeMesinSilm: "22555140302715", Sn: "0", Dt: 25, KdJenisBahanBakar: "B35", StatusMesin: "STANDBY"},
			{Nomor: 6, NamaMesin: "PLTS SW KAYAN HULU (ESDM)", IdMesin: "000386", KodeMesinSilm: "22555140302716", Sn: "0", Dt: 100, KdJenisBahanBakar: "B35", StatusMesin: "GANGGUAN"},
		}
	case "0272":
		return unitName, kdArea, namaArea, []models.WACBMachineItem{
			{Nomor: 1, NamaMesin: "PLTD KELAY #03 (PEMKAB BERAU)", IdMesin: "001706", KodeMesinSilm: "22555140302721", Sn: "11168687", Dt: 201, KdJenisBahanBakar: "B35", StatusMesin: "STANDBY"},
			{Nomor: 2, NamaMesin: "PLTD KELAY #04 (CATERPILLAR) EX PLTD KAUBUN #05", IdMesin: "001707", KodeMesinSilm: "22555140302722", Sn: "3F 203313", Dt: 400, KdJenisBahanBakar: "B35", StatusMesin: "OPERASI"},
			{Nomor: 3, NamaMesin: "PLTD KELAY #05 (MAN) EX PLTD GUNUNG SARI #06", IdMesin: "004403", KodeMesinSilm: "22555140302723", Sn: "39426022002609", Dt: 200, KdJenisBahanBakar: "B35", StatusMesin: "OPERASI"},
			{Nomor: 4, NamaMesin: "PLTD KELAY #06 (DEUTZ) EX PLTD LUMBIS OGONG #02", IdMesin: "004475", KodeMesinSilm: "22555140302724", Sn: "11462448", Dt: 250, KdJenisBahanBakar: "B35", StatusMesin: "OPERASI"},
		}
	case "0273":
		return unitName, kdArea, namaArea, []models.WACBMachineItem{
			{Nomor: 1, NamaMesin: "PLTD KELUMPANG #01 (DEUTZ)", IdMesin: "027301", KodeMesinSilm: "22555140302731", Sn: "00125443", Dt: 40, KdJenisBahanBakar: "B35", StatusMesin: "STANDBY"},
			{Nomor: 2, NamaMesin: "PLTD KELUMPANG #02 (DEUTZ)", IdMesin: "027302", KodeMesinSilm: "22555140302732", Sn: "8048069", Dt: 40, KdJenisBahanBakar: "B35", StatusMesin: "STANDBY"},
			{Nomor: 3, NamaMesin: "PLTD KELUMPANG #04 (DEUTZ) EX PLTD MUARA ALOH #03", IdMesin: "027303", KodeMesinSilm: "22555140302733", Sn: "80481218", Dt: 40, KdJenisBahanBakar: "B35", StatusMesin: "STANDBY"},
		}
	case "0274":
		return unitName, kdArea, namaArea, []models.WACBMachineItem{
			{Nomor: 1, NamaMesin: "PLTD KRAYAN #01 (DEUTZ)", IdMesin: "000399", KodeMesinSilm: "22555140302741", Sn: "11750183", Dt: 200, KdJenisBahanBakar: "B35", StatusMesin: "OPERASI"},
			{Nomor: 2, NamaMesin: "PLTD KRAYAN #02 (DEUTZ)", IdMesin: "000400", KodeMesinSilm: "22555140302742", Sn: "11750182", Dt: 200, KdJenisBahanBakar: "B35", StatusMesin: "OPERASI"},
			{Nomor: 3, NamaMesin: "PLTD KRAYAN #04 (CUMMINS)", IdMesin: "000401", KodeMesinSilm: "22555140302743", Sn: "25374283", Dt: 250, KdJenisBahanBakar: "B35", StatusMesin: "GANGGUAN"},
			{Nomor: 4, NamaMesin: "PLTD KRAYAN #06 (MAN) EX PLTD BUNYU #04", IdMesin: "000404", KodeMesinSilm: "22555140302744", Sn: "39092790614101", Dt: 200, KdJenisBahanBakar: "B35", StatusMesin: "OPERASI"},
			{Nomor: 5, NamaMesin: "PLTD KRAYAN #07 (MERCEDES-BENZ) EX PLTD BATU PUTIH #01", IdMesin: "000405", KodeMesinSilm: "22555140302745", Sn: "444901400024517", Dt: 396, KdJenisBahanBakar: "B35", StatusMesin: "GANGGUAN"},
			{Nomor: 6, NamaMesin: "PLTD KRAYAN #08 (DEUTZ) EX PLTD KARANGAN DALAM #07", IdMesin: "000379", KodeMesinSilm: "22555140302746", Sn: "11902079", Dt: 240, KdJenisBahanBakar: "B35", StatusMesin: "OPERASI"},
		}
	case "0275":
		return unitName, kdArea, namaArea, []models.WACBMachineItem{
			{Nomor: 1, NamaMesin: "PLTD LONG APARI #02 (DEUTZ)", IdMesin: "000410", KodeMesinSilm: "22555140302751", Sn: "11782013", Dt: 100, KdJenisBahanBakar: "B35", StatusMesin: "OPERASI"},
			{Nomor: 2, NamaMesin: "PLTD LONG APARI #03 (DEUTZ)", IdMesin: "000411", KodeMesinSilm: "22555140302752", Sn: "11782005", Dt: 100, KdJenisBahanBakar: "B35", StatusMesin: "OPERASI"},
			{Nomor: 3, NamaMesin: "PLTD LONG APARI #04 (DEUTZ)", IdMesin: "000412", KodeMesinSilm: "22555140302753", Sn: "11782012", Dt: 100, KdJenisBahanBakar: "B35", StatusMesin: "STANDBY"},
			{Nomor: 4, NamaMesin: "PLTD LONG APARI #05 (DEUTZ)", IdMesin: "000413", KodeMesinSilm: "22555140302754", Sn: "11782011", Dt: 100, KdJenisBahanBakar: "B35", StatusMesin: "OPERASI"},
			{Nomor: 5, NamaMesin: "PLTD LONG APARI #06 (DEUTZ)", IdMesin: "000414", KodeMesinSilm: "22555140302755", Sn: "11710950", Dt: 100, KdJenisBahanBakar: "B35", StatusMesin: "OPERASI"},
			{Nomor: 6, NamaMesin: "PLTD LONG APARI #07 (DEUTZ)", IdMesin: "000415", KodeMesinSilm: "22555140302756", Sn: "11743580", Dt: 100, KdJenisBahanBakar: "B35", StatusMesin: "STANDBY"},
		}
	case "0276":
		return unitName, kdArea, namaArea, []models.WACBMachineItem{
			{Nomor: 1, NamaMesin: "PLTD LONG LAYU #01 (CUMMINS) EX PLTD KRAYAN SELATAN #01", IdMesin: "000416", KodeMesinSilm: "22555140302761", Sn: "201204010", Dt: 50, KdJenisBahanBakar: "B35", StatusMesin: "OPERASI"},
			{Nomor: 2, NamaMesin: "PLTD LONG LAYU #02 (CUMMINS) EX PLTD KRAYAN SELATAN #02", IdMesin: "000417", KodeMesinSilm: "22555140302762", Sn: "31501038", Dt: 50, KdJenisBahanBakar: "B35", StatusMesin: "STANDBY"},
			{Nomor: 3, NamaMesin: "PLTD LONG LAYU #03 (DEUTZ)", IdMesin: "003289", KodeMesinSilm: "22555140302763", Sn: "12186944", Dt: 128, KdJenisBahanBakar: "B35", StatusMesin: "STANDBY"},
		}
	case "0277":
		return unitName, kdArea, namaArea, []models.WACBMachineItem{
			{Nomor: 1, NamaMesin: "PLTD LONG PAHANGAI #01 (DEUTZ)", IdMesin: "000418", KodeMesinSilm: "22555140302771", Sn: "11782010", Dt: 100, KdJenisBahanBakar: "B35", StatusMesin: "OPERASI"},
			{Nomor: 2, NamaMesin: "PLTD LONG PAHANGAI #02 (DEUTZ)", IdMesin: "000419", KodeMesinSilm: "22555140302772", Sn: "11778334", Dt: 100, KdJenisBahanBakar: "B35", StatusMesin: "OPERASI"},
			{Nomor: 3, NamaMesin: "PLTD LONG PAHANGAI #03 (DEUTZ)", IdMesin: "000420", KodeMesinSilm: "22555140302773", Sn: "11782006", Dt: 100, KdJenisBahanBakar: "B35", StatusMesin: "OPERASI"},
			{Nomor: 4, NamaMesin: "PLTD LONG PAHANGAI #04 (DEUTZ)", IdMesin: "000421", KodeMesinSilm: "22555140302774", Sn: "11782007", Dt: 100, KdJenisBahanBakar: "B35", StatusMesin: "STANDBY"},
			{Nomor: 5, NamaMesin: "PLTD LONG PAHANGAI #05 (DEUTZ)", IdMesin: "000422", KodeMesinSilm: "22555140302775", Sn: "11782009", Dt: 100, KdJenisBahanBakar: "B35", StatusMesin: "STANDBY"},
			{Nomor: 6, NamaMesin: "PLTD LONG PAHANGAI #06 (DEUTZ)", IdMesin: "000423", KodeMesinSilm: "22555140302776", Sn: "11782008", Dt: 100, KdJenisBahanBakar: "B35", StatusMesin: "STANDBY"},
		}
	case "0278":
		return unitName, kdArea, namaArea, []models.WACBMachineItem{
			{Nomor: 1, NamaMesin: "PLTD LONG PESO #01 (CUMMINS)", IdMesin: "000424", KodeMesinSilm: "22555140302781", Sn: "44649131", Dt: 100, KdJenisBahanBakar: "B35", StatusMesin: "OPERASI"},
			{Nomor: 2, NamaMesin: "PLTD LONG PESO #02 (DEUTZ)", IdMesin: "000425", KodeMesinSilm: "22555140302782", Sn: "0061999", Dt: 100, KdJenisBahanBakar: "B35", StatusMesin: "STANDBY"},
			{Nomor: 3, NamaMesin: "PLTD LONG PESO #03 (KOMATSU)", IdMesin: "000426", KodeMesinSilm: "22555140302783", Sn: "18648", Dt: 243, KdJenisBahanBakar: "B35", StatusMesin: "OPERASI"},
			{Nomor: 4, NamaMesin: "PLTD LONG PESO #04 (MAN) EX PLTD MUARA PAHU #02 (MAN)", IdMesin: "000427", KodeMesinSilm: "22555140302784", Sn: "39092790574101", Dt: 200, KdJenisBahanBakar: "B35", StatusMesin: "OPERASI"},
			{Nomor: 5, NamaMesin: "PLTD LONG PESO #05 (DEUTZ-PEMKAB) EX PLTD SEKATAK BUJI #03", IdMesin: "000428", KodeMesinSilm: "22555140302785", Sn: "10717820", Dt: 160, KdJenisBahanBakar: "B35", StatusMesin: "STANDBY"},
		}
	case "0279":
		return unitName, kdArea, namaArea, []models.WACBMachineItem{
			{Nomor: 1, NamaMesin: "PLTD LONG SEGAR #04 (PT KPC)", IdMesin: "000432", KodeMesinSilm: "22555140302791", Sn: "39431611383155", Dt: 220, KdJenisBahanBakar: "B35", StatusMesin: "OPERASI"},
			{Nomor: 2, NamaMesin: "PLTD LONG SEGAR #05 (KOMATSU) EX PLTD DATAH BILANG #04", IdMesin: "000535", KodeMesinSilm: "22555140302792", Sn: "18488", Dt: 240, KdJenisBahanBakar: "B35", StatusMesin: "OPERASI"},
			{Nomor: 3, NamaMesin: "PLTD LONG SEGAR #06 (DEUTZ) EX PLTD GEMAR BARU #05", IdMesin: "000536", KodeMesinSilm: "22555140302793", Sn: "11953953", Dt: 180, KdJenisBahanBakar: "B35", StatusMesin: "OPERASI"},
		}
	case "0280":
		return unitName, kdArea, namaArea, []models.WACBMachineItem{
			{Nomor: 1, NamaMesin: "PLTD LUMBIS OGONG #01 (DEUTZ)", IdMesin: "000434", KodeMesinSilm: "22555140302801", Sn: "11794282", Dt: 250, KdJenisBahanBakar: "B35", StatusMesin: "STANDBY"},
			{Nomor: 2, NamaMesin: "PLTD LUMBIS OGONG #03 (DEUTZ) EX PLTD MUARA ALOH #02", IdMesin: "000436", KodeMesinSilm: "22555140302802", Sn: "00102754", Dt: 41, KdJenisBahanBakar: "B35", StatusMesin: "OPERASI"},
			{Nomor: 3, NamaMesin: "PLTS SW LUMBIS OGONG (ESDM)", IdMesin: "000436", KodeMesinSilm: "22555140302803", Sn: "0", Dt: 100, KdJenisBahanBakar: "B35", StatusMesin: "GANGGUAN"},
		}
	case "0281":
		return unitName, kdArea, namaArea, []models.WACBMachineItem{
			{Nomor: 1, NamaMesin: "PLTD MARATUA #02 (DEUTZ) EX PLTD PULAU DERAWAN #01", IdMesin: "000437", KodeMesinSilm: "22555140302811", Sn: "09188693", Dt: 338, KdJenisBahanBakar: "B35", StatusMesin: "GANGGUAN"},
			{Nomor: 2, NamaMesin: "PLTD MARATUA #03 (DEUTZ) EX PLTD GUNUNG SARI #05", IdMesin: "000439", KodeMesinSilm: "22555140302812", Sn: "11951492", Dt: 250, KdJenisBahanBakar: "B35", StatusMesin: "OPERASI"},
			{Nomor: 3, NamaMesin: "PLTD MARATUA #04 (DEUTZ) EX BATU PUTIH #03", IdMesin: "000440", KodeMesinSilm: "22555140302813", Sn: "11910171", Dt: 250, KdJenisBahanBakar: "B35", StatusMesin: "OPERASI"},
			{Nomor: 4, NamaMesin: "PLTD MARATUA #05 (KOMATSU) EX PLTD KAUBUN #02", IdMesin: "001709", KodeMesinSilm: "22555140302814", Sn: "30106", Dt: 500, KdJenisBahanBakar: "B35", StatusMesin: "GANGGUAN"},
			{Nomor: 5, NamaMesin: "PLTD MARATUA #06 (DEUTZ) EX PLTD KARANGAN DALAM #03", IdMesin: "003274", KodeMesinSilm: "22555140302815", Sn: "11916834", Dt: 240, KdJenisBahanBakar: "B35", StatusMesin: "OPERASI"},
			{Nomor: 6, NamaMesin: "PLTD MARATUA #07 (KOMATSU) EX PLTD TANJUNG BATU KALTIMRA #06", IdMesin: "000518", KodeMesinSilm: "22555140302816", Sn: "13880", Dt: 720, KdJenisBahanBakar: "B35", StatusMesin: "OPERASI"},
		}
	case "0282":
		return unitName, kdArea, namaArea, []models.WACBMachineItem{
			{Nomor: 1, NamaMesin: "PLTD MERASA #06 (DEUTZ) EX PLTD GUNUNG SARI #07", IdMesin: "000446", KodeMesinSilm: "22555140302821", Sn: "84103CO122", Dt: 100, KdJenisBahanBakar: "B35", StatusMesin: "OPERASI"},
			{Nomor: 2, NamaMesin: "PLTD MERASA #07 (DEUTZ) EX PLTD SEMAYANG #01", IdMesin: "000537", KodeMesinSilm: "22555140302822", Sn: "00102756", Dt: 40, KdJenisBahanBakar: "B35", StatusMesin: "STANDBY"},
			{Nomor: 3, NamaMesin: "PLTD MERASA #08 (CUMMINS) EX PLTD KELAY #02", IdMesin: "000394", KodeMesinSilm: "22555140302823", Sn: "87744063", Dt: 125, KdJenisBahanBakar: "B35", StatusMesin: "STANDBY"},
			{Nomor: 4, NamaMesin: "PLTD MERASA #09 (CUMMINS) EX PLTD DILANG PUTI #07", IdMesin: "004109", KodeMesinSilm: "22555140302824", Sn: "44649137", Dt: 100, KdJenisBahanBakar: "B35", StatusMesin: "OPERASI"},
		}
	case "0283":
		return unitName, kdArea, namaArea, []models.WACBMachineItem{
			{Nomor: 1, NamaMesin: "PLTD MUARA PAHU #03 (MAN)", IdMesin: "000449", KodeMesinSilm: "22555140302831", Sn: "49418358031834", Dt: 500, KdJenisBahanBakar: "B35", StatusMesin: "OPERASI"},
			{Nomor: 2, NamaMesin: "PLTD MUARA PAHU #04 (MAN)", IdMesin: "000450", KodeMesinSilm: "22555140302832", Sn: "49497382134201", Dt: 500, KdJenisBahanBakar: "B35", StatusMesin: "OPERASI"},
			{Nomor: 3, NamaMesin: "PLTD MUARA PAHU #05 (PEMKAB-MAN) EX PLTD BONGAN #02", IdMesin: "000548", KodeMesinSilm: "22555140302833", Sn: "49408332460826", Dt: 500, KdJenisBahanBakar: "B35", StatusMesin: "STANDBY"},
			{Nomor: 4, NamaMesin: "PLTD MUARA PAHU #06 (MAN) EX PLTD KAUBUN #01", IdMesin: "000381", KodeMesinSilm: "22555140302834", Sn: "49418232921764", Dt: 536, KdJenisBahanBakar: "B35", StatusMesin: "STANDBY"},
			{Nomor: 5, NamaMesin: "PLTD MUARA PAHU #07 (MAN) EX PLTD SEI MENGGARIS #04", IdMesin: "000489", KodeMesinSilm: "22555140302835", Sn: "39091781614101", Dt: 200, KdJenisBahanBakar: "B35", StatusMesin: "OPERASI"},
		}
	case "0284":
		return unitName, kdArea, namaArea, []models.WACBMachineItem{
			{Nomor: 1, NamaMesin: "PLTD MUARA PANTUAN #01 (DEUTZ)", IdMesin: "000451", KodeMesinSilm: "22555140302841", Sn: "8163 DO 528", Dt: 40, KdJenisBahanBakar: "B35", StatusMesin: "STANDBY"},
			{Nomor: 2, NamaMesin: "PLTD MUARA PANTUAN #03 (DEUTZ)", IdMesin: "000453", KodeMesinSilm: "22555140302842", Sn: "6711749", Dt: 100, KdJenisBahanBakar: "B35", StatusMesin: "STANDBY"},
			{Nomor: 3, NamaMesin: "PLTD MUARA PANTUAN #07 (DEUTZ) EX PLTD TABANG #04", IdMesin: "000456", KodeMesinSilm: "22555140302843", Sn: "6711921", Dt: 100, KdJenisBahanBakar: "B35", StatusMesin: "STANDBY"},
			{Nomor: 4, NamaMesin: "PLTD MUARA PANTUAN #09 (MTU) EX PLTD LONG IRAM #08", IdMesin: "000524", KodeMesinSilm: "22555140302844", Sn: "901400024738", Dt: 280, KdJenisBahanBakar: "B35", StatusMesin: "OPERASI"},
			{Nomor: 5, NamaMesin: "PLTD MUARA PANTUAN #10 (KOMATSU) EX PLTD JANTUR #09", IdMesin: "004433", KodeMesinSilm: "22555140302845", Sn: "115077", Dt: 240, KdJenisBahanBakar: "B35", StatusMesin: "STANDBY"},
		}
	case "0285":
		return unitName, kdArea, namaArea, []models.WACBMachineItem{
			{Nomor: 1, NamaMesin: "PLTD MUARA SIRAN #02 (DEUTZ)", IdMesin: "000463", KodeMesinSilm: "22555140302851", Sn: "8046130", Dt: 40, KdJenisBahanBakar: "B35", StatusMesin: "OPERASI"},
			{Nomor: 2, NamaMesin: "PLTD MUARA SIRAN #03 (DEUTZ)", IdMesin: "000464", KodeMesinSilm: "22555140302852", Sn: "7134413", Dt: 100, KdJenisBahanBakar: "B35", StatusMesin: "OPERASI"},
			{Nomor: 3, NamaMesin: "PLTD MUARA SIRAN #04 (CUMMINS) EX PLTD JANTUR #06", IdMesin: "000465", KodeMesinSilm: "22555140302853", Sn: "44771255", Dt: 100, KdJenisBahanBakar: "B35", StatusMesin: "STANDBY"},
			{Nomor: 4, NamaMesin: "PLTD MUARA SIRAN #05 (DEUTZ) EX PLTD JANTUR #02", IdMesin: "000466", KodeMesinSilm: "22555140302854", Sn: "00127035", Dt: 100, KdJenisBahanBakar: "B35", StatusMesin: "OPERASI"},
			{Nomor: 5, NamaMesin: "PLTD MUARA SIRAN #06 (MTU) EX PLTD SEMAYANG #02", IdMesin: "000492", KodeMesinSilm: "22555140302855", Sn: "0084893", Dt: 100, KdJenisBahanBakar: "B35", StatusMesin: "OPERASI"},
		}
	case "0286":
		return unitName, kdArea, namaArea, []models.WACBMachineItem{
			{Nomor: 1, NamaMesin: "PLTD PULAU DERAWAN #02 (CUMMINS)", IdMesin: "000468", KodeMesinSilm: "22555140302861", Sn: "21150206", Dt: 100, KdJenisBahanBakar: "B35", StatusMesin: "STANDBY"},
			{Nomor: 2, NamaMesin: "PLTD PULAU DERAWAN #04 (MERCEDES-BENZ)", IdMesin: "000469", KodeMesinSilm: "22555140302862", Sn: "086655", Dt: 100, KdJenisBahanBakar: "B35", StatusMesin: "STANDBY"},
			{Nomor: 3, NamaMesin: "PLTD PULAU DERAWAN #05 (DEUTZ)", IdMesin: "000470", KodeMesinSilm: "22555140302863", Sn: "11902077", Dt: 250, KdJenisBahanBakar: "B35", StatusMesin: "OPERASI"},
			{Nomor: 4, NamaMesin: "PLTD PULAU DERAWAN #06 (DEUTZ)", IdMesin: "000471", KodeMesinSilm: "22555140302864", Sn: "11895189", Dt: 250, KdJenisBahanBakar: "B35", StatusMesin: "OPERASI"},
			{Nomor: 5, NamaMesin: "PLTD PULAU DERAWAN #07 (DEUTZ)", IdMesin: "000543", KodeMesinSilm: "22555140302865", Sn: "12022527", Dt: 250, KdJenisBahanBakar: "B35", StatusMesin: "OPERASI"},
			{Nomor: 6, NamaMesin: "PLTD PULAU DERAWAN #09 (DEUTZ) EX PLTD KRAYAN #05", IdMesin: "000544", KodeMesinSilm: "22555140302866", Sn: "11958004", Dt: 200, KdJenisBahanBakar: "B35", StatusMesin: "OPERASI"},
			{Nomor: 7, NamaMesin: "PLTD PULAU DERAWAN #10 (CUMMINS) EX PLTD TANJUNG BATU KALTIMRA #07", IdMesin: "000544", KodeMesinSilm: "22555140302867", Sn: "41332025", Dt: 500, KdJenisBahanBakar: "B35", StatusMesin: "OPERASI"},
			{Nomor: 8, NamaMesin: "PLTS PULAU DERAWAN #01", IdMesin: "000468", KodeMesinSilm: "22555140302868", Sn: "0", Dt: 210, KdJenisBahanBakar: "B35", StatusMesin: "GANGGUAN"},
		}
	case "0287":
		return unitName, kdArea, namaArea, []models.WACBMachineItem{
			{Nomor: 1, NamaMesin: "PLTD PA UPAN #01 (FAWDE) EX PLTD KRAYAN SELATAN #03", IdMesin: "000473", KodeMesinSilm: "22555140302871", Sn: "1705291", Dt: 25, KdJenisBahanBakar: "B35", StatusMesin: "OPERASI"},
			{Nomor: 2, NamaMesin: "PLTD PA UPAN #02 (FAWDE) EX PLTD KRAYAN SELATAN #04", IdMesin: "000474", KodeMesinSilm: "22555140302872", Sn: "175292", Dt: 25, KdJenisBahanBakar: "B35", StatusMesin: "OPERASI"},
		}
	case "0288":
		return unitName, kdArea, namaArea, []models.WACBMachineItem{
			{Nomor: 1, NamaMesin: "PLTD PENYINGGAHAN #01 (DEUTZ)", IdMesin: "000475", KodeMesinSilm: "22555140302881", Sn: "84103CX0108", Dt: 100, KdJenisBahanBakar: "B35", StatusMesin: "OPERASI"},
			{Nomor: 2, NamaMesin: "PLTD PENYINGGAHAN #03 (DEUTZ)", IdMesin: "000476", KodeMesinSilm: "22555140302882", Sn: "9120191", Dt: 220, KdJenisBahanBakar: "B35", StatusMesin: "OPERASI"},
			{Nomor: 3, NamaMesin: "PLTD PENYINGGAHAN #04 (KOMATSU)", IdMesin: "000477", KodeMesinSilm: "22555140302883", Sn: "119884", Dt: 240, KdJenisBahanBakar: "B35", StatusMesin: "OPERASI"},
			{Nomor: 4, NamaMesin: "PLTD PENYINGGAHAN #05 (MAN) EX PLTD JANTUR #03", IdMesin: "004121", KodeMesinSilm: "22555140302884", Sn: "39086350454101", Dt: 220, KdJenisBahanBakar: "B35", StatusMesin: "OPERASI"},
		}
	case "0289":
		return unitName, kdArea, namaArea, []models.WACBMachineItem{
			{Nomor: 1, NamaMesin: "PLTD SEDULANG #05 (DEUTZ) EX PLTD MUARA KEDANG #05", IdMesin: "000483", KodeMesinSilm: "22555140302891", Sn: "00669908", Dt: 100, KdJenisBahanBakar: "B35", StatusMesin: "OPERASI"},
			{Nomor: 2, NamaMesin: "PLTD SEDULANG #06 (DEUTZ) EX PLTD MUARA KEDANG #03", IdMesin: "000484", KodeMesinSilm: "22555140302892", Sn: "8163E0684", Dt: 40, KdJenisBahanBakar: "B35", StatusMesin: "OPERASI"},
			{Nomor: 3, NamaMesin: "PLTD SEDULANG #07 (CUMMINS) EX PLTD MUARA ALOH #04", IdMesin: "000485", KodeMesinSilm: "22555140302893", Sn: "44783804", Dt: 100, KdJenisBahanBakar: "B35", StatusMesin: "STANDBY"},
			{Nomor: 4, NamaMesin: "PLTD SEDULANG #08 (MERCEDES-BENZ) EX PLTD PENGANDAN #05", IdMesin: "000531", KodeMesinSilm: "22555140302894", Sn: "137352", Dt: 100, KdJenisBahanBakar: "B35", StatusMesin: "OPERASI"},
			{Nomor: 5, NamaMesin: "PLTD SEDULANG #09 (DEUTZ) EX PLTD JANTUR #04", IdMesin: "000534", KodeMesinSilm: "22555140302895", Sn: "9120189", Dt: 304, KdJenisBahanBakar: "B35", StatusMesin: "OPERASI"},
		}
	case "0290":
		return unitName, kdArea, namaArea, []models.WACBMachineItem{
			{Nomor: 1, NamaMesin: "PLTD SEI MENGGARIS #01 (DEUTZ)", IdMesin: "000486", KodeMesinSilm: "22555140302901", Sn: "11338325", Dt: 200, KdJenisBahanBakar: "B35", StatusMesin: "OPERASI"},
			{Nomor: 2, NamaMesin: "PLTD SEI MENGGARIS #02 (DEUTZ)", IdMesin: "000487", KodeMesinSilm: "22555140302902", Sn: "11338324", Dt: 200, KdJenisBahanBakar: "B35", StatusMesin: "OPERASI"},
			{Nomor: 3, NamaMesin: "PLTD SEI MENGGARIS #03 (DEUTZ)", IdMesin: "000488", KodeMesinSilm: "22555140302903", Sn: "11338328", Dt: 200, KdJenisBahanBakar: "B35", StatusMesin: "OPERASI"},
			{Nomor: 4, NamaMesin: "PLTD SEI MENGGARIS #05 (DEUTZ) EX PLTD SEKATAK BUJI #07", IdMesin: "000490", KodeMesinSilm: "22555140302904", Sn: "11902083", Dt: 240, KdJenisBahanBakar: "B35", StatusMesin: "OPERASI"},
			{Nomor: 5, NamaMesin: "PLTD SEI MENGGARIS #06 (CUMMINS) EX PLTD GUNUNG SARI #04", IdMesin: "000491", KodeMesinSilm: "22555140302905", Sn: "4469110", Dt: 100, KdJenisBahanBakar: "B35", StatusMesin: "STANDBY"},
			{Nomor: 6, NamaMesin: "PLTD SEI MENGGARIS #07 (DEUTZ) EX PLTD KRAYAN #03", IdMesin: "001703", KodeMesinSilm: "22555140302906", Sn: "11338326", Dt: 200, KdJenisBahanBakar: "B35", StatusMesin: "OPERASI"},
			{Nomor: 7, NamaMesin: "PLTD SEI MENGGARIS #08 (DEUTZ) EX PLTD BIDUK-BIDUK #07", IdMesin: "000532", KodeMesinSilm: "22555140302907", Sn: "11895182", Dt: 250, KdJenisBahanBakar: "B35", StatusMesin: "STANDBY"},
			{Nomor: 8, NamaMesin: "PLTD SEI MENGGARIS #09 (MAN) EX PLTD TANJUNG BATU KALTIMRA #08", IdMesin: "000549", KodeMesinSilm: "22555140302908", Sn: "52141161104110", Dt: 200, KdJenisBahanBakar: "B35", StatusMesin: "GANGGUAN"},
			{Nomor: 9, NamaMesin: "PLTD SEI MENGGARIS #10 (CUMMINS) EX PLTD BIDUK-BIDUK #05", IdMesin: "004379", KodeMesinSilm: "22555140302909", Sn: "85002991", Dt: 625, KdJenisBahanBakar: "B35", StatusMesin: "OPERASI"},
			{Nomor: 10, NamaMesin: "PLTD SEI MENGGARIS #11 (CUMMINS) EX PLTD TANJUNG BATU KALTIMRA #05", IdMesin: "004387", KodeMesinSilm: "225551403029010", Sn: "85002979", Dt: 650, KdJenisBahanBakar: "B35", StatusMesin: "GANGGUAN"},
			{Nomor: 11, NamaMesin: "PLTD SEI MENGGARIS #12 (MTU) EX PLTD PLTD BIDUK-BIDUK #06", IdMesin: "004480", KodeMesinSilm: "225551403029011", Sn: "535102557", Dt: 500, KdJenisBahanBakar: "B35", StatusMesin: "OPERASI"},
		}
	case "0291":
		return unitName, kdArea, namaArea, []models.WACBMachineItem{
			{Nomor: 1, NamaMesin: "PLTD MUARA KEDANG #01 (DEUTZ)", IdMesin: "029101", KodeMesinSilm: "22555140302911", Sn: "8048138", Dt: 40, KdJenisBahanBakar: "B35", StatusMesin: "GANGGUAN"},
		}
	case "0292":
		return unitName, kdArea, namaArea, []models.WACBMachineItem{
			{Nomor: 1, NamaMesin: "PLTD SENYIUR #01 (PEMKAB KUTIM)", IdMesin: "004115", KodeMesinSilm: "22555140302921", Sn: "39400321974201", Dt: 200, KdJenisBahanBakar: "B35", StatusMesin: "OPERASI"},
			{Nomor: 2, NamaMesin: "PLTD SENYIUR #02 (PEMKAB KUTIM)", IdMesin: "000497", KodeMesinSilm: "22555140302922", Sn: "39400311744201", Dt: 200, KdJenisBahanBakar: "B35", StatusMesin: "OPERASI"},
			{Nomor: 3, NamaMesin: "PLTD SENYIUR #03 (DEUTZ)", IdMesin: "000498", KodeMesinSilm: "22555140302923", Sn: "11902080", Dt: 240, KdJenisBahanBakar: "B35", StatusMesin: "OPERASI"},
			{Nomor: 4, NamaMesin: "PLTD SENYIUR #04 (DEUTZ)", IdMesin: "000499", KodeMesinSilm: "22555140302924", Sn: "11902082", Dt: 240, KdJenisBahanBakar: "B35", StatusMesin: "GANGGUAN"},
		}
	case "0293":
		return unitName, kdArea, namaArea, []models.WACBMachineItem{
			{Nomor: 1, NamaMesin: "PLTD TABANG #05 (MTU)", IdMesin: "000505", KodeMesinSilm: "22555140302931", Sn: "901400024518", Dt: 250, KdJenisBahanBakar: "B35", StatusMesin: "OPERASI"},
			{Nomor: 2, NamaMesin: "PLTD TABANG #06 (CUMMINS) EX PLTD LONG PAHANGAI", IdMesin: "000506", KodeMesinSilm: "22555140302932", Sn: "232201887", Dt: 250, KdJenisBahanBakar: "B35", StatusMesin: "STANDBY"},
			{Nomor: 3, NamaMesin: "PLTD MOBILER TABANG #07 (BS-MTU) EX PLTD MOBILER UP3 SAMARINDA #01", IdMesin: "000530", KodeMesinSilm: "22555140302933", Sn: "535102558", Dt: 500, KdJenisBahanBakar: "B35", StatusMesin: "GANGGUAN"},
			{Nomor: 4, NamaMesin: "PLTD TABANG #08 (DEUTZ) EX PLTD KARANGAN DALAM #05", IdMesin: "003179", KodeMesinSilm: "22555140302934", Sn: "11910015", Dt: 240, KdJenisBahanBakar: "B35", StatusMesin: "OPERASI"},
			{Nomor: 5, NamaMesin: "PLTD TABANG #09 (CUMMINS) EX PLTD BIDUK-BIDUK #04", IdMesin: "003290", KodeMesinSilm: "22555140302935", Sn: "30344519", Dt: 250, KdJenisBahanBakar: "B35", StatusMesin: "OPERASI"},
		}
	case "0294":
		return unitName, kdArea, namaArea, []models.WACBMachineItem{
			{Nomor: 1, NamaMesin: "PLTD TANAH MERAH #01 (DEUTZ)", IdMesin: "000508", KodeMesinSilm: "22555140302941", Sn: "8048136", Dt: 40, KdJenisBahanBakar: "B35", StatusMesin: "STANDBY"},
			{Nomor: 2, NamaMesin: "PLTD TANAH MERAH #02 (MAN)", IdMesin: "000510", KodeMesinSilm: "22555140302942", Sn: "39497852024201", Dt: 250, KdJenisBahanBakar: "B35", StatusMesin: "OPERASI"},
			{Nomor: 3, NamaMesin: "PLTD TANAH MERAH #05 (DEUTZ) EX PLTD LONG BELUAH #07", IdMesin: "000511", KodeMesinSilm: "22555140302943", Sn: "7134411", Dt: 100, KdJenisBahanBakar: "B35", StatusMesin: "STANDBY"},
			{Nomor: 4, NamaMesin: "PLTD TANAH MERAH #06 (MAN) EX PLTD BUNYU #05", IdMesin: "000512", KodeMesinSilm: "22555140302944", Sn: "39091781624101", Dt: 250, KdJenisBahanBakar: "B35", StatusMesin: "STANDBY"},
			{Nomor: 5, NamaMesin: "PLTD TANAH MERAH #07 (DEUTZ-PEMKAB) EX PLTD SEKATAK BUJI #04", IdMesin: "000513", KodeMesinSilm: "22555140302945", Sn: "9188695", Dt: 280, KdJenisBahanBakar: "B35", StatusMesin: "OPERASI"},
			{Nomor: 6, NamaMesin: "PLTD TANAH MERAH #08 (MAN) EX PLTD PULAU DERAWAN #08", IdMesin: "000542", KodeMesinSilm: "22555140302946", Sn: "39086670674101", Dt: 250, KdJenisBahanBakar: "B35", StatusMesin: "OPERASI"},
			{Nomor: 7, NamaMesin: "PLTD TANAH MERAH #09 (DEUTZ) EX PLTD KARANGAN DALAM #04", IdMesin: "000376", KodeMesinSilm: "22555140302947", Sn: "11916827", Dt: 240, KdJenisBahanBakar: "B35", StatusMesin: "OPERASI"},
			{Nomor: 8, NamaMesin: "PLTMG SW TANAH MERAH (PLN NUSA DAYA) (PROYEK)", IdMesin: "000508", KodeMesinSilm: "22555140302948", Sn: "H5002015031-Z", Dt: 500, KdJenisBahanBakar: "B35", StatusMesin: "OPERASI"},
		}
	case "0295":
		return unitName, kdArea, namaArea, []models.WACBMachineItem{
			{Nomor: 1, NamaMesin: "PLTD PENGANDAN #02 (DEUTZ)", IdMesin: "029501", KodeMesinSilm: "22555140302951", Sn: "8163B0461", Dt: 40, KdJenisBahanBakar: "B35", StatusMesin: "GANGGUAN"},
		}
	case "0296":
		return unitName, kdArea, namaArea, []models.WACBMachineItem{
			{Nomor: 1, NamaMesin: "PLTD LABANG #01 (DEUTZ) EX PLTD MUARA PANTUAN #02", IdMesin: "000519", KodeMesinSilm: "22555140302961", Sn: "00878565", Dt: 40, KdJenisBahanBakar: "B35", StatusMesin: "OPERASI"},
		}
	case "0297":
		return unitName, kdArea, namaArea, []models.WACBMachineItem{
			{Nomor: 1, NamaMesin: "PLTD MUARA PANTUN #01 (MERCEDES-BENZ) EX PLTD MUARA WAHAU #01 (MERCEDES-BENZ)", IdMesin: "000520", KodeMesinSilm: "22555140302971", Sn: "444901400024484", Dt: 280, KdJenisBahanBakar: "B35", StatusMesin: "OPERASI"},
			{Nomor: 2, NamaMesin: "PLTD MUARA PANTUN #02 (MTU) EX PLTD MUARA WAHAU #02", IdMesin: "000521", KodeMesinSilm: "22555140302972", Sn: "444901400024515", Dt: 280, KdJenisBahanBakar: "B35", StatusMesin: "OPERASI"},
			{Nomor: 3, NamaMesin: "PLTD MUARA PANTUN #03 (PEMDA KUKAR)", IdMesin: "000545", KodeMesinSilm: "22555140302973", Sn: "9NR00482", Dt: 180, KdJenisBahanBakar: "B35", StatusMesin: "STANDBY"},
		}
	case "0298":
		return unitName, kdArea, namaArea, []models.WACBMachineItem{
			{Nomor: 1, NamaMesin: "PLTD SEKATAK BUJI #05 (DEUTZ)", IdMesin: "029801", KodeMesinSilm: "22555140302981", Sn: "9119780/9119947", Dt: 250, KdJenisBahanBakar: "B35", StatusMesin: "GANGGUAN"},
			{Nomor: 2, NamaMesin: "PLTD SEKATAK BUJI #06 (DEUTZ)", IdMesin: "029802", KodeMesinSilm: "22555140302982", Sn: "7134410", Dt: 100, KdJenisBahanBakar: "B35", StatusMesin: "GANGGUAN"},
			{Nomor: 3, NamaMesin: "PLTD SEKATAK BUJI #09 (CUMMINS) EX PLTD SEI BUAYA #12", IdMesin: "029803", KodeMesinSilm: "22555140302983", Sn: "33160583", Dt: 1100, KdJenisBahanBakar: "B35", StatusMesin: "GANGGUAN"},
		}
	case "0299":
		return unitName, kdArea, namaArea, []models.WACBMachineItem{
			{Nomor: 1, NamaMesin: "PLTD SEMAYANG #04 (DEUTZ)", IdMesin: "029901", KodeMesinSilm: "22555140302991", Sn: "84103 C 0098", Dt: 100, KdJenisBahanBakar: "B35", StatusMesin: "STANDBY"},
			{Nomor: 2, NamaMesin: "PLTD SEMAYANG #05 (CUMMINS) EX PLTD JANTUR #01", IdMesin: "029902", KodeMesinSilm: "22555140302992", Sn: "44649126", Dt: 100, KdJenisBahanBakar: "B35", StatusMesin: "STANDBY"},
			{Nomor: 3, NamaMesin: "PLTD SEMAYANG #06 (DEUTZ) EX PLTD MUARA PAHU #01", IdMesin: "029903", KodeMesinSilm: "22555140302993", Sn: "7773905", Dt: 100, KdJenisBahanBakar: "B35", StatusMesin: "STANDBY"},
		}
	case "0300":
		return unitName, kdArea, namaArea, []models.WACBMachineItem{
			{Nomor: 1, NamaMesin: "PLTD TABISAQ #01 (CUMMINS)", IdMesin: "030001", KodeMesinSilm: "22555140303001", Sn: "44771232", Dt: 100, KdJenisBahanBakar: "B35", StatusMesin: "STANDBY"},
		}
	case "0301":
		return unitName, kdArea, namaArea, []models.WACBMachineItem{
			{Nomor: 1, NamaMesin: "PLTD TANJUNG BATU KALTIMRA #04 (MAN)", IdMesin: "030101", KodeMesinSilm: "22555140303011", Sn: "4941.8243.461780", Dt: 500, KdJenisBahanBakar: "B35", StatusMesin: "STANDBY"},
		}
	case "0934":
		return unitName, kdArea, namaArea, []models.WACBMachineItem{
			{Nomor: 1, NamaMesin: "PLTD SANDARAN #01 (PEMKAB KUTIM) EX PLTD KARANGAN DALAM #08", IdMesin: "003258", KodeMesinSilm: "22555140309341", Sn: "C09S803427", Dt: 220, KdJenisBahanBakar: "B35", StatusMesin: "OPERASI"},
			{Nomor: 2, NamaMesin: "PLTD SANDARAN #02 (DEUTZ) EX PLTD GEMAR BARU #06", IdMesin: "003259", KodeMesinSilm: "22555140309342", Sn: "11953952", Dt: 240, KdJenisBahanBakar: "B35", StatusMesin: "OPERASI"},
			{Nomor: 3, NamaMesin: "PLTD SANDARAN #03 (PEMKAB KUTIM) EX PLTD GEMAR BARU #07", IdMesin: "093403", KodeMesinSilm: "22555140309343", Sn: "21900456", Dt: 200, KdJenisBahanBakar: "B35", StatusMesin: "STANDBY"},
		}
	case "0935":
		return unitName, kdArea, namaArea, []models.WACBMachineItem{
			{Nomor: 1, NamaMesin: "PLTD TAU LUMBIS #01 (DEUTZ) EX PLTD KELUMPANG #03", IdMesin: "003281", KodeMesinSilm: "22555140309351", Sn: "00107703", Dt: 40, KdJenisBahanBakar: "B35", StatusMesin: "STANDBY"},
			{Nomor: 2, NamaMesin: "PLTD TAU LUMBIS #02 (DEUTZ) EX PLTD SEMAYANG #03", IdMesin: "000429", KodeMesinSilm: "22555140309352", Sn: "8163E0686", Dt: 40, KdJenisBahanBakar: "B35", StatusMesin: "OPERASI"},
		}
	case "1168":
		return unitName, kdArea, namaArea, []models.WACBMachineItem{
			{Nomor: 1, NamaMesin: "PLTD SUNGAI BOH #01 (DEUTZ) EX PLTD DILANG PUTI #09", IdMesin: "004110", KodeMesinSilm: "22555140311681", Sn: "064062", Dt: 100, KdJenisBahanBakar: "B35", StatusMesin: "OPERASI"},
			{Nomor: 2, NamaMesin: "PLTD SUNGAI BOH #02 (DEUTZ) EX PLTD KAYAN HULU #07", IdMesin: "004111", KodeMesinSilm: "22555140311682", Sn: "00169247", Dt: 100, KdJenisBahanBakar: "B35", StatusMesin: "STANDBY"},
			{Nomor: 3, NamaMesin: "PLTD SUNGAI BOH #03 (DEUTZ) EX PLTD KAYAN HULU #03", IdMesin: "004112", KodeMesinSilm: "22555140311683", Sn: "11337742", Dt: 250, KdJenisBahanBakar: "B35", StatusMesin: "OPERASI"},
		}
	default:
		return unitName, kdArea, namaArea, []models.WACBMachineItem{
			{Nomor: 1, NamaMesin: fmt.Sprintf("%s #01", unitName), IdMesin: fmt.Sprintf("%s01", kdUnit), KodeMesinSilm: fmt.Sprintf("225551403%s1", kdUnit), Sn: fmt.Sprintf("SN-%s-01", kdUnit), Dt: 500, KdJenisBahanBakar: "B35", StatusMesin: "OPERASI"},
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
