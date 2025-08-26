// src/api/order-manager/routes/order-manager.js
module.exports = {
    routes: [
        {
            method: 'POST',
            path: '/order-manager/set-order',
            handler: 'order-manager.setOrder'
        }
    ]
};