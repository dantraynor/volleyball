"""
5-1 Volleyball Offensive System - Learning App
Flask backend for HW10 Technical Prototype
"""

import json
import os
from datetime import datetime

from flask import Flask, jsonify, redirect, render_template, request, url_for

app = Flask(__name__)


#  Load lesson and quiz content from JSON
def load_json(filename):
    path = os.path.join(os.path.dirname(__file__), "data", filename)
    with open(path, "r") as f:
        return json.load(f)


LESSONS = load_json("lessons.json")
QUIZ = load_json("quiz.json")


#  Single user memory state for req8
def fresh_state():
    return {
        "started_at": None,
        "lesson_visits": {},
        "lesson_choices": {},
        "quiz_answers": {},
        "finished_at": None,
    }


user_state = fresh_state()


# Routes


@app.route("/")
def home():
    return render_template("home.html")


@app.route("/start", methods=["POST"])
def start():
    global user_state
    user_state = fresh_state()
    user_state["started_at"] = datetime.now().isoformat()
    return redirect(url_for("learn", n=1))


@app.route("/learn/<int:n>")
def learn(n):
    if n < 1 or n > len(LESSONS):
        return redirect(url_for("home"))
    lesson = LESSONS[n - 1]
    user_state["lesson_visits"][str(n)] = datetime.now().isoformat()
    return render_template("learn.html", lesson=lesson, n=n, total=len(LESSONS))


@app.route("/api/lesson-choice", methods=["POST"])
def lesson_choice():
    data = request.get_json() or {}
    lesson_id = str(data.get("lesson_id"))
    choice = data.get("choice")
    if lesson_id and choice is not None:
        user_state["lesson_choices"].setdefault(lesson_id, []).append(
            {
                "choice": choice,
                "at": datetime.now().isoformat(),
            }
        )
    return jsonify({"ok": True})


# @app.route("/defend/<int:n>")
# def defend(n):
#     return f"Defense option {n}"


@app.route("/quiz/<int:n>", methods=["GET", "POST"])
def quiz(n):
    if n < 1 or n > len(QUIZ):
        return redirect(url_for('results'))

    question = QUIZ[n - 1]

    if request.method == 'POST':
        action = request.form.get('action')

        if action == 'submit':
            answer = request.form.get('answer')
            user_state['quiz_answers'][str(n)] = answer

            is_correct = (answer == question['correct'])
            feedback = question['feedback_correct'] if is_correct else question['feedback_incorrect']

            return render_template(
                'quiz.html',
                question=question,
                n=n,
                total=len(QUIZ),
                answered=True,
                selected_answer=answer,
                is_correct=is_correct,
                feedback=feedback
            )

        elif action == 'next':
            if n < len(QUIZ):
                return redirect(url_for('quiz', n=n + 1))
            return redirect(url_for('results'))

    return render_template(
        'quiz.html',
        question=question,
        n=n,
        total=len(QUIZ),
        answered=False,
        selected_answer=None,
        is_correct=None,
        feedback=None
    )

@app.route("/results")
def results():
    correct_count = 0
    breakdown = []
    for q in QUIZ:
        qid = str(q["id"])
        user_ans = user_state["quiz_answers"].get(qid)
        is_correct = user_ans == q["correct"]
        if is_correct:
            correct_count += 1
        breakdown.append(
            {
                "id": q["id"],
                "question": q["question"],
                "user_answer": user_ans,
                "correct_answer": q["correct"],
                "is_correct": is_correct,
                "feedback": q.get("feedback_correct")
                if is_correct
                else q.get("feedback_incorrect"),
            }
        )
    user_state["finished_at"] = datetime.now().isoformat()
    return render_template(
        "results.html", correct=correct_count, total=len(QUIZ), breakdown=breakdown
    )


@app.route("/api/debug-state")
def debug_state():
    return jsonify(user_state)


if __name__ == "__main__":
    app.run(debug=True, port=5000)
