import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../constants/app_dimensions.dart';

/// Subtle elevation and border helpers for BLINK UI.
class NeonEffects {
  NeonEffects._();

  /// Compatibility helper for older widgets that asked for a glow.
  static List<BoxShadow> neonGlow({
    required Color color,
    double blurRadius = AppDimensions.glowBlurRadius,
    double opacity = 0.3,
  }) {
    return [
      BoxShadow(
        color: Colors.black.withValues(alpha: 0.08),
        blurRadius: 12,
        offset: const Offset(0, 4),
        spreadRadius: 0,
      ),
    ];
  }

  /// Subtle progress shadow for connecting state.
  static List<BoxShadow> pulsingGlow({
    required Color color,
    required double animationValue, // 0.0 to 1.0
    double maxBlur = 20.0,
    double maxOpacity = 0.7,
  }) {
    final blur = maxBlur * animationValue;
    final opacity = maxOpacity * (1 - animationValue);

    return [
      BoxShadow(
        color: color.withValues(alpha: opacity * 0.18),
        blurRadius: blur.clamp(4, 12),
        spreadRadius: 0,
      ),
    ];
  }

  /// Soft gradient decoration kept for compatibility.
  static BoxDecoration gradientBorder({
    required List<Color> colors,
    double borderWidth = 2.0,
    double borderRadius = AppDimensions.radiusMedium,
    Color? backgroundColor,
  }) {
    return BoxDecoration(
      color: backgroundColor,
      borderRadius: BorderRadius.circular(borderRadius),
      border: Border.all(
        width: 0,
        color: Colors.transparent,
      ),
      gradient: LinearGradient(
        colors: colors,
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      ),
    );
  }

  /// Thin bordered decoration.
  static BoxDecoration glowingBorder({
    required Color color,
    double borderWidth = 2.0,
    double borderRadius = AppDimensions.radiusMedium,
    Color? backgroundColor,
    bool isGlowing = true,
  }) {
    return BoxDecoration(
      color: backgroundColor ?? AppColors.bgSecondary,
      borderRadius: BorderRadius.circular(borderRadius),
      border: Border.all(
        color: color,
        width: borderWidth,
      ),
      boxShadow: isGlowing ? cardShadow() : null,
    );
  }

  /// Button background decoration.
  static BoxDecoration gradientOverlay({
    required List<Color> colors,
    double borderRadius = AppDimensions.radiusMedium,
    List<BoxShadow>? shadows,
  }) {
    return BoxDecoration(
      borderRadius: BorderRadius.circular(borderRadius),
      gradient: LinearGradient(
        colors: colors,
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      ),
      boxShadow: shadows,
    );
  }

  /// Status indicator decoration.
  static BoxDecoration statusIndicator({
    required Color color,
    bool isPulsing = false,
  }) {
    return BoxDecoration(
      color: color,
      shape: BoxShape.circle,
      border: Border.all(
        color: AppColors.bgPrimary,
        width: AppDimensions.statusDotBorderWidth,
      ),
      boxShadow: null,
    );
  }

  /// Card elevation shadow (subtle, not neon)
  static List<BoxShadow> cardShadow() {
    return [
      BoxShadow(
        color: Colors.black.withOpacity(0.15),
        blurRadius: AppDimensions.shadowBlurRadius,
        spreadRadius: AppDimensions.shadowSpreadRadius,
        offset: const Offset(0, 4),
      ),
    ];
  }

  /// Compatibility helper. Text no longer glows.
  static List<Shadow> textGlow({
    required Color color,
    double blurRadius = 8.0,
    double opacity = 0.5,
  }) {
    return const [];
  }

  /// Preset: primary shadow.
  static List<BoxShadow> get cyanGlow => neonGlow(color: AppColors.neonCyan);

  /// Preset: success shadow.
  static List<BoxShadow> get greenGlow => neonGlow(color: AppColors.neonGreen);

  /// Preset: error shadow.
  static List<BoxShadow> get pinkGlow => neonGlow(color: AppColors.neonPink);

  /// Preset: secondary shadow.
  static List<BoxShadow> get purpleGlow => neonGlow(color: AppColors.neonPurple);
}
