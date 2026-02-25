import 'dart:io';
import 'dart:typed_data';
import 'package:path_provider/path_provider.dart';

/// Native file save: writes to the app's documents directory
Future<void> saveFile(Uint8List bytes, String fileName) async {
  final dir = await getApplicationDocumentsDirectory();
  final file = File('${dir.path}/$fileName');
  await file.writeAsBytes(bytes);
  print('[FileSaver] File saved to: ${file.path}');
}
