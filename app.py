from flask import Flask, render_template, request, jsonify
from flask import send_from_directory
from youtube_search import YoutubeSearch
from yt_dlp import YoutubeDL
import os
import re


app = Flask(__name__)


def remove_words_in_brackets(text):
    pattern = r"\s*\([^)]*\)"
    return re.sub(pattern, "", text)


def download_song(user_input):
    search_query = user_input
    results = YoutubeSearch(search_query, max_results=1).to_dict()

    for video in results:
        video_title_with_brackets = video["title"]
        video_title = remove_words_in_brackets(video_title_with_brackets)
        video_url = "https://www.youtube.com/watch?v=" + video["id"]

    file_path = os.path.join("static", "songs", f"{video_title}.mp3")
    if os.path.exists(file_path):
        response = file_path
        return response
    else:
        ydl_opts = {
            "format": "bestaudio/best",
            "outtmpl": f"{file_path}",
        }

        with YoutubeDL(ydl_opts) as ydl:
            ydl.download([video_url])

        print(f"Download complete: {video_title}")
        response = file_path
        return response


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/static/songs/<path:filename>", methods=["GET"])
def serve_song(filename):
    return send_from_directory("static/songs", filename)


@app.route("/request", methods=["POST"])
def process():
    user_input = request.form["user_input"].lower()
    song_request = f"Music {user_input}"
    results = YoutubeSearch(song_request, max_results=5).to_dict()

    songs = []
    for video in results:
        video_title = video["title"]
        result = remove_words_in_brackets(video_title)
        songs.append(f"{result}")

    return jsonify({"songs": songs})


@app.route("/song_request", methods=["POST"])
def return_song():
    user_input = request.form["song_request"].lower()
    song_request = f"Music {user_input}"
    song = download_song(song_request)

    return jsonify({"song": song})


if __name__ == "__main__":
    app.run(debug=False, port=20060)
