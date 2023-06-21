from flask import Flask, render_template, request, jsonify
import random
import openai
from datetime import datetime
import re
from flask import send_from_directory
from youtube_search import YoutubeSearch
from yt_dlp import YoutubeDL
import os
import urllib.request

current_time = datetime.now().strftime("%H:%M")
formatted_time = f"{current_time} min"

app = Flask(__name__)

# Set up OpenAI API credentials
openai.api_key = "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"

# Greet and play songs responses
greetings = ["ayoo", "hii", "hi", "amakuru", "hello", "waguan"]
greet_responses = ["Hello!", "Hi there!", "Hey!", "Greetings!", "Good day to you!"]
play_song_phrases = ["play song", "download for me", "play this", "download this","play sing","plat song"]


# Function to generate AI response
def generate_response(user_input):
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": user_input},
        ],
    )
    response.choices[0].message.content.strip()
    me_response = (
        response.choices[0]
        .message.content.strip()
        .replace("OpenAI", "Coding Rwanda")
        .replace("2015", "2023")
        .replace("chagpt", "more")
        .replace("GPT-3", "More V1")
        .replace("2021", "2023 June")
        .replace("2020", "2023 June")
        .replace("Sam Altman", "IRANZI Thierry")
        .replace("San Francisco", "Kicukiro")
        .replace("California", "Rwanda")
        .replace("Silicon Valley", "Kicukiro-Kagarama")
        .replace("Bay Area in the United States.", "Rwanda")
        .replace("Bay Area", "Kagarama")
    )
    return me_response


def playsong(user_input):
    search_query = user_input
    results = YoutubeSearch(search_query, max_results=1).to_dict()

    for video in results:
        video_title = video["title"]
        video_url = "https://www.youtube.com/watch?v=" + video["id"]
        print(f"{video_title}: {video_url}")

    file_path = os.path.join("static", "songs", f"{video_title}.mp3")
    if os.path.exists(file_path):
        response = f"song++{file_path}"
        return response
    else:
        ydl_opts = {
            "format": "bestaudio/best",
            "outtmpl": f"{file_path}",
        }

        with YoutubeDL(ydl_opts) as ydl:
            ydl.download([video_url])

        print(f"Download complete: {video_title}")
        response = f"song++{file_path}"
        return response


# Define the route for the home page
@app.route("/")
def home():
    return render_template("index.html")


# Define the route for serving song files
@app.route("/static/songs/<path:filename>", methods=["GET"])
def serve_song(filename):
    return send_from_directory("static/songs", filename)


@app.route("/response", methods=["POST"])
def process():
    user_input = request.form["user_input"].lower()

    # Check for greetings
    if any(greeting in user_input for greeting in greetings):
        response = random.choice(greet_responses)

    # Check for play song requests
    elif "who" in user_input.lower() and "create" and "you" in user_input.lower():
        response = "I Was Created By IRANZI Thierry On 8 June 2023"

    elif "what" in user_input.lower() and "time" in user_input.lower():
        response = f"The Time is {formatted_time}"

    elif "iranzi" in user_input.lower() and "know" in user_input.lower():
        response = "Yes iranzi thierry is my creator"

    elif "who" in user_input.lower() and "is" and "iranzi" in user_input.lower():
        response = "IRANZI Thierry is a well-known entrepreneur, investor, and startup accelerator. He is the CEO of Coding Rwanda, a research company that aims to create AI technologies that benefit everyone"

    elif any(song_phrase in user_input for song_phrase in play_song_phrases):
        response_only = user_input.lower().strip()
        for song_phrase in play_song_phrases:
            response_only = response_only.replace(song_phrase, "").strip()
        response = playsong(response_only)

    else:
        openai_form = (
            user_input
            .strip()
            .replace("coding rwanda", "OpenAI")
            .replace("2023", "2015")
            .replace("more", "chagpt")
            .replace("more v1", "GPT-3")
            .replace("2021", "2023 June")
            .replace("2020", "2023 June")
            .replace("iranzi thierry", "Sam Altman")
        )
        response = generate_response(openai_form)

    return jsonify({"response": response})


if __name__ == "__main__":
    app.run(debug=False, port=20060)
