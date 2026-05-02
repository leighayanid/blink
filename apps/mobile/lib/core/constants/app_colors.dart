import 'package:flutter/material.dart';

/// BLINK app color palette.
///
/// The primary tokens define the current calm utility UI. The neon-prefixed
/// aliases are retained for older widgets while mapping them to the same
/// restrained palette.
class AppColors {
  AppColors._();

  // Dark theme
  static const Color bgPrimary = Color(0xFF0F172A);
  static const Color bgSecondary = Color(0xFF111827);
  static const Color bgTertiary = Color(0xFF172033);

  static const Color textPrimary = Color(0xFFF8FAFC);
  static const Color textSecondary = Color(0xFFCBD5E1);
  static const Color textTertiary = Color(0xFF94A3B8);

  static const Color borderPrimary = Color(0xFF253044);
  static const Color borderStrong = Color(0xFF334155);
  static const Color borderAccent = primary;

  // Light theme
  static const Color bgPrimaryLight = Color(0xFFF8FAFC);
  static const Color bgSecondaryLight = Color(0xFFFFFFFF);
  static const Color bgTertiaryLight = Color(0xFFF1F5F9);

  static const Color textPrimaryLight = Color(0xFF111827);
  static const Color textSecondaryLight = Color(0xFF475569);
  static const Color textTertiaryLight = Color(0xFF64748B);

  static const Color borderPrimaryLight = Color(0xFFE2E8F0);
  static const Color borderStrongLight = Color(0xFFCBD5E1);

  // Shared intent colors
  static const Color primary = Color(0xFF2563EB);
  static const Color primarySoft = Color(0xFFEFF6FF);
  static const Color success = Color(0xFF16A34A);
  static const Color warning = Color(0xFFD97706);
  static const Color error = Color(0xFFDC2626);

  static const Color statusOnline = success;
  static const Color statusConnecting = warning;
  static const Color statusError = error;
  static const Color statusOffline = textTertiary;

  // Compatibility aliases for existing widgets.
  static const Color neonOrange = warning;
  static const Color neonCyan = primary;
  static const Color neonGreen = success;
  static const Color neonRed = error;
  static const Color neonPink = error;
  static const Color neonYellow = warning;
  static const Color neonPurple = Color(0xFF475569);
}
