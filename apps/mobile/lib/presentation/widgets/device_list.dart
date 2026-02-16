import 'package:flutter/material.dart';
import 'package:animate_do/animate_do.dart';
import '../../data/models/device.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_text_styles.dart';
import '../../core/constants/app_dimensions.dart';
import '../../core/network/webrtc_manager.dart' show WebRTCConnectionState;
import 'device_card.dart';

/// Device list widget with stagger animation
class DeviceList extends StatelessWidget {
  final List<Device> devices;
  final Device? selectedDevice;
  final Set<String> connectedPeers;
  final Map<String, WebRTCConnectionState> connectionStates;
  final Function(Device) onDeviceSelect;
  final Function(Device) onDeviceConnect;

  const DeviceList({
    super.key,
    required this.devices,
    this.selectedDevice,
    this.connectedPeers = const {},
    this.connectionStates = const {},
    required this.onDeviceSelect,
    required this.onDeviceConnect,
  });

  @override
  Widget build(BuildContext context) {
    if (devices.isEmpty) {
      return _buildEmptyState();
    }

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 1,
        mainAxisSpacing: AppDimensions.space4,
        crossAxisSpacing: AppDimensions.space4,
        childAspectRatio: 1.5,
      ),
      itemCount: devices.length,
      itemBuilder: (context, index) {
        final device = devices[index];
        final isSelected = selectedDevice?.id == device.id;
        final isConnected =
            device.peerId != null && connectedPeers.contains(device.peerId);
        final connectionState =
            device.peerId != null ? connectionStates[device.peerId] : null;

        return FadeInUp(
          delay: Duration(milliseconds: 50 * index),
          duration: const Duration(milliseconds: 500),
          child: DeviceCard(
            device: device,
            isSelected: isSelected,
            isConnected: isConnected,
            connectionState: connectionState,
            onTap: () => onDeviceSelect(device),
            onConnect: () => onDeviceConnect(device),
          ),
        );
      },
    );
  }

  Widget _buildEmptyState() {
    return FadeIn(
      child: Container(
        padding: const EdgeInsets.all(AppDimensions.space12),
        decoration: BoxDecoration(
          border: Border.all(
            color: AppColors.borderPrimary,
            style: BorderStyle.solid,
          ),
          borderRadius: BorderRadius.circular(AppDimensions.radiusLarge),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.public,
              size: AppDimensions.iconHuge,
              color: AppColors.textTertiary.withOpacity(0.5),
            ),
            const SizedBox(height: AppDimensions.space4),
            Text(
              'NO DEVICES FOUND',
              style: AppTextStyles.headingSmall.copyWith(
                color: AppColors.textSecondary,
              ),
            ),
            const SizedBox(height: AppDimensions.space2),
            Text(
              'Ensure devices are on the same network.',
              style: AppTextStyles.bodySmall.copyWith(
                color: AppColors.textTertiary,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
