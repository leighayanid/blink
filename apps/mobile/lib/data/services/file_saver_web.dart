import 'dart:typed_data';
import 'package:universal_html/html.dart' as html;

/// Web file save: triggers a browser download via anchor click
Future<void> saveFile(Uint8List bytes, String fileName) async {
  final blob = html.Blob([bytes]);
  final url = html.Url.createObjectUrlFromBlob(blob);
  html.AnchorElement(href: url)
    ..setAttribute('download', fileName)
    ..click();
  html.Url.revokeObjectUrl(url);
  print('[FileSaver] Web download triggered: $fileName');
}
