# Scratch.ai POC — Quick Start Guide

## Setup (5 minutes)

### 1. Install dependencies
```bash
pip install anthropic PyPDF2 python-pptx
```

### 2. Get your Claude API key
- Go to https://console.anthropic.com/
- Create an account (free tier gives you some credits)
- Copy your API key

### 3. Set the API key
```bash
# Mac/Linux
export ANTHROPIC_API_KEY="sk-ant-your-key-here"

# Windows PowerShell
$env:ANTHROPIC_API_KEY="sk-ant-your-key-here"
```

## Usage

### Basic — Detailed notes from a lecture
```bash
python scratch_ai_poc.py --transcript my_lecture.vtt --slides lecture_slides.pdf
```

### Simple/Layman mode
```bash
python scratch_ai_poc.py --transcript my_lecture.vtt --slides lecture_slides.pdf --mode simple
```

### Generate BOTH versions at once
```bash
python scratch_ai_poc.py --transcript my_lecture.vtt --slides lecture_slides.pdf --both
```

### Custom output filename
```bash
python scratch_ai_poc.py -t lecture.vtt -s slides.pdf -o my_notes.md
```

## Where to get your lecture files

### Zoom Transcript
1. After your Zoom lecture, go to zoom.us → Recordings
2. Find the lecture → click "Audio Transcript"
3. Download the .vtt file
4. Alternative: copy-paste the transcript from Zoom into a .txt file

### Canvas Slides
1. Go to your Canvas course page
2. Download the lecture slides (PDF or PPTX)
3. If slides aren't available, you can paste the main content into a .txt file

## Supported file formats
- Transcripts: .vtt (Zoom), .txt, .md
- Slides: .pdf, .pptx, .txt

## What to look for in the output
After running the script, open the generated .md file and ask yourself:
- Are the key concepts accurate?
- Is the structure logical?
- Would this actually help you study?
- Is the "simple" mode genuinely easier to understand?
- Are the review questions useful?

Your honest answers determine whether Scratch.ai is worth building further.
