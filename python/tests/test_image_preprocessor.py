import io
from PIL import Image
from services.image_preprocessor import preprocess_image

def test_preprocess_image():
    # Create a small dummy image in memory
    img = Image.new('RGB', (100, 100), color = 'red')
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='JPEG')
    img_bytes = img_byte_arr.getvalue()

    processed = preprocess_image(img_bytes)
    assert len(processed) > 0

    # Test resizing
    large_img = Image.new('RGB', (2500, 2500), color = 'blue')
    large_byte_arr = io.BytesIO()
    large_img.save(large_byte_arr, format='JPEG')
    large_bytes = large_byte_arr.getvalue()

    processed_large = preprocess_image(large_bytes, max_size=(500, 500))
    # Load back the processed image and assert dimensions
    back_img = Image.open(io.BytesIO(processed_large))
    assert back_img.size[0] <= 500
    assert back_img.size[1] <= 500
