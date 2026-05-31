import os
import io
import cloudinary
import cloudinary.uploader
from fastapi import UploadFile
from typing import Union, Any
from dotenv import load_dotenv

load_dotenv()

cloudinary.config(
    cloud_name=os.getenv("CLOUD_NAME"),
    api_key=os.getenv("CLOUD_API_KEY"),
    api_secret=os.getenv("CLOUD_API_SECRET")
)

def _assert_cloudinary_configured() -> None:
    """Fail fast with a clear message if Cloudinary isn't configured."""
    cfg = cloudinary.config()
    if not cfg.cloud_name or not cfg.api_key or not cfg.api_secret:
        raise EnvironmentError(
            "Cloudinary is not configured. "
            "Set CLOUD_NAME, CLOUD_API_KEY, CLOUD_API_SECRET in .env."
        )


def upload_to_cloudinary(
    file: Union[str, UploadFile, bytes, Any],
    folder: str = "memes",
    *,
    delete_local: bool = True,   # explicit opt-in instead of silent side-effect
) -> dict:
    """
    Upload a file to Cloudinary.

    Args:
        file:         A file path (str), FastAPI UploadFile, bytes, or file-like object.
        folder:       Cloudinary folder to upload into.
        delete_local: If True and `file` is a path, delete the local file
                      ONLY after a confirmed successful upload.

    Returns:
        Cloudinary upload result dict (contains 'secure_url', 'public_id', etc.)

    Raises:
        EnvironmentError: Cloudinary credentials missing.
        Exception:        Any Cloudinary upload error (local file is NOT deleted).
    """
    _assert_cloudinary_configured()

    upload_source: Any
    is_path = isinstance(file, str)

    if is_path:
        if not os.path.exists(file):
            raise FileNotFoundError(f"File not found: {file}")
        upload_source = file

    elif isinstance(file, UploadFile):
        file.file.seek(0)          # reset cursor — critical if file was read before
        upload_source = file.file

    elif isinstance(file, bytes):
        # ---> ADDED: Convert raw bytes into a file-like object <---
        upload_source = io.BytesIO(file)

    else:
        upload_source = file       # generic file-like object

    # Upload first — only clean up local file after confirmed success
    result: dict = cloudinary.uploader.upload(
        upload_source,
        resource_type="auto",
        folder=folder,
    )

    # Safe to delete now — upload succeeded
    if is_path and delete_local and os.path.exists(file):
        os.remove(file)

    return result