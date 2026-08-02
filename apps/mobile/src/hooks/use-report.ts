import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { createReport, type ReportTargetType } from '@/services/supabase/reports';
import { useAuth } from '@/store/auth';

export function useReport() {
  const { t } = useTranslation();

  return useCallback(
    (targetType: ReportTargetType, targetId: string) => {
      Alert.alert(t('report.title'), t('report.subtitle'), [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('report.confirm'),
          style: 'destructive',
          onPress: async () => {
            const userId = useAuth.getState().userId;
            if (!userId) return;
            try {
              await createReport(userId, targetType, targetId, t('report.defaultReason'));
              Alert.alert(t('report.sentTitle'), t('report.sentMessage'));
            } catch {
              Alert.alert(t('report.failedTitle'), t('discover.saveFailed'));
            }
          },
        },
      ]);
    },
    [t],
  );
}
