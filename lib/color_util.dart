import 'dart:math' as math;
import 'dart:ui';

// class for color utility functions.
// singleton is needed otherwise the cache map won't store data between calls.
class ColorUtil {
  static final Map<double, Map<double, double>> deltaToValueToResultMap = {};
  //TODO: moving map operation to SendPort / ReceivePort to share between Isolates

  // RGB to HSL
  static List<double> rgbToHsl(int r, int g, int b) {
    double h, s, l;
    double rd = r / 255.0;
    double gd = g / 255.0;
    double bd = b / 255.0;
    double max = math.max(rd, math.max(gd, bd));
    double min = math.min(rd, math.min(gd, bd));
    double d = max - min;
    l = (max + min) / 2;
    if (d == 0) {
      h = 0;
      s = 0;
    } else {
      s = d / (1 - (2 * l - 1).abs());
      if (max == rd) {
        h = (gd - bd) / d + (gd < bd ? 6 : 0);
      } else if (max == gd) {
        h = (bd - rd) / d + 2;
      } else {
        h = (rd - gd) / d + 4;
      }
      h /= 6;
    }
    return [h, s, l];
  }

  // hue to RGB
  static double _hueToRgb(double p, double q, double t) {
    if (t < 0) {
      t += 1;
    }
    if (t > 1) {
      t -= 1;
    }
    if (t < 1 / 6) {
      return p + (q - p) * 6 * t;
    }
    if (t < 1 / 2) {
      return q;
    }
    if (t < 2 / 3) {
      return p + (q - p) * (2 / 3 - t) * 6;
    }
    return p;
  }

  // HSL to RGB
  static List<int> hslToRgb(double h, double s, double l) {
    double r, g, b;
    if (s == 0) {
      r = g = b = l;
    } else {
      double q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      double p = 2 * l - q;
      r = _hueToRgb(p, q, h + 1 / 3);
      g = _hueToRgb(p, q, h);
      b = _hueToRgb(p, q, h - 1 / 3);
    }
    return [(r * 255).round(), (g * 255).round(), (b * 255).round()];
  }

  static Color rgbToColor(List<int> rgb) =>
      Color.fromARGB(255, rgb[0], rgb[1], rgb[2]);

  // linear interpolation
  static double linearInterpolate(double min, double max, double value) {
    if (min == 0.0 && max == 1.0) {
      return value;
    }
    if (value < min) {
      return 0.0;
    }
    if (value > max) {
      return 1.0;
    }
    double delta = max - min;
    double index = value - min;
    if (deltaToValueToResultMap.containsKey(delta)) {
      if (deltaToValueToResultMap[delta]!.containsKey(index)) {
        return deltaToValueToResultMap[delta]![index]!;
      } else {
        double result = index / delta;
        deltaToValueToResultMap[delta]![index] = result;
        return result;
      }
    } else {
      double result = index / delta;
      deltaToValueToResultMap[delta] = {index: result};
      return result;
    }
  }
}
