import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_text_styles.dart';
import '../../core/constants/app_dimensions.dart';

/// Platform badge (WIN, MAC, AND, IOS, LIN)
class PlatformBadge extends StatelessWidget {
  final String platform;

  const PlatformBadge({
    super.key,
    required this.platform,
  });

  String _getPlatformLabel() {
    final map = {
      'Windows': 'WIN',
      'macOS': 'MAC',
      'Linux': 'LIN',
      'Android': 'AND',
      'iOS': 'IOS',
      'Unknown': 'UNK',
    };
    return map[platform] ?? 'UNK';
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppDimensions.space2),
      decoration: BoxDecoration(
        border: Border.all(
          color: AppColors.borderStrong,
          width: 1,
        ),
        borderRadius: BorderRadius.circular(AppDimensions.radiusSmall),
      ),
      child: Text(
        _getPlatformLabel(),
        style: AppTextStyles.labelSmall.copyWith(
          fontWeight: FontWeight.bold,
        ),
        textAlign: TextAlign.center,
      ),
    );
  }
}
