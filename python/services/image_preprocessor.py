import io
from PIL import Image

def preprocess_image(image_bytes: bytes, max_size=(1920, 1920), quality=80) -> bytes:
    """
    Strips EXIF, resizes image to fit max_size, and compresses it.
    Returns the preprocessed image bytes.
    """
    try:
        img = Image.open(io.BytesIO(image_bytes))
        
        # Convert to RGB (to ensure JPEG compatibility and remove transparency/alpha profiles)
        if img.mode != 'RGB':
            img = img.convert('RGB')
            
        # Resize if larger than max_size while maintaining aspect ratio
        img.thumbnail(max_size, Image.Resampling.LANCZOS)
        
        # Save to bytes buffer
        out_buffer = io.BytesIO()
        # By default, saving as JPEG with PIL does not include EXIF unless specifically passed.
        # This strips EXIF automatically.
        img.save(out_buffer, format='JPEG', quality=quality)
        return out_buffer.getvalue()
    except Exception as e:
        # Fallback to returning original bytes if Pillow processing fails
        print(f"Error preprocessing image: {e}")
        return image_bytes
