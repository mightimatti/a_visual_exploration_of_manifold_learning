from sklearn.datasets import fetch_openml
from sklearn.decomposition import PCA
from sklearn.preprocessing import normalize
from numpy.random import permutation
import seaborn as sns

from sklearn.manifold import TSNE, MDS, LocallyLinearEmbedding, Isomap

from PIL import Image
import numpy as np
import pickle


# utility function
def rgb_to_hex(float_r, float_g, float_b):
    return "#%02x%02x%02x" % (
        int(float_r * 255),
        int(float_g * 255),
        int(float_b * 255),
    )


class EmbeddingGenerator:
    def __init__(self):

        try:
            with open(CACHED_DS_FILEPATH, "rb") as f:
                self.x, self.y = pickle.load(f)
            print("Using cached dataset")
        except FileNotFoundError as err:
            print(
                "Didn't find cached dataset. Downloading it now. This might take a minute…"
            )

            # download dataset using sklearns built-in method
            self.x, self.y = fetch_openml("mnist_784", return_X_y=True, as_frame=True)

            # pickle dataset to speed up future runs
            with open(CACHED_DS_FILEPATH, "wb+") as f:
                pickle.dump(
                    (
                        self.x,
                        self.y,
                    ),
                    f,
                )

        self.normalized_x = normalize(self.x)
        self.index = self.x.index
        self.return_object_count = 1000

    def get_model(self, method):
        default_kwargs = {"n_components": 2}
        if method == "tsne":
            return TSNE(**default_kwargs)
        elif method == "mds":
            return MDS(**default_kwargs)
        elif method == "lle":
            return LocallyLinearEmbedding(**default_kwargs)
        elif method == "isomap":
            return Isomap(**default_kwargs)
        elif method == "pca":
            return PCA(**default_kwargs)
        else:
            raise ValueError("Unsupported Method")

    def get_image(self, idx):
        # fetch relvant instance
        instance = self.x.iloc[idx].to_numpy()
        # "de-flatten"/reshape image into 28x28 matrix
        img = Image.fromarray(
            instance.reshape(
                (
                    28,
                    28,
                )
            )
        )
        # convert to luminance map and return
        return img.convert("L"), self.y.iloc[idx]

    """
    filter Dataset returning only instances of digits in 
    `digits`
    """

    def filter_dataset(self, digits):
        indices = [False] * len(self.y)

        index_dict = {}

        for d in digits:
            cur_idx_array = self.y == str(d)
            index_dict[d] = cur_idx_array
            indices |= cur_idx_array

        return self.normalized_x[indices], index_dict

    def transform_data_and_build_response(
        self, digits_to_include, digits_per_class, class_indexes, model
    ):
        response_data = {"digits": {}}

        min_x = []
        min_y = []
        max_x = []
        max_y = []
        # if not isinstance(model, TSNE):
        for digit in digits_to_include:
            instances = self.normalized_x[class_indexes[digit]]
            transformed_instances = model.transform(instances)
            filtered_indices = self.index[class_indexes[digit]]

            min_x.append(transformed_instances[:, 0].min())
            min_y.append(transformed_instances[:, 1].min())
            max_x.append(transformed_instances[:, 0].max())
            max_y.append(transformed_instances[:, 1].max())

            response_data["digits"][digit] = [
                {
                    "x": transformed_instances[idx][0],
                    "y": transformed_instances[idx][1],
                    "idx": int(filtered_indices[idx]),
                    "cls": digit,
                }
                for idx in range(digits_per_class)
            ]
        response_data["bounds"] = {
            "min_x": min(min_x),
            "min_y": min(min_y),
            "max_x": max(max_x),
            "max_y": max(max_y),
        }
        response_data["color_mapping"] = {
            idx: rgb_to_hex(*c) for idx, c in enumerate(sns.husl_palette(n_colors=10))
        }

        return response_data
        # else:
        #     agg_indices = [False] * len(self.y)
        #     for digit in digits_to_include:
        #          agg_indices |= class_indexes[digit]

        #     instances = self.normalized_x[agg_indices]
        #     filtered_indices = self.index[agg_indices]
        #     filtered_res = self.y[agg_indices]

        #     transformed_instances = model.fit_transform(instances)

        #     response_data = { digit: [] for digit in digits_to_include}

        #     for idx, dat in enumerate(transformed_instances):
        #         response_data[filtered_res[idx]].append(
        #             {
        #                 'x': dat[0],
        #                 'y': dat[1],
        #                 'idx': int(filtered_indices[idx]),
        #                 'cls': filtered_res[idx]
        #             }
        #         )

    def get_digits(self, digits_to_include):
        if not digits_to_include:
            digits_to_include = "0123456789"

        digits_per_class = self.return_object_count // len(digits_to_include)

        return digits_to_include, digits_per_class

    def get_embedding(self, digits_to_include, method):

        # include all digits, if not otherwise specified
        digits_to_include, digits_per_class = self.get_digits(digits_to_include)

        df, class_indexes = self.filter_dataset(digits_to_include)

        model = self.get_model(method)

        training_slice = permutation(df)[: self.training_object_count]
        model.fit(training_slice)

        return self.transform_data_and_build_response(
            digits_to_include, digits_per_class, class_indexes, model
        )


"""
from embedding import EmbeddingGenerator
eg = EmbeddingGenerator()
eg.pca("123",5)
"""
