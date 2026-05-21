"""Helpers for community resource files on Cloudinary."""

import os

import time

import uuid



import requests



DOCUMENT_EXTENSIONS = frozenset({

    "pdf",

    "doc",

    "docx",

    "ppt",

    "pptx",

    "xls",

    "xlsx",

    "zip",

    "rar",

    "7z",

    "txt",

    "csv",

    "rtf",

    "odt",

    "ods",

    "odp",

})





def extension_from_name(name):

    if not name:

        return ""

    base = os.path.basename(str(name))

    if "." not in base:

        return ""

    ext = base.rsplit(".", 1)[-1].lower()

    return ext if ext and len(ext) <= 10 else ""





def is_document_extension(ext):

    return bool(ext) and ext in DOCUMENT_EXTENSIONS





def resource_upload_path(instance, filename):

    """Keep the client extension in the Cloudinary public_id."""

    base = os.path.basename(filename or "file")

    stem, ext = os.path.splitext(base)

    if not stem:

        stem = "file"

    unique = uuid.uuid4().hex[:8]

    return f"resources/{stem}_{unique}{ext.lower()}"





def _ensure_cloudinary_config():

    """django-cloudinary-storage does not always configure cloudinary.api."""

    try:

        from django.conf import settings

        import cloudinary



        cfg = getattr(settings, "CLOUDINARY_STORAGE", {}) or {}

        cloudinary.config(

            cloud_name=cfg.get("CLOUD_NAME"),

            api_key=cfg.get("API_KEY"),

            api_secret=cfg.get("API_SECRET"),

            secure=True,

        )

        return bool(cfg.get("CLOUD_NAME") and cfg.get("API_SECRET"))

    except Exception:

        return False





def _public_id_candidates(stored_name, ext):

    """All public_id strings worth trying with the Admin API."""

    base = (stored_name or "").strip().lstrip("/")

    if not base:

        return []



    candidates = [base]

    if ext and not base.lower().endswith(f".{ext}"):

        candidates.append(f"{base}.{ext}")



    expanded = []

    for name in candidates:

        expanded.append(name)

        if name.startswith("media/"):

            expanded.append(name[6:])

        else:

            expanded.append(f"media/{name}")



    seen = set()

    ordered = []

    for name in expanded:

        if name and name not in seen:

            seen.add(name)

            ordered.append(name)

    return ordered





def _cloudinary_resource_attempts(public_id, ext):

    """Build (resource_type, public_id) pairs to resolve legacy + raw uploads."""

    attempts = []

    for pid in _public_id_candidates(public_id, ext):

        attempts.append(("raw", pid))

        if ext and is_document_extension(ext):

            stem = pid

            if stem.lower().endswith(f".{ext}"):

                stem = stem[: -(len(ext) + 1)]

            attempts.append(("image", stem))



    seen = set()

    ordered = []

    for item in attempts:

        if item not in seen:

            seen.add(item)

            ordered.append(item)

    return ordered





def resolve_cloudinary_resource(resource):

    """

    Look up the asset on Cloudinary. Returns metadata dict or None.

    Never use resource.file.url — that builds broken /v1/ URLs.

    """

    if not resource.file:

        return None



    if not _ensure_cloudinary_config():

        return None



    import cloudinary.api



    stored_name = (resource.file.name or "").strip()

    ext = resource.file_extension or extension_from_name(resource.original_filename)



    for resource_type, pid in _cloudinary_resource_attempts(stored_name, ext):

        try:

            info = cloudinary.api.resource(pid, resource_type=resource_type)

            if info:

                info["_resolved_resource_type"] = resource_type

                return info

        except Exception:

            continue

    return None





def build_resource_file_url(resource):

    """Return Cloudinary secure_url with the real version (not /v1/)."""

    info = resolve_cloudinary_resource(resource)

    if info:

        url = info.get("secure_url") or info.get("url")

        if url:

            return url.replace("http://", "https://", 1)

    return None





def resource_download_url(resource):

    return build_resource_file_url(resource)





def fetch_resource_file_bytes(resource):
    """
    Download file bytes via Cloudinary Admin API (works when CDN URLs are blocked).
    Returns (bytes, content_type) or (None, error_code).
    """
    info = resolve_cloudinary_resource(resource)
    if not info:
        return None, "not_found"

    if not _ensure_cloudinary_config():
        return None, "not_configured"

    import cloudinary
    import cloudinary.utils

    public_id = info.get("public_id")
    resource_type = info.get("_resolved_resource_type") or info.get("resource_type") or "raw"
    if not public_id:
        return None, "not_found"

    timestamp = int(time.time())
    params = {"public_id": public_id, "timestamp": timestamp}

    api_secret = cloudinary.config().api_secret
    if not api_secret:
        return None, "not_configured"

    params["signature"] = cloudinary.utils.api_sign_request(params, api_secret)
    params["api_key"] = cloudinary.config().api_key

    cloud_name = cloudinary.config().cloud_name
    url = f"https://api.cloudinary.com/v1_1/{cloud_name}/{resource_type}/download"

    try:
        resp = requests.get(url, params=params, timeout=90)
    except requests.RequestException:
        return None, "upstream_error"

    if resp.status_code == 200 and resp.content:
        content_type = resp.headers.get("Content-Type", "application/octet-stream")
        return resp.content, content_type

    if resp.status_code in (401, 403):
        return None, "pdf_delivery_blocked"

    return None, "not_found"


