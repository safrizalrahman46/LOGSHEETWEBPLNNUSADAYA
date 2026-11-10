import fitz
from PIL import Image
import os
import shutil
import re

def generate_clean_manual_pdf():
    src_pdf = 'MANUAL BOOK WEBSIRE/Buku Panduan Pengguna - LOGSHEET WEB PLN SERVICES.pdf'
    doc = fitz.open(src_pdf)
    print(f"Loaded {src_pdf} with {len(doc)} pages.")

    total_repairs = 0

    # 1. First, fix the 3 fragmented body text spots with exact coordinates
    # Page 6 (index 5)
    p6 = doc[5]
    p6.add_redact_annot(
        fitz.Rect(254.0, 421.0, 351.0, 435.0),
        text='PT PLN Services',
        fontname='helv',
        fontsize=8.5,
        text_color=(0.12, 0.16, 0.23),
        fill=(1, 1, 1)
    )
    p6.apply_redactions()
    total_repairs += 1

    # Page 35 (index 34)
    p35 = doc[34]
    # Spot 1: between x=143.6 and x=229.6 on line y=232.0 (do NOT touch y<231)
    p35.add_redact_annot(
        fitz.Rect(144.0, 231.5, 229.0, 245.0),
        text='PT PLN Services',
        fontname='helv',
        fontsize=8.5,
        text_color=(0.12, 0.16, 0.23),
        fill=(1, 1, 1)
    )
    # Spot 2: at start of line y=578.5 (x from 42.0 to 131.5)
    p35.add_redact_annot(
        fitz.Rect(42.0, 578.0, 131.5, 591.5),
        text='PT PLN Services',
        fontname='helv',
        fontsize=8.5,
        text_color=(0.12, 0.16, 0.23),
        fill=(1, 1, 1)
    )
    p35.apply_redactions()
    total_repairs += 2

    # 2. Loop through all pages to repair any overlapping spans
    for pno in range(len(doc)):
        page = doc[pno]
        dict_page = page.get_text('dict')
        pix = page.get_pixmap(dpi=150)
        im = Image.frombytes('RGB', [pix.width, pix.height], pix.samples)

        spans = []
        for b in dict_page['blocks']:
            if 'lines' in b:
                for l in b['lines']:
                    for s in l['spans']:
                        t = s['text']
                        if any(w in t for w in ['SERVICES', 'Services', 'NUSA', 'Nusa']):
                            spans.append(s)

        # Cluster overlapping spans
        groups = []
        used = set()
        for i, s1 in enumerate(spans):
            if i in used:
                continue
            r1 = fitz.Rect(s1['bbox'])
            grp = [s1]
            used.add(i)
            for j, s2 in enumerate(spans):
                if j in used:
                    continue
                r2 = fitz.Rect(s2['bbox'])
                if r1.intersects(r2):
                    intersect_area = (r1 & r2).get_area()
                    min_area = min(r1.get_area(), r2.get_area())
                    if min_area > 0 and (intersect_area / min_area) > 0.3:
                        grp.append(s2)
                        used.add(j)
                        r1 = r1 | r2
            if len(grp) > 1:
                groups.append((r1, grp))

        if not groups:
            continue

        print(f"Page {pno+1}: repairing {len(groups)} overlapping groups...")
        for r, grp in groups:
            texts = [s['text'] for s in grp]

            # 1. Running Header (top of page)
            if r.y1 < 50 and any('LOGSHEET' in t for t in texts):
                clean_text = 'LOGSHEET WEB PLN SERVICES'
                fontname = 'hebo'
                fontsize = 8.5
                text_color = (0.00, 0.34, 0.59)
            # 2. Running Footer (bottom of page)
            elif r.y0 > 800:
                clean_text = 'PT PLN SERVICES'
                fontname = 'helv'
                fontsize = 8.0
                text_color = (0.40, 0.45, 0.52)
            # 3. Body text
            else:
                primary = grp[0]
                fontname = 'hebo' if ('bold' in primary['font'].lower() or 'black' in primary['font'].lower()) else 'helv'
                fontsize = round(primary['size'], 1)
                c = primary['color']
                text_color = (((c >> 16) & 255)/255, ((c >> 8) & 255)/255, (c & 255)/255)

                if any('PT PLN SERVICES' in t for t in texts) and any('PT PLN Services' in t for t in texts):
                    if pno == 1: # page 2 metadata tables
                        if r.y0 < 350 or r.y0 > 600:
                            clean_text = 'PT PLN SERVICES'
                        else:
                            clean_text = 'PLN Services'
                    elif any(t.isupper() for t in texts):
                        clean_text = 'PT PLN SERVICES'
                    else:
                        clean_text = 'PT PLN Services'
                elif any('PT PLN' in t for t in texts):
                    clean_text = 'PT PLN SERVICES' if any(t.isupper() for t in texts) else 'PT PLN Services'
                elif any('PLN SERVICES' in t for t in texts) and any('PLN Services' in t for t in texts):
                    clean_text = 'PLN SERVICES' if any(t.isupper() for t in texts) else 'PLN Services'
                elif any('SERVICES' in t for t in texts):
                    clean_text = 'SERVICES'
                else:
                    clean_text = 'Services'

            # Sample background color safely
            scale_x = pix.width / page.rect.width
            scale_y = pix.height / page.rect.height
            sample_px = int(min(max(0, (r.x0 + 2) * scale_x), pix.width - 1))
            sample_py = int(max(0, (r.y0 - 2) * scale_y))
            bg_col = im.getpixel((sample_px, sample_py))
            bg_tuple = (bg_col[0]/255, bg_col[1]/255, bg_col[2]/255)

            redact_rect = fitz.Rect(r.x0 - 1.0, r.y0 - 0.5, r.x1 + 1.0, r.y1 + 0.5)
            page.add_redact_annot(
                redact_rect,
                text=clean_text,
                fontname=fontname,
                fontsize=fontsize,
                text_color=text_color,
                fill=bg_tuple
            )
            total_repairs += 1

        page.apply_redactions()

    # Metadata
    doc.set_metadata({
        'title': 'Buku Panduan Pengguna - LOGSHEET WEB PLN SERVICES',
        'author': 'PT PLN Services - Unit Pelaksana Kalimantan 3 (UP KAL 3)',
        'subject': 'Buku Panduan Pengguna Portal Web Logsheet WACB & HAR PLTD - Edisi Revisi Terbaru 2026',
        'creator': 'PT PLN Services',
        'producer': 'PT PLN Services IT & Operasi Pembangkitan UP KAL 3'
    })

    out_file = 'MANUAL BOOK WEBSIRE/Buku Panduan Pengguna - LOGSHEET WEB PLN SERVICES.pdf'
    out_temp = 'MANUAL BOOK WEBSIRE/Buku Panduan Pengguna - LOGSHEET WEB PLN SERVICES.tmp.pdf'
    doc.save(out_temp, garbage=4, deflate=True)
    doc.close()
    if os.path.exists(out_file):
        os.remove(out_file)
    shutil.move(out_temp, out_file)
    print(f"\nSUCCESS: Repaired {total_repairs} locations and saved to {out_file}")

    # Verify 0 overlaps
    doc_check = fitz.open(out_file)
    overlaps_found = 0
    for pno in range(len(doc_check)):
        p = doc_check[pno]
        spans = []
        for b in p.get_text('dict')['blocks']:
            if 'lines' in b:
                for l in b['lines']:
                    for s in l['spans']:
                        if any(w in s['text'] for w in ['SERVICES', 'Services']):
                            spans.append(s)
        for i in range(len(spans)):
            r1 = fitz.Rect(spans[i]['bbox'])
            for j in range(i+1, len(spans)):
                r2 = fitz.Rect(spans[j]['bbox'])
                if r1.intersects(r2):
                    min_a = min(r1.get_area(), r2.get_area())
                    if min_a > 0 and ((r1 & r2).get_area() / min_a) > 0.3:
                        overlaps_found += 1
                        print(f"Warning: Overlap remaining on page {pno+1}: {spans[i]['text']} vs {spans[j]['text']}")

    doc_check.close()
    print(f"VERIFICATION RESULT: Overlaps remaining = {overlaps_found}")

    if overlaps_found == 0:
        # Copy to all needed destinations
        dests = [
            'MANUAL BOOK WEBSIRE/MANUAL_BOOK_LOGSHEET_WEB_PLN_SERVICES.pdf',
            'MANUAL BOOK WEBSIRE/Buku Panduan Pengguna - LOGSHEET WEB PLN NUSA DAYA.pdf',
            'MANUAL BOOK WEBSIRE/MANUAL_BOOK_LOGSHEET_WEB_PLN_NUSA_DAYA.pdf',
            'frontend/public/docs/Buku Panduan Pengguna - LOGSHEET WEB PLN SERVICES.pdf',
            'frontend/public/docs/MANUAL_BOOK_LOGSHEET_WEB_PLN_SERVICES.pdf',
            'frontend/public/docs/Buku Panduan Pengguna - LOGSHEET WEB PLN NUSA DAYA.pdf',
        ]
        os.makedirs('frontend/public/docs', exist_ok=True)
        for dst in dests:
            shutil.copyfile(out_file, dst)
            print(f"Copied to: {dst}")
        print("ALL DESTINATIONS UPDATED SUCCESSFULLY!")

if __name__ == '__main__':
    generate_clean_manual_pdf()
