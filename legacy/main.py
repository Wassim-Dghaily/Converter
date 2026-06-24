import os
from PIL import Image
from flask import Flask, render_template, jsonify, request
from moviepy.video.io.VideoFileClip import VideoFileClip
from pdf2docx import Converter
import pytesseract

app = Flask(__name__, static_folder='static')
UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
if not os.path.exists(UPLOAD_FOLDER):
    os.mkdir(UPLOAD_FOLDER)


@app.route('/upload_image', methods=['POST'])  # the post  allows for file submission and not just get
def upload_images():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']

    if file:
        F_name = os.path.splitext(file.filename)[0]  # name la7al
        png_filename = F_name + '.png'
        png_filepath = os.path.join(app.config['UPLOAD_FOLDER'], png_filename)

        try:
            # Convert and save the image as PNG
            image = Image.open(file)
            image.save(png_filepath, 'PNG')
            return jsonify({
                'message': 'File uploaded successfully',
                'file_path': png_filepath
            }), 200
        except Exception as e:
            return jsonify({'error': f'Image processing failed: {str(e)}'}), 500


@app.route('/upload_video', methods=['POST'])
def upload_video():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']


    if file:
        F_name = os.path.splitext(file.filename)[0]  # bas l esem
        video_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)  # Save MP4 file
        file.save(video_path)

        # Convert MP4 to MP3
        mp3_filename = F_name + '.mp3'
        mp3_filepath = os.path.join(app.config['UPLOAD_FOLDER'], mp3_filename)

        # Load the video and extract audio
        video_clip = VideoFileClip(video_path)
        audio_clip = video_clip.audio
        audio_clip.write_audiofile(mp3_filepath)

        # Clean up resources
        audio_clip.close()
        video_clip.close()
        os.remove(video_path)
        return jsonify({
            'message': 'Video converted to MP3 successfully',
            'file_path': mp3_filepath
        }), 200


@app.route('/upload_document', methods=['POST'])
def upload_document():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded.'}), 400

    file = request.files['file']
    if file:
        F_name = os.path.splitext(file.filename)[0]
        pdf_filepath = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(pdf_filepath)

        docx_filename = F_name + '.docx'
        docx_filepath = os.path.join(app.config['UPLOAD_FOLDER'], docx_filename)


        cv = Converter(pdf_filepath)
        cv.convert(docx_filepath, start=0, end=None)
        cv.close()
        os.remove(pdf_filepath)

        return jsonify({
            'message': 'PDF converted to DOCX successfully',
            'file_path': docx_filepath

        }),
@app.route('/upload_ocr', methods=['POST'])
def upload_ocr_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded.'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected.'}), 400

    try:

        image = Image.open(file)
        text = pytesseract.image_to_string(image)


        F_name = os.path.splitext(file.filename)[0]
        txt_filename = F_name + '.txt'  # Text file name
        txt_filepath = os.path.join(app.config['UPLOAD_FOLDER'], txt_filename)

        with open(txt_filepath, 'w') as f:
            f.write(text)  # upload it to a txt

        return jsonify({
            'message': 'OCR successful',
            'text': text,

        }), 200
    except Exception as e:
        return jsonify({'error': f'OCR processing failed: {str(e)}'}), 500



@app.route("/")
def home():
    return render_template("home.html")

@app.route("/home")
def home_view():
    return render_template("home.html")

@app.route("/images")
def images():
    return render_template("images.html")


@app.route("/videos")
def videos():
    return render_template("videos.html")


@app.route("/ocr")
def ocr():
    return render_template("ocr.html")
@app.route("/home")


@app.route("/documents")
def documents():
    return render_template("documents.html")

if __name__ == "__main__":
    app.run(debug=True)
