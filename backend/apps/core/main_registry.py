import threading

class WebMainRegistry:
    _thread_local = threading.local()

    @classmethod
    def start_recording(cls):
        cls._thread_local.recorded = []
        cls._thread_local.is_recording = True

    @classmethod
    def stop_recording(cls):
        cls._thread_local.is_recording = False
        res = getattr(cls._thread_local, 'recorded', [])
        cls._thread_local.recorded = []
        return res

    @classmethod
    def record(cls, instance):
        if getattr(cls._thread_local, 'is_recording', False):
            cls._thread_local.recorded.append(instance)
