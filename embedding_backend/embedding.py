from sklearn.datasets import fetch_openml
from sklearn.decomposition import PCA
from sklearn.preprocessing import normalize
from numpy.random import permutation
import seaborn as sns
from sklearn.manifold import TSNE, MDS, LocallyLinearEmbedding, Isomap

from PIL import Image
import numpy as np
import pickle

# path to store cached Dataset
CACHED_DS_FILEPATH = "dset.pkl"

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

        # mnist = fetch_openml('mnist_784')
        self.training_object_count = 900

        self.normalized_x = normalize(self.x)
        self.index = self.x.index
        self.return_object_count = 300

    def get_model(self, method):
        default_kwargs = {"n_components": 2}
        if method == "mds":
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

    def filter_dataset(self, digits):
        """
        filter Dataset returning only instances of digits in
        `digits`
        """
        indices = [False] * len(self.y)

        index_dict = {}

        for d in digits:
            cur_idx_array = self.y == str(d)
            index_dict[d] = cur_idx_array
            indices |= cur_idx_array

        return self.normalized_x[indices], index_dict

    def transform_data_and_build_response(
        self, digits_to_include, digits_per_class, class_indices, model
    ):
        response_data = {"digits": {}}

        min_x = min_y = max_x = max_y = []

        for digit in digits_to_include:
            instances = self.normalized_x[class_indices[digit]]
            transformed_instances = model.transform(instances)
            filtered_indices = self.index[class_indices[digit]]

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

        # return colour palette along with data
        response_data["color_mapping"] = {
            idx: rgb_to_hex(*c) for idx, c in enumerate(sns.husl_palette(n_colors=10))
        }

        return response_data

    def fit_transform_data_and_build_response(
        self, digits_to_include, digits_per_class, class_indices, model, training_slice
    ):
        """
        similar to the above function, but the fit and the transorm step are not
        decoupled. This is for reasons inherent to the dimensionality reduction
        techniques involved. Note the differing signature of the function
        """
        response_data = {"digits": {}}

        min_x = min_y = max_x = max_y = []

        transformed_instances = model.fit_transform(training_slice)

        for digit in digits_to_include:
            filtered_indices = self.index[class_indices[digit]]
            # for idx in filtered_indices:
            class_instances = transformed_instances

            min_x.append(transformed_instances[:, 0].min())
            min_y.append(transformed_instances[:, 1].min())
            max_x.append(transformed_instances[:, 0].max())
            max_y.append(transformed_instances[:, 1].max())

            # response_data["digits"][digit] = [
            #     {
            #         "x": transformed_instances[idx][0],
            #         "y": transformed_instances[idx][1],
            #         "idx": int(filtered_indices[idx]),
            #         "cls": digit,
            #     }
            #     for idx in range(digits_per_class)
            # ]
        response_data["bounds"] = {
            "min_x": min(min_x),
            "min_y": min(min_y),
            "max_x": max(max_x),
            "max_y": max(max_y),
        }

        # return colour palette along with data
        response_data["color_mapping"] = {
            idx: rgb_to_hex(*c) for idx, c in enumerate(sns.husl_palette(n_colors=10))
        }

        return response_data

    def get_digits(self, digits_to_include):
        if not digits_to_include:
            digits_to_include = "0123456789"

        digits_per_class = self.return_object_count // len(digits_to_include)

        return digits_to_include, digits_per_class

    def get_embedding(self, digits_to_include, method):

        # include all digits, if not otherwise specified
        digits_to_include, digits_per_class = self.get_digits(digits_to_include)

        df, class_indices = self.filter_dataset(digits_to_include)

        training_slice = permutation(df)[: self.training_object_count]

        model = self.get_model(method)
        if method not in ["mds"]:
            model.fit(training_slice)

            return self.transform_data_and_build_response(
                digits_to_include, digits_per_class, class_indices, model
            )

        else:
            return self.fit_transform_data_and_build_response(
                digits_to_include, digits_per_class, class_indices, model, training_slice
            )
