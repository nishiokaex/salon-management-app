import React, { useEffect } from 'react';
import { View, ScrollView } from 'react-native';
import { 
  Appbar, 
  Card, 
  Title, 
  Paragraph, 
  Surface, 
  Text, 
  ActivityIndicator,
  Chip,
  List
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../stores/useAppStore';

export default function DashboardScreen() {
  const {
    dashboardSummary,
    dashboardLoading,
    dashboardError,
    loadDashboardSummary
  } = useAppStore();

  useEffect(() => {
    loadDashboardSummary();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(amount || 0);
  };

  if (dashboardLoading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 16 }}>データを読み込み中...</Text>
      </SafeAreaView>
    );
  }

  if (dashboardError) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text variant="headlineSmall">エラーが発生しました</Text>
        <Text style={{ marginTop: 8 }}>{dashboardError}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.Content title="サロン管理" subtitle={new Date().toLocaleDateString('ja-JP')} />
        <Appbar.Action icon="refresh" onPress={loadDashboardSummary} />
      </Appbar.Header>
      <ScrollView style={{ flex: 1, padding: 16 }}>
        <View style={{ marginBottom: 16 }}>
          <Title>今日の概要</Title>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
            <Surface style={{ flex: 1, minWidth: 150, padding: 16, borderRadius: 8, marginRight: 8, marginBottom: 8 }}>
              <Text variant="bodySmall">今日の売上</Text>
              <Text variant="headlineSmall">{formatCurrency(dashboardSummary?.todayRevenue || 0)}</Text>
            </Surface>
            <Surface style={{ flex: 1, minWidth: 150, padding: 16, borderRadius: 8, marginRight: 8, marginBottom: 8 }}>
              <Text variant="bodySmall">今日の予約</Text>
              <Text variant="headlineSmall">{(dashboardSummary?.todayBookingCount || 0).toString()}件</Text>
            </Surface>
            <Surface style={{ flex: 1, minWidth: 150, padding: 16, borderRadius: 8, marginRight: 8, marginBottom: 8 }}>
              <Text variant="bodySmall">登録顧客</Text>
              <Text variant="headlineSmall">{(dashboardSummary?.totalCustomers || 0).toString()}人</Text>
            </Surface>
            <Surface style={{ flex: 1, minWidth: 150, padding: 16, borderRadius: 8, marginBottom: 8 }}>
              <Text variant="bodySmall">在庫アラート</Text>
              <Text variant="headlineSmall">{(dashboardSummary?.lowStockCount || 0).toString()}件</Text>
{dashboardSummary?.lowStockCount > 0 ? (
                <Chip 
                  icon="alert" 
                  mode="outlined" 
                  compact
                  style={{ marginTop: 4, alignSelf: 'flex-start' }}
                >
                  要確認
                </Chip>
              ) : null}
            </Surface>
          </View>
        </View>
        
        <View>
          <Title>今日の予約</Title>
          {dashboardSummary?.todayBookings?.length > 0 ? (
            dashboardSummary.todayBookings.map((booking) => (
              <Card key={booking.id} style={{ marginTop: 8 }}>
                <Card.Content>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flex: 1 }}>
                      <Text variant="titleMedium">{(booking.customerName || booking.customer?.name || '顧客名不明').toString()}</Text>
                      <Text variant="bodyMedium">{(booking.service || '施術内容なし').toString()}</Text>
                      <Text variant="bodySmall">{(booking.time || '時間不明').toString()}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text variant="titleMedium">{formatCurrency(booking.price || 0)}</Text>
                      <Chip mode="outlined" compact>
                        {(booking.getStatusText ? booking.getStatusText() : (booking.status === 'scheduled' ? '予約済み' : booking.status === 'completed' ? '完了' : booking.status === 'cancelled' ? 'キャンセル' : booking.status || '不明')).toString()}
                      </Chip>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            ))
          ) : (
            <Card style={{ marginTop: 8 }}>
              <Card.Content>
                <Paragraph>予約はありません</Paragraph>
              </Card.Content>
            </Card>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}