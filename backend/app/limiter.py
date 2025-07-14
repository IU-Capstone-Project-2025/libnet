import os
from slowapi import Limiter
from slowapi.util import get_remote_address

if os.getenv("TESTING") == "1":
    class DummyLimiter:
        def limit(self, _):
            def decorator(func):
                return func
            return decorator
    limiter = DummyLimiter()
else:
    limiter = Limiter(key_func=get_remote_address)
