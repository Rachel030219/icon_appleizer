# Icon Appleizer

A Flutter app that can make your icon look like tinted by iOS 18.

## How to use

Just head to [GitHub Pages](https://apple.rachelt.one) and you'll see the app. You can also build yourself or download the artifacts from GitHub Actions. Note that currently this app is only tested on macOS and web, and extra permission and modification might be needed on other platforms.

## Build

Before building, you need Flutter SDK installed. Then, run the following command:

```bash
git clone https://github.com/Rachel030219/icon_appleizer.git
cd icon_appleizer
flutter pub get
flutter run
```

You can also build the app for your platform:

```bash
flutter build <platform>
```

Note that to compile to wasm, the `file_saver` plugin is modified and untested on Windows and Linux. You may test yourself, or just change the `pubspec.yaml` to use the original package.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

