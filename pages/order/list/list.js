const AV = require('../../../utils/av-weapp.js')
Page({
	data: {
		orders: [],
	},
	onLoad: function (options) {
		// 订单状态，已下单为0，已付为1，已发货为2，已收货为3
		var status = parseInt(options.status);
		// 存为全局变量，控制支付按钮是否显示
		this.setData({
			status: status
		});
	},
	onShow: function() {
		var that = this;
		var user = AV.User.current();
		var query = new AV.Query('Order');	
		query.include('buys');
		query.equalTo('user', user);
		query.equalTo('status', this.data.status);
		query.descending('createdAt');
		query.find().then(function (orderObjects) {
			that.setData({
				orders: orderObjects
			});
			// loop search order, fetch the Buy objects
			for (var i = 0; i < orderObjects.length; i++) {
				var order = orderObjects[i];
				var queryMapping = new AV.Query('OrderGoodsMap');
				queryMapping.include('goods');
				queryMapping.equalTo('order', order);
				queryMapping.find().then(function (mappingObjects) {
					var mappingArray = [];
					for (var j = 0; j < mappingObjects.length; j++) {
						var mappingObject = mappingObjects[j];
						var mapping = {
							avatar: mappingObject.get('goods').get('avatar'),
							title: mappingObject.get('goods').get('title'),
							price: mappingObject.get('goods').get('price'),
							quantity: mappingObject.get('quantity')
						};
						mappingArray.push(mapping);
					}
					// 找出orderObjectId所在的索引位置，来得到k的值
					var k = 0;
					var orders = that.data.orders;
					for (var index = 0; index < orders.length; index++) {
						var order = orders[index];
						if (order.get('objectId') == mappingObject.get('order').get('objectId')) {
							k = index;
							break;
						}
					}
					var mappingData = that.data.mappingData == undefined ? [] : that.data.mappingData;
					mappingData[k] = mappingArray;
					that.setData({
						mappingData: mappingData
					});
				});
			}
		});
	},
	pay: function(e) {
		var objectId = e.currentTarget.dataset.objectId;
		var totalFee = e.currentTarget.dataset.totalFee;
		wx.navigateTo({
			url: '../payment/payment?orderId=' + objectId + '&totalFee=' + totalFee
		});
	}
});