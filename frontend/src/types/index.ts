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

export interface LogsheetLocation {
  lat: number;
  lng: number;
  accuracy: number;
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
  selfie_url?: string;
  foto_mesin_url?: string;
  foto_urls?: string[];
  location?: LogsheetLocation | null;
}

export interface LogsheetHistoryItem {
  id: number;
  local_id: string;
  kd_region: string;
  kd_unit: string;
  nama_unit: string;
  tanggal: string;
  jam: string;
  operator_name: string;
  machine_count: number;
  message_text: string;
  status_mesin_summary: string;
  sync_status: string;
  wacb_id: string;
  selfie_url: string;
  foto_mesin_url: string;
  foto_urls: string;
  location_lat: number;
  location_lng: number;
  location_accuracy: number;
  created_at: string;
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

export interface AppNotification {
  id: string;
  title: string;
  description: string;
  time: string;
  priority: "tinggi" | "sedang" | "rendah";
  type: string;
  target_type: string;
  is_read: boolean;
  user_id: string;
  unit_id: string;
  created_at?: string;
}

export interface MasterUnit {
  id: string;
  name: string;
  location_name?: string;
  latitude?: number;
  longitude?: number;
  radius_meter?: number;
  status: string;
}

export interface MasterMachine {
  id: string;
  unit_id: string;
  up3?: string;
  machine_name: string;
  brand?: string;
  machine_type?: string;
  serial_number?: string;
  generator_code?: string;
  ownership_status?: string;
  performance_label?: string;
  capacity?: string;
  available_capacity?: string;
  dispatch_capacity?: string;
  status: "operasi" | "standby" | "gangguan-rusak";
  condition_label?: string;
  created_at?: string;
}

export interface MasterLogsheet {
  id: string;
  unit_id: string;
  unit_name: string;
  machine_id: string;
  machine_name: string;
  machine_status: string;
  beban_mesin: number;
  stand_kwh: number;
  stand_bbm: number;
  submitted_at: string;
  sync_status: string;
  report_status: string;
  approval_status: string;
  notes?: string;
}

export interface RoleRow {
  name: Role;
  description: string;
  permissions: string[];
  users_count: number;
}

export interface StatsData {
  machines: {
    total: number;
    counts: Record<string, number>;
    alerts: {
      id: string;
      name: string;
      unit_id: string;
      status: string;
      detail: string;
      capacity: string;
      brand?: string;
      updated_at: string;
    }[];
  };
  har: {
    total: number;
    counts: Record<string, number>;
    alerts: {
      id: number;
      ticket_number: string;
      machine_name: string;
      nama_unit: string;
      status: string;
      fault_description: string;
      maintenance_type: string;
      teknisi_name?: string;
      created_at: string;
      updated_at: string;
    }[];
  };
  logsheet: {
    today: number;
    total: number;
    local_records: number;
    pending_approval: number;
    per_hour: { jam: string; jumlah: number }[];
    per_day: { tanggal: string; jumlah: number }[];
    beban_per_mesin: { mesin: string; beban: number }[];
    approval_counts: Record<string, number>;
    late: number;
    failed_sync: number;
  };
  presensi: { today: number; anomaly: number };
}
