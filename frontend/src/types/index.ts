export type Role =
  | "SUPERADMIN"
  | "ADMIN"
  | "MANAGER"
  | "SUPERVISOR"
  | "TEKNISI"
  | "OPERATOR";

export interface User {
  id: string | number;
  username: string;
  name: string;
  email: string;
  role: Role;
  kd_region: string;
  kd_unit?: string;
  nama_unit?: string;
  avatar?: string;
}

export interface WACBUnitItem {
  kd_unit: string;
  nama_unit: string;
  kd_region: string;
  kd_area: string;
  nama_area: string;
}

export interface WACBMachineItem {
  nomor: number;
  nama_mesin: string;
  id_mesin: string;
  kode_mesin_silm: string;
  sn: string;
  dt: number;
  kd_jenis_bahan_bakar: string;
}

export interface WACBFormatResponse {
  message: string;
  units?: WACBUnitItem[];
  unit?: WACBUnitItem;
  format?: {
    title: string;
    unit_name: string;
    unit_code: string;
    date: string;
    time: string;
    operator_name: string;
    mesin: WACBMachineItem[];
    text: string;
  };
}

export interface WACBTimeSlotStatus {
  status: "done" | "not done";
  id_beban?: string | null;
}

export interface WACBMatrixUnit {
  id: number;
  kd_region: string;
  kd_unit: string;
  nama_unit: string;
  jam_operasional: number;
  logsheet_pltd: Record<string, WACBTimeSlotStatus>;
}

export interface WACBMatrixResponse {
  message?: string;
  data?: WACBMatrixUnit[];
}

export interface WACBDetailReportResponse {
  success: boolean;
  data?: {
    beban_uld?: {
      id_beban: string;
      kd_unit: string;
      nama_unit: string;
      tanggal: string;
      jam: string;
    };
    beban_mesin?: Array<{
      id_beban: string;
      id_mesin: string;
      nama_mesin: string;
      kd_status: string; // "01": OPERASI, "02": STANDBY, "03": GANGGUAN
      daya_mampu?: number;
      beban?: number;
      stand_kwh?: number;
      stand_bbm?: number;
      tek_oli?: number;
      tem_air?: number;
      arus_r?: number;
      arus_s?: number;
      arus_t?: number;
      teg?: number;
      cos_phi?: string;
      frequency?: number;
      keterangan?: string;
      operator?: string;
    }>;
  };
}

export interface MachineFormEntry {
  nomor: number;
  id_mesin: string;
  nama_mesin: string;
  kode_mesin_silm: string;
  sn: string;
  dt: number;
  daya_mampu: string;
  status_mesin: "OPERASI" | "STANDBY" | "GANGGUAN";
  beban: number;
  stand_kwh: number;
  stand_bbm: number;
  phasa_r: number;
  phasa_s: number;
  phasa_t: number;
  tek_oli: number;
  temp_air: number;
  tegangan: number;
  frequency: number;
  cos_phi: number;
  jam_kerja_mesin: number;
  kd_jenis_bahan_bakar: string;
  keterangan: string;
}

export interface BatchLogsheetRequest {
  local_id: string;
  kd_region: string;
  kd_unit: string;
  nama_unit: string;
  tanggal: string;
  jam: string;
  operator_name: string;
  machines: MachineFormEntry[];
}

export interface OfflineDraft {
  id?: number;
  local_id: string;
  kd_unit: string;
  nama_unit: string;
  tanggal: string;
  jam: string;
  operator_name: string;
  payload: BatchLogsheetRequest;
  status: "PENDING" | "SYNCING" | "FAILED";
  retry_count: number;
  error_message?: string;
  created_at: string;
}

export interface HARTicket {
  id?: number;
  ticket_number: string;
  kd_unit: string;
  nama_unit: string;
  id_mesin: string;
  nama_mesin: string;
  category: string;
  maintenance_type: string;
  running_hours: number;
  fault_description: string;
  action_taken: string;
  status: "DRAFT" | "SUBMITTED" | "IN_PROGRESS" | "RESOLVED" | "APPROVED";
  teknisi_name: string;
  supervisor_approval?: string;
  created_at?: string;
}
