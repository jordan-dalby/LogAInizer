import json
import unittest
import os
from src.parser import LogParser

class TestLogParser(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.parser = LogParser()
        cls.test_cases_dir = 'tests/cases/parser'

    def load_test_cases(self, filename):
        file_path = os.path.join(self.test_cases_dir, filename)
        with open(file_path, 'r') as f:
            return json.load(f)

    def run_test_cases(self, test_cases):
        for case in test_cases:
            log_line = case['logLine']
            expected_timestamp = case['expectedTimestamp']
            expected_log_level = case['expectedLogLevel']
            expected_message = case['expectedMessage']

            with self.subTest(log_line=log_line):
                parsed_entry = self.parser.parse_log_line(log_line)
                self.assertIsNotNone(parsed_entry)
                self.assertEqual(parsed_entry['timestamp'], expected_timestamp)
                self.assertEqual(parsed_entry['level'], expected_log_level)
                self.assertEqual(parsed_entry['message'], expected_message)

    def test_apache_common(self):
        test_cases = self.load_test_cases('apache_common.json')
        self.run_test_cases(test_cases)

    def test_journalctl(self):
        test_cases = self.load_test_cases('journalctl.json')
        self.run_test_cases(test_cases)

    def test_kubernetes(self):
        test_cases = self.load_test_cases('kubernetes.json')
        self.run_test_cases(test_cases)

    def test_logcat(self):
        test_cases = self.load_test_cases('logcat.json')
        self.run_test_cases(test_cases)

    def test_mysql(self):
        test_cases = self.load_test_cases('mysql.json')
        self.run_test_cases(test_cases)

    def test_nginx(self):
        test_cases = self.load_test_cases('nginx.json')
        self.run_test_cases(test_cases)

    def test_nodejs(self):
        test_cases = self.load_test_cases('nodejs.json')
        self.run_test_cases(test_cases)

if __name__ == '__main__':
    unittest.main()