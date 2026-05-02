import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'app_colors.dart';

/// BLINK app text styles.
class AppTextStyles {
  AppTextStyles._();

  static TextStyle get brand => GoogleFonts.inter();
  static TextStyle get sans => GoogleFonts.inter();
  static TextStyle get mono => GoogleFonts.jetBrainsMono();

  static TextStyle get displayLarge => sans.copyWith(
        fontSize: 40,
        fontWeight: FontWeight.w600,
        letterSpacing: 0,
        height: 1.1,
        color: AppColors.textPrimary,
      );

  static TextStyle get displayMedium => sans.copyWith(
        fontSize: 32,
        fontWeight: FontWeight.w600,
        letterSpacing: 0,
        height: 1.15,
        color: AppColors.textPrimary,
      );

  static TextStyle get displaySmall => sans.copyWith(
        fontSize: 24,
        fontWeight: FontWeight.w600,
        letterSpacing: 0,
        height: 1.2,
        color: AppColors.textPrimary,
      );

  static TextStyle get headingLarge => sans.copyWith(
        fontSize: 20,
        fontWeight: FontWeight.w600,
        letterSpacing: 0,
        color: AppColors.textPrimary,
      );

  static TextStyle get headingMedium => sans.copyWith(
        fontSize: 16,
        fontWeight: FontWeight.w600,
        letterSpacing: 0,
        color: AppColors.textPrimary,
      );

  static TextStyle get headingSmall => sans.copyWith(
        fontSize: 14,
        fontWeight: FontWeight.w600,
        letterSpacing: 0,
        color: AppColors.textPrimary,
      );

  static TextStyle get bodyLarge => sans.copyWith(
        fontSize: 16,
        fontWeight: FontWeight.w400,
        letterSpacing: 0,
        color: AppColors.textPrimary,
      );

  static TextStyle get bodyMedium => sans.copyWith(
        fontSize: 14,
        fontWeight: FontWeight.w400,
        letterSpacing: 0,
        color: AppColors.textSecondary,
      );

  static TextStyle get bodySmall => sans.copyWith(
        fontSize: 12,
        fontWeight: FontWeight.w400,
        letterSpacing: 0,
        color: AppColors.textSecondary,
      );

  static TextStyle get labelLarge => sans.copyWith(
        fontSize: 14,
        fontWeight: FontWeight.w500,
        letterSpacing: 0,
        color: AppColors.textPrimary,
      );

  static TextStyle get labelMedium => sans.copyWith(
        fontSize: 12,
        fontWeight: FontWeight.w500,
        letterSpacing: 0,
        color: AppColors.textSecondary,
      );

  static TextStyle get labelSmall => sans.copyWith(
        fontSize: 11,
        fontWeight: FontWeight.w500,
        letterSpacing: 0,
        color: AppColors.textTertiary,
      );

  static TextStyle get button => sans.copyWith(
        fontSize: 14,
        fontWeight: FontWeight.w600,
        letterSpacing: 0,
        color: AppColors.textPrimary,
      );

  static TextStyle get buttonSmall => sans.copyWith(
        fontSize: 12,
        fontWeight: FontWeight.w600,
        letterSpacing: 0,
        color: AppColors.textPrimary,
      );

  static TextStyle get caption => sans.copyWith(
        fontSize: 11,
        fontWeight: FontWeight.w400,
        letterSpacing: 0,
        color: AppColors.textTertiary,
      );

  static TextStyle get overline => sans.copyWith(
        fontSize: 11,
        fontWeight: FontWeight.w500,
        letterSpacing: 0,
        color: AppColors.textSecondary,
      );

  static TextStyle get subtitle => sans.copyWith(
        fontSize: 12,
        fontWeight: FontWeight.w400,
        letterSpacing: 0,
        color: AppColors.textSecondary,
      );
}
