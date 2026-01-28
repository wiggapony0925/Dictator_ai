from openai import OpenAI
import os
import uuid

def convert_text_to_speech(text, api_key, output_dir="static/audio"):
    """
    Converts text to speech using OpenAI API.
    Args:
        text (str): Text to convert.
        api_key (str): OpenAI API Key.
        output_dir (str): Directory to save audio files.
    Returns:
        str: Filename of the generated audio.
    """
    if not api_key:
        raise ValueError("OpenAI API Key is required.")

    client = OpenAI(api_key=api_key)

    # Ensure output directory exists
    os.makedirs(output_dir, exist_ok=True)

    # Truncate text if necessary. OpenAI TTS has a limit of 4096 characters per request.
    # For a "simple" MVP, we will truncate. For a full product, we would chunk.
    # Let's be safe and warn/truncate for now or do a naive chunk loop?
    # The prompt asked for "simple yet effective". 
    # Let's do a simple chunking to make it effective for longer docs.
    
    max_chars = 4096
    chunks = [text[i:i+max_chars] for i in range(0, len(text), max_chars)]
    
    # Generate unique filename
    filename = f"{uuid.uuid4()}.mp3"
    final_path = os.path.join(output_dir, filename)
    
    # Iterate and combine? (Combining MP3s in python without ffmpeg is tricky without external deps like pydub which requires installed ffmpeg)
    # To keep it "simple" and "dockerized" without massive dependencies, 
    # let's just stick to the first chunk if it's too long, OR
    # simply create multiple files? 
    # Actually, standard OpenAI TTS can handle it if we just send one request if under limit.
    # If over limit, let's just error for now or take the first 4096 chars.
    # A cleaner approach for MVP:
    
    if len(text) > 4096:
        # Simple heuristic: Just read the first ~4000 characters.
        # User can upgrade later.
        print("Warning: Text too long, truncating to 4096 chars.")
        text = text[:4096]

    try:
        response = client.audio.speech.create(
            model="tts-1",
            voice="alloy",
            input=text
        )
        
        response.stream_to_file(final_path)
        return filename
        
    except Exception as e:
        print(f"Error calling OpenAI TTS: {e}")
        raise e
