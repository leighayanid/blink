import 'package:flutter/material.dart';

/// BLINK App Color Palette - Synthwave/Cyberpunk Theme
/// Matching the web app's exact color scheme
class AppColors {
  AppColors._();

  // Background Colors
  static const Color bgPrimary = Color(0xFF0A0A0F);
  static const Color bgSecondary = Color(0xFF13131A);
  static const Color bgTertiary = Color(0xFF1A1A24);

  // Neon Accent Colors
  static const Color neonCyan = Color(0xFF00FFFF);
  static const Color neonGreen = Color(0xFF00FF88);
  static const Color neonPink = Color(0xFFFF0080);
  static const Color neonPurple = Color(0xFFBB00FF);
  static const Color neonYellow = Color(0xFFFFFF00);
  static const Color neonOrange = Color(0xFFFF6600);

  // Text Colors
  static const Color textPrimary = Color(0xFFFFFFFF);
  static const Color textSecondary = Color(0xFFB0B0C0);
  static const Color textTertiary = Color(0xFF70707A);

  // Border Colors
  static const Color borderPrimary = Color(0xFF2A2A35);
  static const Color borderStrong = Color(0xFF404050);

  // Status Colors
  static const Color statusOnline = neonGreen;
  static const Color statusConnecting = neonCyan;
  static const Color statusError = neonPink;
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
