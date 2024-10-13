from openai import OpenAI
import constants

class LogAnalyser():
    def __init__(self):
        pass

    def analyse(self, logs, context):
        prompt = self._generate_prompt(logs, context)
        response = self._ask_gpt(prompt)
        return response
    
    def _generate_prompt(self, logs, context):
        prompt = f"Analyse the following logs and provide insights:\n\n"
        for log in logs:
            prompt += f"Log: \n{log['index']} {log['timestamp']} {log['level']} {log['message']}\n"
        prompt += f"\nContext: {context}"
        print(prompt)
        return prompt

    def _ask_gpt(self, prompt):
        client = OpenAI(api_key=constants.OPENAI_API_KEY)
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "user", "content": prompt}
            ],
            max_tokens=300
        )
        return response.choices[0].message.content.strip()