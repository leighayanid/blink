import 'package:flutter/material.dart';

/// BLINK App Color Palette - Synthwave/Cyberpunk Theme
/// Matching the web app's exact color scheme
class AppColors {
  AppColors._();

  // Background Colors (Command Center / HUD)
  static const Color bgPrimary = Color(0xFF050508);
  static const Color bgSecondary = Color(0xFF0A0A0F);
  static const Color bgTertiary = Color(0xFF0D0D14);

  // HUD Neon Accent Colors
  static const Color neonOrange = Color(0xFFFF6B00);
  static const Color neonCyan = Color(0xFF00F0FF);
  static const Color neonGreen = Color(0xFF00FF41);
  static const Color neonRed = Color(0xFFFF003C);
  static const Color neonYellow = Color(0xFFFFFF00);
  static const Color neonPurple = Color(0xFF9400D3);

  // Text Colors (HUD Optimized)
  static const Color textPrimary = Color(0xFFE0E6ED);
  static const Color textSecondary = Color(0xFFB0B8C1);
  static const Color textTertiary = Color(0xFF8A92A0);

  // Border Colors (Technical HUD)
  static const Color borderPrimary = Color(0xFF1A1D23);
  static const Color borderStrong = Color(0xFF2D323A);
  static const Color borderAccent = neonOrange;

  // Status Colors
  static const Color statusOnline = neonGreen;
  static const Color statusConnecting = neonCyan;
  static const Color statusError = neonRed;
  static const Color statusOffline = textTertiary;

  // Light Theme Overrides (for light mode support)
  static const Color bgPrimaryLight = Color(0xFFF5F5F7);
  static const Color bgSecondaryLight = Color(0xFFFFFFFF);
  static const Color bgTertiaryLight = Color(0xFFE8E8EA);

  static const Color textPrimaryLight = Color(0xFF1A1A1F);
  static const Color textSecondaryLight = Color(0xFF505058);
  static const Color textTertiaryLight = Color(0xFF90909A);

  static const Color borderPrimaryLight = Color(0xFFD0D0D8);
  static const Color borderStrongLight = Color(0xFFA0A0A8);
}
