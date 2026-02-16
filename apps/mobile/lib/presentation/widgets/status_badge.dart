import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_text_styles.dart';
import '../../core/constants/app_dimensions.dart';

/// Status badge widget
class StatusBadge extends StatelessWidget {
  final String label;
  final bool isActive;
  final Color? activeColor;
  final Color? inactiveColor;

  const StatusBadge({
    super.key,
    required this.label,
    this.isActive = false,
    this.activeColor,
    this.inactiveColor,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppDimensions.badgePaddingHorizontal,
        vertical: AppDimensions.badgePaddingVertical,
      ),
      decoration: BoxDecoration(
        color: isActive
            ? (activeColor ?? AppColors.textPrimary)
            : (inactiveColor ?? AppColors.bgSecondary),
        borderRadius: BorderRadius.circular(AppDimensions.radiusSmall),
      ),
      child: Text(
        label.toUpperCase(),
        style: AppTextStyles.labelSmall.copyWith(
          color: isActive
              ? AppColors.bgPrimary
              : AppColors.textSecondary,
        ),
      ),
    );
  }
}
