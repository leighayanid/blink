import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_text_styles.dart';
import '../../core/constants/app_dimensions.dart';
import '../providers/device_provider.dart';
import '../providers/webrtc_provider.dart';
import '../providers/transfer_provider.dart';
import '../providers/theme_provider.dart';
import '../widgets/device_list.dart';
import '../widgets/file_uploader.dart';
import '../widgets/transfer_progress.dart';
import '../widgets/status_badge.dart';
import '../widgets/platform_badge.dart';

/// Main screen with responsive layout
class MainScreen extends ConsumerStatefulWidget {
  const MainScreen({super.key});

  @override
  ConsumerState<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends ConsumerState<MainScreen> {
  int _currentMobileTab = 1; // Start with transfer tab

  @override
  void initState() {
    super.initState();
    _initializeApp();
  }

  Future<void> _initializeApp() async {
    // Connect to signaling server
    await ref.read(deviceProvider.notifier).connect();

    // Initialize WebRTC
    final deviceState = ref.read(deviceProvider);
    if (deviceState.localDevice != null) {
      final webrtcManager = ref.read(webrtcManagerProvider);
      final peerId = await webrtcManager.initPeer(deviceState.localDevice!.id);
      ref.read(deviceProvider.notifier).setLocalPeerId(peerId);
      ref.read(deviceProvider.notifier).announce();
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDesktop = MediaQuery.of(context).size.width >=
        AppDimensions.desktopBreakpoint;

    return Scaffold(
      backgroundColor: AppColors.bgPrimary,
      body: SafeArea(
        child: isDesktop ? _buildDesktopLayout() : _buildMobileLayout(),
      ),
      bottomNavigationBar:
          isDesktop ? null : _buildMobileBottomNavigation(),
    );
  }

  /// Desktop layout (three columns)
  Widget _buildDesktopLayout() {
    return Row(
      children: [
        Expanded(
          flex: 1,
          child: _buildDiscoverColumn(),
        ),
        const VerticalDivider(width: 1),
        Expanded(
          flex: 2,
          child: _buildTransferColumn(),
        ),
        const VerticalDivider(width: 1),
        Expanded(
          flex: 1,
          child: _buildNetworkColumn(),
        ),
      ],
    );
  }

  /// Mobile layout (tabbed)
  Widget _buildMobileLayout() {
    return IndexedStack(
      index: _currentMobileTab,
      children: [
        _buildDiscoverColumn(),
        _buildTransferColumn(),
        _buildNetworkColumn(),
      ],
    );
  }

  /// Left column: Discovery
  Widget _buildDiscoverColumn() {
    final deviceState = ref.watch(deviceProvider);
    final connectionStatesAsync = ref.watch(connectionStatesProvider);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppDimensions.space6),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildHeader(),
          const SizedBox(height: AppDimensions.space6),
          _buildLocalDeviceCard(),
          const SizedBox(height: AppDimensions.space6),
          _buildSectionHeader(
            title: 'DISCOVERED',
            count: deviceState.discoveredDevices.length,
          ),
          const SizedBox(height: AppDimensions.space4),
          connectionStatesAsync.when(
            data: (connectionStates) => DeviceList(
              devices: deviceState.discoveredDevices,
              selectedDevice: deviceState.selectedDevice,
              connectedPeers: deviceState.connectedPeers,
              connectionStates: connectionStates,
              onDeviceSelect: (device) {
                ref.read(deviceProvider.notifier).selectDevice(device);
              },
              onDeviceConnect: (device) => _handleDeviceConnect(device),
            ),
            loading: () => const CircularProgressIndicator(),
            error: (_, __) => DeviceList(
              devices: deviceState.discoveredDevices,
              selectedDevice: deviceState.selectedDevice,
              connectedPeers: deviceState.connectedPeers,
              connectionStates: const {},
              onDeviceSelect: (device) {
                ref.read(deviceProvider.notifier).selectDevice(device);
              },
              onDeviceConnect: (device) => _handleDeviceConnect(device),
            ),
          ),
        ],
      ),
    );
  }

  /// Center column: Transfer
  Widget _buildTransferColumn() {
    final deviceState = ref.watch(deviceProvider);
    final transfersAsync = ref.watch(transfersProvider);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppDimensions.space6),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildSectionHeader(title: 'TRANSFER FILES'),
          const SizedBox(height: AppDimensions.space4),
          FileUploader(
            disabled: deviceState.connectedPeers.isEmpty,
            connectedCount: deviceState.connectedPeers.length,
            onFilesSelected: (files) => _handleFilesSelected(files),
          ),
          const SizedBox(height: AppDimensions.space6),
          _buildSectionHeader(
            title: 'QUEUE',
            count: transfersAsync.value?.length ?? 0,
          ),
          const SizedBox(height: AppDimensions.space4),
          transfersAsync.when(
            data: (transfers) => TransferProgress(
              transfers: transfers,
              embedded: true,
              onClearTransfer: (id) {
                ref
                    .read(fileTransferServiceProvider)
                    .removeTransfer(id);
              },
            ),
            loading: () => const CircularProgressIndicator(),
            error: (_, __) => const TransferProgress(
              transfers: [],
              embedded: true,
            ),
          ),
        ],
      ),
    );
  }

  /// Right column: Network
  Widget _buildNetworkColumn() {
    final deviceState = ref.watch(deviceProvider);

    final connectedDevices = deviceState.discoveredDevices
        .where((d) =>
            d.peerId != null && deviceState.connectedPeers.contains(d.peerId))
        .toList();

    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppDimensions.space6),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildSectionHeader(
            title: 'NETWORK',
            count: deviceState.connectedPeers.length,
          ),
          const SizedBox(height: AppDimensions.space4),
          if (connectedDevices.isEmpty)
            _buildEmptyConnections()
          else
            ...connectedDevices.map((device) => Padding(
                  padding: const EdgeInsets.only(bottom: AppDimensions.space4),
                  child: _buildConnectedItem(device),
                )),
        ],
      ),
    );
  }

  /// App header
  Widget _buildHeader() {
    final themeNotifier = ref.read(themeProvider.notifier);
    final isDark = themeNotifier.isDark;

    return Stack(
      children: [
        Positioned(
          top: 0,
          right: 0,
          child: IconButton(
            icon: Icon(
              isDark ? Icons.light_mode : Icons.dark_mode,
              size: AppDimensions.iconMedium,
            ),
            onPressed: () => themeNotifier.toggleTheme(),
          ),
        ),
        Column(
          children: [
            Text(
              'BLINK',
              style: AppTextStyles.displayLarge,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: AppDimensions.space2),
            Text(
              'SECURE LOCAL FILE SHARING',
              style: AppTextStyles.subtitle,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: AppDimensions.space4),
            _buildOnlineStatus(),
          ],
        ),
      ],
    );
  }

  Widget _buildOnlineStatus() {
    final deviceState = ref.watch(deviceProvider);

    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Container(
          width: 8,
          height: 8,
          decoration: BoxDecoration(
            color: deviceState.isConnected
                ? AppColors.statusOnline
                : AppColors.statusOffline,
            shape: BoxShape.circle,
          ),
        ),
        const SizedBox(width: AppDimensions.space2),
        Text(
          deviceState.isConnected ? 'ONLINE' : 'OFFLINE',
          style: AppTextStyles.caption,
        ),
      ],
    );
  }

  Widget _buildLocalDeviceCard() {
    final deviceState = ref.watch(deviceProvider);
    final localDevice = deviceState.localDevice;

    if (localDevice == null) return const SizedBox.shrink();

    return Container(
      padding: const EdgeInsets.all(AppDimensions.space4),
      decoration: BoxDecoration(
        color: AppColors.bgSecondary,
        border: Border.all(color: AppColors.borderPrimary),
        borderRadius: BorderRadius.circular(AppDimensions.radiusMedium),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'LOCAL DEVICE',
            style: AppTextStyles.labelSmall,
          ),
          const SizedBox(height: AppDimensions.space3),
          Row(
            children: [
              PlatformBadge(platform: localDevice.platform),
              const SizedBox(width: AppDimensions.space3),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      localDevice.name,
                      style: AppTextStyles.bodyMedium.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    Text(
                      localDevice.platform,
                      style: AppTextStyles.caption,
                    ),
                  ],
                ),
              ),
              StatusBadge(
                label: deviceState.isConnected ? 'CONNECTED' : 'OFFLINE',
                isActive: deviceState.isConnected,
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader({required String title, int? count}) {
    return Row(
      children: [
        Text(title, style: AppTextStyles.headingSmall),
        if (count != null) ...[
          const SizedBox(width: AppDimensions.space2),
          Container(
            padding: const EdgeInsets.symmetric(
              horizontal: AppDimensions.space2,
              vertical: 2,
            ),
            decoration: BoxDecoration(
              color: AppColors.bgTertiary,
              borderRadius: BorderRadius.circular(AppDimensions.radiusSmall),
            ),
            child: Text(
              count.toString(),
              style: AppTextStyles.caption,
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildEmptyConnections() {
    return Container(
      padding: const EdgeInsets.all(AppDimensions.space12),
      child: Column(
        children: [
          Icon(
            Icons.hub_outlined,
            size: AppDimensions.iconLarge,
            color: AppColors.textTertiary.withOpacity(0.5),
          ),
          const SizedBox(height: AppDimensions.space2),
          Text(
            'NO ACTIVE CONNECTIONS',
            style: AppTextStyles.labelSmall.copyWith(
              color: AppColors.textTertiary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildConnectedItem(device) {
    return Container(
      padding: const EdgeInsets.all(AppDimensions.space4),
      decoration: BoxDecoration(
        color: AppColors.bgSecondary,
        border: Border.all(color: AppColors.borderStrong),
        borderRadius: BorderRadius.circular(AppDimensions.radiusMedium),
      ),
      child: Row(
        children: [
          PlatformBadge(platform: device.platform),
          const SizedBox(width: AppDimensions.space3),
          Expanded(
            child: Text(
              device.name,
              style: AppTextStyles.bodyMedium.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
          TextButton(
            onPressed: () => _handleDeviceDisconnect(device),
            child: Text(
              'DISCONNECT',
              style: AppTextStyles.buttonSmall,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMobileBottomNavigation() {
    final deviceState = ref.watch(deviceProvider);

    return BottomNavigationBar(
      currentIndex: _currentMobileTab,
      onTap: (index) {
        setState(() {
          _currentMobileTab = index;
        });
      },
      items: [
        const BottomNavigationBarItem(
          icon: Icon(Icons.explore),
          label: 'DISCOVER',
        ),
        const BottomNavigationBarItem(
          icon: Icon(Icons.swap_horiz),
          label: 'TRANSFER',
        ),
        BottomNavigationBarItem(
          icon: Stack(
            clipBehavior: Clip.none,
            children: [
              const Icon(Icons.hub),
              if (deviceState.connectedPeers.isNotEmpty)
                Positioned(
                  right: -4,
                  top: -4,
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: const BoxDecoration(
                      color: AppColors.neonGreen,
                      shape: BoxShape.circle,
                    ),
                    child: Text(
                      deviceState.connectedPeers.length.toString(),
                      style: AppTextStyles.caption.copyWith(
                        fontSize: 8,
                        color: AppColors.bgPrimary,
                      ),
                    ),
                  ),
                ),
            ],
          ),
          label: 'NETWORK',
        ),
      ],
    );
  }

  Future<void> _handleDeviceConnect(device) async {
    if (device.peerId == null) return;

    final webrtcManager = ref.read(webrtcManagerProvider);
    await webrtcManager.connectToPeer(device.peerId!);
    ref.read(deviceProvider.notifier).addConnectedPeer(device.peerId!);
  }

  Future<void> _handleDeviceDisconnect(device) async {
    if (device.peerId == null) return;

    final webrtcManager = ref.read(webrtcManagerProvider);
    await webrtcManager.closeConnection(device.peerId!);
    ref.read(deviceProvider.notifier).removeConnectedPeer(device.peerId!);
  }

  Future<void> _handleFilesSelected(files) async {
    for (final platformFile in files) {
      // For web, we can access bytes directly
      if (platformFile.bytes != null) {
        // TODO: Implement file sending through WebRTC
        print('Selected file: ${platformFile.name} (${platformFile.size} bytes)');
      }
    }
  }
}
