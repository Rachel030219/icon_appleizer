import 'dart:typed_data';

import 'color_util.dart';

class ImageUtil {
  // argMap {'imageData': ByteData imageData, 'hue': double hue,
  //         'luminance': double luminance, 'blackCutoff': double blackCutoff,
  //         'whiteCutoff': double whiteCutoff}
  // Only certain data types can be passed through SendPort.send, so here we
  // pass a Map<String, dynamic> as the argument, and returning a list
  // as the result. Therefore, we can create ui.Image in the main thread.
  // @param imageData: ByteData of the image.
  // @param hue: hue value, from 0.0 to 1.0.
  // @param luminance: luminance value, from 0.0 to 1.0.
  // @return Uint8List: the modified image data.
  static Future<Uint8List> calculateNewImage(
      Map<String, dynamic> argMap) async {
    ByteData? imageData = argMap['imageData'];
    double hue = argMap['hue'];
    double luminance = argMap['luminance'];
    double blackCutoff = argMap['blackCutoff'];
    double whiteCutoff = argMap['whiteCutoff'];
    List<int> bytes = imageData!.buffer.asUint8List();
    // the raw bytes are in RGBA, so we need to skip every 4 bytes
    for (int i = 0; i < bytes.length; i += 4) {
      List<double> hsl =
          ColorUtil.rgbToHsl(bytes[i], bytes[i + 1], bytes[i + 2]);
      hsl[0] = hue;
      List<int> rgb = ColorUtil.hslToRgb(hsl[0], 1.0, luminance)
          .map((x) => (ColorUtil.linearInterpolate(
                      blackCutoff, 1.0 - whiteCutoff, hsl[2]) *
                  x)
              .toInt())
          .toList();
      bytes[i] = rgb[0];
      bytes[i + 1] = rgb[1];
      bytes[i + 2] = rgb[2];
    }
    return Uint8List.fromList(bytes);
  }
}
