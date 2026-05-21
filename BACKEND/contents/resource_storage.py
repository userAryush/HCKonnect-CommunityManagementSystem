"""Cloudinary storage for resource files — always raw + public delivery."""
import os

import cloudinary.uploader
from cloudinary_storage.storage import RawMediaCloudinaryStorage

from .resource_utils import extension_from_name


class ResourceCloudinaryStorage(RawMediaCloudinaryStorage):
    def _upload(self, name, content):
        options = {
            "use_filename": True,
            "resource_type": self.RESOURCE_TYPE,
            "access_mode": "public",
            "tags": self.TAG,
        }
        folder = os.path.dirname(name)
        if folder:
            options["folder"] = folder
        ext = extension_from_name(name)
        if ext:
            options["format"] = ext
        return cloudinary.uploader.upload(content, **options)
