import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_text_styles.dart';
import '../../core/constants/app_dimensions.dart';

/// Compatibility button used by older screens, styled as a simple utility action.
class NeonButton extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;
  final bool isLoading;
  final bool isOutline;
  final bool isSmall;
  final List<Color>? gradientColors;
  final IconData? icon;

  const NeonButton({
    super.key,
    required this.label,
    this.onPressed,
    this.isLoading = false,
    this.isOutline = false,
    this.isSmall = false,
    this.gradientColors,
    this.icon,
  });

  @override
  Widget build(BuildContext context) {
    final backgroundColor = gradientColors?.first ?? AppColors.primary;

    return Container(
      height: isSmall ? 36 : 48,
      decoration: isOutline
          ? null
          : BoxDecoration(
              color: onPressed != null
                  ? backgroundColor
                  : AppColors.borderStrong,
              borderRadius: BorderRadius.circular(AppDimensions.radiusMedium),
            ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: isLoading ? null : onPressed,
          borderRadius: BorderRadius.circular(AppDimensions.radiusMedium),
          child: Container(
            padding: EdgeInsets.symmetric(
              horizontal: isSmall
                  ? AppDimensions.space4
                  : AppDimensions.buttonPaddingHorizontal,
              vertical: isSmall
                  ? AppDimensions.space2
                  : AppDimensions.buttonPaddingVertical,
            ),
            decoration: isOutline
                ? BoxDecoration(
                    border: Border.all(
                      color: AppColors.borderStrong,
                      width: 1,
                    ),
                    borderRadius:
                        BorderRadius.circular(AppDimensions.radiusMedium),
                  )
                : null,
            child: Center(
              child: isLoading
                  ? SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        valueColor: AlwaysStoppedAnimation<Color>(
                          isOutline
                              ? AppColors.textPrimary
                              : AppColors.bgPrimary,
                        ),
                      ),
                    )
                  : Row(
                      mainAxisSize: MainAxisSize.min,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        if (icon != null) ...[
                          Icon(
                            icon,
                            size: isSmall
                                ? AppDimensions.iconSmall
                                : AppDimensions.iconMedium,
                            color: isOutline
                                ? AppColors.textPrimary
                                : AppColors.bgPrimary,
                          ),
                          SizedBox(width: AppDimensions.space2),
                        ],
                        Text(
                          label,
                          style: (isSmall
                                  ? AppTextStyles.buttonSmall
                                  : AppTextStyles.button)
                              .copyWith(
                            color: isOutline
                                ? AppColors.textPrimary
                                : AppColors.bgPrimary,
                          ),
                        ),
                      ],
                    ),
            ),
          ),
        ),
      ),
    );
  }
}
