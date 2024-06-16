import 'dart:math' as math;
import 'dart:ui' as ui;

import 'package:file_saver/file_saver.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/foundation.dart';
import 'package:icon_appleizer/slider_with_value_input.dart';
import 'package:image_picker/image_picker.dart';

import 'color_util.dart';
import 'image_util.dart';

void main() {
  runApp(const AppleizerApp());
}

class AppleizerApp extends StatelessWidget {
  const AppleizerApp({super.key});

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return const CupertinoApp(
      title: 'IconAppleizer',
      theme: CupertinoThemeData(
        primaryColor: Color(0xFF0070FF),
        brightness: Brightness.light,
        barBackgroundColor: Color(0xFF0070FF),
        textTheme: CupertinoTextThemeData(
          navTitleTextStyle: TextStyle(
            color: Color(0xFFFFFFFF),
            fontSize: 17.0,
            fontWeight: FontWeight.w600,
          ),
          textStyle: TextStyle(
            color: Color(0xFF000000),
            fontSize: 17.0,
            fontWeight: FontWeight.w400,
          ),
        ),
      ),
      home: MyHomePage(title: 'Icon Appleizer'),
    );
  }
}

class MyHomePage extends StatefulWidget {
  const MyHomePage({super.key, required this.title});

  final String title;

  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _ImagePainter extends CustomPainter {
  ui.Image? image;
  double maxSize;

  _ImagePainter(this.image) : maxSize = 512.0;

  void updateMaxSize(double newSize) {
    maxSize = newSize;
  }

  @override
  void paint(Canvas canvas, Size size) {
    if (image != null) {
      paintImage(
          canvas: canvas,
          rect: Rect.fromLTWH(
              0, 0, math.min(512, maxSize), math.min(512, maxSize)),
          image: image!,
          alignment: Alignment.center,
          fit: BoxFit.scaleDown);
    }
  }

  @override
  bool shouldRepaint(covariant _ImagePainter oldDelegate) {
    return oldDelegate.image != image;
  }
}

class _MyHomePageState extends State<MyHomePage> {
  ui.Image? currentImage;
  ui.Image? modifiedImage;

  // pre-define widgets and painter
  static final Widget imageNotLoadedWidget = SizedBox(
    width: 512,
    height: 512,
    child: Container(
      alignment: Alignment.center,
      child: const Text('No image selected.'),
    ),
  );
  static final Widget imageLoadingWidget = SizedBox(
    width: 512,
    height: 512,
    child: Container(
      alignment: Alignment.center,
      child: const CupertinoActivityIndicator(),
    ),
  );
  static final _ImagePainter _originalImagePainter = _ImagePainter(null);
  final Widget imageOriginalWidget = CustomPaint(
    painter: _originalImagePainter,
    size: const ui.Size(512, 512),
  );
  static final _ImagePainter _imagePainter = _ImagePainter(null);
  final Widget imageCanvasWidget = CustomPaint(
    painter: _imagePainter,
    size: const ui.Size(512, 512),
  );
  List<Widget> imageWidgets = [imageNotLoadedWidget];

  // define colors and input key
  double currentHue = 0.0;
  final hueInputKey = GlobalKey<SliderWithValueInputState>();
  Color hueColor = ColorUtil.rgbToColor(ColorUtil.hslToRgb(0.0, 1.0, 0.5));
  double currentLuminance = 0.5;
  final luminanceInputKey = GlobalKey<SliderWithValueInputState>();
  Color luminanceColor =
      ColorUtil.rgbToColor(ColorUtil.hslToRgb(0.0, 1.0, 0.5));
  double blackCutoff = 0.0;
  final blackInputKey = GlobalKey<SliderWithValueInputState>();
  Color blackColor = ColorUtil.rgbToColor(ColorUtil.hslToRgb(0.0, 0.0, 0.0));
  double whiteCutoff = 0.0;
  final whiteInputKey = GlobalKey<SliderWithValueInputState>();
  Color whiteColor = ColorUtil.rgbToColor(ColorUtil.hslToRgb(0.0, 0.0, 1.0));

  void loadImage(XFile? imageToLoad) async {
    if (imageToLoad != null) {
      clearConfig();
      // create buffer, load codec, get frame, and set the image
      ui.ImmutableBuffer buffer = await ui.ImmutableBuffer.fromUint8List(
          await imageToLoad.readAsBytes());
      ui.ImageDescriptor descriptor = await ui.ImageDescriptor.encoded(buffer);
      ui.Codec codec = await descriptor.instantiateCodec();
      ui.FrameInfo frameInfo = await codec.getNextFrame();
      currentImage = frameInfo.image;
      _originalImagePainter.image = currentImage;
      computeAndShowImage();
    }
  }

  void clearConfig() {
    currentHue = 0.0;
    currentLuminance = 0.5;
    blackCutoff = 0.0;
    whiteCutoff = 0.0;
    setState(() {
      hueInputKey.currentState?.value = 0;
      luminanceInputKey.currentState?.value = 50;
      blackInputKey.currentState?.value = 0;
      whiteInputKey.currentState?.value = 0;
    });
  }

  // pass parameters to `compute`, then render the computation result
  void computeAndShowImage() async {
    setState(() {
      imageWidgets = [
        imageOriginalWidget,
        const Padding(
            padding: EdgeInsets.symmetric(vertical: 4.0, horizontal: 0.0)),
        imageLoadingWidget,
      ];
    });
    if (currentImage != null) {
      ByteData? currentImageData = await currentImage?.toByteData();
      if (currentImageData != null) {
        Uint8List pixelList = await compute(ImageUtil.calculateNewImage, {
          'imageData': currentImageData,
          'hue': currentHue,
          'luminance': currentLuminance,
          'blackCutoff': blackCutoff,
          'whiteCutoff': whiteCutoff,
        });
        // create a new image with the modified bytes
        ui.ImmutableBuffer buffer =
            await ui.ImmutableBuffer.fromUint8List(pixelList);
        ui.ImageDescriptor imageDescriptor = ui.ImageDescriptor.raw(buffer,
            width: currentImage!.width,
            height: currentImage!.height,
            pixelFormat: ui.PixelFormat.rgba8888);
        ui.Codec codec = await imageDescriptor.instantiateCodec();
        ui.FrameInfo frameInfo = await codec.getNextFrame();
        ui.Image newImage = frameInfo.image;
        modifiedImage = newImage;
        _imagePainter.image = modifiedImage;
        setState(() {
          imageWidgets = [
            imageOriginalWidget,
            const Padding(
                padding: EdgeInsets.symmetric(vertical: 4.0, horizontal: 0.0)),
            imageCanvasWidget,
          ];
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    List<Widget> widgets = <Widget>[
      LayoutBuilder(
        builder: (BuildContext context, BoxConstraints constraints) {
          _originalImagePainter.updateMaxSize(constraints.maxWidth);
          _imagePainter.updateMaxSize(constraints.maxWidth);
          if (constraints.maxWidth < 1024) {
            return Column(
              mainAxisAlignment: MainAxisAlignment.center,
              mainAxisSize: MainAxisSize.min,
              children: imageWidgets,
            );
          } else {
            return Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              mainAxisSize: MainAxisSize.max,
              children: imageWidgets,
            );
          }
        },
      ),
      const Padding(padding: EdgeInsets.all(10.0)),
      SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          mainAxisSize: MainAxisSize.min,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            SliderWithValueInput(
              key: hueInputKey,
              title: 'Hue',
              max: 360,
              color: hueColor,
              enabled: currentImage != null,
              onChange: (hue) {
                setState(() {
                  currentHue = hue / 360.0;
                  hueColor = ColorUtil.rgbToColor(
                      ColorUtil.hslToRgb(currentHue, 1.0, 0.5));
                  luminanceColor = ColorUtil.rgbToColor(
                      ColorUtil.hslToRgb(currentHue, 1.0, currentLuminance));
                });
              },
              onChangeEnd: (_) => computeAndShowImage(),
            ),
            SliderWithValueInput(
              key: luminanceInputKey,
              title: 'Luminance',
              min: 50,
              max: 100,
              color: luminanceColor,
              enabled: currentImage != null,
              onChange: (luminance) {
                setState(() {
                  currentLuminance = luminance / 100.0;
                  luminanceColor = ColorUtil.rgbToColor(
                      ColorUtil.hslToRgb(currentHue, 1.0, currentLuminance));
                });
              },
              onChangeEnd: (_) => computeAndShowImage(),
            ),
          ],
        ),
      ),
      SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          mainAxisSize: MainAxisSize.min,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            SliderWithValueInput(
              key: blackInputKey,
              title: 'Black Cutoff',
              max: 100 - whiteCutoff * 100,
              color: blackColor,
              enabled: currentImage != null,
              onChange: (blackCut) {
                setState(() {
                  blackCutoff = blackCut / 100.0;
                  if (blackCutoff + whiteCutoff > 1.0) {
                    whiteCutoff = 1.0 - blackCutoff;
                    whiteInputKey.currentState?.value = whiteCutoff * 100;
                  }
                  blackColor = ColorUtil.rgbToColor(
                      ColorUtil.hslToRgb(0.0, 0.0, blackCutoff));
                });
              },
              onChangeEnd: (_) => computeAndShowImage(),
            ),
            SliderWithValueInput(
              key: whiteInputKey,
              title: 'White Cutoff',
              max: 100 - blackCutoff * 100,
              color: whiteColor,
              enabled: currentImage != null,
              onChange: (whiteCut) {
                setState(() {
                  whiteCutoff = whiteCut / 100.0;
                  if (blackCutoff + whiteCutoff > 1.0) {
                    blackCutoff = 1.0 - whiteCutoff;
                    blackInputKey.currentState?.value = blackCutoff * 100;
                  }
                  whiteColor = ColorUtil.rgbToColor(
                      ColorUtil.hslToRgb(0.0, 0.0, 1.0 - whiteCutoff));
                });
              },
              onChangeEnd: (_) => computeAndShowImage(),
            ),
          ],
        ),
      ),
      const Padding(padding: EdgeInsets.all(8.0)),
      SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            SizedBox(
              width: 150,
              child: CupertinoButton.filled(
                padding: EdgeInsets.zero,
                onPressed: () async {
                  XFile? image = await ImagePicker()
                      .pickImage(source: ImageSource.gallery);
                  if (image != null) {
                    setState(() {
                      currentImage = null;
                      imageWidgets = [imageLoadingWidget];
                      loadImage(image);
                    });
                  }
                },
                child: const Text('SELECT…'),
              ),
            ),
            const Padding(padding: EdgeInsets.symmetric(horizontal: 8.0)),
            SizedBox(
              width: 150,
              child: CupertinoButton.filled(
                padding: EdgeInsets.zero,
                onPressed: () {
                  if (modifiedImage != null) {
                    modifiedImage!
                        .toByteData(format: ui.ImageByteFormat.png)
                        .then((byteData) {
                      FileSaver.instance.saveFile(
                          name: 'appleized.png',
                          bytes: byteData!.buffer.asUint8List());
                      showCupertinoDialog(
                          context: context,
                          builder: (BuildContext context) =>
                              CupertinoAlertDialog(
                                content: const Text(
                                  "appleized.png is saved to Downloads folder.",
                                  style: TextStyle(fontSize: 16.0),
                                ),
                                actions: <CupertinoDialogAction>[
                                  CupertinoDialogAction(
                                      child: const Text('OK'),
                                      onPressed: () {
                                        Navigator.of(context).pop();
                                      }),
                                ],
                              ));
                    });
                  }
                },
                child: const Text('SAVE'),
              ),
            ),
            const Padding(padding: EdgeInsets.symmetric(horizontal: 8.0)),
            SizedBox(
              width: 150,
              child: CupertinoButton(
                padding: EdgeInsets.zero,
                onPressed: () {
                  clearConfig();
                  setState(() {
                    imageWidgets = [imageNotLoadedWidget];
                  });
                },
                child: const Text('CLEAR'),
              ),
            ),
          ],
        ),
      ),
      const Padding(padding: EdgeInsets.all(8.0)),
    ];
    return CupertinoPageScaffold(
      navigationBar: CupertinoNavigationBar(
          backgroundColor: CupertinoColors.lightBackgroundGray,
          middle: const Text(
            'Icon Appleizer',
            style: TextStyle(color: CupertinoColors.black),
          ),
          trailing: CupertinoButton(
              padding: EdgeInsets.zero,
              child: const Icon(
                CupertinoIcons.question_circle,
                color: CupertinoColors.black,
              ),
              onPressed: () {
                showCupertinoDialog(
                    context: context,
                    builder: (BuildContext context) => CupertinoAlertDialog(
                          content: const Text(
                            "SELECT an image to start, click SAVE to download.\n\n"
                            "Any pixel with luminance below Black Cutoff will be "
                            "black in the output, vice versa for White Cutoff. "
                            "Those between will be interpolated between "
                            "black and white.\n\n"
                            "Made by Rachel T\nPowered by Flutter",
                            style: TextStyle(fontSize: 16.0),
                          ),
                          actions: <CupertinoDialogAction>[
                            CupertinoDialogAction(
                                child: const Text('OK'),
                                onPressed: () {
                                  Navigator.of(context).pop();
                                }),
                          ],
                        ));
              })),
      child: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: widgets,
            ),
          ),
        ),
      ),
    );
  }
}
