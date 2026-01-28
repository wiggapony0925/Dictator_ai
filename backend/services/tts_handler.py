from openai import OpenAI
import os
import uuid

def convert_text_to_speech(text, api_key, voice="alloy", speed=1.0, model="tts-1"):
    """
    Converts text to speech using OpenAI API with customizable options.
    """
    client = OpenAI(api_key=api_key)
    
    try:
        response = client.audio.speech.create(
            model=model,
            voice=voice,
            input=text,
            speed=speed
        )
        
        # Save to a file
        filename = f"{uuid.uuid4()}.mp3"
        filepath = os.path.join("static/audio", filename)
        os.makedirs("static/audio", exist_ok=True)
        
        # response.stream_to_file(filepath) is deprecated in some versions
        # Using standard write for compatibility
        with open(filepath, "wb") as f:
            f.write(response.content)
        
        return filename
    except Exception as e:
        print(f"Error calling OpenAI API: {e}")
        raise e
