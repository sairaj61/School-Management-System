import uuid
from datetime import datetime

def generate_time_based_uuid():
    """Generate a time-based UUID (UUID v1)"""
    return uuid.uuid1()  # UUID v1 is time-based 