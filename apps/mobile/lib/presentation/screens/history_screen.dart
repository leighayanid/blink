import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:animate_do/animate_do.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_text_styles.dart';
import '../../core/constants/app_dimensions.dart';
import '../providers/transfer_provider.dart';
import '../widgets/transfer_progress.dart';

/// Transfer history screen showing completed and failed transfers
class HistoryScreen extends ConsumerWidget {
  const HistoryScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final completedTransfers = ref.watch(completedTransfersProvider);
    final failedTransfers = ref.watch(failedTransfersProvider);
    final allHistoryTransfers = [...completedTransfers, ...failedTransfers];

    return Scaffold(
      backgroundColor: AppColors.bgPrimary,
      appBar: AppBar(
        backgroundColor: AppColors.bgSecondary,
        elevation: 0,
        title: Text(
          'TRANSFER HISTORY',
          style: AppTextStyles.headingSmall,
        ),
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.of(context).pop(),
        ),
        actions: [
          if (allHistoryTransfers.isNotEmpty)
            IconButton(
              icon: const Icon(Icons.delete_sweep),
              onPressed: () => _showClearAllDialog(context, ref),
              tooltip: 'Clear All',
            ),
        ],
      ),
      body: allHistoryTransfers.isEmpty
          ? _buildEmptyState()
          : Column(
              children: [
                // Stats section
                FadeInDown(
                  duration: const Duration(milliseconds: 400),
                  child: Container(
                    margin: const EdgeInsets.all(AppDimensions.space6),
                    padding: const EdgeInsets.all(AppDimensions.space4),
                    decoration: BoxDecoration(
                      color: AppColors.bgSecondary,
                      border: Border.all(color: AppColors.borderPrimary),
                      borderRadius:
                          BorderRadius.circular(AppDimensions.radiusMedium),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: [
                        _buildStatItem(
                          'Completed',
                          completedTransfers.length.toString(),
                          AppColors.neonGreen,
                          Icons.check_circle,
                        ),
                        Container(
                          width: 1,
                          height: 40,
                          color: AppColors.borderPrimary,
                        ),
                        _buildStatItem(
                          'Failed',
                          failedTransfers.length.toString(),
                          AppColors.neonPink,
                          Icons.error,
                        ),
                        Container(
                          width: 1,
                          height: 40,
                          color: AppColors.borderPrimary,
                        ),
                        _buildStatItem(
                          'Total',
                          allHistoryTransfers.length.toString(),
                          AppColors.neonCyan,
                          Icons.history,
                        ),
                      ],
                    ),
                  ),
                ),

                // Transfers list
                Expanded(
                  child: ListView.separated(
                    padding: const EdgeInsets.symmetric(
                      horizontal: AppDimensions.space6,
                      vertical: AppDimensions.space4,
                    ),
                    itemCount: allHistoryTransfers.length,
                    separatorBuilder: (context, index) =>
                        const SizedBox(height: AppDimensions.space3),
                    itemBuilder: (context, index) {
                      final transfer = allHistoryTransfers[index];
                      return FadeInUp(
                        duration: Duration(milliseconds: 300 + (index * 50)),
                        child: SlideInRight(
                          duration: Duration(milliseconds: 300 + (index * 50)),
                          child: TransferProgress(
                            transfers: [transfer],
                            embedded: true,
                            onClearTransfer: (id) {
                              ref
                                  .read(fileTransferServiceProvider)
                                  .removeTransfer(id);
                            },
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
    );
  }

  Widget _buildStatItem(
      String label, String value, Color color, IconData icon) {
    return Column(
      children: [
        Icon(icon, color: color, size: AppDimensions.iconMedium),
        const SizedBox(height: AppDimensions.space2),
        Text(
          value,
          style: AppTextStyles.headingMedium.copyWith(color: color),
        ),
        const SizedBox(height: AppDimensions.space1),
        Text(
          label,
          style: AppTextStyles.caption.copyWith(
            color: AppColors.textTertiary,
          ),
        ),
      ],
    );
  }

  Widget _buildEmptyState() {
    return FadeIn(
      duration: const Duration(milliseconds: 600),
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Pulse(
              infinite: true,
              duration: const Duration(seconds: 2),
              child: Icon(
                Icons.history,
                size: 80,
                color: AppColors.textTertiary.withOpacity(0.5),
              ),
            ),
            const SizedBox(height: AppDimensions.space4),
            Text(
              'NO TRANSFER HISTORY',
              style: AppTextStyles.headingMedium.copyWith(
                color: AppColors.textTertiary,
              ),
            ),
            const SizedBox(height: AppDimensions.space2),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: AppDimensions.space8),
              child: Text(
                'Your completed and failed transfers will appear here',
                style: AppTextStyles.caption.copyWith(
                  color: AppColors.textTertiary.withOpacity(0.7),
                ),
                textAlign: TextAlign.center,
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showClearAllDialog(BuildContext context, WidgetRef ref) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: AppColors.bgSecondary,
        title: Text('Clear History', style: AppTextStyles.headingSmall),
        content: Text(
          'Are you sure you want to clear all transfer history?',
          style: AppTextStyles.bodyMedium,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: Text('CANCEL', style: AppTextStyles.buttonSmall),
          ),
          TextButton(
            onPressed: () {
              ref.read(fileTransferServiceProvider).clearCompleted();
              Navigator.of(context).pop();
            },
            style: TextButton.styleFrom(
              foregroundColor: AppColors.statusError,
            ),
            child: Text('CLEAR ALL', style: AppTextStyles.buttonSmall),
          ),
        ],
      ),
    );
  }
}
