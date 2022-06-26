from bottle import route, run, post, request, HTTPResponse, static_file
from truckpad.bottle.cors import CorsPlugin, enable_cors

from embedding import EmbeddingGenerator
from io import BytesIO
from img_manipulation import get_aggregated_image


eg = EmbeddingGenerator()


@enable_cors
@route("/aggregation/<method>")
def agg(method):
    # headers = {"Content-Type": "image/png"}
    ids = request.GET.get('digits')
    ids = map(int, ids.split(","))

    # get instances for current selection and their respective classes
    imgs = []
    classes = []
    for idx in ids:
        # unpack image and it's respective classification
        inst, inst_class = eg.get_image(idx)

        imgs.append(inst)
        classes.append(inst_class)

    # buffer = get_aggregated_image(imgs)
    # body = BytesIO(buffer)

    slug = get_aggregated_image(imgs, classes, method)
    # return HTTPResponse(slug, **headers)
    return HTTPResponse(
        {"id": slug, "method": method, "instanceCount": len(imgs) }
    )


@enable_cors
@route("/embedding/<method>")
def get_embedding(method):
    rp = getattr(request.params, "digits", None)
    return dict(data=eg.get_embedding(rp, method), method=method)


@enable_cors
@route("/img")
def img():
    headers = {"Content-Type": "image/png"}
    idx = getattr(request.params, "idx", None)
    if idx:
        idx = int(idx)
        img, _ = eg.get_image(idx)
        body = BytesIO()
        img.save(body, format="PNG")
        return HTTPResponse(body.getvalue(), **headers)

@enable_cors
@route("/aggregatedImages/<filepath>")
def img(filepath):
    return static_file(filepath, root="aggregated_images")


run(host="localhost", port=8080, debug=True)
