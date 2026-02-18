import PyPDF2
import pdfplumber


def extract_text_from_pdf(file_bytes: bytes) -> str:
    text = ""
    
    try:
        with pdfplumber.open(file_bytes) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
    except Exception:
        try:
            reader = PyPDF2.PdfReader(file_bytes)
            for page in reader.pages:
                text += page.extract_text() + "\n"
        except Exception:
            pass
    
    return text.strip()


def clean_text(text: str) -> str:
    import re
    text = re.sub(r'\s+', ' ', text)
    text = re.sub(r'[^\w\s@.\-+,]', ' ', text)
    return text.strip()
