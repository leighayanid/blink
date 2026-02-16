import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../constants/app_dimensions.dart';

/// Neon glow effects and custom decorations for BLINK UI
class NeonEffects {
  NeonEffects._();

  /// Neon glow shadow for containers
  static List<BoxShadow> neonGlow({
    required Color color,
    double blurRadius = AppDimensions.glowBlurRadius,
    double opacity = 0.3,
  }) {
    return [
      BoxShadow(
        color: color.withOpacity(opacity),
        blurRadius: blurRadius,
        spreadRadius: 0,
      ),
    ];
  }

  /// Pulsing neon glow animation (for connecting state)
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
        color: color.withOpacity(opacity),
        blurRadius: blur,
        spreadRadius: animationValue * 4,
      ),
    ];
  }

  /// Gradient border decoration with neon colors
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

  /// Glowing border decoration
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
      boxShadow: isGlowing ? neonGlow(color: color) : null,
    );
  }

  /// Gradient overlay for buttons
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

  /// Status indicator decoration (connecting/connected/error)
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
      boxShadow: neonGlow(color: color, blurRadius: 8),
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

  /// Neon text glow effect
  static List<Shadow> textGlow({
    required Color color,
    double blurRadius = 8.0,
    double opacity = 0.5,
  }) {
    return [
      Shadow(
        color: color.withOpacity(opacity),
        blurRadius: blurRadius,
      ),
    ];
  }

  /// Preset: Cyan glow (for primary elements)
  static List<BoxShadow> get cyanGlow => neonGlow(color: AppColors.neonCyan);

  /// Preset: Green glow (for success/connected state)
  static List<BoxShadow> get greenGlow => neonGlow(color: AppColors.neonGreen);

  /// Preset: Pink glow (for error state)
  static List<BoxShadow> get pinkGlow => neonGlow(color: AppColors.neonPink);

  /// Preset: Purple glow (for secondary elements)
  static List<BoxShadow> get purpleGlow => neonGlow(color: AppColors.neonPurple);
}
