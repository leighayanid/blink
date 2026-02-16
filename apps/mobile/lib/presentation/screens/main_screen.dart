import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:animate_do/animate_do.dart';
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
import 'settings_screen.dart';
import 'history_screen.dart';

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
      appBar: AppBar(
        backgroundColor: AppColors.bgSecondary,
        elevation: 0,
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('BLINK', style: AppTextStyles.headingMedium),
          ],
        ),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.history),
            onPressed: () => _navigateToHistory(context),
            tooltip: 'History',
          ),
          IconButton(
            icon: const Icon(Icons.settings),
            onPressed: () => _navigateToSettings(context),
            tooltip: 'Settings',
          ),
        ],
      ),
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
    return AnimatedSwitcher(
      duration: const Duration(milliseconds: 300),
      transitionBuilder: (Widget child, Animation<double> animation) {
        return FadeTransition(
          opacity: animation,
          child: SlideTransition(
            position: Tween<Offset>(
              begin: const Offset(0.05, 0),
              end: Offset.zero,
            ).animate(animation),
            child: child,
          ),
        );
      },
      child: IndexedStack(
        key: ValueKey<int>(_currentMobileTab),
        index: _currentMobileTab,
        children: [
          _buildDiscoverColumn(),
          _buildTransferColumn(),
          _buildNetworkColumn(),
        ],
      ),
    );
  }

  /// Left column: Discovery
  Widget _buildDiscoverColumn() {
    final deviceState = ref.watch(deviceProvider);
    final connectionStatesAsync = ref.watch(connectionStatesProvider);

    return RefreshIndicator(
      onRefresh: _handleRefreshDevices,
      color: AppColors.neonCyan,
      backgroundColor: AppColors.bgSecondary,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
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
              loading: () => const Center(
                child: Padding(
                  padding: EdgeInsets.all(AppDimensions.space8),
                  child: CircularProgressIndicator(
                    color: AppColors.neonCyan,
                  ),
                ),
              ),
              error: (error, stack) => Column(
                children: [
                  Icon(
                    Icons.error_outline,
                    size: AppDimensions.iconLarge,
                    color: AppColors.statusError,
                  ),
                  const SizedBox(height: AppDimensions.space2),
                  Text(
                    'Error loading devices',
                    style: AppTextStyles.labelSmall.copyWith(
                      color: AppColors.statusError,
                    ),
                  ),
                  const SizedBox(height: AppDimensions.space4),
                  DeviceList(
                    devices: deviceState.discoveredDevices,
                    selectedDevice: deviceState.selectedDevice,
                    connectedPeers: deviceState.connectedPeers,
                    connectionStates: const {},
                    onDeviceSelect: (device) {
                      ref.read(deviceProvider.notifier).selectDevice(device);
                    },
                    onDeviceConnect: (device) => _handleDeviceConnect(device),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _handleRefreshDevices() async {
    try {
      // Announce to network again to refresh discovery
      ref.read(deviceProvider.notifier).announce();
      await Future.delayed(const Duration(milliseconds: 500));
      _showSuccess('Refreshed device list');
    } catch (error) {
      print('[MainScreen] Error refreshing devices: $error');
      _showError('Failed to refresh devices');
    }
  }

  /// Center column: Transfer
  Widget _buildTransferColumn() {
    final deviceState = ref.watch(deviceProvider);
    final transfersAsync = ref.watch(transfersProvider);
    final completedTransfers = ref.watch(completedTransfersProvider);

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
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildSectionHeader(
                title: 'QUEUE',
                count: transfersAsync.value?.length ?? 0,
              ),
              if (completedTransfers.isNotEmpty)
                TextButton.icon(
                  onPressed: _handleClearCompleted,
                  icon: const Icon(Icons.clear_all, size: 16),
                  label: Text(
                    'CLEAR COMPLETED',
                    style: AppTextStyles.buttonSmall,
                  ),
                ),
            ],
          ),
          const SizedBox(height: AppDimensions.space4),
          transfersAsync.when(
            data: (transfers) => transfers.isEmpty
                ? _buildEmptyTransfers()
                : TransferProgress(
                    transfers: transfers,
                    embedded: true,
                    onClearTransfer: (id) async {
                      final confirmed = await _showConfirmDialog(
                        'Remove Transfer',
                        'Are you sure you want to remove this transfer?',
                      );
                      if (confirmed) {
                        ref.read(fileTransferServiceProvider).removeTransfer(id);
                      }
                    },
                  ),
            loading: () => const Center(
              child: Padding(
                padding: EdgeInsets.all(AppDimensions.space8),
                child: CircularProgressIndicator(
                  color: AppColors.neonPink,
                ),
              ),
            ),
            error: (error, stack) => Column(
              children: [
                Icon(
                  Icons.error_outline,
                  size: AppDimensions.iconLarge,
                  color: AppColors.statusError,
                ),
                const SizedBox(height: AppDimensions.space2),
                Text(
                  'Error loading transfers',
                  style: AppTextStyles.labelSmall.copyWith(
                    color: AppColors.statusError,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyTransfers() {
    return Container(
      padding: const EdgeInsets.all(AppDimensions.space12),
      child: Column(
        children: [
          Icon(
            Icons.cloud_upload_outlined,
            size: AppDimensions.iconLarge,
            color: AppColors.textTertiary.withOpacity(0.5),
          ),
          const SizedBox(height: AppDimensions.space2),
          Text(
            'NO ACTIVE TRANSFERS',
            style: AppTextStyles.labelSmall.copyWith(
              color: AppColors.textTertiary,
            ),
          ),
          const SizedBox(height: AppDimensions.space1),
          Text(
            'Select files above to start transferring',
            style: AppTextStyles.caption.copyWith(
              color: AppColors.textTertiary.withOpacity(0.7),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _handleClearCompleted() async {
    final confirmed = await _showConfirmDialog(
      'Clear Completed',
      'Remove all completed transfers from the list?',
    );

    if (confirmed) {
      ref.read(fileTransferServiceProvider).clearCompleted();
      _showSuccess('Cleared completed transfers');
    }
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
            FadeInDown(
              duration: const Duration(milliseconds: 600),
              child: Text(
                'BLINK',
                style: AppTextStyles.displayLarge,
                textAlign: TextAlign.center,
              ),
            ),
            const SizedBox(height: AppDimensions.space2),
            FadeInDown(
              duration: const Duration(milliseconds: 800),
              child: Text(
                'SECURE LOCAL FILE SHARING',
                style: AppTextStyles.subtitle,
                textAlign: TextAlign.center,
              ),
            ),
            const SizedBox(height: AppDimensions.space4),
            FadeIn(
              duration: const Duration(milliseconds: 1000),
              child: _buildOnlineStatus(),
            ),
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

    try {
      final webrtcManager = ref.read(webrtcManagerProvider);
      final fileTransferService = ref.read(fileTransferServiceProvider);

      // Connect to peer
      final dataChannel = await webrtcManager.connectToPeer(device.peerId!);

      // Setup receive handler for incoming files
      fileTransferService.setupReceiveHandler(dataChannel);

      ref.read(deviceProvider.notifier).addConnectedPeer(device.peerId!);
      _showSuccess('Connected to ${device.name}');
    } catch (error) {
      print('[MainScreen] Error connecting to device: $error');
      _showError('Failed to connect to ${device.name}');
    }
  }

  Future<void> _handleDeviceDisconnect(device) async {
    if (device.peerId == null) return;

    // Show confirmation dialog
    final confirmed = await _showConfirmDialog(
      'Disconnect Device',
      'Are you sure you want to disconnect from ${device.name}?',
    );

    if (!confirmed) return;

    try {
      final webrtcManager = ref.read(webrtcManagerProvider);
      await webrtcManager.closeConnection(device.peerId!);
      ref.read(deviceProvider.notifier).removeConnectedPeer(device.peerId!);
      _showSuccess('Disconnected from ${device.name}');
    } catch (error) {
      print('[MainScreen] Error disconnecting from device: $error');
      _showError('Failed to disconnect from ${device.name}');
    }
  }

  Future<bool> _showConfirmDialog(String title, String message) async {
    final result = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: AppColors.bgSecondary,
        title: Text(title, style: AppTextStyles.headingSmall),
        content: Text(message, style: AppTextStyles.bodyMedium),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: Text('CANCEL', style: AppTextStyles.buttonSmall),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(true),
            style: TextButton.styleFrom(
              foregroundColor: AppColors.statusError,
            ),
            child: Text('CONFIRM', style: AppTextStyles.buttonSmall),
          ),
        ],
      ),
    );
    return result ?? false;
  }

  Future<void> _handleFilesSelected(files) async {
    final deviceState = ref.read(deviceProvider);
    final fileTransferService = ref.read(fileTransferServiceProvider);
    final webrtcManager = ref.read(webrtcManagerProvider);

    // Get all connected peers
    final connectedPeers = deviceState.connectedPeers;
    if (connectedPeers.isEmpty) {
      _showError('No connected devices to send files to');
      return;
    }

    try {
      for (final platformFile in files) {
        // For web, we can access bytes directly
        if (platformFile.bytes != null && platformFile.name != null) {
          print('[MainScreen] Sending file: ${platformFile.name} (${platformFile.size} bytes)');

          // Send file to all connected peers
          for (final peerId in connectedPeers) {
            final dataChannel = webrtcManager.dataChannels[peerId];

            if (dataChannel != null) {
              // Setup receive handler if not already set
              fileTransferService.setupReceiveHandler(dataChannel);

              // Send the file
              await fileTransferService.sendFile(
                fileBytes: platformFile.bytes!,
                fileName: platformFile.name!,
                fileSize: platformFile.size!,
                channel: dataChannel,
                onProgress: (progress) {
                  print('[MainScreen] Transfer progress: $progress%');
                },
              );
            }
          }
        } else {
          _showError('Unable to read file: ${platformFile.name ?? "unknown"}');
        }
      }
    } catch (error) {
      print('[MainScreen] Error sending files: $error');
      _showError('Failed to send file: $error');
    }
  }

  void _showError(String message) {
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(message),
          backgroundColor: AppColors.statusError,
          behavior: SnackBarBehavior.floating,
          margin: const EdgeInsets.all(AppDimensions.space4),
          duration: const Duration(seconds: 3),
        ),
      );
    }
  }

  void _showSuccess(String message) {
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(message),
          backgroundColor: AppColors.statusOnline,
          behavior: SnackBarBehavior.floating,
          margin: const EdgeInsets.all(AppDimensions.space4),
          duration: const Duration(seconds: 2),
        ),
      );
    }
  }

  void _navigateToSettings(BuildContext context) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => const SettingsScreen(),
      ),
    );
  }

  void _navigateToHistory(BuildContext context) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => const HistoryScreen(),
      ),
    );
  }
}
