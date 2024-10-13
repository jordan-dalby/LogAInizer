from flask import Flask, request, jsonify
from flask_cors import CORS
from processor import LogProcessor
from parser import LogParser

app = Flask(__name__)
CORS(app)

# Initialize LogParser and LogProcessor
log_parser = LogParser()
log_processor = LogProcessor(log_parser)

@app.route('/analyse', methods=['POST'])
def analyse_logs():
    """
    Endpoint to analyse logs from a file or text input.
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

        print(logs)
        return jsonify({'logs': logs})
    except Exception as e:
        print(str(e))
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)