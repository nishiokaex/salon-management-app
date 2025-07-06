import React, { useEffect, useState } from 'react';
import { View, ScrollView } from 'react-native';
import { 
  Appbar, 
  Card, 
  Title, 
  Paragraph, 
  FAB, 
  Modal, 
  Portal, 
  Text,
  TextInput,
  Button,
  Chip,
  ActivityIndicator,
  Menu,
  Divider
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../stores/useAppStore';

export default function BookingScreen() {
  const {
    bookings,
    bookingLoading,
    bookingError,
    loadBookings,
    createBooking,
    updateBooking,
    updateBookingStatus,
    deleteBooking
  } = useAppStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [newBooking, setNewBooking] = useState({
    date: new Date().toISOString().split('T')[0],
    time: '',
    customerName: '',
    service: '',
    price: ''
  });

  const [menuVisible, setMenuVisible] = useState({});

  useEffect(() => {
    loadBookings();
  }, []);

  const handleCreateBooking = async () => {
    try {
      // 正規化された形式で予約を作成
      await createBooking({
        customerId: null, // 新しい顧客システムでは既存の顧客IDが必要
        date: newBooking.date,
        time: newBooking.time,
        notes: '',
        // 暫定的に古いサービス形式をサポート
        services: [{
          serviceId: null,
          price: parseInt(newBooking.price) || 0,
          duration: 60, // デフォルト60分
          staffMember: '',
          notes: newBooking.service
        }],
        // 後方互換性のため
        customerName: newBooking.customerName,
        service: newBooking.service,
        price: parseInt(newBooking.price) || 0
      });
      setNewBooking({
        date: new Date().toISOString().split('T')[0],
        time: '',
        customerName: '',
        service: '',
        price: ''
      });
      setShowAddModal(false);
    } catch (error) {
      console.error('予約作成エラー:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(amount || 0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return '#3B82F6';
      case 'completed': return '#10B981';
      case 'cancelled': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const toggleMenu = (bookingId) => {
    setMenuVisible(prev => ({
      ...prev,
      [bookingId]: !prev[bookingId]
    }));
  };

  const openEditModal = (booking) => {
    setEditingBooking(booking);
    setNewBooking({
      date: booking.date,
      time: booking.time,
      customerName: booking.customerName,
      service: booking.service || '施術内容なし',
      price: (booking.price || booking.totalPrice || 0).toString()
    });
    setShowEditModal(true);
  };

  const handleEditBooking = async () => {
    try {
      await updateBooking(editingBooking.id, {
        date: newBooking.date,
        time: newBooking.time,
        totalPrice: parseInt(newBooking.price) || 0,
        notes: newBooking.service, // 暫定的にnotesに保存
        // 後方互換性のため
        customerName: newBooking.customerName,
        service: newBooking.service,
        price: parseInt(newBooking.price) || 0
      });
      setShowEditModal(false);
      setEditingBooking(null);
      setNewBooking({
        date: new Date().toISOString().split('T')[0],
        time: '',
        customerName: '',
        service: '',
        price: ''
      });
    } catch (error) {
      console.error('予約編集エラー:', error);
    }
  };

  if (bookingLoading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 16 }}>予約データを読み込み中...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.Content title="予約管理" />
        <Appbar.Action icon="refresh" onPress={loadBookings} />
      </Appbar.Header>
      
      <ScrollView style={{ flex: 1, padding: 16 }}>
        {bookingError && (
          <Card style={{ marginBottom: 16, backgroundColor: '#FEE2E2' }}>
            <Card.Content>
              <Text style={{ color: '#DC2626' }}>エラー: {bookingError}</Text>
            </Card.Content>
          </Card>
        )}

        {bookings.length > 0 ? (
          bookings.map((booking) => (
            <Card key={booking.id} style={{ marginBottom: 12 }}>
              <Card.Content>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1 }}>
                    <Text variant="titleLarge">{(booking.customerName || booking.customer?.name || '顧客名不明').toString()}</Text>
                    <Text variant="bodyLarge" style={{ marginTop: 4 }}>
                      {(booking.service || '施術内容なし').toString()}
                    </Text>
                    <Text variant="bodyMedium" style={{ marginTop: 2, color: '#6B7280' }}>
                      {(booking.date || '日付不明').toString()} {(booking.time || '時間不明').toString()}
                    </Text>
                  </View>
                  
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                      {formatCurrency(booking.price || booking.totalPrice || 0)}
                    </Text>
                    <Chip 
                      mode="outlined" 
                      compact
                      style={{ 
                        marginTop: 4,
                        borderColor: getStatusColor(booking.status),
                      }}
                      textStyle={{ color: getStatusColor(booking.status) }}
                    >
                      {(booking.getStatusText ? booking.getStatusText() : (booking.status === 'scheduled' ? '予約済み' : booking.status === 'completed' ? '完了' : booking.status === 'cancelled' ? 'キャンセル' : booking.status || '不明')).toString()}
                    </Chip>
                  </View>
                </View>
                
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 }}>
                  <Menu
                    visible={menuVisible[booking.id] || false}
                    onDismiss={() => toggleMenu(booking.id)}
                    anchor={
                      <Button mode="outlined" compact onPress={() => toggleMenu(booking.id)}>
                        操作
                      </Button>
                    }
                  >
                    <Menu.Item 
                      onPress={() => {
                        openEditModal(booking);
                        toggleMenu(booking.id);
                      }} 
                      title="編集" 
                    />
                    <Divider />
                    <Menu.Item 
                      onPress={async () => {
                        try {
                          await updateBookingStatus(booking.id, 'completed');
                          toggleMenu(booking.id);
                        } catch (error) {
                          console.error('予約ステータス更新エラー:', error);
                        }
                      }} 
                      title="完了にする" 
                    />
                    <Menu.Item 
                      onPress={async () => {
                        try {
                          await updateBookingStatus(booking.id, 'cancelled');
                          toggleMenu(booking.id);
                        } catch (error) {
                          console.error('予約ステータス更新エラー:', error);
                        }
                      }} 
                      title="キャンセル" 
                    />
                    <Divider />
                    <Menu.Item 
                      onPress={async () => {
                        try {
                          await deleteBooking(booking.id);
                          toggleMenu(booking.id);
                        } catch (error) {
                          console.error('予約削除エラー:', error);
                        }
                      }} 
                      title="削除" 
                    />
                  </Menu>
                </View>
              </Card.Content>
            </Card>
          ))
        ) : (
          <Card>
            <Card.Content>
              <Paragraph>予約はありません</Paragraph>
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      <Portal>
        <Modal
          visible={showAddModal}
          onDismiss={() => setShowAddModal(false)}
          contentContainerStyle={{
            backgroundColor: 'white',
            padding: 20,
            margin: 20,
            borderRadius: 8
          }}
        >
          <Title>新規予約追加</Title>
          
          <TextInput
            label="日付"
            value={newBooking.date}
            onChangeText={(text) => setNewBooking(prev => ({ ...prev, date: text }))}
            mode="outlined"
            style={{ marginTop: 16 }}
          />
          
          <TextInput
            label="時間"
            value={newBooking.time}
            onChangeText={(text) => setNewBooking(prev => ({ ...prev, time: text }))}
            mode="outlined"
            placeholder="例: 14:00"
            style={{ marginTop: 8 }}
          />
          
          <TextInput
            label="顧客名"
            value={newBooking.customerName}
            onChangeText={(text) => setNewBooking(prev => ({ ...prev, customerName: text }))}
            mode="outlined"
            style={{ marginTop: 8 }}
          />
          
          <TextInput
            label="施術内容"
            value={newBooking.service}
            onChangeText={(text) => setNewBooking(prev => ({ ...prev, service: text }))}
            mode="outlined"
            style={{ marginTop: 8 }}
          />
          
          <TextInput
            label="料金"
            value={newBooking.price}
            onChangeText={(text) => setNewBooking(prev => ({ ...prev, price: text }))}
            mode="outlined"
            keyboardType="numeric"
            style={{ marginTop: 8 }}
          />
          
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 24 }}>
            <Button 
              mode="outlined" 
              onPress={() => setShowAddModal(false)}
              style={{ marginRight: 8 }}
            >
              キャンセル
            </Button>
            <Button 
              mode="contained" 
              onPress={handleCreateBooking}
              disabled={!newBooking.customerName || !newBooking.service}
            >
              追加
            </Button>
          </View>
        </Modal>

        <Modal
          visible={showEditModal}
          onDismiss={() => setShowEditModal(false)}
          contentContainerStyle={{
            backgroundColor: 'white',
            padding: 20,
            margin: 20,
            borderRadius: 8
          }}
        >
          <Title>予約編集</Title>
          
          <TextInput
            label="日付"
            value={newBooking.date}
            onChangeText={(text) => setNewBooking(prev => ({ ...prev, date: text }))}
            mode="outlined"
            style={{ marginTop: 16 }}
          />
          
          <TextInput
            label="時間"
            value={newBooking.time}
            onChangeText={(text) => setNewBooking(prev => ({ ...prev, time: text }))}
            mode="outlined"
            placeholder="例: 14:00"
            style={{ marginTop: 8 }}
          />
          
          <TextInput
            label="顧客名"
            value={newBooking.customerName}
            onChangeText={(text) => setNewBooking(prev => ({ ...prev, customerName: text }))}
            mode="outlined"
            style={{ marginTop: 8 }}
          />
          
          <TextInput
            label="施術内容"
            value={newBooking.service}
            onChangeText={(text) => setNewBooking(prev => ({ ...prev, service: text }))}
            mode="outlined"
            style={{ marginTop: 8 }}
          />
          
          <TextInput
            label="料金"
            value={newBooking.price}
            onChangeText={(text) => setNewBooking(prev => ({ ...prev, price: text }))}
            mode="outlined"
            keyboardType="numeric"
            style={{ marginTop: 8 }}
          />
          
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 24 }}>
            <Button 
              mode="outlined" 
              onPress={() => setShowEditModal(false)}
              style={{ marginRight: 8 }}
            >
              キャンセル
            </Button>
            <Button 
              mode="contained" 
              onPress={handleEditBooking}
              disabled={!newBooking.customerName || !newBooking.service}
            >
              更新
            </Button>
          </View>
        </Modal>
      </Portal>

      <FAB
        icon="plus"
        style={{
          position: 'absolute',
          margin: 16,
          right: 0,
          bottom: 0,
        }}
        onPress={() => setShowAddModal(true)}
      />
    </SafeAreaView>
  );
}