import 'dart:math' as math;

import 'package:flutter/cupertino.dart';

class SliderWithValueInput extends StatefulWidget {
  final String title;
  final Function(double) onChange;
  final Function(double)? onChangeEnd;
  final double min;
  final double max;
  final Color color;
  final bool enabled;
  final int? divisions;
  const SliderWithValueInput({
    super.key,
    required this.title,
    required this.onChange,
    this.onChangeEnd,
    this.color = const Color(0xFF000000),
    this.min = 0.0,
    this.max = 1.0,
    this.divisions,
    this.enabled = true,
  });

  @override
  State<StatefulWidget> createState() => SliderWithValueInputState();
}

class SliderWithValueInputState extends State<SliderWithValueInput> {
  late TextEditingController controller;
  late String title;
  double value = 0.0;
  @override
  void initState() {
    controller = TextEditingController();
    title = widget.title;
    value = widget.min;
    super.initState();
  }

  @override
  void dispose() {
    controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    controller.text = value.toInt().toString();
    return Padding(
      padding: const EdgeInsets.all(8),
      child: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: const Color.fromARGB(10, 0, 0, 0),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          mainAxisSize: MainAxisSize.min,
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 7),
              child: Text(title),
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.center,
              mainAxisSize: MainAxisSize.min,
              children: [
                CupertinoSlider(
                  min: widget.min,
                  max: math.max(widget.max, 1),
                  value: value,
                  activeColor: widget.color,
                  thumbColor: widget.color,
                  divisions: math.max((widget.max - widget.min).toInt(), 1),
                  onChanged: (double value) {
                    if (widget.enabled && widget.max > widget.min) {
                      setState(() {
                        this.value = value;
                        controller.text = value.toInt().toString();
                      });
                      widget.onChange(value);
                    }
                  },
                  onChangeEnd: (double value) {
                    if (widget.enabled && widget.max > widget.min) {
                      if (widget.onChangeEnd != null) {
                        widget.onChangeEnd!(value);
                      }
                    }
                  },
                ),
                Container(
                  height: 40,
                  width: 60,
                  padding: const EdgeInsets.all(0),
                  child: CupertinoTextField.borderless(
                    enabled: widget.enabled,
                    controller: controller,
                    textAlign: TextAlign.center,
                    keyboardType: TextInputType.number,
                    placeholder: widget.min.toString(),
                    onChanged: (String value) {
                      if (value.isEmpty) {
                        return;
                      }
                      double doubleValue = double.tryParse(value) ?? 0;
                      if (doubleValue < widget.min) {
                        doubleValue = widget.min;
                        controller.text = widget.min.toString();
                      } else if (doubleValue > widget.max) {
                        doubleValue = widget.max;
                        controller.text = widget.max.toString();
                      }
                      this.value = doubleValue;
                      widget.onChange(doubleValue);
                    },
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
