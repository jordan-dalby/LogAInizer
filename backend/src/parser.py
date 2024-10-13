import yaml
import re
from typing import Dict, Optional, List, Tuple
from dateutil import parser

class LogParser:
    def __init__(self, config_file: str = 'options.yaml'):
        self._regex_patterns: List[Tuple[re.Pattern, Dict]] = []
        self._log_level_mapping: Dict[str, str] = {}
        self._load_config(config_file)

    def _load_config(self, config_file: str):
        with open(config_file, 'r') as f:
            config = yaml.safe_load(f)
        
        self._regex_patterns = [
            (re.compile(pattern['regex']), pattern)
            for pattern in config['logRegexes']
        ]

        self._log_level_mapping = config['logLevelMapping']

    def parse_log_line(self, log_line: str) -> Optional[Dict[str, Optional[str]]]:
        if not log_line or log_line.isspace() or log_line == '':
            return None

        best_match = None
        highest_score = -1

        for regex, pattern in self._regex_patterns:
            match = regex.match(log_line)
            if match:
                # Calculate score based on presence of all elements (timestamp, level, message)
                score = 0
                timestamp = match.group(pattern['timestampGroup']) if pattern['timestampGroup'] != -1 else 'UNKNOWN'
                log_level = match.group(pattern['logLevelGroup']) if pattern['logLevelGroup'] != -1 else 'UNKNOWN'
                
                message = self._format_message(match, pattern['messageFormat'])

                # Heuristic: prioritize matches that have all three components
                if timestamp:
                    score += 1
                if log_level:
                    score += 1
                if message:
                    score += 1

                if score > highest_score:
                    highest_score = score
                    best_match = (match, pattern)

        if best_match:
            match, pattern = best_match
            return self._extract_log_parts(match, pattern)

        return {'timestamp': 'UNKNOWN', 'level': 'UNKNOWN', 'message': log_line}

    def _extract_log_parts(self, match, pattern):
        timestamp = match.group(pattern['timestampGroup']) if pattern['timestampGroup'] != -1 else 'UNKNOWN'
        log_level = match.group(pattern['logLevelGroup']) if pattern['logLevelGroup'] != -1 else 'UNKNOWN'
        
        message = self._format_message(match, pattern['messageFormat'])

        return {
            'timestamp': self._standardise_timestamp(timestamp),
            'level': self._standardise_log_level(log_level),
            'message': message,
        }

    def _format_message(self, match, message_format):
        def replace_group(m):
            group_num = int(m.group(1))
            if group_num <= len(match.groups()):
                return match.group(group_num) or ''
            return ''

        return re.sub(r'\{(\d+)\}', replace_group, message_format)

    def _standardise_timestamp(self, timestamp: str) -> str:
        try:
            # Parse the input date string
            parsed_date = parser.parse(timestamp, fuzzy=True)
            
            # Format the parsed date to the desired format
            return parsed_date.strftime("%Y-%m-%d %H:%M:%S.%f")[:-2]
        except ValueError:
            return "Invalid date format"
        except Exception as e:
            return f"Error: {str(e)}"
    
    def _standardise_log_level(self, log_level: Optional[str]) -> Optional[str]:
        if log_level is None:
            return None
        if log_level.upper() not in self._log_level_mapping:
            return 'UNKNOWN'
        return self._log_level_mapping.get(log_level.upper(), log_level.upper())