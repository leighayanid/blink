import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'app_colors.dart';

/// BLINK App Text Styles
/// Matching the web app's typography system
class AppTextStyles {
  AppTextStyles._();

  // Font Families
  static TextStyle get mono => GoogleFonts.jetBrainsMono();
  static TextStyle get sans => GoogleFonts.inter();

  // Display Styles (Large titles)
  static TextStyle get displayLarge => sans.copyWith(
        fontSize: 48,
        fontWeight: FontWeight.w900,
        letterSpacing: -2.4,
        height: 1.0,
        color: AppColors.textPrimary,
      );

  static TextStyle get displayMedium => sans.copyWith(
        fontSize: 36,
        fontWeight: FontWeight.w900,
        letterSpacing: -1.8,
        height: 1.1,
        color: AppColors.textPrimary,
      );

  static TextStyle get displaySmall => sans.copyWith(
        fontSize: 24,
        fontWeight: FontWeight.w800,
        letterSpacing: -1.2,
        height: 1.2,
        color: AppColors.textPrimary,
      );

  // Heading Styles
  static TextStyle get headingLarge => mono.copyWith(
        fontSize: 20,
        fontWeight: FontWeight.w700,
        letterSpacing: 0.2,
        color: AppColors.textPrimary,
      );

  static TextStyle get headingMedium => mono.copyWith(
        fontSize: 16,
        fontWeight: FontWeight.w600,
        letterSpacing: 0.8,
        color: AppColors.textPrimary,
      );

  static TextStyle get headingSmall => mono.copyWith(
        fontSize: 14,
        fontWeight: FontWeight.w600,
        letterSpacing: 0.7,
        color: AppColors.textPrimary,
      );

  // Body Styles
  static TextStyle get bodyLarge => sans.copyWith(
        fontSize: 16,
        fontWeight: FontWeight.w400,
        letterSpacing: 0.15,
        color: AppColors.textPrimary,
      );

  static TextStyle get bodyMedium => sans.copyWith(
        fontSize: 14,
        fontWeight: FontWeight.w400,
        letterSpacing: 0.1,
        color: AppColors.textSecondary,
      );

  static TextStyle get bodySmall => sans.copyWith(
        fontSize: 12,
        fontWeight: FontWeight.w400,
        letterSpacing: 0.1,
        color: AppColors.textSecondary,
      );

  // Label Styles (Uppercase labels)
  static TextStyle get labelLarge => mono.copyWith(
        fontSize: 14,
        fontWeight: FontWeight.w700,
        letterSpacing: 1.0,
        color: AppColors.textPrimary,
      );

  static TextStyle get labelMedium => mono.copyWith(
        fontSize: 12,
        fontWeight: FontWeight.w700,
        letterSpacing: 0.8,
        color: AppColors.textSecondary,
      );

  static TextStyle get labelSmall => mono.copyWith(
        fontSize: 10,
        fontWeight: FontWeight.w700,
        letterSpacing: 0.6,
        color: AppColors.textTertiary,
      );

  // Button Styles
  static TextStyle get button => mono.copyWith(
        fontSize: 14,
        fontWeight: FontWeight.w700,
        letterSpacing: 1.2,
        color: AppColors.textPrimary,
      );

  static TextStyle get buttonSmall => mono.copyWith(
        fontSize: 12,
        fontWeight: FontWeight.w700,
        letterSpacing: 1.0,
        color: AppColors.textPrimary,
      );

  // Caption/Helper Text
  static TextStyle get caption => mono.copyWith(
        fontSize: 11,
        fontWeight: FontWeight.w400,
        letterSpacing: 0.4,
        color: AppColors.textTertiary,
      );

  static TextStyle get overline => mono.copyWith(
        fontSize: 10,
        fontWeight: FontWeight.w600,
        letterSpacing: 1.5,
        color: AppColors.textSecondary,
      );

  // Subtitle (for app subtitle "SECURE LOCAL FILE SHARING")
  static TextStyle get subtitle => mono.copyWith(
        fontSize: 12,
        fontWeight: FontWeight.w400,
        letterSpacing: 1.2,
        color: AppColors.textSecondary,
      );
}
