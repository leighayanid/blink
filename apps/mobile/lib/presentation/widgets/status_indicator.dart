import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_dimensions.dart';
import '../../core/theme/neon_effects.dart';
import '../../core/network/webrtc_manager.dart' show WebRTCConnectionState;

/// Status indicator dot (connected/connecting/disconnected/error)
class StatusIndicator extends StatefulWidget {
  final WebRTCConnectionState state;
  final bool showPulse;

  const StatusIndicator({
    super.key,
    required this.state,
    this.showPulse = true,
  });

  @override
  State<StatusIndicator> createState() => _StatusIndicatorState();
}

class _StatusIndicatorState extends State<StatusIndicator>
    with SingleTickerProviderStateMixin {
  late AnimationController _pulseController;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    );

    if (widget.state == WebRTCConnectionState.connecting && widget.showPulse) {
      _pulseController.repeat();
    }
  }

  @override
  void didUpdateWidget(StatusIndicator oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.state == WebRTCConnectionState.connecting && widget.showPulse) {
      _pulseController.repeat();
    } else {
      _pulseController.stop();
    }
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  Color _getColor() {
    switch (widget.state) {
      case WebRTCConnectionState.connected:
        return AppColors.statusOnline;
      case WebRTCConnectionState.connecting:
        return AppColors.statusConnecting;
      case WebRTCConnectionState.error:
        return AppColors.statusError;
      case WebRTCConnectionState.disconnected:
        return AppColors.statusOffline;
    }
  }

  @override
  Widget build(BuildContext context) {
    final color = _getColor();

    if (widget.state == WebRTCConnectionState.connecting && widget.showPulse) {
      return AnimatedBuilder(
        animation: _pulseController,
        builder: (context, child) {
          return Container(
            width: AppDimensions.statusDotSize,
            height: AppDimensions.statusDotSize,
            decoration: BoxDecoration(
              color: color,
              shape: BoxShape.circle,
              border: Border.all(
                color: AppColors.bgPrimary,
                width: AppDimensions.statusDotBorderWidth,
              ),
              boxShadow: NeonEffects.pulsingGlow(
                color: color,
                animationValue: _pulseController.value,
              ),
            ),
          );
        },
      );
    }

    return Container(
      width: AppDimensions.statusDotSize,
      height: AppDimensions.statusDotSize,
      decoration: NeonEffects.statusIndicator(
        color: color,
        isPulsing: false,
      ),
    );
  }
}
