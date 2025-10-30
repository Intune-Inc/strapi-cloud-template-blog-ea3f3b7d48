module.exports = {
    async beforeCreate(event) {
        const { data } = event.params;
        
        // order가 없으면 자동으로 다음 순서 할당
        if (!data.order) {
            const maxOrderItem = await strapi.db.query('api::golf-product-category.golf-product-category').findMany({
                orderBy: { order: 'desc' },
                limit: 1
            });
            data.order = maxOrderItem.length ? maxOrderItem[0].order + 1 : 1;
            console.log(`새 상품에 order ${data.order} 할당`);
        }
    }
};
