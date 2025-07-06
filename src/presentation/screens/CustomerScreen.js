import React, { useEffect, useState } from 'react';
import { View, ScrollView, Linking } from 'react-native';
import { 
  Appbar, 
  Card, 
  Title, 
  Paragraph, 
  FAB, 
  Searchbar,
  Text,
  IconButton,
  Modal,
  Portal,
  TextInput,
  Button,
  ActivityIndicator,
  Chip,
  List
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../stores/useAppStore';

export default function CustomerScreen() {
  const {
    customers,
    customerLoading,
    customerError,
    loadCustomers,
    createCustomer,
    updateCustomer,
    searchCustomers,
    createBooking
  } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [bookingCustomer, setBookingCustomer] = useState(null);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    email: '',
    notes: ''
  });
  const [newBooking, setNewBooking] = useState({
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    service: '',
    price: 0,
    notes: ''
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
    searchCustomers(query);
  };

  const handleCreateCustomer = async () => {
    try {
      await createCustomer(newCustomer);
      setNewCustomer({
        name: '',
        phone: '',
        email: '',
        notes: ''
      });
      setShowAddModal(false);
    } catch (error) {
      console.error('顧客作成エラー:', error);
    }
  };

  const handleEditCustomer = async () => {
    try {
      await updateCustomer(editingCustomer.id, newCustomer);
      setShowEditModal(false);
      setEditingCustomer(null);
      setNewCustomer({
        name: '',
        phone: '',
        email: '',
        notes: ''
      });
    } catch (error) {
      console.error('顧客更新エラー:', error);
    }
  };

  const openEditModal = (customer) => {
    setEditingCustomer(customer);
    setNewCustomer({
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      notes: customer.notes
    });
    setShowEditModal(true);
  };

  const makePhoneCall = (phoneNumber) => {
    if (phoneNumber) {
      Linking.openURL(`tel:${phoneNumber}`);
    }
  };

  const sendEmail = (email) => {
    if (email) {
      Linking.openURL(`mailto:${email}`);
    }
  };

  const openBookingModal = (customer) => {
    setBookingCustomer(customer);
    setNewBooking({
      date: new Date().toISOString().split('T')[0],
      time: '10:00',
      service: '',
      price: 0,
      notes: ''
    });
    setShowBookingModal(true);
  };

  const handleCreateBooking = async () => {
    try {
      // 正規化された形式で予約を作成
      await createBooking({
        customerId: bookingCustomer.id,
        date: newBooking.date,
        time: newBooking.time,
        notes: newBooking.notes,
        services: [{
          serviceId: null,
          price: Number(newBooking.price),
          duration: 60, // デフォルト60分
          staffMember: '',
          notes: newBooking.service
        }],
        // 後方互換性のため
        customerName: bookingCustomer.name,
        service: newBooking.service,
        price: Number(newBooking.price)
      });
      setShowBookingModal(false);
      setBookingCustomer(null);
      setNewBooking({
        date: new Date().toISOString().split('T')[0],
        time: '10:00',
        service: '',
        price: 0,
        notes: ''
      });
      // 顧客データを再読み込みして来店回数を更新
      loadCustomers();
    } catch (error) {
      console.error('予約作成エラー:', error);
    }
  };

  if (customerLoading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 16 }}>顧客データを読み込み中...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.Content title="顧客管理" />
        <Appbar.Action icon="refresh" onPress={loadCustomers} />
      </Appbar.Header>
      
      <View style={{ flex: 1, padding: 16 }}>
        <Searchbar
          placeholder="顧客を検索"
          onChangeText={handleSearch}
          value={searchQuery}
          style={{ marginBottom: 16 }}
        />
        
        {customerError && (
          <Card style={{ marginBottom: 16, backgroundColor: '#FEE2E2' }}>
            <Card.Content>
              <Text style={{ color: '#DC2626' }}>エラー: {customerError}</Text>
            </Card.Content>
          </Card>
        )}

        <ScrollView style={{ flex: 1 }}>
          {customers.length > 0 ? (
            customers.map((customer) => (
              <Card key={customer.id} style={{ marginBottom: 12 }}>
                <Card.Content>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1 }}>
                      <Text variant="titleLarge">{(customer.name || '顧客名不明').toString()}</Text>
                      
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
                        <Chip mode="outlined" compact style={{ marginRight: 8, marginBottom: 4 }}>
                          来店回数: {(customer.visitCount || 0).toString()}回
                        </Chip>
                        <Chip mode="outlined" compact style={{ marginBottom: 4 }}>
                          最終来店: {(customer.getLastVisitString ? customer.getLastVisitString() : 
                            (customer.lastVisit ? new Date(customer.lastVisit).toLocaleDateString('ja-JP') : '来店履歴なし')).toString()}
                        </Chip>
                      </View>

{customer.phone ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                          <IconButton 
                            icon="phone" 
                            size={20} 
                            onPress={() => makePhoneCall(customer.phone)}
                          />
                          <Text variant="bodyMedium">{customer.phone.toString()}</Text>
                        </View>
                      ) : null}

                      {customer.email ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <IconButton 
                            icon="email" 
                            size={20} 
                            onPress={() => sendEmail(customer.email)}
                          />
                          <Text variant="bodyMedium">{customer.email.toString()}</Text>
                        </View>
                      ) : null}

                      {customer.notes ? (
                        <Text variant="bodySmall" style={{ marginTop: 8, fontStyle: 'italic' }}>
                          {customer.notes.toString()}
                        </Text>
                      ) : null}
                    </View>
                    
                    <View style={{ flexDirection: 'row' }}>
                      <IconButton 
                        icon="calendar-plus" 
                        mode="outlined"
                        onPress={() => openBookingModal(customer)}
                        style={{ marginRight: 4 }}
                      />
                      <IconButton 
                        icon="pencil" 
                        mode="outlined"
                        onPress={() => openEditModal(customer)}
                      />
                    </View>
                  </View>
                </Card.Content>
              </Card>
            ))
          ) : (
            <Card>
              <Card.Content>
                <Paragraph>
                  {searchQuery ? '検索結果がありません' : '顧客はありません'}
                </Paragraph>
              </Card.Content>
            </Card>
          )}
        </ScrollView>
      </View>

      <Portal>
        <Modal
          visible={showAddModal}
          onDismiss={() => setShowAddModal(false)}
          contentContainerStyle={{
            backgroundColor: 'white',
            padding: 20,
            margin: 20,
            borderRadius: 8,
            maxHeight: '80%'
          }}
        >
          <Title>新規顧客追加</Title>
          
          <TextInput
            label="顧客名 *"
            value={newCustomer.name}
            onChangeText={(text) => setNewCustomer(prev => ({ ...prev, name: text }))}
            mode="outlined"
            style={{ marginTop: 16 }}
          />
          
          <TextInput
            label="電話番号"
            value={newCustomer.phone}
            onChangeText={(text) => setNewCustomer(prev => ({ ...prev, phone: text }))}
            mode="outlined"
            keyboardType="phone-pad"
            style={{ marginTop: 8 }}
          />
          
          <TextInput
            label="メールアドレス"
            value={newCustomer.email}
            onChangeText={(text) => setNewCustomer(prev => ({ ...prev, email: text }))}
            mode="outlined"
            keyboardType="email-address"
            style={{ marginTop: 8 }}
          />
          
          <TextInput
            label="特記事項・備考"
            value={newCustomer.notes}
            onChangeText={(text) => setNewCustomer(prev => ({ ...prev, notes: text }))}
            mode="outlined"
            multiline
            numberOfLines={3}
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
              onPress={handleCreateCustomer}
              disabled={!newCustomer.name.trim()}
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
            borderRadius: 8,
            maxHeight: '80%'
          }}
        >
          <Title>顧客情報編集</Title>
          
          <TextInput
            label="顧客名 *"
            value={newCustomer.name}
            onChangeText={(text) => setNewCustomer(prev => ({ ...prev, name: text }))}
            mode="outlined"
            style={{ marginTop: 16 }}
          />
          
          <TextInput
            label="電話番号"
            value={newCustomer.phone}
            onChangeText={(text) => setNewCustomer(prev => ({ ...prev, phone: text }))}
            mode="outlined"
            keyboardType="phone-pad"
            style={{ marginTop: 8 }}
          />
          
          <TextInput
            label="メールアドレス"
            value={newCustomer.email}
            onChangeText={(text) => setNewCustomer(prev => ({ ...prev, email: text }))}
            mode="outlined"
            keyboardType="email-address"
            style={{ marginTop: 8 }}
          />
          
          <TextInput
            label="特記事項・備考"
            value={newCustomer.notes}
            onChangeText={(text) => setNewCustomer(prev => ({ ...prev, notes: text }))}
            mode="outlined"
            multiline
            numberOfLines={3}
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
              onPress={handleEditCustomer}
              disabled={!newCustomer.name.trim()}
            >
              更新
            </Button>
          </View>
        </Modal>

        <Modal
          visible={showBookingModal}
          onDismiss={() => setShowBookingModal(false)}
          contentContainerStyle={{
            backgroundColor: 'white',
            padding: 20,
            margin: 20,
            borderRadius: 8,
            maxHeight: '80%'
          }}
        >
          <Title>新規予約作成</Title>
          {bookingCustomer && (
            <Text variant="bodyLarge" style={{ marginTop: 8, marginBottom: 16 }}>
              顧客: {bookingCustomer.name}
            </Text>
          )}
          
          <TextInput
            label="予約日"
            value={newBooking.date}
            onChangeText={(text) => setNewBooking(prev => ({ ...prev, date: text }))}
            mode="outlined"
            style={{ marginTop: 8 }}
          />
          
          <TextInput
            label="予約時間"
            value={newBooking.time}
            onChangeText={(text) => setNewBooking(prev => ({ ...prev, time: text }))}
            mode="outlined"
            placeholder="例: 10:00"
            style={{ marginTop: 8 }}
          />
          
          <TextInput
            label="サービス内容 *"
            value={newBooking.service}
            onChangeText={(text) => setNewBooking(prev => ({ ...prev, service: text }))}
            mode="outlined"
            placeholder="例: カット、カラー、パーマ"
            style={{ marginTop: 8 }}
          />
          
          <TextInput
            label="料金"
            value={newBooking.price.toString()}
            onChangeText={(text) => setNewBooking(prev => ({ ...prev, price: text }))}
            mode="outlined"
            keyboardType="numeric"
            placeholder="例: 5000"
            style={{ marginTop: 8 }}
          />
          
          <TextInput
            label="備考"
            value={newBooking.notes}
            onChangeText={(text) => setNewBooking(prev => ({ ...prev, notes: text }))}
            mode="outlined"
            multiline
            numberOfLines={3}
            style={{ marginTop: 8 }}
          />
          
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 24 }}>
            <Button 
              mode="outlined" 
              onPress={() => setShowBookingModal(false)}
              style={{ marginRight: 8 }}
            >
              キャンセル
            </Button>
            <Button 
              mode="contained" 
              onPress={handleCreateBooking}
              disabled={!newBooking.service.trim()}
            >
              予約作成
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