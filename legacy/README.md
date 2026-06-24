# Legacy — original Flask prototype (archived)

This folder contains the **original university Flask project** that YallaConvert grew out of.
It is **not part of the live app** and is kept only as a **reference** for the future
server-side conversion service (see Phase 11 in `../PROJECT_MEMORY.md`), because its Python
conversion logic (Pillow image→PNG, MoviePy MP4→MP3, pdf2docx PDF→DOCX, pytesseract OCR)
maps closely to the native tools we'll run server-side later.

Nothing here is imported, built, or deployed. Do not wire it into the Next.js app.

Contents:
- `main.py` — Flask routes + the four original conversion endpoints.
- `templates/` — original HTML pages.
- `static/` — original CSS and logo images.
