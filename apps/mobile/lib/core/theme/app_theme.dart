import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../constants/app_text_styles.dart';
import '../constants/app_dimensions.dart';

/// BLINK app theme configuration.
class AppTheme {
  AppTheme._();

  static ThemeData get darkTheme {
    return _buildTheme(
      brightness: Brightness.dark,
      background: AppColors.bgPrimary,
      surface: AppColors.bgSecondary,
      surfaceMuted: AppColors.bgTertiary,
      textPrimary: AppColors.textPrimary,
      textSecondary: AppColors.textSecondary,
      textMuted: AppColors.textTertiary,
      border: AppColors.borderPrimary,
    );
  }

  static ThemeData get lightTheme {
    return _buildTheme(
      brightness: Brightness.light,
      background: AppColors.bgPrimaryLight,
      surface: AppColors.bgSecondaryLight,
      surfaceMuted: AppColors.bgTertiaryLight,
      textPrimary: AppColors.textPrimaryLight,
      textSecondary: AppColors.textSecondaryLight,
      textMuted: AppColors.textTertiaryLight,
      border: AppColors.borderPrimaryLight,
    );
  }

  static ThemeData _buildTheme({
    required Brightness brightness,
    required Color background,
    required Color surface,
    required Color surfaceMuted,
    required Color textPrimary,
    required Color textSecondary,
    required Color textMuted,
    required Color border,
  }) {
    final isDark = brightness == Brightness.dark;

    return ThemeData(
      useMaterial3: true,
      brightness: brightness,
      scaffoldBackgroundColor: background,
      colorScheme: ColorScheme(
        brightness: brightness,
        primary: AppColors.primary,
        onPrimary: Colors.white,
        secondary: textSecondary,
        onSecondary: surface,
        error: AppColors.error,
        onError: Colors.white,
        surface: surface,
        onSurface: textPrimary,
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: surface,
        foregroundColor: textPrimary,
        elevation: 0,
        centerTitle: true,
        titleTextStyle: AppTextStyles.headingLarge.copyWith(color: textPrimary),
        shape: Border(
          bottom: BorderSide(color: border, width: AppDimensions.dividerThickness),
        ),
      ),
      cardTheme: CardThemeData(
        color: surface,
        elevation: 0,
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppDimensions.radiusMedium),
          side: BorderSide(color: border, width: 1),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          textStyle: AppTextStyles.button.copyWith(color: Colors.white),
          elevation: 0,
          padding: const EdgeInsets.symmetric(
            horizontal: AppDimensions.buttonPaddingHorizontal,
            vertical: AppDimensions.buttonPaddingVertical,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppDimensions.radiusMedium),
          ),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: textPrimary,
          textStyle: AppTextStyles.button.copyWith(color: textPrimary),
          side: BorderSide(color: border, width: 1),
          padding: const EdgeInsets.symmetric(
            horizontal: AppDimensions.buttonPaddingHorizontal,
            vertical: AppDimensions.buttonPaddingVertical,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppDimensions.radiusMedium),
          ),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: AppColors.primary,
          textStyle: AppTextStyles.button.copyWith(color: AppColors.primary),
          padding: const EdgeInsets.symmetric(
            horizontal: AppDimensions.buttonPaddingHorizontal,
            vertical: AppDimensions.buttonPaddingVertical,
          ),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: surfaceMuted,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppDimensions.radiusMedium),
          borderSide: BorderSide(color: border, width: 1),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppDimensions.radiusMedium),
          borderSide: BorderSide(color: border, width: 1),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppDimensions.radiusMedium),
          borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppDimensions.radiusMedium),
          borderSide: const BorderSide(color: AppColors.error, width: 1),
        ),
        labelStyle: AppTextStyles.bodyMedium.copyWith(color: textSecondary),
        hintStyle: AppTextStyles.bodySmall.copyWith(color: textMuted),
      ),
      dividerTheme: DividerThemeData(
        color: border,
        thickness: AppDimensions.dividerThickness,
        space: 0,
      ),
      bottomNavigationBarTheme: BottomNavigationBarThemeData(
        backgroundColor: surface,
        selectedItemColor: AppColors.primary,
        unselectedItemColor: textMuted,
        selectedLabelStyle: AppTextStyles.labelSmall.copyWith(color: AppColors.primary),
        unselectedLabelStyle: AppTextStyles.labelSmall.copyWith(color: textMuted),
        type: BottomNavigationBarType.fixed,
        elevation: 0,
      ),
      iconTheme: IconThemeData(
        color: textSecondary,
        size: AppDimensions.iconMedium,
      ),
      progressIndicatorTheme: ProgressIndicatorThemeData(
        color: AppColors.primary,
        linearTrackColor: surfaceMuted,
      ),
      switchTheme: SwitchThemeData(
        thumbColor: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) return AppColors.primary;
          return isDark ? AppColors.textTertiary : AppColors.textTertiaryLight;
        }),
        trackColor: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return AppColors.primary.withValues(alpha: 0.24);
          }
          return surfaceMuted;
        }),
      ),
      textTheme: TextTheme(
        displayLarge: AppTextStyles.displayLarge.copyWith(color: textPrimary),
        displayMedium: AppTextStyles.displayMedium.copyWith(color: textPrimary),
        displaySmall: AppTextStyles.displaySmall.copyWith(color: textPrimary),
        headlineLarge: AppTextStyles.headingLarge.copyWith(color: textPrimary),
        headlineMedium: AppTextStyles.headingMedium.copyWith(color: textPrimary),
        headlineSmall: AppTextStyles.headingSmall.copyWith(color: textPrimary),
        bodyLarge: AppTextStyles.bodyLarge.copyWith(color: textPrimary),
        bodyMedium: AppTextStyles.bodyMedium.copyWith(color: textSecondary),
        bodySmall: AppTextStyles.bodySmall.copyWith(color: textSecondary),
        labelLarge: AppTextStyles.labelLarge.copyWith(color: textPrimary),
        labelMedium: AppTextStyles.labelMedium.copyWith(color: textSecondary),
        labelSmall: AppTextStyles.labelSmall.copyWith(color: textMuted),
      ),
    );
  }
}
