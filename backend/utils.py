import random
import string
from datetime import datetime

def generate_display_id(prefix: str) -> str:
    """
    Generates a readable unique ID like PAT-20240426-A1B2.
    prefix: e.g., 'PAT', 'DOC', 'HOSP', 'APT'
    """
    date_str = datetime.now().strftime("%Y%m%d")
    random_suffix = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
    return f"{prefix}-{date_str}-{random_suffix}"
