FINAL_STATUSES = {"PAID", "COMPLETED", "CANCELLED"}

def is_final_status(status: str) -> bool:
    return (status or "").upper() in FINAL_STATUSES