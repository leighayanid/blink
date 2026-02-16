import 'package:flutter/material.dart';
import '../../data/models/device.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_text_styles.dart';
import '../../core/constants/app_dimensions.dart';
import '../../core/theme/neon_effects.dart';
import '../../core/network/webrtc_manager.dart' show WebRTCConnectionState;
import 'platform_badge.dart';
import 'status_indicator.dart';
import 'neon_button.dart';

/// Device card widget matching the web app's design
class DeviceCard extends StatelessWidget {
  final Device device;
  final bool isSelected;
  final bool isConnected;
  final WebRTCConnectionState? connectionState;
  final VoidCallback? onTap;
  final VoidCallback? onConnect;

  const DeviceCard({
    super.key,
    required this.device,
    this.isSelected = false,
    this.isConnected = false,
    this.connectionState,
    this.onTap,
    this.onConnect,
  });

  IconData _getPlatformIcon() {
    final lower = device.platform.toLowerCase();
    if (lower.contains('android') ||
        lower.contains('ios') ||
        lower.contains('phone')) {
      return Icons.smartphone;
    }
    if (lower.contains('win') ||
        lower.contains('mac') ||
        lower.contains('linux')) {
      return Icons.computer;
    }
    return Icons.devices;
  }

  String _getStatusText() {
    if (connectionState == WebRTCConnectionState.connecting) {
      return 'ESTABLISHING...';
    }
    if (connectionState == WebRTCConnectionState.error) {
      return 'CONNECTION FAILED';
    }
    if (isConnected) {
      return 'CONNECTED';
    }
    return 'AVAILABLE';
  }

  String _getActionLabel() {
    if (connectionState == WebRTCConnectionState.connecting) {
      return '';
    }
    if (isConnected) {
      return 'DISCONNECT';
    }
    return 'CONNECT';
  }

  Color _getBorderColor() {
    if (isConnected) return AppColors.neonGreen;
    if (connectionState == WebRTCConnectionState.connecting) {
      return AppColors.neonCyan;
    }
    if (connectionState == WebRTCConnectionState.error) return AppColors.neonPink;
    if (isSelected) return AppColors.neonCyan;
    return AppColors.borderPrimary;
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        constraints: const BoxConstraints(
          minHeight: AppDimensions.deviceCardMinHeight,
        ),
        padding: const EdgeInsets.all(AppDimensions.space4),
        decoration: BoxDecoration(
          color: isSelected
              ? AppColors.neonCyan.withOpacity(0.03)
              : AppColors.bgSecondary,
          border: Border.all(
            color: _getBorderColor(),
            width: isConnected ? 2 : 1,
          ),
          borderRadius: BorderRadius.circular(AppDimensions.radiusLarge),
          boxShadow: isConnected
              ? NeonEffects.neonGlow(color: AppColors.neonGreen)
              : null,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            // Device icon with status indicator
            Row(
              children: [
                Stack(
                  clipBehavior: Clip.none,
                  children: [
                    Container(
                      width: AppDimensions.deviceIconSize,
                      height: AppDimensions.deviceIconSize,
                      decoration: BoxDecoration(
                        color: AppColors.bgTertiary,
                        borderRadius: BorderRadius.circular(
                          AppDimensions.radiusMedium,
                        ),
                      ),
                      child: Icon(
                        _getPlatformIcon(),
                        color: AppColors.textSecondary,
                        size: AppDimensions.iconLarge,
                      ),
                    ),
                    if (isConnected || connectionState != null)
                      Positioned(
                        right: -2,
                        top: -2,
                        child: StatusIndicator(
                          state: connectionState ?? WebRTCConnectionState.connected,
                        ),
                      ),
                  ],
                ),
              ],
            ),

            const SizedBox(height: AppDimensions.space4),

            // Platform badge
            PlatformBadge(platform: device.platform),

            const SizedBox(height: AppDimensions.space2),

            // Device name
            Text(
              device.name,
              style: AppTextStyles.headingMedium,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),

            const SizedBox(height: AppDimensions.space1),

            // Status text
            Text(
              _getStatusText(),
              style: AppTextStyles.caption.copyWith(
                color: AppColors.textTertiary,
              ),
            ),

            const Spacer(),

            // Connect button
            if (onConnect != null)
              NeonButton(
                label: _getActionLabel(),
                isLoading: connectionState == WebRTCConnectionState.connecting,
                isOutline: isConnected,
                isSmall: true,
                onPressed: connectionState == WebRTCConnectionState.connecting
                    ? null
                    : onConnect,
              ),
          ],
        ),
      ),
    );
  }
}
