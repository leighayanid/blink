import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:animate_do/animate_do.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_text_styles.dart';
import '../../core/constants/app_dimensions.dart';
import '../providers/theme_provider.dart';
import '../providers/device_provider.dart';

/// Settings screen for app configuration
class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final themeNotifier = ref.read(themeProvider.notifier);
    final isDark = themeNotifier.isDark;
    final deviceState = ref.watch(deviceProvider);

    return Scaffold(
      backgroundColor: AppColors.bgPrimary,
      appBar: AppBar(
        backgroundColor: AppColors.bgSecondary,
        elevation: 0,
        title: Text(
          'SETTINGS',
          style: AppTextStyles.headingSmall,
        ),
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(AppDimensions.space6),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Appearance Section
            FadeInUp(
              duration: const Duration(milliseconds: 400),
              child: _buildSectionHeader('APPEARANCE'),
            ),
            const SizedBox(height: AppDimensions.space4),
            FadeInUp(
              duration: const Duration(milliseconds: 500),
              child: _buildSettingTile(
                icon: isDark ? Icons.dark_mode : Icons.light_mode,
                title: 'Theme',
                subtitle: isDark ? 'Dark Mode' : 'Light Mode',
                trailing: Switch(
                  value: isDark,
                  onChanged: (_) => themeNotifier.toggleTheme(),
                  activeColor: AppColors.neonCyan,
                ),
              ),
            ),

            const SizedBox(height: AppDimensions.space6),

            // Device Section
            FadeInUp(
              duration: const Duration(milliseconds: 600),
              child: _buildSectionHeader('DEVICE'),
            ),
            const SizedBox(height: AppDimensions.space4),
            FadeInUp(
              duration: const Duration(milliseconds: 700),
              child: _buildInfoTile(
                icon: Icons.phone_android,
                title: 'Device Name',
                value: deviceState.localDevice?.name ?? 'Unknown',
              ),
            ),
            const SizedBox(height: AppDimensions.space3),
            FadeInUp(
              duration: const Duration(milliseconds: 800),
              child: _buildInfoTile(
                icon: Icons.computer,
                title: 'Platform',
                value: deviceState.localDevice?.platform ?? 'Unknown',
              ),
            ),
            const SizedBox(height: AppDimensions.space3),
            FadeInUp(
              duration: const Duration(milliseconds: 900),
              child: _buildInfoTile(
                icon: Icons.fingerprint,
                title: 'Device ID',
                value: deviceState.localDevice?.id.substring(0, 12) ?? 'Unknown',
              ),
            ),

            const SizedBox(height: AppDimensions.space6),

            // Network Section
            FadeInUp(
              duration: const Duration(milliseconds: 1000),
              child: _buildSectionHeader('NETWORK'),
            ),
            const SizedBox(height: AppDimensions.space4),
            FadeInUp(
              duration: const Duration(milliseconds: 1100),
              child: _buildInfoTile(
                icon: Icons.signal_cellular_alt,
                title: 'Connection Status',
                value: deviceState.isConnected ? 'Connected' : 'Disconnected',
                valueColor: deviceState.isConnected
                    ? AppColors.neonGreen
                    : AppColors.statusError,
              ),
            ),
            const SizedBox(height: AppDimensions.space3),
            FadeInUp(
              duration: const Duration(milliseconds: 1200),
              child: _buildInfoTile(
                icon: Icons.hub,
                title: 'Connected Peers',
                value: '${deviceState.connectedPeers.length}',
              ),
            ),

            const SizedBox(height: AppDimensions.space6),

            // About Section
            FadeInUp(
              duration: const Duration(milliseconds: 1300),
              child: _buildSectionHeader('ABOUT'),
            ),
            const SizedBox(height: AppDimensions.space4),
            FadeInUp(
              duration: const Duration(milliseconds: 1400),
              child: _buildInfoTile(
                icon: Icons.info_outline,
                title: 'Version',
                value: '1.0.0',
              ),
            ),
            const SizedBox(height: AppDimensions.space3),
            FadeInUp(
              duration: const Duration(milliseconds: 1500),
              child: _buildInfoTile(
                icon: Icons.code,
                title: 'Technology',
                value: 'Flutter + WebRTC',
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: AppDimensions.space2),
      child: Text(
        title,
        style: AppTextStyles.headingSmall,
      ),
    );
  }

  Widget _buildSettingTile({
    required IconData icon,
    required String title,
    required String subtitle,
    required Widget trailing,
  }) {
    return Container(
      padding: const EdgeInsets.all(AppDimensions.space4),
      decoration: BoxDecoration(
        color: AppColors.bgSecondary,
        border: Border.all(color: AppColors.borderPrimary),
        borderRadius: BorderRadius.circular(AppDimensions.radiusMedium),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(AppDimensions.space3),
            decoration: BoxDecoration(
              color: AppColors.bgTertiary,
              borderRadius: BorderRadius.circular(AppDimensions.radiusSmall),
            ),
            child: Icon(icon, color: AppColors.neonCyan),
          ),
          const SizedBox(width: AppDimensions.space3),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: AppTextStyles.bodyMedium),
                const SizedBox(height: AppDimensions.space1),
                Text(
                  subtitle,
                  style: AppTextStyles.caption.copyWith(
                    color: AppColors.textTertiary,
                  ),
                ),
              ],
            ),
          ),
          trailing,
        ],
      ),
    );
  }

  Widget _buildInfoTile({
    required IconData icon,
    required String title,
    required String value,
    Color? valueColor,
  }) {
    return Container(
      padding: const EdgeInsets.all(AppDimensions.space4),
      decoration: BoxDecoration(
        color: AppColors.bgSecondary,
        border: Border.all(color: AppColors.borderPrimary),
        borderRadius: BorderRadius.circular(AppDimensions.radiusMedium),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(AppDimensions.space3),
            decoration: BoxDecoration(
              color: AppColors.bgTertiary,
              borderRadius: BorderRadius.circular(AppDimensions.radiusSmall),
            ),
            child: Icon(icon, color: AppColors.textSecondary),
          ),
          const SizedBox(width: AppDimensions.space3),
          Expanded(
            child: Text(title, style: AppTextStyles.bodyMedium),
          ),
          Text(
            value,
            style: AppTextStyles.bodyMedium.copyWith(
              color: valueColor ?? AppColors.neonCyan,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}
