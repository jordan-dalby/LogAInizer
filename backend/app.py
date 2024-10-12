from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
import re

app = Flask(__name__)
CORS(app)

"""
Endpoint to analyse logs from a file or text input.
Route: /analyse
Method: POST
Request:
- file (optional): A file containing logs to be processed.
- logs (optional): A text input containing logs to be processed.
Response:
- JSON object containing the processed logs.
Returns:
- 200: A JSON response with the processed logs.
- 400: A JSON response with an error message if no file or logs are provided.
"""
@app.route('/analyse', methods=['POST'])
def upload_file():
    # Check if a file or logs are provided
    if 'file' in request.files:
        file = request.files['file']
        logs = process_file(file)
    elif 'logs' in request.form:
        logs_text = request.form['logs']
        logs = process_logs(logs_text)
    else:
        return jsonify({'error': 'No file or logs provided'}), 400

    return jsonify({'logs': logs})

def process_file(file):
    # TODO
    pass

def process_logs(logs_text):
    logs = []
    for line in logs_text.split('\n'):
        log = parse_log_line(line)
        if log:
            logs.append(log)
    return logs

def parse_log_line(log_line):
    # Timestamp regex patterns to match
    timestamp_patterns = [
        r'\d{4}[-/\.]\d{2}[-/\.]\d{2}\s*T?\s*\d{2}:\d{2}(?::\d{2})?(?:\.\d+)?(?:[-+]\d{2}:?\d{2})?(?:\.\d+)?',
        r'(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}(?:st|nd|rd|th)?\s+\d{4}\s+\d{2}:\d{2}:\d{2}(?:\.\d+)?',
        r'\d{2}/\d{2}/\d{4}\s+\d{2}:\d{2}:\d{2}(?:\.\d+)?',
        r'\d{4}\.\d{2}\.\d{2}\s+\d{2}:\d{2}:\d{2}(?:\.\d+)?',
        r'\d{2}-\d{2}-\d{4}\s\d{2}:\d{2}:\d{2}(?:\.\d+)?',
        r'\[?\d{4}-\d{2}-\d{2}\]?\s\d{2}:\d{2}:\d{2}(?:\.\d+)?',
        r'\d{4}\.\d{2}\.\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?',
    ]

    # Log level regex patterns to match
    log_level_patterns = [
        r'(TRACE|DEBUG|INFO|WARN(?:ING)?|ERROR|FATAL)\s*',
        r'\[(TRACE|DEBUG|INFO|WARN(?:ING)?|ERROR|FATAL)\]\s*',
        r'\|(TRACE|DEBUG|INFO|WARN(?:ING)?|ERROR|FATAL)\|\s*',
    ]

    # Declare some defaults
    timestamp = None
    log_level = None
    message = log_line

    # Try to find a timestamp pattern that matches
    for pattern in timestamp_patterns:
        match = re.search(pattern, log_line)
        if match:
            timestamp = match.group(0)
            message = log_line[match.end():].strip()
            break

    # Try to find a log level pattern that matches
    for pattern in log_level_patterns:
        match = re.search(pattern, message, re.IGNORECASE)
        if match:
            log_level = match.group(1).upper()
            message = re.sub(pattern, '', message, flags=re.IGNORECASE).strip()
            break

    # Remove leading characters like -, :, |, whitespace, and brackets
    message = re.sub(r'^[-:|\s\[\]]+', '', message).strip()

    # Prettify the timestamp
    if timestamp:
        timestamp = standardise_timestamp(timestamp)

    # Clean up the log level, some loggers use WARN rather than WARNING, so we need to account for that here
    if log_level:
        log_level = log_level.upper()
        if log_level == 'WARN':
            log_level = 'WARNING'

    # If we got nothing from the message, just return None
    if not timestamp and not log_level and not message:
        return None

    # Return the parsed log line
    return {
        'timestamp': timestamp,
        'level': log_level.lower() if log_level else None,
        'message': message if message else None
    }

def standardise_timestamp(timestamp):
    # List of date formats to try parsing
    input_formats = [
        "%Y-%m-%d %H:%M:%S",
        "%Y-%m-%d %H:%M:%S.%f",
        "%Y/%m/%d %H:%M:%S",
        "%Y/%m/%d %H:%M:%S.%f",
        "%Y.%m.%d %H:%M:%S",
        "%Y.%m.%d %H:%M:%S.%f",
        "%m/%d/%Y %H:%M:%S",
        "%m/%d/%Y %H:%M:%S.%f",
        "%B %d %Y %H:%M:%S",
        "%B %d %Y %H:%M:%S.%f",
        "%B %dst %Y %H:%M:%S",
        "%B %dst %Y %H:%M:%S.%f",
        "%B %dnd %Y %H:%M:%S",
        "%B %dnd %Y %H:%M:%S.%f",
        "%B %drd %Y %H:%M:%S",
        "%B %drd %Y %H:%M:%S.%f",
        "%B %dth %Y %H:%M:%S",
        "%B %dth %Y %H:%M:%S.%f",
        "%Y-%m-%dT%H:%M:%S",
        "%Y-%m-%dT%H:%M:%S.%f",
        "%d-%m-%Y %H:%M:%S",
        "%d-%m-%Y %H:%M:%S.%f",
        "%Y.%m.%dT%H:%M:%S",
        "%Y.%m.%dT%H:%M:%S.%f",
    ]
    
    timestamp = re.sub(r'\s+', ' ', timestamp).strip()
    timestamp = re.sub(r'[\[\]]', '', timestamp).strip()
    
    # Need special handling for May 1st, June 2nd, etc. format
    match = re.match(r'(\w+)\s+(\d+)(?:st|nd|rd|th)?\s+(\d{4})\s+(\d{2}:\d{2}:\d{2})(?:\.(\d+))?', timestamp)
    if match:
        month, day, year, time, microseconds = match.groups()
        timestamp = f"{month} {day} {year} {time}"
        if microseconds:
            timestamp += f".{microseconds}"
    
    # Try each format
    for fmt in input_formats:
        try:
            dt = datetime.strptime(timestamp, fmt)
            formatted = dt.strftime("%Y-%m-%d %H:%M:%S.%f")
            # Ensure 4 decimal places
            parts = formatted.split('.')
            if len(parts) == 1:
                return f"{parts[0]}.0000"
            else:
                milliseconds = parts[1].ljust(4, '0')[:4]
                return f"{parts[0]}.{milliseconds}"
        except ValueError:
            continue
    
    # Return original timestamp if no match is found (failsafe)
    return timestamp

if __name__ == '__main__':
    # TODO: Replace with waitress for prod
    app.run(debug=True, port=5000)