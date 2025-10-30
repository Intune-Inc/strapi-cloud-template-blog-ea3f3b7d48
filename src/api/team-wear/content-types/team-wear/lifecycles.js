module.exports = {
    async beforeCreate(event) {
        const { data } = event.params;
        
        // order가 없으면 자동으로 다음 순서 할당
        if (!data.order) {
            const maxOrderItem = await strapi.db.query('api::team-wear.team-wear').findMany({
                orderBy: { order: 'desc' },
                limit: 1
            });
            const maxOrder = maxOrderItem.length ? Number(maxOrderItem[0].order) : 0;
            data.order = maxOrder + 1;
            console.log(`새 상품에 order ${data.order} 할당`);
        }
    }
};
