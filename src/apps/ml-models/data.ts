import { ModelData, FrameworkCode } from './types';

export const models: ModelData[] = [
  {
    name: 'AlexNet',
    family: 'CNN',
    variants: ['AlexNet'],
    params: 61.1,
    topAccuracy: 56.5,
    year: 2012,
    available: true,
    pytorch: true,
    tensorflow: true
  },
  {
    name: 'VGG',
    family: 'CNN',
    variants: ['VGG11', 'VGG13', 'VGG16', 'VGG19'],
    params: 138.4,
    topAccuracy: 71.6,
    year: 2014,
    available: true,
    pytorch: true,
    tensorflow: true
  },
  {
    name: 'ResNet',
    family: 'Residual',
    variants: ['ResNet18', 'ResNet34', 'ResNet50', 'ResNet101', 'ResNet152'],
    params: 60.2,
    topAccuracy: 78.3,
    year: 2015,
    available: true,
    pytorch: true,
    tensorflow: true
  },
  {
    name: 'Inception v3',
    family: 'Inception',
    variants: ['Inception v3'],
    params: 23.8,
    topAccuracy: 77.5,
    year: 2015,
    available: true,
    pytorch: true,
    tensorflow: true
  },
  {
    name: 'DenseNet',
    family: 'Dense',
    variants: ['DenseNet121', 'DenseNet169', 'DenseNet201'],
    params: 20.0,
    topAccuracy: 77.3,
    year: 2016,
    available: true,
    pytorch: true,
    tensorflow: true
  },
  {
    name: 'SqueezeNet',
    family: 'Efficient',
    variants: ['SqueezeNet 1.0', 'SqueezeNet 1.1'],
    params: 1.2,
    topAccuracy: 58.1,
    year: 2016,
    available: true,
    pytorch: true,
    tensorflow: true
  }
];

export const codeExamples: Record<string, FrameworkCode> = {
  AlexNet: {
    pytorch: `import torch
import torchvision.models as models

# Load pre-trained AlexNet
model = models.alexnet(pretrained=True)
model.eval()

# Prepare input (batch_size, channels, height, width)
input_tensor = torch.randn(1, 3, 224, 224)

# Inference
with torch.no_grad():
    output = model(input_tensor)

# Get predictions
probabilities = torch.nn.functional.softmax(output[0], dim=0)
top5_prob, top5_catid = torch.topk(probabilities, 5)`,
    tensorflow: `import tensorflow as tf
from tensorflow.keras.applications import VGG16

# Load pre-trained AlexNet-style model
model = tf.keras.applications.VGG16(
    weights='imagenet',
    include_top=True
)

# Prepare input
img = tf.keras.preprocessing.image.load_img(
    'image.jpg', target_size=(224, 224)
)
img_array = tf.keras.preprocessing.image.img_to_array(img)
img_array = tf.expand_dims(img_array, 0)
img_array = tf.keras.applications.vgg16.preprocess_input(img_array)

# Inference
predictions = model.predict(img_array)
decoded = tf.keras.applications.vgg16.decode_predictions(predictions, top=5)`
  },
  VGG: {
    pytorch: `import torch
import torchvision.models as models

# Load VGG variants
vgg11 = models.vgg11(pretrained=True)
vgg16 = models.vgg16(pretrained=True)
vgg19 = models.vgg19(pretrained=True)

# Set to evaluation mode
model = vgg16.eval()

# Prepare input
input_tensor = torch.randn(1, 3, 224, 224)

# Inference
with torch.no_grad():
    output = model(input_tensor)

# Apply softmax
probabilities = torch.nn.functional.softmax(output[0], dim=0)`,
    tensorflow: `import tensorflow as tf
from tensorflow.keras.applications import VGG16, VGG19

# Load VGG variants
vgg16 = VGG16(weights='imagenet', include_top=True)
vgg19 = VGG19(weights='imagenet', include_top=True)

# Prepare input
from tensorflow.keras.preprocessing import image
img = image.load_img('image.jpg', target_size=(224, 224))
x = image.img_to_array(img)
x = tf.expand_dims(x, 0)
x = tf.keras.applications.vgg16.preprocess_input(x)

# Inference
predictions = vgg16.predict(x)
results = tf.keras.applications.vgg16.decode_predictions(predictions, top=5)`
  },
  ResNet: {
    pytorch: `import torch
import torchvision.models as models

# Load ResNet variants
resnet18 = models.resnet18(pretrained=True)
resnet50 = models.resnet50(pretrained=True)
resnet152 = models.resnet152(pretrained=True)

# Set to evaluation mode
model = resnet50.eval()

# Prepare input
input_tensor = torch.randn(1, 3, 224, 224)

# Inference with residual connections
with torch.no_grad():
    output = model(input_tensor)

# Get top predictions
probabilities = torch.nn.functional.softmax(output[0], dim=0)
top5_prob, top5_catid = torch.topk(probabilities, 5)`,
    tensorflow: `import tensorflow as tf
from tensorflow.keras.applications import (
    ResNet50, ResNet101, ResNet152
)

# Load ResNet variants
resnet50 = ResNet50(weights='imagenet', include_top=True)
resnet152 = ResNet152(weights='imagenet', include_top=True)

# Prepare input
img = tf.keras.preprocessing.image.load_img(
    'image.jpg', target_size=(224, 224)
)
x = tf.keras.preprocessing.image.img_to_array(img)
x = tf.expand_dims(x, 0)
x = tf.keras.applications.resnet.preprocess_input(x)

# Inference
predictions = resnet50.predict(x)
results = tf.keras.applications.resnet.decode_predictions(predictions, top=5)`
  },
  'Inception v3': {
    pytorch: `import torch
import torchvision.models as models

# Load Inception v3
model = models.inception_v3(pretrained=True)
model.eval()

# Note: Inception v3 expects 299x299 input
input_tensor = torch.randn(1, 3, 299, 299)

# Inference
with torch.no_grad():
    output = model(input_tensor)

# Process output
probabilities = torch.nn.functional.softmax(output[0], dim=0)
top5_prob, top5_catid = torch.topk(probabilities, 5)`,
    tensorflow: `import tensorflow as tf
from tensorflow.keras.applications import InceptionV3

# Load Inception v3
model = InceptionV3(weights='imagenet', include_top=True)

# Prepare input (299x299 for Inception)
img = tf.keras.preprocessing.image.load_img(
    'image.jpg', target_size=(299, 299)
)
x = tf.keras.preprocessing.image.img_to_array(img)
x = tf.expand_dims(x, 0)
x = tf.keras.applications.inception_v3.preprocess_input(x)

# Inference
predictions = model.predict(x)
results = tf.keras.applications.inception_v3.decode_predictions(
    predictions, top=5
)`
  },
  DenseNet: {
    pytorch: `import torch
import torchvision.models as models

# Load DenseNet variants
densenet121 = models.densenet121(pretrained=True)
densenet169 = models.densenet169(pretrained=True)
densenet201 = models.densenet201(pretrained=True)

# Set to evaluation mode
model = densenet121.eval()

# Prepare input
input_tensor = torch.randn(1, 3, 224, 224)

# Inference with dense connections
with torch.no_grad():
    output = model(input_tensor)

# Get predictions
probabilities = torch.nn.functional.softmax(output[0], dim=0)`,
    tensorflow: `import tensorflow as tf
from tensorflow.keras.applications import (
    DenseNet121, DenseNet169, DenseNet201
)

# Load DenseNet variants
densenet121 = DenseNet121(weights='imagenet', include_top=True)
densenet201 = DenseNet201(weights='imagenet', include_top=True)

# Prepare input
img = tf.keras.preprocessing.image.load_img(
    'image.jpg', target_size=(224, 224)
)
x = tf.keras.preprocessing.image.img_to_array(img)
x = tf.expand_dims(x, 0)
x = tf.keras.applications.densenet.preprocess_input(x)

# Inference
predictions = densenet121.predict(x)
results = tf.keras.applications.densenet.decode_predictions(predictions, top=5)`
  },
  SqueezeNet: {
    pytorch: `import torch
import torchvision.models as models

# Load SqueezeNet
model = models.squeezenet1_0(pretrained=True)
# or squeezenet1_1 for the updated version
# model = models.squeezenet1_1(pretrained=True)

model.eval()

# Prepare input
input_tensor = torch.randn(1, 3, 224, 224)

# Inference - efficient with fire modules
with torch.no_grad():
    output = model(input_tensor)

# Get predictions
probabilities = torch.nn.functional.softmax(output[0], dim=0)
top5_prob, top5_catid = torch.topk(probabilities, 5)`,
    tensorflow: `import tensorflow as tf

# SqueezeNet implementation
def fire_module(x, squeeze_filters, expand_filters):
    squeeze = tf.keras.layers.Conv2D(
        squeeze_filters, (1, 1), activation='relu'
    )(x)
    expand1x1 = tf.keras.layers.Conv2D(
        expand_filters, (1, 1), activation='relu'
    )(squeeze)
    expand3x3 = tf.keras.layers.Conv2D(
        expand_filters, (3, 3), padding='same', activation='relu'
    )(squeeze)
    return tf.keras.layers.Concatenate()([expand1x1, expand3x3])

# Build SqueezeNet
input_layer = tf.keras.layers.Input(shape=(224, 224, 3))
x = tf.keras.layers.Conv2D(64, (3, 3), strides=2, activation='relu')(input_layer)
x = tf.keras.layers.MaxPooling2D(pool_size=(3, 3), strides=2)(x)
x = fire_module(x, 16, 64)
# ... additional fire modules ...
predictions = tf.keras.layers.Dense(1000, activation='softmax')(x)

model = tf.keras.Model(inputs=input_layer, outputs=predictions)`
  }
};
