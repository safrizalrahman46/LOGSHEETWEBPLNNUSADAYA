import fitz
from PIL import Image
import re
import os
import shutil

def build_pdf():
    src_pdf = 'MANUAL BOOK WEBSIRE/Buku Panduan Pengguna - LOGSHEET WEB PLN NUSA DAYA.pdf'
    doc = fitz.open(src_pdf)

    print(f'Starting PDF processing for {len(doc)} pages...')

    # 1. Page 1: Cover Header Card & Text
    p1 = doc[0]

    # Sample gradient background before redacting text
    pix1 = p1.get_pixmap(dpi=150)
    im1 = Image.frombytes('RGB', [pix1.width, pix1.height], pix1.samples)

    # Redact old header area completely (removes old title and old image)
    p1.add_redact_annot(fitz.Rect(55, 70, 500, 126), fill=(1, 1, 1))

    # Redact text occurrences in page 1 body (y > 130)
    for phrase, repl in [
        ('PT PLN Nusa Daya', 'PT PLN Services'),
        ('PLN Nusa Daya', 'PLN Services'),
        ('PT PLN NUSA DAYA', 'PT PLN SERVICES'),
        ('PLN NUSA DAYA', 'PLN SERVICES'),
    ]:
        for r in p1.search_for(phrase):
            if r.y0 > 130:
                px = int(r.x0 * 150 / 72)
                py = int((r.y0 - 3) * 150 / 72)
                bg_col = im1.getpixel((px, py))
                bg_tuple = (bg_col[0]/255, bg_col[1]/255, bg_col[2]/255)
                p1.add_redact_annot(r, text=repl, fontname='helv', fontsize=round(r.height*0.82, 1), text_color=(0.89, 0.91, 0.94), fill=bg_tuple)

    p1.apply_redactions()

    # Draw modern white container card on page 1 header
    card_rect = fitz.Rect(52, 68, 543, 130)
    p1.draw_rect(card_rect, color=(0.7, 0.85, 0.95), fill=(1, 1, 1), width=1.5)

    # Insert official PLN Services logo
    logo_rect = fitz.Rect(65, 77, 65 + 110, 77 + 44)
    p1.insert_image(logo_rect, filename='logo_pln_services_transparent.png')

    # Vertical divider line
    p1.draw_line(fitz.Point(188, 76), fitz.Point(188, 122), color=(0.82, 0.86, 0.90), width=1)

    # Text inside header card
    p1.insert_text(fitz.Point(200, 94), 'PT PLN SERVICES', fontname='hebo', fontsize=14, color=(0.0, 0.35, 0.55))
    p1.insert_text(fitz.Point(200, 107), 'SISTEM KONTROL OPERASI & PEMELIHARAAN TERPADU - UP KAL 3', fontname='helv', fontsize=7.8, color=(0.35, 0.40, 0.48))
    p1.insert_text(fitz.Point(200, 119), 'EDISI REVISI TERBARU 2026 - LOGSHEET & AMC/HAR', fontname='hebo', fontsize=7.5, color=(0.0, 0.55, 0.45))

    print('Page 1 complete.')

    # 2. Pages 2-35
    replacements = [
        ('support.logsheet@plnnusadaya.co.id', 'support.logsheet@plnservices.co.id'),
        ('https://helpdesk.plnnusadaya.co.id', 'https://helpdesk.plnservices.co.id'),
        ('https://www.plnnusadaya.co.id', 'https://www.plnservices.co.id'),
        ('LOGSHEET WEB PLN NUSA DAYA', 'LOGSHEET WEB PLN SERVICES'),
        ('PT PLN (Persero) Nusa Daya', 'PT PLN Services'),
        ('PT PLN NUSA DAYA', 'PT PLN SERVICES'),
        ('PT PLN Nusa Daya', 'PT PLN Services'),
        ('PLN NUSA DAYA', 'PLN SERVICES'),
        ('PLN Nusa Daya', 'PLN Services'),
    ]

    total_count = 0

    for pno in range(1, len(doc)):
        page = doc[pno]
        pdict = page.get_text('dict')
        page_count = 0
        
        for phrase, repl in replacements:
            rects = page.search_for(phrase)
            if not rects:
                continue
                
            for r in rects:
                matched_font = 'helv'
                matched_size = round(r.height * 0.85, 1)
                matched_color = (0.12, 0.16, 0.23)
                
                for b in pdict['blocks']:
                    if 'lines' in b:
                        for l in b['lines']:
                            for s in l['spans']:
                                sb = fitz.Rect(s['bbox'])
                                if sb.intersects(r):
                                    c = s['color']
                                    matched_color = (((c >> 16) & 255)/255, ((c >> 8) & 255)/255, (c & 255)/255)
                                    fnt = s['font'].lower()
                                    if 'bold' in fnt or 'black' in fnt or 'semibold' in fnt:
                                        matched_font = 'hebo'
                                    else:
                                        matched_font = 'helv'
                                    matched_size = s['size']
                                    break
                
                # Running Header
                if r.y1 < 50:
                    matched_color = (0.00, 0.34, 0.59)
                    matched_size = 8.5
                    matched_font = 'helv'
                # Running Footer
                elif r.y0 > 800:
                    matched_color = (0.40, 0.45, 0.52)
                    matched_size = 8.0
                    matched_font = 'helv'
                    
                page.add_redact_annot(r, text=repl, fontname=matched_font, fontsize=matched_size, text_color=matched_color, fill=(1, 1, 1))
                page_count += 1
                total_count += 1
                
        if page_count > 0:
            page.apply_redactions()

    print(f'Total redactions across pages 2-35: {total_count}')

    # Metadata
    doc.set_metadata({
        'title': 'Buku Panduan Pengguna - LOGSHEET WEB PLN SERVICES',
        'author': 'PT PLN Services - Unit Pelaksana Kalimantan 3 (UP KAL 3)',
        'subject': 'Buku Panduan Pengguna Portal Web Logsheet WACB & HAR PLTD - Edisi Revisi Terbaru 2026',
        'creator': 'PT PLN Services',
        'producer': 'PT PLN Services IT & Operasi Pembangkitan UP KAL 3'
    })

    out_file1 = 'MANUAL BOOK WEBSIRE/Buku Panduan Pengguna - LOGSHEET WEB PLN SERVICES.pdf'
    doc.save(out_file1, garbage=4, deflate=True)
    doc.close()
    print(f'Saved: {out_file1}')

    # Verify
    doc_check = fitz.open(out_file1)
    nusa_pages = []
    for i, p in enumerate(doc_check):
        t = p.get_text()
        if re.search(r'nusa\s*daya', t, re.IGNORECASE):
            nusa_pages.append(i+1)
    print(f'Pages with "Nusa Daya": {nusa_pages}')
    doc_check.close()

    # Also copy to aliases and public folders so all links work
    destinations = [
        'MANUAL BOOK WEBSIRE/Buku Panduan Pengguna - LOGSHEET WEB PLN NUSA DAYA.pdf',
        'MANUAL BOOK WEBSIRE/MANUAL_BOOK_LOGSHEET_WEB_PLN_SERVICES.pdf',
        'MANUAL BOOK WEBSIRE/MANUAL_BOOK_LOGSHEET_WEB_PLN_NUSA_DAYA.pdf',
        'frontend/public/docs/Buku Panduan Pengguna - LOGSHEET WEB PLN SERVICES.pdf',
        'frontend/public/docs/MANUAL_BOOK_LOGSHEET_WEB_PLN_SERVICES.pdf',
        'frontend/public/docs/Buku Panduan Pengguna - LOGSHEET WEB PLN NUSA DAYA.pdf',
    ]

    os.makedirs('frontend/public/docs', exist_ok=True)
    for dst in destinations:
        shutil.copyfile(out_file1, dst)
        print(f'Copied to: {dst}')

    print('ALL PDF BUILDS AND COPIES COMPLETED SUCCESSFULLY!')

if __name__ == '__main__':
    build_pdf()
