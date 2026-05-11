"""
Utils Common – các hàm helper dùng chung trong toàn bộ ứng dụng.
"""


def serialize_record(row) -> dict:
    """
    Chuyển asyncpg Record → dict, xử lý các kiểu đặc biệt.
    datetime → ISO string, các kiểu không serialize được → str.
    """
    if row is None:
        return {}
    d = dict(row)
    for k, v in d.items():
        if hasattr(v, "isoformat"):          # datetime / date
            d[k] = v.isoformat()
        elif v is not None and not isinstance(v, (str, int, float, bool, list, dict)):
            d[k] = str(v)
    return d
