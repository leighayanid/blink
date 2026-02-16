import 'package:flutter/material.dart';
import '../../data/models/transfer.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_text_styles.dart';
import '../../core/constants/app_dimensions.dart';

/// Transfer progress widget showing file transfer queue
class TransferProgress extends StatelessWidget {
  final List<Transfer> transfers;
  final bool embedded;
  final Function(String)? onClearTransfer;

  const TransferProgress({
    super.key,
    required this.transfers,
    this.embedded = false,
    this.onClearTransfer,
  });

  @override
  Widget build(BuildContext context) {
    if (transfers.isEmpty) {
      return _buildEmptyState();
    }

    return ListView.separated(
      shrinkWrap: true,
      physics: embedded
          ? const NeverScrollableScrollPhysics()
          : const AlwaysScrollableScrollPhysics(),
      itemCount: transfers.length,
      separatorBuilder: (context, index) =>
          const SizedBox(height: AppDimensions.space3),
      itemBuilder: (context, index) {
        final transfer = transfers[index];
        return _TransferItem(
          transfer: transfer,
          onClear: onClearTransfer,
        );
      },
    );
  }

  Widget _buildEmptyState() {
    return Container(
      padding: const EdgeInsets.all(AppDimensions.space8),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.hourglass_empty,
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
        ],
      ),
    );
  }
}

class _TransferItem extends StatelessWidget {
  final Transfer transfer;
  final Function(String)? onClear;

  const _TransferItem({
    required this.transfer,
    this.onClear,
  });

  IconData _getIcon() {
    switch (transfer.status) {
      case TransferStatus.sending:
        return Icons.upload;
      case TransferStatus.receiving:
        return Icons.download;
      case TransferStatus.completed:
        return Icons.check_circle;
      case TransferStatus.failed:
        return Icons.error;
      case TransferStatus.pending:
        return Icons.pending;
    }
  }

  Color _getIconColor() {
    switch (transfer.status) {
      case TransferStatus.sending:
      case TransferStatus.receiving:
        return AppColors.neonCyan;
      case TransferStatus.completed:
        return AppColors.neonGreen;
      case TransferStatus.failed:
        return AppColors.neonPink;
      case TransferStatus.pending:
        return AppColors.textTertiary;
    }
  }

  String _getStatusLabel() {
    switch (transfer.status) {
      case TransferStatus.sending:
        return 'SENDING';
      case TransferStatus.receiving:
        return 'RECEIVING';
      case TransferStatus.completed:
        return 'COMPLETED';
      case TransferStatus.failed:
        return 'FAILED';
      case TransferStatus.pending:
        return 'PENDING';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppDimensions.space4),
      decoration: BoxDecoration(
        color: AppColors.bgTertiary,
        borderRadius: BorderRadius.circular(AppDimensions.radiusMedium),
        border: Border.all(
          color: AppColors.borderPrimary,
          width: 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                _getIcon(),
                size: AppDimensions.iconMedium,
                color: _getIconColor(),
              ),
              const SizedBox(width: AppDimensions.space2),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      transfer.fileName,
                      style: AppTextStyles.bodyMedium.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: AppDimensions.space1),
                    Row(
                      children: [
                        Text(
                          _getStatusLabel(),
                          style: AppTextStyles.caption,
                        ),
                        const SizedBox(width: AppDimensions.space2),
                        Text(
                          '•',
                          style: AppTextStyles.caption,
                        ),
                        const SizedBox(width: AppDimensions.space2),
                        Text(
                          transfer.formattedSize,
                          style: AppTextStyles.caption,
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              if (transfer.isCompleted && onClear != null)
                IconButton(
                  icon: const Icon(Icons.close),
                  iconSize: AppDimensions.iconSmall,
                  color: AppColors.textTertiary,
                  onPressed: () => onClear!(transfer.id),
                ),
            ],
          ),
          if (transfer.isActive) ...[
            const SizedBox(height: AppDimensions.space3),
            ClipRRect(
              borderRadius: BorderRadius.circular(AppDimensions.radiusSmall),
              child: LinearProgressIndicator(
                value: transfer.progress / 100,
                minHeight: 4,
                backgroundColor: AppColors.bgSecondary,
                valueColor: AlwaysStoppedAnimation<Color>(
                  _getIconColor(),
                ),
              ),
            ),
            const SizedBox(height: AppDimensions.space2),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '${transfer.progress.toStringAsFixed(1)}%',
                  style: AppTextStyles.caption,
                ),
                if (transfer.formattedSpeed != null)
                  Text(
                    transfer.formattedSpeed!,
                    style: AppTextStyles.caption,
                  ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}
