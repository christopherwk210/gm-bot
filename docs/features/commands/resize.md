# Resize

> **Matches:** `!resize`, `!upscale`, `!upsize`

> **Usable by:** Everyone

When used while uploading an image, resizes the image.

```
!resize [scale] [-b] [-o]
```
Resizes an image by a power of `[scale]`. Uses nearest neighbor scaling unless `-b` is used, in which case it will use bilinear. If `-o` is used, the original image will also be uploaded. `[scale]` must be between 0 and 10.
