from flask import Flask, request, jsonify
from flask_cors import CORS

from openai import OpenAI
import os
import time
app = Flask(__name__)
CORS(app)
client = OpenAI(
    base_url="https://models.github.ai/inference",
    api_key="apikey",
)
@app.route('/generate', methods=['POST'])
def generate():
    start_time = time.time()
    data=request.get_json()
    question=data.get('question','')
    if not question:
        return jsonify({"answer": "Vous n'avez pas posé de question."})
    try:
        reponse = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "",
                },
                {
                    "role": "user",
                    "content": question,
                }
            ],
            model="openai/gpt-4o",
            temperature=1,
            max_tokens=4096,
            top_p=1
        )
        answer=reponse.choices[0].message.content.strip()
        return jsonify({
            "status": "success",
            "answer": answer,
            "time": round(time.time() - start_time, 2)  # temps de réponse en secondes
        })
    except Exception as e:
        return jsonify({"answer": f"Erreur NLP : {str(e)}"}),500
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)

   