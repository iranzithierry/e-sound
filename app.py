from flask import Flask, render_template, request, jsonify
from flask import send_from_directory
from youtube_search import YoutubeSearch
from yt_dlp import YoutubeDL
import os



app = Flask(__name__)



def search_song(user_input):
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

    response = search_song(user_input)

    return jsonify({"response": response})


if __name__ == "__main__":
    app.run(debug=False, port=20060)
