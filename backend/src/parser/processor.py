from typing import List, Dict, Optional
from .parser import LogParser

class LogProcessor:
    def __init__(self, log_parser: LogParser):
        self.log_parser = log_parser

    def process_logs(self, logs_text: str) -> List[Dict[str, Optional[str]]]:
        return [
            {**log, "index": idx} 
            for idx, line in enumerate(logs_text.split('\n')) 
            if (log := self.log_parser.parse_log_line(line))
        ]

    def process_file(self, file) -> List[Dict[str, Optional[str]]]:
        logs_text = file.read().decode('utf-8')
        return self.process_logs(logs_text)