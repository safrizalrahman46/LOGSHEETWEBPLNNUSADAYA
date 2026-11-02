-- ==========================================================
-- PLN NUSA DAYA - MIGRATION: REAL MACHINES & CAPACITIES
-- Source: DATA KINERJA MESIN TERBARU.xlsx (Filtered Non-Rusak)
-- ==========================================================

BEGIN;

-- 1. Upsert Units
INSERT INTO units (id, name, location_name, radius_meter, status, created_at, updated_at)
VALUES ('0264', 'ULD BATU AMPAR', 'SITE BONTANG', 250, 'active', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET name = 'ULD BATU AMPAR', location_name = 'SITE BONTANG', updated_at = NOW();
INSERT INTO units (id, name, location_name, radius_meter, status, created_at, updated_at)
VALUES ('0265', 'ULD BIDUK-BIDUK', 'SITE BERAU', 250, 'active', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET name = 'ULD BIDUK-BIDUK', location_name = 'SITE BERAU', updated_at = NOW();
INSERT INTO units (id, name, location_name, radius_meter, status, created_at, updated_at)
VALUES ('0266', 'ULD DATAH BILANG', 'AREA SAMARINDA', 250, 'active', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET name = 'ULD DATAH BILANG', location_name = 'AREA SAMARINDA', updated_at = NOW();
INSERT INTO units (id, name, location_name, radius_meter, status, created_at, updated_at)
VALUES ('0267', 'ULD DILANG PUTI', 'AREA SAMARINDA', 250, 'active', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET name = 'ULD DILANG PUTI', location_name = 'AREA SAMARINDA', updated_at = NOW();
INSERT INTO units (id, name, location_name, radius_meter, status, created_at, updated_at)
VALUES ('0268', 'ULD GEMAR BARU', 'SITE BONTANG', 250, 'active', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET name = 'ULD GEMAR BARU', location_name = 'SITE BONTANG', updated_at = NOW();
INSERT INTO units (id, name, location_name, radius_meter, status, created_at, updated_at)
VALUES ('0269', 'ULD JANTUR', 'AREA SAMARINDA', 250, 'active', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET name = 'ULD JANTUR', location_name = 'AREA SAMARINDA', updated_at = NOW();
INSERT INTO units (id, name, location_name, radius_meter, status, created_at, updated_at)
VALUES ('0270', 'ULD KARANGAN DALAM', 'SITE BONTANG', 250, 'active', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET name = 'ULD KARANGAN DALAM', location_name = 'SITE BONTANG', updated_at = NOW();
INSERT INTO units (id, name, location_name, radius_meter, status, created_at, updated_at)
VALUES ('0271', 'ULD KAYAN HULU', 'SITE BERAU', 250, 'active', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET name = 'ULD KAYAN HULU', location_name = 'SITE BERAU', updated_at = NOW();
INSERT INTO units (id, name, location_name, radius_meter, status, created_at, updated_at)
VALUES ('0272', 'ULD KELAY', 'SITE BERAU', 250, 'active', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET name = 'ULD KELAY', location_name = 'SITE BERAU', updated_at = NOW();
INSERT INTO units (id, name, location_name, radius_meter, status, created_at, updated_at)
VALUES ('0273', 'ULD KELUMPANG', 'AREA SAMARINDA', 250, 'active', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET name = 'ULD KELUMPANG', location_name = 'AREA SAMARINDA', updated_at = NOW();
INSERT INTO units (id, name, location_name, radius_meter, status, created_at, updated_at)
VALUES ('0274', 'ULD KRAYAN', 'AREA KALTARA', 250, 'active', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET name = 'ULD KRAYAN', location_name = 'AREA KALTARA', updated_at = NOW();
INSERT INTO units (id, name, location_name, radius_meter, status, created_at, updated_at)
VALUES ('0275', 'ULD LONG APARI', 'AREA SAMARINDA', 250, 'active', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET name = 'ULD LONG APARI', location_name = 'AREA SAMARINDA', updated_at = NOW();
INSERT INTO units (id, name, location_name, radius_meter, status, created_at, updated_at)
VALUES ('0276', 'ULD LONG LAYU', 'AREA KALTARA', 250, 'active', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET name = 'ULD LONG LAYU', location_name = 'AREA KALTARA', updated_at = NOW();
INSERT INTO units (id, name, location_name, radius_meter, status, created_at, updated_at)
VALUES ('0277', 'ULD LONG PAHANGAI', 'AREA SAMARINDA', 250, 'active', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET name = 'ULD LONG PAHANGAI', location_name = 'AREA SAMARINDA', updated_at = NOW();
INSERT INTO units (id, name, location_name, radius_meter, status, created_at, updated_at)
VALUES ('0278', 'ULD LONG PESO', 'AREA KALTARA', 250, 'active', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET name = 'ULD LONG PESO', location_name = 'AREA KALTARA', updated_at = NOW();
INSERT INTO units (id, name, location_name, radius_meter, status, created_at, updated_at)
VALUES ('0279', 'ULD LONG SEGAR', 'SITE BONTANG', 250, 'active', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET name = 'ULD LONG SEGAR', location_name = 'SITE BONTANG', updated_at = NOW();
INSERT INTO units (id, name, location_name, radius_meter, status, created_at, updated_at)
VALUES ('0280', 'ULD LUMBIS OGONG', 'SITE BERAU', 250, 'active', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET name = 'ULD LUMBIS OGONG', location_name = 'SITE BERAU', updated_at = NOW();
INSERT INTO units (id, name, location_name, radius_meter, status, created_at, updated_at)
VALUES ('0281', 'ULD MARATUA', 'SITE BERAU', 250, 'active', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET name = 'ULD MARATUA', location_name = 'SITE BERAU', updated_at = NOW();
INSERT INTO units (id, name, location_name, radius_meter, status, created_at, updated_at)
VALUES ('0282', 'ULD MERASA', 'SITE BERAU', 250, 'active', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET name = 'ULD MERASA', location_name = 'SITE BERAU', updated_at = NOW();
INSERT INTO units (id, name, location_name, radius_meter, status, created_at, updated_at)
VALUES ('0283', 'ULD MUARA PAHU', 'AREA SAMARINDA', 250, 'active', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET name = 'ULD MUARA PAHU', location_name = 'AREA SAMARINDA', updated_at = NOW();
INSERT INTO units (id, name, location_name, radius_meter, status, created_at, updated_at)
VALUES ('0284', 'ULD MUARA PANTUAN', 'AREA SAMARINDA', 250, 'active', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET name = 'ULD MUARA PANTUAN', location_name = 'AREA SAMARINDA', updated_at = NOW();
INSERT INTO units (id, name, location_name, radius_meter, status, created_at, updated_at)
VALUES ('0285', 'ULD MUARA SIRAN', 'AREA SAMARINDA', 250, 'active', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET name = 'ULD MUARA SIRAN', location_name = 'AREA SAMARINDA', updated_at = NOW();
INSERT INTO units (id, name, location_name, radius_meter, status, created_at, updated_at)
VALUES ('0286', 'ULD DERAWAN', 'SITE BERAU', 250, 'active', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET name = 'ULD DERAWAN', location_name = 'SITE BERAU', updated_at = NOW();
INSERT INTO units (id, name, location_name, radius_meter, status, created_at, updated_at)
VALUES ('0287', 'ULD PA UPAN', 'AREA KALTARA', 250, 'active', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET name = 'ULD PA UPAN', location_name = 'AREA KALTARA', updated_at = NOW();
INSERT INTO units (id, name, location_name, radius_meter, status, created_at, updated_at)
VALUES ('0288', 'ULD PENYINGGAHAN', 'AREA SAMARINDA', 250, 'active', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET name = 'ULD PENYINGGAHAN', location_name = 'AREA SAMARINDA', updated_at = NOW();
INSERT INTO units (id, name, location_name, radius_meter, status, created_at, updated_at)
VALUES ('0289', 'ULD SEDULANG', 'AREA SAMARINDA', 250, 'active', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET name = 'ULD SEDULANG', location_name = 'AREA SAMARINDA', updated_at = NOW();
INSERT INTO units (id, name, location_name, radius_meter, status, created_at, updated_at)
VALUES ('0290', 'ULD SEI MENGGARIS', 'AREA KALTARA', 250, 'active', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET name = 'ULD SEI MENGGARIS', location_name = 'AREA KALTARA', updated_at = NOW();
INSERT INTO units (id, name, location_name, radius_meter, status, created_at, updated_at)
VALUES ('0291', 'ULD MUARA KEDANG', 'AREA SAMARINDA', 250, 'active', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET name = 'ULD MUARA KEDANG', location_name = 'AREA SAMARINDA', updated_at = NOW();
INSERT INTO units (id, name, location_name, radius_meter, status, created_at, updated_at)
VALUES ('0292', 'ULD SENYIUR', 'SITE BONTANG', 250, 'active', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET name = 'ULD SENYIUR', location_name = 'SITE BONTANG', updated_at = NOW();
INSERT INTO units (id, name, location_name, radius_meter, status, created_at, updated_at)
VALUES ('0293', 'ULD TABANG', 'AREA SAMARINDA', 250, 'active', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET name = 'ULD TABANG', location_name = 'AREA SAMARINDA', updated_at = NOW();
INSERT INTO units (id, name, location_name, radius_meter, status, created_at, updated_at)
VALUES ('0294', 'ULD TANAH MERAH', 'AREA KALTARA', 250, 'active', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET name = 'ULD TANAH MERAH', location_name = 'AREA KALTARA', updated_at = NOW();
INSERT INTO units (id, name, location_name, radius_meter, status, created_at, updated_at)
VALUES ('0295', 'ULD PENGANDAN', 'SITE BONTANG', 250, 'active', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET name = 'ULD PENGANDAN', location_name = 'SITE BONTANG', updated_at = NOW();
INSERT INTO units (id, name, location_name, radius_meter, status, created_at, updated_at)
VALUES ('0296', 'ULD LABANG', 'SITE BERAU', 250, 'active', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET name = 'ULD LABANG', location_name = 'SITE BERAU', updated_at = NOW();
INSERT INTO units (id, name, location_name, radius_meter, status, created_at, updated_at)
VALUES ('0297', 'ULD MUARA PANTUN', 'SITE BONTANG', 250, 'active', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET name = 'ULD MUARA PANTUN', location_name = 'SITE BONTANG', updated_at = NOW();
INSERT INTO units (id, name, location_name, radius_meter, status, created_at, updated_at)
VALUES ('0298', 'ULD SEKATAK BUJI', 'AREA KALTARA', 250, 'active', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET name = 'ULD SEKATAK BUJI', location_name = 'AREA KALTARA', updated_at = NOW();
INSERT INTO units (id, name, location_name, radius_meter, status, created_at, updated_at)
VALUES ('0299', 'ULD SEMAYANG', 'AREA SAMARINDA', 250, 'active', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET name = 'ULD SEMAYANG', location_name = 'AREA SAMARINDA', updated_at = NOW();
INSERT INTO units (id, name, location_name, radius_meter, status, created_at, updated_at)
VALUES ('0300', 'ULD TABISAQ', 'AREA SAMARINDA', 250, 'active', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET name = 'ULD TABISAQ', location_name = 'AREA SAMARINDA', updated_at = NOW();
INSERT INTO units (id, name, location_name, radius_meter, status, created_at, updated_at)
VALUES ('0301', 'ULD TANJUNG BATU', 'SITE BERAU', 250, 'active', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET name = 'ULD TANJUNG BATU', location_name = 'SITE BERAU', updated_at = NOW();
INSERT INTO units (id, name, location_name, radius_meter, status, created_at, updated_at)
VALUES ('0934', 'ULD SANDARAN', 'SITE BONTANG', 250, 'active', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET name = 'ULD SANDARAN', location_name = 'SITE BONTANG', updated_at = NOW();
INSERT INTO units (id, name, location_name, radius_meter, status, created_at, updated_at)
VALUES ('0935', 'PLTD TAU LUMBIS', 'SITE BERAU', 250, 'active', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET name = 'PLTD TAU LUMBIS', location_name = 'SITE BERAU', updated_at = NOW();
INSERT INTO units (id, name, location_name, radius_meter, status, created_at, updated_at)
VALUES ('1168', 'PLTD SUNGAI BOH', 'SITE BERAU', 250, 'active', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET name = 'PLTD SUNGAI BOH', location_name = 'SITE BERAU', updated_at = NOW();

-- 2. Clear and Insert Real Active Machines
DELETE FROM machines;

INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0264-01', '0264', 'BONTANG', 'PLTD BATU AMPAR #01 (DEUTZ)', 'DEUTZ', 'BF6M 1013 E', '0134354',
    'PLTD-HSD', 'P', 'YA', '100 kW',
    '100 kW', '100 kW', 'operasi', 'BEROPERASI', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0264-02', '0264', 'BONTANG', 'PLTD BATU AMPAR #02 (DEUTZ)', 'DEUTZ', 'BF6M 1013 E', '064064',
    'PLTD-HSD', 'P', 'YA', '100 kW',
    '100 kW', '100 kW', 'operasi', 'BEROPERASI', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0264-03', '0264', 'BONTANG', 'PLTD BATU AMPAR #04 (DEUTZ)', 'DEUTZ', 'F 10 L 413 F', '6711748',
    'PLTD-HSD', 'P', 'YA', '100 kW',
    '100 kW', '100 kW', 'operasi', 'BEROPERASI', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0264-04', '0264', 'BONTANG', 'PLTD BATU AMPAR #05 (MAN) EX PLTD SANGKULIRANG #04', 'MAN', 'D 2866 LE', '39093750534101',
    'PLTD-HSD', 'P', 'YA', '200 kW',
    '200 kW', '200 kW', 'operasi', 'BEROPERASI', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0264-05', '0264', 'BONTANG', 'PLTD BATU AMPAR #06 (MAN) EX PLTD KAUBUN #04', 'MAN', 'D2866 LE201', '39400470874201',
    'PLTD-HSD', 'P', 'YA', '200 kW',
    '200 kW', '200 kW', 'operasi', 'BEROPERASI', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0265-01', '0265', 'BERAU', 'PLTD BIDUK-BIDUK #02 (DEUTZ)', 'DEUTZ', 'TBD 616 V12', '001568',
    'PLTD-HSD', 'P', 'YA', '634 kW',
    '634 kW', '634 kW', 'gangguan-rusak', 'PEMELIHARAAN', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0265-02', '0265', 'BERAU', 'PLTD BIDUK-BIDUK #04 (CUMMINS)', 'CUMMINS', 'NTA855G4-470', '30344519',
    'PLTD-HSD', 'P', 'YA', '250 kW',
    '250 kW', '250 kW', 'standby', 'STANDBY', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0265-03', '0265', 'BERAU', 'PLTD BIDUK-BIDUK #05 (CUMMINS)', 'CUMMINS', 'QSK23-G3', '85002991',
    'PLTD-HSD', 'P', 'YA', '625 kW',
    '625 kW', '625 kW', 'operasi', 'BEROPERASI', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0265-04', '0265', 'BERAU', 'PLTD BIDUK-BIDUK #06 (MTU) EX PLTD MUARA MUNTAI #03', 'MTU', '12V2000G62', '535102557',
    'PLTD-HSD', 'P', 'YA', '500 kW',
    '500 kW', '500 kW', 'gangguan-rusak', 'PEMELIHARAAN', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0265-05', '0265', 'BERAU', 'PLTD BIDUK-BIDUK #08 (MITSUBISHI) EX PLTD MARATUA #01', 'MITSUBISHI', 'S16R-PTA-S', '22566',
    'PLTD-HSD', 'P', 'YA', '1330 kW',
    '1330 kW', '1330 kW', 'operasi', 'BEROPERASI', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0266-01', '0266', 'SAMARINDA', 'PLTD DATAH BILANG #02 (CUMMINS)', 'CUMMINS', '6CTA 83', '44649163',
    'PLTD-HSD', 'P', 'YA', '100 kW',
    '100 kW', '100 kW', 'standby', 'STANDBY', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0266-02', '0266', 'SAMARINDA', 'PLTD DATAH BILANG #06 (DEUTZ) EX PLTD MUARA KEDANG #02 (DEUTZ)', 'DEUTZ', 'F12L413F', '6370704',
    'PLTD-HSD', 'P', 'YA', '140 kW',
    '140 kW', '140 kW', 'standby', 'STANDBY', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0266-03', '0266', 'SAMARINDA', 'PLTD DATAH BILANG #07 (MAN) EX PLTD SENTWAR #08 (MAN)', 'MAN', 'D 2842 LE 201', '49419108011912',
    'PLTD-HSD', 'P', 'YA', '500 kW',
    '500 kW', '500 kW', 'operasi', 'BEROPERASI', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0266-04', '0266', 'SAMARINDA', 'PLTD DATAH BILANG #08 (MAN) EX PLTD BONGAN #04', 'MAN', 'D 2842 LE 201', '49419108041912',
    'PLTD-HSD', 'P', 'YA', '500 kW',
    '500 kW', '500 kW', 'operasi', 'BEROPERASI', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0266-05', '0266', 'SAMARINDA', 'PLTD DATAH BILANG #09 (MAN) EX PLTD DILANG PUTI #10', 'MAN', 'D 2866 LE', '39499220824201',
    'PLTD-HSD', 'P', 'YA', '220 kW',
    '220 kW', '220 kW', 'operasi', 'BEROPERASI', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0266-06', '0266', 'SAMARINDA', 'PLTD DATAH BILANG #10 (MAN) EX PLTD JANTUR #08', 'MAN', 'D 2842 LE 201', '49401480484201',
    'PLTD-HSD', 'P', 'YA', '500 kW',
    '500 kW', '500 kW', 'standby', 'STANDBY', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0267-01', '0267', 'SAMARINDA', 'PLTD DILANG PUTI #04 (DEUTZ)', 'DEUTZ', 'F5L 413 FR', '8048137',
    'PLTD-HSD', 'P', 'YA', '74 kW',
    '74 kW', '74 kW', 'standby', 'STANDBY', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0267-02', '0267', 'SAMARINDA', 'PLTD DILANG PUTI #06 (DEUTZ) EX PLTD TABISAQ #02', 'DEUTZ', 'F5L 413 FR', '8048145',
    'PLTD-HSD', 'P', 'YA', '40 kW',
    '40 kW', '40 kW', 'standby', 'STANDBY', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0267-03', '0267', 'SAMARINDA', 'PLTD DILANG PUTI #07 (CUMMINS) EX PLTD TABISAQ #03', 'CUMMINS', '6CTA 83', '44649137',
    'PLTD-HSD', 'P', 'YA', '100 kW',
    '100 kW', '100 kW', 'standby', 'STANDBY', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0267-04', '0267', 'SAMARINDA', 'PLTD DILANG PUTI #08 (DEUTZ) EX PLTD TABISAQ #08', 'DEUTZ', 'BF6M1013E', '141328.0',
    'PLTD-HSD', 'P', 'YA', '100 kW',
    '100 kW', '100 kW', 'standby', 'STANDBY', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0268-01', '0268', 'BONTANG', 'PLTD GEMAR BARU #02 (DEUTZ)', 'DEUTZ', 'BF6M 1013 E', '00064061',
    'PLTD-HSD', 'P', 'YA', '100 kW',
    '100 kW', '100 kW', 'standby', 'STANDBY', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0268-02', '0268', 'BONTANG', 'PLTD GEMAR BARU #03 (MWM)', 'MWM', 'TBD 232 V12', '87123F0031',
    'PLTD-HSD', 'P', 'YA', '220 kW',
    '220 kW', '220 kW', 'standby', 'STANDBY', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0269-01', '0269', 'SAMARINDA', 'PLTD JANTUR #09 (KOMATSU) EX PLTD TABISAQ #07', 'KOMATSU', 'SA6D 125-2', '115077',
    'PLTD-HSD', 'P', 'YA', '240 kW',
    '240 kW', '240 kW', 'standby', 'STANDBY', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0270-01', '0270', 'BONTANG', 'PLTD KARANGAN DALAM #02 (DEUTZ)', 'DEUTZ', 'F6L 912', '8163A0387',
    'PLTD-HSD', 'P', 'YA', '40 kW',
    '40 kW', '40 kW', 'standby', 'STANDBY', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0270-02', '0270', 'BONTANG', 'PLTD KARANGAN DALAM #06 (CUMMINS) EX PLTD TABISAQ #06', 'CUMMINS', 'NTA 855 G-4', '30340523',
    'PLTD-HSD', 'P', 'YA', '280 kW',
    '280 kW', '280 kW', 'standby', 'STANDBY', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0271-01', '0271', 'BERAU', 'PLTD KAYAN HULU #01 (DEUTZ)', 'DEUTZ', 'TCD 2013 L06-4V', '11337740',
    'PLTD-HSD', 'P', 'YA', '250 kW',
    '250 kW', '250 kW', 'standby', 'STANDBY', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0271-02', '0271', 'BERAU', 'PLTD KAYAN HULU #02 (DEUTZ)', 'DEUTZ', 'TCD 2013 L06-4V', '11337741',
    'PLTD-HSD', 'P', 'YA', '250 kW',
    '250 kW', '250 kW', 'operasi', 'BEROPERASI', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0271-03', '0271', 'BERAU', 'PLTD KAYAN HULU #04 (DEUTZ)', 'DEUTZ', 'TCD 2013 L06-4V', '11338323',
    'PLTD-HSD', 'P', 'YA', '250 kW',
    '250 kW', '250 kW', 'standby', 'STANDBY', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0271-04', '0271', 'BERAU', 'PLTD KAYAN HULU #05 (DEUTZ)', 'DEUTZ', 'TCD 2013 L06-4V', '11522621',
    'PLTD-HSD', 'P', 'YA', '250 kW',
    '250 kW', '250 kW', 'standby', 'STANDBY', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0271-05', '0271', 'BERAU', 'PLTD KAYAN HULU #06 (YANMAR)', 'YANMAR', '', '',
    'PLTD-HSD', 'P', 'YA', '25 kW',
    '25 kW', '25 kW', 'standby', 'STANDBY', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0271-06', '0271', 'BERAU', 'PLTS SW KAYAN HULU (ESDM)', 'DEUTZ', '', '',
    'PLTS', 'S', 'TIDAK', '100 kW',
    '100 kW', '100 kW', 'gangguan-rusak', 'RUSAK SEMENTARA / GANGGUAN', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0272-01', '0272', 'BERAU', 'PLTD KELAY #03 (PEMKAB BERAU)', 'DEUTZ', 'BF6M 1013 FC', '11168687',
    'PLTD-HSD', 'P', 'YA', '201 kW',
    '201 kW', '201 kW', 'standby', 'STANDBY', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0272-02', '0272', 'BERAU', 'PLTD KELAY #04 (CATERPILLAR) EX PLTD KAUBUN #05', 'CATERPILLAR', '3412 TT', '3F 203313',
    'PLTD-HSD', 'P', 'YA', '400 kW',
    '400 kW', '400 kW', 'operasi', 'BEROPERASI', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0273-01', '0273', 'SAMARINDA', 'PLTD KELUMPANG #01 (DEUTZ)', 'DEUTZ', 'BF4M 1012 E', '00125443',
    'PLTD-HSD', 'P', 'YA', '40 kW',
    '40 kW', '40 kW', 'standby', 'STANDBY', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0273-02', '0273', 'SAMARINDA', 'PLTD KELUMPANG #02 (DEUTZ)', 'DEUTZ', 'F5L 413 F', '8048069',
    'PLTD-HSD', 'P', 'YA', '40 kW',
    '40 kW', '40 kW', 'standby', 'STANDBY', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0273-03', '0273', 'SAMARINDA', 'PLTD KELUMPANG #04 (DEUTZ) EX PLTD MUARA ALOH #03', 'DEUTZ', 'F5L 413 FR', '80481218',
    'PLTD-HSD', 'P', 'YA', '40 kW',
    '40 kW', '40 kW', 'standby', 'STANDBY', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0274-01', '0274', 'KALTARA', 'PLTD KRAYAN #01 (DEUTZ)', 'DEUTZ', 'TCD 2013 L06-4V', '11750183',
    'PLTD-HSD', 'P', 'YA', '200 kW',
    '200 kW', '200 kW', 'operasi', 'BEROPERASI', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0274-02', '0274', 'KALTARA', 'PLTD KRAYAN #02 (DEUTZ)', 'DEUTZ', 'TCD 2013 L06-4V', '11750182',
    'PLTD-HSD', 'P', 'YA', '200 kW',
    '200 kW', '200 kW', 'operasi', 'BEROPERASI', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0274-03', '0274', 'KALTARA', 'PLTD KRAYAN #04 (CUMMINS)', 'CUMMINS', 'NT-855-66', '25374283',
    'PLTD-HSD', 'P', 'YA', '250 kW',
    '250 kW', '250 kW', 'operasi', 'BEROPERASI', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0274-04', '0274', 'KALTARA', 'PLTD KRAYAN #06 (MAN) EX PLTD BUNYU #04', 'MAN', 'D2866LE201', '39092790614101',
    'PLTD-HSD', 'P', 'YA', '200 kW',
    '200 kW', '200 kW', 'standby', 'STANDBY', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0274-05', '0274', 'KALTARA', 'PLTD KRAYAN #07 (MERCEDES-BENZ) EX PLTD BATU PUTIH #01', 'MERCY MTU', '12V 183TA 32', '444901400024517',
    'PLTD-HSD', 'P', 'YA', '396 kW',
    '396 kW', '396 kW', 'gangguan-rusak', 'PEMELIHARAAN', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0274-06', '0274', 'KALTARA', 'PLTD KRAYAN #08 (DEUTZ) EX PLTD KARANGAN DALAM #07', 'DEUTZ', 'TCD2013L06-4V', '11902079',
    'PLTD-HSD', 'P', 'YA', '240 kW',
    '240 kW', '240 kW', 'operasi', 'BEROPERASI', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0275-01', '0275', 'SAMARINDA', 'PLTD LONG APARI #02 (DEUTZ)', 'DEUTZ', 'BF6M 1013 EC', '11782013',
    'PLTD-HSD', 'P', 'YA', '100 kW',
    '100 kW', '100 kW', 'operasi', 'BEROPERASI', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0275-02', '0275', 'SAMARINDA', 'PLTD LONG APARI #03 (DEUTZ)', 'DEUTZ', 'BF6M 1013 EC', '11782005',
    'PLTD-HSD', 'P', 'YA', '100 kW',
    '100 kW', '100 kW', 'operasi', 'BEROPERASI', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0275-03', '0275', 'SAMARINDA', 'PLTD LONG APARI #04 (DEUTZ)', 'DEUTZ', 'BF6M 1013 EC', '11782012',
    'PLTD-HSD', 'P', 'YA', '100 kW',
    '100 kW', '100 kW', 'standby', 'STANDBY', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0275-04', '0275', 'SAMARINDA', 'PLTD LONG APARI #05 (DEUTZ)', 'DEUTZ', 'BF6M 1013 EC', '11782011',
    'PLTD-HSD', 'P', 'YA', '100 kW',
    '100 kW', '100 kW', 'operasi', 'BEROPERASI', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0275-05', '0275', 'SAMARINDA', 'PLTD LONG APARI #06 (DEUTZ)', 'DEUTZ', 'BF6M 1013 EC', '11710950',
    'PLTD-HSD', 'P', 'YA', '100 kW',
    '100 kW', '100 kW', 'operasi', 'BEROPERASI', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0275-06', '0275', 'SAMARINDA', 'PLTD LONG APARI #07 (DEUTZ)', 'DEUTZ', 'BF6M 1013 EC', '11743580',
    'PLTD-HSD', 'P', 'YA', '100 kW',
    '100 kW', '100 kW', 'gangguan-rusak', 'RUSAK SEMENTARA / GANGGUAN', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0276-01', '0276', 'KALTARA', 'PLTD LONG LAYU #01 (CUMMINS) EX PLTD KRAYAN SELATAN #01', 'CUMMINS', 'RD 50C', '201204010',
    'PLTD-HSD', 'P', 'YA', '50 kW',
    '50 kW', '50 kW', 'operasi', 'BEROPERASI', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0276-02', '0276', 'KALTARA', 'PLTD LONG LAYU #02 (CUMMINS) EX PLTD KRAYAN SELATAN #02', 'CUMMINS', 'RD 50C', '31501038',
    'PLTD-HSD', 'P', 'YA', '50 kW',
    '50 kW', '50 kW', 'standby', 'STANDBY', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0276-03', '0276', 'KALTARA', 'PLTD LONG LAYU #03 (DEUTZ)', 'DEUTZ', 'BF6M 1013 EC', '12186944',
    'PLTD-HSD', 'P', 'YA', '50 kW',
    '50 kW', '50 kW', 'operasi', 'BEROPERASI', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0277-01', '0277', 'SAMARINDA', 'PLTD LONG PAHANGAI #01 (DEUTZ)', 'DEUTZ', 'BF6M 1013 EC', '11782010',
    'PLTD-HSD', 'P', 'YA', '100 kW',
    '100 kW', '100 kW', 'operasi', 'BEROPERASI', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0277-02', '0277', 'SAMARINDA', 'PLTD LONG PAHANGAI #02 (DEUTZ)', 'DEUTZ', 'BF6M 1013 EC', '11778334',
    'PLTD-HSD', 'P', 'YA', '100 kW',
    '100 kW', '100 kW', 'operasi', 'BEROPERASI', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0277-03', '0277', 'SAMARINDA', 'PLTD LONG PAHANGAI #03 (DEUTZ)', 'DEUTZ', 'BF6M 1013 EC', '11782006',
    'PLTD-HSD', 'P', 'YA', '100 kW',
    '100 kW', '100 kW', 'operasi', 'BEROPERASI', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0277-04', '0277', 'SAMARINDA', 'PLTD LONG PAHANGAI #04 (DEUTZ)', 'DEUTZ', 'BF6M 1013 EC', '11782007',
    'PLTD-HSD', 'P', 'YA', '100 kW',
    '100 kW', '100 kW', 'operasi', 'BEROPERASI', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0277-05', '0277', 'SAMARINDA', 'PLTD LONG PAHANGAI #05 (DEUTZ)', 'DEUTZ', 'BF6M 1013 EC', '11782009',
    'PLTD-HSD', 'P', 'YA', '100 kW',
    '100 kW', '100 kW', 'standby', 'STANDBY', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0277-06', '0277', 'SAMARINDA', 'PLTD LONG PAHANGAI #06 (DEUTZ)', 'DEUTZ', 'BF6M 1013 EC', '11782008',
    'PLTD-HSD', 'P', 'YA', '100 kW',
    '100 kW', '100 kW', 'standby', 'STANDBY', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0278-01', '0278', 'KALTARA', 'PLTD LONG PESO #01 (CUMMINS)', 'CUMMINS', '6CT 8.3G', '44649131',
    'PLTD-HSD', 'P', 'YA', '100 kW',
    '100 kW', '100 kW', 'operasi', 'BEROPERASI', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0278-02', '0278', 'KALTARA', 'PLTD LONG PESO #02 (DEUTZ)', 'DEUTZ', 'BF6M1013EC', '0061999',
    'PLTD-HSD', 'P', 'YA', '100 kW',
    '100 kW', '100 kW', 'operasi', 'BEROPERASI', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0278-03', '0278', 'KALTARA', 'PLTD LONG PESO #03 (KOMATSU)', 'KOMATSU', 'S6D 140-01', '18648',
    'PLTD-HSD', 'P', 'YA', '243 kW',
    '243 kW', '243 kW', 'standby', 'STANDBY', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0278-04', '0278', 'KALTARA', 'PLTD LONG PESO #04 (MAN) EX PLTD MUARA PAHU #02 (MAN)', 'MAN', 'D 2866 LE', '39092790574101',
    'PLTD-HSD', 'P', 'YA', '200 kW',
    '200 kW', '200 kW', 'operasi', 'BEROPERASI', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0278-05', '0278', 'KALTARA', 'PLTD LONG PESO #05 (DEUTZ-PEMKAB) EX PLTD SEKATAK BUJI #03', 'DEUTZ', 'BF6M1013EC', '10717820.0',
    'PLTD-HSD', 'P', 'YA', '160 kW',
    '160 kW', '160 kW', 'standby', 'STANDBY', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0279-01', '0279', 'BONTANG', 'PLTD LONG SEGAR #04 (PT KPC)', 'MAN', 'D 2866 LE 201', '39431611383155',
    'PLTD-HSD', 'P', 'YA', '220 kW',
    '220 kW', '220 kW', 'operasi', 'BEROPERASI', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0279-02', '0279', 'BONTANG', 'PLTD LONG SEGAR #05 (KOMATSU) EX PLTD DATAH BILANG #04', 'KOMATSU', 'S6D140-1', '18488',
    'PLTD-HSD', 'P', 'YA', '240 kW',
    '240 kW', '240 kW', 'standby', 'STANDBY', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0279-03', '0279', 'BONTANG', 'PLTD LONG SEGAR #06 (DEUTZ) EX PLTD GEMAR BARU #05', 'DEUTZ', 'TCD 2013 L06 4V', '11953953',
    'PLTD-HSD', 'P', 'YA', '240 kW',
    '240 kW', '240 kW', 'operasi', 'BEROPERASI', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0280-01', '0280', 'BERAU', 'PLTD LUMBIS OGONG #01 (DEUTZ)', 'DEUTZ', 'TCD 2013 L06-4V', '11794282',
    'PLTD-HSD', 'P', 'YA', '250 kW',
    '250 kW', '250 kW', 'standby', 'STANDBY', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0280-02', '0280', 'BERAU', 'PLTD LUMBIS OGONG #02 (DEUTZ)', 'DEUTZ', 'TCD 2013 L06-4V', '11462448',
    'PLTD-HSD', 'P', 'YA', '250 kW',
    '250 kW', '250 kW', 'standby', 'STANDBY', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0280-03', '0280', 'BERAU', 'PLTD LUMBIS OGONG #03 (DEUTZ) EX PLTD MUARA ALOH #02', 'DEUTZ', 'BF4M 1012E', '00102754',
    'PLTD-HSD', 'P', 'YA', '41 kW',
    '41 kW', '41 kW', 'operasi', 'BEROPERASI', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0280-04', '0280', 'BERAU', 'PLTS SW LUMBIS OGONG (ESDM)', 'DEUTZ', '', '',
    'PLTS', 'S', 'TIDAK', '100 kW',
    '100 kW', '100 kW', 'gangguan-rusak', 'RUSAK SEMENTARA / GANGGUAN', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0281-01', '0281', 'BERAU', 'PLTD MARATUA #02 (DEUTZ) EX PLTD PULAU DERAWAN #01', 'DEUTZ', 'BF6M 1015CP', '09188693',
    'PLTD-HSD', 'P', 'YA', '338 kW',
    '338 kW', '338 kW', 'gangguan-rusak', 'PEMELIHARAAN', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0281-02', '0281', 'BERAU', 'PLTD MARATUA #03 (DEUTZ) EX PLTD GUNUNG SARI #05', 'DEUTZ', 'TCD 2013 L06-4V', '11951492',
    'PLTD-HSD', 'P', 'YA', '250 kW',
    '250 kW', '250 kW', 'operasi', 'BEROPERASI', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0281-03', '0281', 'BERAU', 'PLTD MARATUA #04 (DEUTZ) EX BATU PUTIH #03', 'DEUTZ', 'TCD 2013 L06-4V', '11910171',
    'PLTD-HSD', 'P', 'YA', '250 kW',
    '250 kW', '250 kW', 'operasi', 'BEROPERASI', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0281-04', '0281', 'BERAU', 'PLTD MARATUA #05 (KOMATSU) EX PLTD KAUBUN #02', 'KOMATSU', 'SAA6D170 P800', '30106',
    'PLTD-HSD', 'P', 'YA', '500 kW',
    '500 kW', '500 kW', 'operasi', 'BEROPERASI', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0281-05', '0281', 'BERAU', 'PLTD MARATUA #06 (DEUTZ) EX PLTD KARANGAN DALAM #03', 'DEUTZ', 'TCD 2013 L06 4V', '11916834',
    'PLTD-HSD', 'P', 'YA', '240 kW',
    '240 kW', '240 kW', 'operasi', 'BEROPERASI', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0281-06', '0281', 'BERAU', 'PLTD MARATUA #07 (KOMATSU) EX PLTD TANJUNG BATU KALTIMRA #06', 'KOMATSU', 'SAA12V 140-P1150', '13880',
    'PLTD-HSD', 'P', 'YA', '720 kW',
    '720 kW', '720 kW', 'operasi', 'BEROPERASI', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0282-01', '0282', 'BERAU', 'PLTD MERASA #06 (DEUTZ) EX PLTD GUNUNG SARI #07', 'DEUTZ', 'F10L 413F', '84103CO122',
    'PLTD-HSD', 'P', 'YA', '100 kW',
    '100 kW', '100 kW', 'operasi', 'BEROPERASI', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0282-02', '0282', 'BERAU', 'PLTD MERASA #07 (DEUTZ) EX PLTD SEMAYANG #01', 'DEUTZ', 'BF4M1012E', '00102756',
    'PLTD-HSD', 'P', 'YA', '40 kW',
    '40 kW', '40 kW', 'standby', 'STANDBY', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0282-03', '0282', 'BERAU', 'PLTD MERASA #08 (CUMMINS) EX PLTD KELAY #02', 'CUMMINS', '6CTA118.3-G2', '87744063',
    'PLTD-HSD', 'P', 'YA', '125 kW',
    '125 kW', '125 kW', 'operasi', 'BEROPERASI', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0283-01', '0283', 'SAMARINDA', 'PLTD MUARA PAHU #03 (MAN)', 'MAN', 'D 2842 LE 201', '49418358031834',
    'PLTD-HSD', 'P', 'YA', '500 kW',
    '500 kW', '500 kW', 'operasi', 'BEROPERASI', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0283-02', '0283', 'SAMARINDA', 'PLTD MUARA PAHU #04 (MAN)', 'MAN', 'D 2842 LE 201', '49497382134201',
    'PLTD-HSD', 'P', 'YA', '500 kW',
    '500 kW', '500 kW', 'operasi', 'BEROPERASI', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0283-03', '0283', 'SAMARINDA', 'PLTD MUARA PAHU #05 (PEMKAB-MAN) EX PLTD BONGAN #02', 'MAN', 'D2842LE201', '49408332460826',
    'PLTD-HSD', 'P', 'YA', '500 kW',
    '500 kW', '500 kW', 'standby', 'STANDBY', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0283-04', '0283', 'SAMARINDA', 'PLTD MUARA PAHU #06 (MAN) EX PLTD KAUBUN #01', 'MAN', 'D 2842 LE 201', '49418232921764',
    'PLTD-HSD', 'P', 'YA', '536 kW',
    '536 kW', '536 kW', 'standby', 'STANDBY', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0283-05', '0283', 'SAMARINDA', 'PLTD MUARA PAHU #07 (MAN) EX PLTD SEI MENGGARIS #04', 'MAN', 'D2866LE', '39091781614101',
    'PLTD-HSD', 'P', 'YA', '200 kW',
    '200 kW', '200 kW', 'operasi', 'BEROPERASI', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0284-01', '0284', 'SAMARINDA', 'PLTD MUARA PANTUAN #01 (DEUTZ)', 'DEUTZ', 'F6L 912', '8163 DO 528',
    'PLTD-HSD', 'P', 'YA', '40 kW',
    '40 kW', '40 kW', 'standby', 'STANDBY', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0284-02', '0284', 'SAMARINDA', 'PLTD MUARA PANTUAN #03 (DEUTZ)', 'DEUTZ', 'F10L 413F', '6711749',
    'PLTD-HSD', 'P', 'YA', '100 kW',
    '100 kW', '100 kW', 'standby', 'STANDBY', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0284-03', '0284', 'SAMARINDA', 'PLTD MUARA PANTUAN #07 (DEUTZ) EX PLTD TABANG #04', 'DEUTZ', 'F10L 413F', '6711921',
    'PLTD-HSD', 'P', 'YA', '100 kW',
    '100 kW', '100 kW', 'standby', 'STANDBY', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0284-04', '0284', 'SAMARINDA', 'PLTD MUARA PANTUAN #09 (MTU) EX PLTD LONG IRAM #08', 'MTU', 'OM444A', '901400024738.0',
    'PLTD-HSD', 'P', 'YA', '280 kW',
    '280 kW', '280 kW', 'operasi', 'BEROPERASI', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0285-01', '0285', 'SAMARINDA', 'PLTD MUARA SIRAN #02 (DEUTZ)', 'DEUTZ', 'F5L 413 FR', '8046130',
    'PLTD-HSD', 'P', 'YA', '40 kW',
    '40 kW', '40 kW', 'operasi', 'BEROPERASI', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0285-02', '0285', 'SAMARINDA', 'PLTD MUARA SIRAN #03 (DEUTZ)', 'DEUTZ', 'F10L 413F', '7134413',
    'PLTD-HSD', 'P', 'YA', '100 kW',
    '100 kW', '100 kW', 'operasi', 'BEROPERASI', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0285-03', '0285', 'SAMARINDA', 'PLTD MUARA SIRAN #04 (CUMMINS) EX PLTD JANTUR #06', 'CUMMINS', '6 CT 83 G', '44771255',
    'PLTD-HSD', 'P', 'YA', '100 kW',
    '100 kW', '100 kW', 'standby', 'STANDBY', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0285-04', '0285', 'SAMARINDA', 'PLTD MUARA SIRAN #05 (DEUTZ) EX PLTD JANTUR #02', 'DEUTZ', 'BF6M1013E', '00127035',
    'PLTD-HSD', 'P', 'YA', '100 kW',
    '100 kW', '100 kW', 'operasi', 'BEROPERASI', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0285-05', '0285', 'SAMARINDA', 'PLTD MUARA SIRAN #06 (MTU) EX PLTD SEMAYANG #02', 'MTU', 'OM 447', '0084893',
    'PLTD-HSD', 'P', 'YA', '100 kW',
    '100 kW', '100 kW', 'operasi', 'BEROPERASI', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0286-01', '0286', 'BERAU', 'PLTD PULAU DERAWAN #02 (CUMMINS)', 'CUMMINS', '6CTA 8.3G', '21150206',
    'PLTD-HSD', 'P', 'YA', '100 kW',
    '100 kW', '100 kW', 'standby', 'STANDBY', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0286-02', '0286', 'BERAU', 'PLTD PULAU DERAWAN #04 (MERCEDES-BENZ)', 'MERCEDES-BENZ', 'OM477 6R 183 AA', '086655',
    'PLTD-HSD', 'P', 'YA', '100 kW',
    '100 kW', '100 kW', 'operasi', 'BEROPERASI', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0286-03', '0286', 'BERAU', 'PLTD PULAU DERAWAN #05 (DEUTZ)', 'DEUTZ', 'TCD 2013 L06-4V', '11902077',
    'PLTD-HSD', 'P', 'YA', '250 kW',
    '250 kW', '250 kW', 'operasi', 'BEROPERASI', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0286-04', '0286', 'BERAU', 'PLTD PULAU DERAWAN #06 (DEUTZ)', 'DEUTZ', 'TCD 2013 L06-4V', '11895189',
    'PLTD-HSD', 'P', 'YA', '250 kW',
    '250 kW', '250 kW', 'operasi', 'BEROPERASI', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0286-05', '0286', 'BERAU', 'PLTD PULAU DERAWAN #07 (DEUTZ)', 'DEUTZ', 'TCD 2013 L06-4V', '12022527',
    'PLTD-HSD', 'P', 'YA', '250 kW',
    '250 kW', '250 kW', 'operasi', 'BEROPERASI', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0286-06', '0286', 'BERAU', 'PLTD PULAU DERAWAN #09 (DEUTZ) EX PLTD KRAYAN #05', 'DEUTZ', 'TCD 2013 L06-4V', '11958004',
    'PLTD-HSD', 'P', 'YA', '200 kW',
    '200 kW', '200 kW', 'operasi', 'BEROPERASI', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0286-07', '0286', 'BERAU', 'PLTS PULAU DERAWAN #01', 'DEUTZ', '', '',
    'PLTS', 'P', 'YA', '210 kW',
    '210 kW', '210 kW', 'operasi', 'BEROPERASI', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0287-01', '0287', 'KALTARA', 'PLTD PA UPAN #01 (FAWDE) EX PLTD KRAYAN SELATAN #03', 'FAWDE', 'RD 25F', '1705291',
    'PLTD-HSD', 'P', 'YA', '25 kW',
    '25 kW', '25 kW', 'operasi', 'BEROPERASI', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0287-02', '0287', 'KALTARA', 'PLTD PA UPAN #02 (FAWDE) EX PLTD KRAYAN SELATAN #04', 'FAWDE', 'RD 25F', '175292',
    'PLTD-HSD', 'P', 'YA', '25 kW',
    '25 kW', '25 kW', 'operasi', 'BEROPERASI', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0288-01', '0288', 'SAMARINDA', 'PLTD PENYINGGAHAN #01 (DEUTZ)', 'DEUTZ', 'F10L 413F', '84103CX0108',
    'PLTD-HSD', 'P', 'YA', '100 kW',
    '100 kW', '100 kW', 'gangguan-rusak', 'PEMELIHARAAN', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0288-02', '0288', 'SAMARINDA', 'PLTD PENYINGGAHAN #03 (DEUTZ)', 'DEUTZ', 'BF6M 1015 C', '9120191',
    'PLTD-HSD', 'P', 'YA', '220 kW',
    '220 kW', '220 kW', 'operasi', 'BEROPERASI', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0288-03', '0288', 'SAMARINDA', 'PLTD PENYINGGAHAN #04 (KOMATSU)', 'KOMATSU', 'SA6D 125-2', '119884',
    'PLTD-HSD', 'P', 'YA', '240 kW',
    '240 kW', '240 kW', 'operasi', 'BEROPERASI', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0289-01', '0289', 'SAMARINDA', 'PLTD SEDULANG #05 (DEUTZ) EX PLTD MUARA KEDANG #05', 'DEUTZ', 'BF6M 1013 EC', '00669908',
    'PLTD-HSD', 'P', 'YA', '100 kW',
    '100 kW', '100 kW', 'standby', 'STANDBY', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0289-02', '0289', 'SAMARINDA', 'PLTD SEDULANG #06 (DEUTZ) EX PLTD MUARA KEDANG #03', 'DEUTZ', 'F6L 912', '8163E0684',
    'PLTD-HSD', 'P', 'YA', '40 kW',
    '40 kW', '40 kW', 'standby', 'STANDBY', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0289-03', '0289', 'SAMARINDA', 'PLTD SEDULANG #07 (CUMMINS) EX PLTD MUARA ALOH #04', 'CUMMINS', '6 CTA 83 G', '44783804',
    'PLTD-HSD', 'P', 'YA', '100 kW',
    '100 kW', '100 kW', 'standby', 'STANDBY', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0289-04', '0289', 'SAMARINDA', 'PLTD SEDULANG #08 (MERCEDES-BENZ) EX PLTD PENGANDAN #05', 'MERCEDES-BENZ', 'OM 355', '137352',
    'PLTD-HSD', 'P', 'YA', '100 kW',
    '100 kW', '100 kW', 'standby', 'STANDBY', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0289-05', '0289', 'SAMARINDA', 'PLTD SEDULANG #09 (DEUTZ) EX PLTD JANTUR #04', 'DEUTZ', 'BF6M1015CP', '9120189',
    'PLTD-HSD', 'P', 'YA', '304 kW',
    '304 kW', '304 kW', 'operasi', 'BEROPERASI', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0290-01', '0290', 'KALTARA', 'PLTD SEI MENGGARIS #01 (DEUTZ)', 'DEUTZ', 'TCD 2013 L06-4V', '11338325',
    'PLTD-HSD', 'P', 'YA', '200 kW',
    '200 kW', '200 kW', 'operasi', 'BEROPERASI', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0290-02', '0290', 'KALTARA', 'PLTD SEI MENGGARIS #02 (DEUTZ)', 'DEUTZ', 'TCD 2013 L06-4V', '11338324',
    'PLTD-HSD', 'P', 'YA', '200 kW',
    '200 kW', '200 kW', 'operasi', 'BEROPERASI', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0290-03', '0290', 'KALTARA', 'PLTD SEI MENGGARIS #03 (DEUTZ)', 'DEUTZ', 'TCD 2013 L06-4V', '11338328',
    'PLTD-HSD', 'P', 'YA', '200 kW',
    '200 kW', '200 kW', 'operasi', 'BEROPERASI', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0290-04', '0290', 'KALTARA', 'PLTD SEI MENGGARIS #05 (DEUTZ) EX PLTD SEKATAK BUJI #07', 'DEUTZ', 'TCD2013L06-4V', '11902083.0',
    'PLTD-HSD', 'P', 'YA', '240 kW',
    '240 kW', '240 kW', 'operasi', 'BEROPERASI', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0290-05', '0290', 'KALTARA', 'PLTD SEI MENGGARIS #06 (CUMMINS) EX PLTD GUNUNG SARI #04', 'CUMMINS', '6CT8.3G', '4469110',
    'PLTD-HSD', 'P', 'YA', '100 kW',
    '100 kW', '100 kW', 'gangguan-rusak', 'RUSAK SEMENTARA / GANGGUAN', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0290-06', '0290', 'KALTARA', 'PLTD SEI MENGGARIS #07 (DEUTZ) EX PLTD KRAYAN #03', 'DEUTZ', 'TCD 2013 L06-4V', '11338326',
    'PLTD-HSD', 'P', 'YA', '200 kW',
    '200 kW', '200 kW', 'operasi', 'BEROPERASI', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0290-07', '0290', 'KALTARA', 'PLTD SEI MENGGARIS #08 (DEUTZ) EX PLTD BIDUK-BIDUK #07', 'DEUTZ', 'TCD2013L06-4V', '11895182',
    'PLTD-HSD', 'P', 'YA', '250 kW',
    '250 kW', '250 kW', 'operasi', 'BEROPERASI', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0290-08', '0290', 'KALTARA', 'PLTD SEI MENGGARIS #09 (MAN) EX PLTD TANJUNG BATU KALTIMRA #08', 'MAN', 'D2676 LE233', '52141161104110',
    'PLTD-HSD', 'P', 'YA', '200 kW',
    '200 kW', '200 kW', 'operasi', 'BEROPERASI', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0291-01', '0291', 'SAMARINDA', 'PLTD MUARA KEDANG #01 (DEUTZ)', 'DEUTZ', 'Z F5L 413 FR', '8048138',
    'PLTD-HSD', 'P', 'YA', '40 kW',
    '40 kW', '40 kW', 'gangguan-rusak', 'RUSAK SEMENTARA / GANGGUAN', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0292-01', '0292', 'BONTANG', 'PLTD SENYIUR #01 (PEMKAB KUTIM)', 'MAN', 'D 2866 LE 211', '39400321974201',
    'PLTD-HSD', 'P', 'YA', '200 kW',
    '200 kW', '200 kW', 'standby', 'STANDBY', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0292-02', '0292', 'BONTANG', 'PLTD SENYIUR #02 (PEMKAB KUTIM)', 'MAN', 'D2866 LE 212', '39400311744201',
    'PLTD-HSD', 'P', 'YA', '200 kW',
    '200 kW', '200 kW', 'operasi', 'BEROPERASI', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0292-03', '0292', 'BONTANG', 'PLTD SENYIUR #03 (DEUTZ)', 'DEUTZ', 'TCD 2013 L06 4V', '11902080',
    'PLTD-HSD', 'P', 'YA', '240 kW',
    '240 kW', '240 kW', 'operasi', 'BEROPERASI', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0292-04', '0292', 'BONTANG', 'PLTD SENYIUR #04 (DEUTZ)', 'DEUTZ', 'TCD 2013 L06 4V', '11902082',
    'PLTD-HSD', 'P', 'YA', '240 kW',
    '240 kW', '240 kW', 'operasi', 'BEROPERASI', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0293-01', '0293', 'SAMARINDA', 'PLTD TABANG #03 (DEUTZ)', 'DEUTZ', 'F10L 413F', '7134412',
    'PLTD-HSD', 'P', 'YA', '100 kW',
    '100 kW', '100 kW', 'gangguan-rusak', 'RUSAK SEMENTARA / GANGGUAN', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0293-02', '0293', 'SAMARINDA', 'PLTD TABANG #05 (MTU)', 'MTU', 'OM 444A', '901400024518',
    'PLTD-HSD', 'P', 'YA', '250 kW',
    '250 kW', '250 kW', 'operasi', 'BEROPERASI', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0293-03', '0293', 'SAMARINDA', 'PLTD TABANG #06 (CUMMINS) EX PLTD LONG PAHANGAI', 'CUMMINS', 'NT 855 G5', '232201887',
    'PLTD-HSD', 'P', 'YA', '250 kW',
    '250 kW', '250 kW', 'operasi', 'BEROPERASI', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0293-04', '0293', 'SAMARINDA', 'PLTD MOBILER TABANG #07 (BS-MTU) EX PLTD MOBILER UP3 SAMARINDA #01', 'MTU', '12V2000 G62', '535102558',
    'PLTD-HSD', 'P', 'YA', '500 kW',
    '500 kW', '500 kW', 'gangguan-rusak', 'PEMELIHARAAN', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0293-05', '0293', 'SAMARINDA', 'PLTD TABANG #08 (DEUTZ) EX PLTD KARANGAN DALAM #05', 'DEUTZ', 'TCD 2013 L06 4V', '11910015',
    'PLTD-HSD', 'P', 'YA', '240 kW',
    '240 kW', '240 kW', 'operasi', 'BEROPERASI', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0294-01', '0294', 'KALTARA', 'PLTD TANAH MERAH #01 (DEUTZ)', 'DEUTZ', 'F5L 413FR', '8048136',
    'PLTD-HSD', 'P', 'YA', '40 kW',
    '40 kW', '40 kW', 'gangguan-rusak', 'RUSAK SEMENTARA / GANGGUAN', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0294-02', '0294', 'KALTARA', 'PLTD TANAH MERAH #02 (MAN)', 'MAN', 'D2866LE201', '39497852024201',
    'PLTD-HSD', 'P', 'YA', '250 kW',
    '250 kW', '250 kW', 'operasi', 'BEROPERASI', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0294-03', '0294', 'KALTARA', 'PLTD TANAH MERAH #04 (DEUTZ)', 'DEUTZ', 'F6L 912', '8163D0530',
    'PLTD-HSD', 'P', 'TIDAK', '40 kW',
    '40 kW', '40 kW', 'gangguan-rusak', 'RUSAK SEMENTARA / GANGGUAN', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0294-04', '0294', 'KALTARA', 'PLTD TANAH MERAH #05 (DEUTZ) EX PLTD LONG BELUAH #07', 'DEUTZ', 'F10L 413F', '7134411',
    'PLTD-HSD', 'P', 'YA', '100 kW',
    '100 kW', '100 kW', 'standby', 'STANDBY', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0294-05', '0294', 'KALTARA', 'PLTD TANAH MERAH #06 (MAN) EX PLTD BUNYU #05', 'DEUTZ', 'D2866LE201', '39091781624101',
    'PLTD-HSD', 'P', 'YA', '250 kW',
    '250 kW', '250 kW', 'standby', 'STANDBY', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0294-06', '0294', 'KALTARA', 'PLTD TANAH MERAH #07 (DEUTZ-PEMKAB) EX PLTD SEKATAK BUJI #04', 'DEUTZ', 'BF6M 1015 CP', '9188695.0',
    'PLTD-HSD', 'P', 'YA', '280 kW',
    '280 kW', '280 kW', 'operasi', 'BEROPERASI', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0294-07', '0294', 'KALTARA', 'PLTD TANAH MERAH #08 (MAN) EX PLTD PULAU DERAWAN #08', 'MAN', 'D2866LE', '39086670674101',
    'PLTD-HSD', 'P', 'YA', '250 kW',
    '250 kW', '250 kW', 'standby', 'STANDBY', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0294-08', '0294', 'KALTARA', 'PLTD TANAH MERAH #09 (DEUTZ) EX PLTD KARANGAN DALAM #04', 'DEUTZ', 'TCD 2013 L06 4V', '11916827',
    'PLTD-HSD', 'P', 'YA', '240 kW',
    '240 kW', '240 kW', 'operasi', 'BEROPERASI', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0295-01', '0295', 'BONTANG', 'PLTD PENGANDAN #02 (DEUTZ)', 'DEUTZ', 'F6L 912', '8163B0461',
    'PLTD-HSD', 'P', 'TIDAK', '40 kW',
    '40 kW', '40 kW', 'standby', 'STANDBY', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0296-01', '0296', 'BERAU', 'PLTD LABANG #01 (DEUTZ) EX PLTD MUARA PANTUAN #02', 'DEUTZ', 'BF4M1012EC', '00878565',
    'PLTD-HSD', 'P', 'YA', '40 kW',
    '40 kW', '40 kW', 'operasi', 'BEROPERASI', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0297-01', '0297', 'BONTANG', 'PLTD MUARA PANTUN #01 (MERCEDES-BENZ) EX PLTD MUARA WAHAU #01 (MERCEDES-BENZ)', 'MERCEDES', '12V183TA 32', '444901400024484',
    'PLTD-HSD', 'P', 'YA', '280 kW',
    '280 kW', '280 kW', 'operasi', 'BEROPERASI', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0297-02', '0297', 'BONTANG', 'PLTD MUARA PANTUN #02 (MTU) EX PLTD MUARA WAHAU #02', 'MTU', '12V170TA32', '444901400024515',
    'PLTD-HSD', 'P', 'YA', '280 kW',
    '280 kW', '280 kW', 'operasi', 'BEROPERASI', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0297-03', '0297', 'BONTANG', 'PLTD MUARA PANTUN #03 (PEMDA KUKAR)', 'CATERPILLAR', '3306', '9NR00482',
    'PLTD-HSD', 'P', 'YA', '180 kW',
    '180 kW', '180 kW', 'standby', 'STANDBY', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0298-01', '0298', 'KALTARA', 'PLTD SEKATAK BUJI #06 (DEUTZ)', 'DEUTZ', 'F10L 413F', '7134410',
    'PLTD-HSD', 'P', 'TIDAK', '100 kW',
    '100 kW', '100 kW', 'gangguan-rusak', 'RUSAK SEMENTARA / GANGGUAN', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0298-02', '0298', 'KALTARA', 'PLTD SEKATAK BUJI #09 (CUMMINS) EX PLTD SEI BUAYA #12', 'CUMMINS', 'KTA 50 G3', '33160583',
    'PLTD-HSD', 'P', 'TIDAK', '1100 kW',
    '1100 kW', '1100 kW', 'gangguan-rusak', 'RUSAK SEMENTARA / GANGGUAN', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0299-01', '0299', 'SAMARINDA', 'PLTD SEMAYANG #04 (DEUTZ)', 'DEUTZ', 'F10L 413F', '84103 C 0098',
    'PLTD-HSD', 'P', 'YA', '100 kW',
    '100 kW', '100 kW', 'standby', 'STANDBY', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0299-02', '0299', 'SAMARINDA', 'PLTD SEMAYANG #05 (CUMMINS) EX PLTD JANTUR #01', 'CUMMINS', '6CTA 84', '44649126',
    'PLTD-HSD', 'P', 'YA', '100 kW',
    '100 kW', '100 kW', 'standby', 'STANDBY', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0299-03', '0299', 'SAMARINDA', 'PLTD SEMAYANG #06 (DEUTZ) EX PLTD MUARA PAHU #01', 'DEUTZ', 'F10L 413F', '7773905',
    'PLTD-HSD', 'P', 'YA', '100 kW',
    '100 kW', '100 kW', 'standby', 'STANDBY', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0300-01', '0300', 'SAMARINDA', 'PLTD TABISAQ #01 (CUMMINS)', 'CUMMINS', '6CTA83G', '44771232',
    'PLTD-HSD', 'P', 'YA', '100 kW',
    '100 kW', '100 kW', 'gangguan-rusak', 'RUSAK SEMENTARA / GANGGUAN', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0301-01', '0301', 'BERAU', 'PLTD TANJUNG BATU KALTIMRA #04 (MAN)', 'MAN', 'D2842LE201', '4941.8243.461780',
    'PLTD-HSD', 'P', 'YA', '500 kW',
    '500 kW', '500 kW', 'standby', 'STANDBY', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0301-02', '0301', 'BERAU', 'PLTD TANJUNG BATU KALTIMRA #05 (CUMMINS)', 'CUMMINS', 'QSK23-G3', '85002979',
    'PLTD-HSD', 'P', 'YA', '650 kW',
    '650 kW', '650 kW', 'standby', 'STANDBY', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0301-03', '0301', 'BERAU', 'PLTD TANJUNG BATU KALTIMRA #07 (CUMMINS)', 'CUMMINS', 'KTA19-G8A', '41332025',
    'PLTD-HSD', 'P', 'YA', '500 kW',
    '500 kW', '500 kW', 'standby', 'STANDBY', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0934-01', '0934', 'BONTANG', 'PLTD SANDARAN #01 (PEMKAB KUTIM) EX PLTD KARANGAN DALAM #08', 'CUMMINS', 'C275D5', 'C09S803427',
    'PLTD-HSD', 'P', 'YA', '220 kW',
    '220 kW', '220 kW', 'operasi', 'BEROPERASI', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0934-02', '0934', 'BONTANG', 'PLTD SANDARAN #02 (DEUTZ) EX PLTD GEMAR BARU #06', 'DEUTZ', 'TCD 2013 L06 4V', '11953952',
    'PLTD-HSD', 'P', 'YA', '240 kW',
    '240 kW', '240 kW', 'operasi', 'BEROPERASI', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0934-03', '0934', 'BONTANG', 'PLTD SANDARAN #03 (PEMKAB KUTIM) EX PLTD GEMAR BARU #07', 'CUMMINS', 'C275-D5', '21900456',
    'PLTD-HSD', 'P', 'YA', '200 kW',
    '200 kW', '200 kW', 'gangguan-rusak', 'PEMELIHARAAN', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0935-01', '0935', 'BERAU', 'PLTD TAU LUMBIS #01 (DEUTZ) EX PLTD KELUMPANG #03', 'DEUTZ', 'BF4M 1012E', '00107703',
    'PLTD-HSD', 'P', 'YA', '40 kW',
    '40 kW', '40 kW', 'standby', 'STANDBY', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-0935-02', '0935', 'BERAU', 'PLTD TAU LUMBIS #02 (DEUTZ) EX PLTD SEMAYANG #03', 'DEUTZ', 'F6L 912', '8163E0686',
    'PLTD-HSD', 'P', 'YA', '40 kW',
    '40 kW', '40 kW', 'operasi', 'BEROPERASI', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-1168-01', '1168', 'BERAU', 'PLTD SUNGAI BOH #01 (DEUTZ) EX PLTD DILANG PUTI #09', 'DEUTZ', 'BF6M 1013 E', '064062',
    'PLTD-HSD', 'P', 'YA', '100 kW',
    '100 kW', '100 kW', 'standby', 'STANDBY', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-1168-02', '1168', 'BERAU', 'PLTD SUNGAI BOH #02 (DEUTZ) EX PLTD KAYAN HULU #07', 'DEUTZ', 'BF6M1013E', '00169247',
    'PLTD-HSD', 'P', 'YA', '100 kW',
    '100 kW', '100 kW', 'standby', 'STANDBY', NOW(), NOW()
);
INSERT INTO machines (
    id, unit_id, up3, machine_name, brand, machine_type, serial_number,
    generator_code, ownership_status, performance_label, capacity,
    available_capacity, dispatch_capacity, status, condition_label, created_at, updated_at
) VALUES (
    'M-1168-03', '1168', 'BERAU', 'PLTD SUNGAI BOH #03 (DEUTZ) EX PLTD KAYAN HULU #03', 'DEUTZ', 'TCD 2013 L06-4V', '11337742',
    'PLTD-HSD', 'P', 'YA', '250 kW',
    '250 kW', '250 kW', 'standby', 'STANDBY', NOW(), NOW()
);

COMMIT;