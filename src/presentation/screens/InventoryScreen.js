import React, { useEffect, useState } from 'react';
import { View, ScrollView } from 'react-native';
import { 
  Appbar, 
  Card, 
  Title, 
  Paragraph, 
  FAB, 
  Chip,
  Text,
  Modal,
  Portal,
  TextInput,
  Button,
  ActivityIndicator,
  ProgressBar,
  IconButton,
  Menu,
  Divider
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../stores/useAppStore';

export default function InventoryScreen() {
  const {
    products,
    productLoading,
    productError,
    loadProducts,
    createProduct,
    updateProduct,
    adjustStock
  } = useAppStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [stockAdjustment, setStockAdjustment] = useState('');
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '消耗品',
    currentStock: '',
    minStock: '',
    sellingPrice: '',
    costPrice: '',
    unit: '個',
    notes: ''
  });

  const [menuVisible, setMenuVisible] = useState({});

  useEffect(() => {
    loadProducts();
  }, []);

  const handleCreateProduct = async () => {
    try {
      await createProduct({
        ...newProduct,
        currentStock: parseInt(newProduct.currentStock) || 0,
        minStock: parseInt(newProduct.minStock) || 0,
        sellingPrice: parseInt(newProduct.sellingPrice) || 0,
        costPrice: parseInt(newProduct.costPrice) || 0
      });
      setNewProduct({
        name: '',
        category: '消耗品',
        currentStock: '',
        minStock: '',
        sellingPrice: '',
        costPrice: '',
        unit: '個',
        notes: ''
      });
      setShowAddModal(false);
    } catch (error) {
      console.error('商品作成エラー:', error);
    }
  };

  const handleEditProduct = async () => {
    try {
      await updateProduct(editingProduct.id, {
        ...newProduct,
        currentStock: parseInt(newProduct.currentStock) || 0,
        minStock: parseInt(newProduct.minStock) || 0,
        sellingPrice: parseInt(newProduct.sellingPrice) || 0,
        costPrice: parseInt(newProduct.costPrice) || 0
      });
      setShowEditModal(false);
      setEditingProduct(null);
      resetForm();
    } catch (error) {
      console.error('商品更新エラー:', error);
    }
  };

  const handleStockAdjustment = async () => {
    try {
      const adjustment = parseInt(stockAdjustment) || 0;
      await adjustStock(editingProduct.id, adjustment);
      setShowStockModal(false);
      setStockAdjustment('');
      setEditingProduct(null);
    } catch (error) {
      console.error('在庫調整エラー:', error);
    }
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      category: product.category,
      currentStock: product.currentStock.toString(),
      minStock: product.minStock.toString(),
      sellingPrice: product.sellingPrice.toString(),
      costPrice: product.costPrice.toString(),
      unit: product.unit,
      notes: product.notes
    });
    setShowEditModal(true);
  };

  const openStockModal = (product) => {
    setEditingProduct(product);
    setShowStockModal(true);
  };

  const resetForm = () => {
    setNewProduct({
      name: '',
      category: '消耗品',
      currentStock: '',
      minStock: '',
      sellingPrice: '',
      costPrice: '',
      unit: '個',
      notes: ''
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(amount || 0);
  };

  const toggleMenu = (productId) => {
    setMenuVisible(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  const lowStockProducts = products.filter(product => product.isLowStock());

  if (productLoading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 16 }}>在庫データを読み込み中...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.Content title="在庫管理" />
        <Appbar.Action icon="refresh" onPress={loadProducts} />
      </Appbar.Header>
      
      <ScrollView style={{ flex: 1, padding: 16 }}>
        {productError && (
          <Card style={{ marginBottom: 16, backgroundColor: '#FEE2E2' }}>
            <Card.Content>
              <Text style={{ color: '#DC2626' }}>エラー: {productError}</Text>
            </Card.Content>
          </Card>
        )}

        <View style={{ marginBottom: 16 }}>
          <Title>在庫アラート</Title>
          {lowStockProducts.length > 0 ? (
            <View style={{ marginTop: 8 }}>
              {lowStockProducts.map(product => (
                <Chip 
                  key={product.id}
                  icon="alert" 
                  mode="outlined"
                  style={{ 
                    marginBottom: 4, 
                    marginRight: 8,
                    borderColor: '#EF4444',
                    backgroundColor: '#FEE2E2'
                  }}
                  textStyle={{ color: '#DC2626' }}
                >
                  {product.name}: {product.currentStock}{product.unit}
                </Chip>
              ))}
            </View>
          ) : (
            <Chip icon="check" style={{ marginTop: 8, alignSelf: 'flex-start' }}>
              在庫不足なし
            </Chip>
          )}
        </View>
        
        {products.length > 0 ? (
          products.map((product) => (
            <Card key={product.id} style={{ marginBottom: 12 }}>
              <Card.Content>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1 }}>
                    <Text variant="titleLarge">{product.name}</Text>
                    <Chip mode="outlined" compact style={{ marginTop: 4, alignSelf: 'flex-start' }}>
                      {product.category}
                    </Chip>
                    
                    <View style={{ marginTop: 8 }}>
                      <Text variant="bodyMedium">
                        在庫数: {product.currentStock}{product.unit} / 最小在庫: {product.minStock}{product.unit}
                      </Text>
                      <ProgressBar 
                        progress={Math.min(product.currentStock / Math.max(product.minStock * 2, 1), 1)}
                        color={product.isLowStock() ? '#EF4444' : '#10B981'}
                        style={{ marginTop: 4 }}
                      />
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                      <Text variant="bodyMedium">
                        販売価格: {formatCurrency(product.sellingPrice)}
                      </Text>
                      <Text variant="bodyMedium">
                        仕入価格: {formatCurrency(product.costPrice)}
                      </Text>
                    </View>

                    <Chip 
                      mode="outlined" 
                      compact
                      style={{ 
                        marginTop: 8, 
                        alignSelf: 'flex-start',
                        borderColor: product.getStockStatusColor()
                      }}
                      textStyle={{ color: product.getStockStatusColor() }}
                    >
                      {product.getStockStatusText()}
                    </Chip>
                  </View>
                  
                  <Menu
                    visible={menuVisible[product.id] || false}
                    onDismiss={() => toggleMenu(product.id)}
                    anchor={
                      <IconButton 
                        icon="dots-vertical" 
                        onPress={() => toggleMenu(product.id)}
                      />
                    }
                  >
                    <Menu.Item 
                      onPress={() => {
                        openStockModal(product);
                        toggleMenu(product.id);
                      }} 
                      title="在庫調整" 
                    />
                    <Menu.Item 
                      onPress={() => {
                        openEditModal(product);
                        toggleMenu(product.id);
                      }} 
                      title="編集" 
                    />
                  </Menu>
                </View>
              </Card.Content>
            </Card>
          ))
        ) : (
          <Card>
            <Card.Content>
              <Paragraph>商品はありません</Paragraph>
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
            borderRadius: 8,
            maxHeight: '90%'
          }}
        >
          <ScrollView>
            <Title>新規商品追加</Title>
            
            <TextInput
              label="商品名 *"
              value={newProduct.name}
              onChangeText={(text) => setNewProduct(prev => ({ ...prev, name: text }))}
              mode="outlined"
              style={{ marginTop: 16 }}
            />
            
            <TextInput
              label="カテゴリ"
              value={newProduct.category}
              onChangeText={(text) => setNewProduct(prev => ({ ...prev, category: text }))}
              mode="outlined"
              style={{ marginTop: 8 }}
            />
            
            <TextInput
              label="現在在庫数"
              value={newProduct.currentStock}
              onChangeText={(text) => setNewProduct(prev => ({ ...prev, currentStock: text }))}
              mode="outlined"
              keyboardType="numeric"
              style={{ marginTop: 8 }}
            />
            
            <TextInput
              label="最小在庫数"
              value={newProduct.minStock}
              onChangeText={(text) => setNewProduct(prev => ({ ...prev, minStock: text }))}
              mode="outlined"
              keyboardType="numeric"
              style={{ marginTop: 8 }}
            />
            
            <TextInput
              label="販売価格"
              value={newProduct.sellingPrice}
              onChangeText={(text) => setNewProduct(prev => ({ ...prev, sellingPrice: text }))}
              mode="outlined"
              keyboardType="numeric"
              style={{ marginTop: 8 }}
            />
            
            <TextInput
              label="仕入価格"
              value={newProduct.costPrice}
              onChangeText={(text) => setNewProduct(prev => ({ ...prev, costPrice: text }))}
              mode="outlined"
              keyboardType="numeric"
              style={{ marginTop: 8 }}
            />
            
            <TextInput
              label="単位"
              value={newProduct.unit}
              onChangeText={(text) => setNewProduct(prev => ({ ...prev, unit: text }))}
              mode="outlined"
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
                onPress={handleCreateProduct}
                disabled={!newProduct.name.trim()}
              >
                追加
              </Button>
            </View>
          </ScrollView>
        </Modal>

        <Modal
          visible={showEditModal}
          onDismiss={() => setShowEditModal(false)}
          contentContainerStyle={{
            backgroundColor: 'white',
            padding: 20,
            margin: 20,
            borderRadius: 8,
            maxHeight: '90%'
          }}
        >
          <ScrollView>
            <Title>商品編集</Title>
            
            <TextInput
              label="商品名 *"
              value={newProduct.name}
              onChangeText={(text) => setNewProduct(prev => ({ ...prev, name: text }))}
              mode="outlined"
              style={{ marginTop: 16 }}
            />
            
            <TextInput
              label="カテゴリ"
              value={newProduct.category}
              onChangeText={(text) => setNewProduct(prev => ({ ...prev, category: text }))}
              mode="outlined"
              style={{ marginTop: 8 }}
            />
            
            <TextInput
              label="現在在庫数"
              value={newProduct.currentStock}
              onChangeText={(text) => setNewProduct(prev => ({ ...prev, currentStock: text }))}
              mode="outlined"
              keyboardType="numeric"
              style={{ marginTop: 8 }}
            />
            
            <TextInput
              label="最小在庫数"
              value={newProduct.minStock}
              onChangeText={(text) => setNewProduct(prev => ({ ...prev, minStock: text }))}
              mode="outlined"
              keyboardType="numeric"
              style={{ marginTop: 8 }}
            />
            
            <TextInput
              label="販売価格"
              value={newProduct.sellingPrice}
              onChangeText={(text) => setNewProduct(prev => ({ ...prev, sellingPrice: text }))}
              mode="outlined"
              keyboardType="numeric"
              style={{ marginTop: 8 }}
            />
            
            <TextInput
              label="仕入価格"
              value={newProduct.costPrice}
              onChangeText={(text) => setNewProduct(prev => ({ ...prev, costPrice: text }))}
              mode="outlined"
              keyboardType="numeric"
              style={{ marginTop: 8 }}
            />
            
            <TextInput
              label="単位"
              value={newProduct.unit}
              onChangeText={(text) => setNewProduct(prev => ({ ...prev, unit: text }))}
              mode="outlined"
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
                onPress={handleEditProduct}
                disabled={!newProduct.name.trim()}
              >
                更新
              </Button>
            </View>
          </ScrollView>
        </Modal>

        <Modal
          visible={showStockModal}
          onDismiss={() => setShowStockModal(false)}
          contentContainerStyle={{
            backgroundColor: 'white',
            padding: 20,
            margin: 20,
            borderRadius: 8
          }}
        >
          <Title>在庫調整</Title>
          <Text style={{ marginTop: 8 }}>
            {editingProduct?.name} (現在: {editingProduct?.currentStock}{editingProduct?.unit})
          </Text>
          
          <TextInput
            label="調整数量 (±)"
            value={stockAdjustment}
            onChangeText={setStockAdjustment}
            mode="outlined"
            keyboardType="numeric"
            placeholder="例: +10 または -5"
            style={{ marginTop: 16 }}
          />
          
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 24 }}>
            <Button 
              mode="outlined" 
              onPress={() => setShowStockModal(false)}
              style={{ marginRight: 8 }}
            >
              キャンセル
            </Button>
            <Button 
              mode="contained" 
              onPress={handleStockAdjustment}
              disabled={!stockAdjustment}
            >
              調整
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