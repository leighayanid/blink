import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_text_styles.dart';
import '../../core/constants/app_dimensions.dart';
import 'neon_button.dart';

/// File uploader widget
class FileUploader extends StatelessWidget {
  final bool disabled;
  final int connectedCount;
  final Function(List<PlatformFile>) onFilesSelected;

  const FileUploader({
    super.key,
    this.disabled = false,
    this.connectedCount = 0,
    required this.onFilesSelected,
  });

  Future<void> _pickFiles() async {
    try {
      FilePickerResult? result = await FilePicker.platform.pickFiles(
        allowMultiple: true,
        type: FileType.any,
      );

      if (result != null && result.files.isNotEmpty) {
        onFilesSelected(result.files);
      }
    } catch (error) {
      print('[FileUploader] Error picking files: $error');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppDimensions.space6),
      decoration: BoxDecoration(
        color: AppColors.bgSecondary,
        border: Border.all(
          color: disabled
              ? AppColors.borderPrimary
              : AppColors.borderStrong,
          width: 1,
          style: disabled ? BorderStyle.solid : BorderStyle.solid,
        ),
        borderRadius: BorderRadius.circular(AppDimensions.radiusLarge),
      ),
      child: Column(
        children: [
          Icon(
            Icons.upload_file,
            size: AppDimensions.iconHuge,
            color: disabled
                ? AppColors.textTertiary.withOpacity(0.5)
                : AppColors.textSecondary,
          ),
          const SizedBox(height: AppDimensions.space4),
          Text(
            disabled
                ? 'CONNECT TO A DEVICE FIRST'
                : 'SELECT FILES TO TRANSFER',
            style: AppTextStyles.labelMedium.copyWith(
              color: disabled
                  ? AppColors.textTertiary
                  : AppColors.textSecondary,
            ),
            textAlign: TextAlign.center,
          ),
          if (!disabled) ...[
            const SizedBox(height: AppDimensions.space2),
            Text(
              'Connected to $connectedCount ${connectedCount == 1 ? "device" : "devices"}',
              style: AppTextStyles.caption.copyWith(
                color: AppColors.neonGreen,
              ),
            ),
          ],
          const SizedBox(height: AppDimensions.space6),
          NeonButton(
            label: 'Choose Files',
            icon: Icons.folder_open,
            onPressed: disabled ? null : _pickFiles,
          ),
        ],
      ),
    );
  }
}
