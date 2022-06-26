import collections
import functools

import cv2 as cv
from PIL import Image
import numpy as np
import os
import time
import seaborn as sns

IMG_FOLDER = (
    "aggregated_images"
)


def convert_from_cv_to_image(img):
    return Image.fromarray(cv.cvtColor(img, cv.COLOR_BGR2RGB))
    # return Image.fromarray(img)


def convert_from_image_to_cv(img):
    return np.array(img)

    # return np.asarray(img)


def monochrome_average(imgs):
    mean_image = np.zeros(shape=[28, 28], dtype=np.float32)
    for img in imgs:
        mean_image += convert_from_image_to_cv(img).astype(np.float32)
    mean_image /= len(imgs)

    return mean_image


def colour_average(images, classes, saturated=False):
    # seperate images by class
    # calculate average image per class
    # determine color value for class

    agg_dict = collections.defaultdict(list)
    for idx, image in enumerate(images):
        agg_dict[classes[idx]].append(image)

    #  calculate class-wise average images
    mean_images = {}
    for cls, imgs in agg_dict.items():
        mean_images[cls] = monochrome_average(imgs)

    #get sorted keys for color-palette
    keys = sorted(mean_images.keys())
    palette = sns.husl_palette(n_colors=10)

    for k in keys:
        # RGB color
        rgb = palette[int(k)]
        #bgr for opencv
        bgr = rgb[::-1]
        # create 28x28 image of solid color
        solid_image = np.full((28, 28, 3),bgr, dtype=np.float32)



        cur_mean_image = np.expand_dims(mean_images[k], 2) * solid_image
        if not saturated:
            # calculate current class ratio to overall image count in selction. Always <1
            cls_ratio = len(agg_dict[k]) / len(images)
            cur_mean_hls = cv.cvtColor(cur_mean_image, cv.COLOR_BGR2HLS)
            cur_mean_hls *= np.full((28,28,3), (1.0,cls_ratio,1.0), dtype=np.float32)
            cur_mean_image = cv.cvtColor(cur_mean_hls, cv.COLOR_HLS2BGR)

        mean_images[k] = cur_mean_image

    # reduce image to a single image
    summed_image = functools.reduce(
        np.add,
        mean_images.values(),
        np.zeros((28,28,3))
    )
    return summed_image



def get_aggregated_image(imgs, classes, method="avg_m"):
    if method == 'avg_m':
        mean_image = monochrome_average(imgs)
    elif method == "avg_c":
        mean_image = colour_average(imgs, classes)
    elif method == "avg_c_s":
        mean_image = colour_average(imgs, classes, saturated=True)
    else:
        raise NotImplementedError
    file_name = str(int(time.time())) + ".png"
    file_path = os.path.join(IMG_FOLDER, file_name)

    buffer = cv.imwrite(file_path, mean_image)

    return file_name
