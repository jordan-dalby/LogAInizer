from flask import Flask, request, jsonify
from flask_cors import CORS
from src.parser.processor import LogProcessor
from src.parser.parser import LogParser
from src.analyser.analyser import LogAnalyser

app = Flask(__name__)
CORS(app)

# Initialize LogParser and LogProcessor
log_parser = LogParser()
log_processor = LogProcessor(log_parser)

# Initialise analyser
analyser = LogAnalyser()

@app.route('/ingest', methods=['POST'])
def ingest_logs():
    """
    Endpoint to ingest logs from a file or text input.
    """
    try:
        if 'file' in request.files:
            file = request.files['file']
            if file.filename == '':
                return jsonify({'error': 'No selected file'}), 400
            if file:
                logs = log_processor.process_file(file)
        elif 'logs' in request.form:
            logs_text = request.form['logs']
            logs = log_processor.process_logs(logs_text)
        else:
            return jsonify({'error': 'No file or logs provided'}), 400

        print(f"Got {len(logs)} logs back")
        print(f"{logs}")
        return jsonify({'logs': logs})
    except Exception as e:
        print(str(e))
        return jsonify({'error': str(e)}), 500

@app.route('/analyse', methods=['POST'])
def analyse_log():
    """
    Endpoint to analyse multiple log lines
    """
    content = request.json
    logs = content['logs']
    context = content['context']

    response = analyser.analyse(logs, context)
    print(response)
    return jsonify({'response': response})

if __name__ == '__main__':
    app.run(debug=True, port=5000)