from functools import wraps
from typing import TypeVar

_cache = {}

T = TypeVar("T")


def cache(name):
    def cache_wrapper1(func: T) -> T:
        @wraps(func)
        def cache_wrapper2(*args, **kwargs):
            if name not in _cache:
                _cache[name] = func(*args, **kwargs)

            return _cache[name]

        return cache_wrapper2

    return cache_wrapper1


def clear_cache():
    global _cache
    _cache = {}
