
module.exports = {
    async setOrder(ctx) {
        try {
            const collections = [
                { name: 'api::golf-sponsor.golf-sponsor', displayName: 'Golf Sponsor' },
                { name: 'api::sports-sponsor.sports-sponsor', displayName: 'Sports Sponsor' },
                { name: 'api::golf-product.golf-product', displayName: 'Golf Product' },
                { name: 'api::sports-product.sports-product', displayName: 'Sports Product' }
            ];

            const results = [];

            for (const collection of collections) {
                try {
                    const items = await strapi.db.query(collection.name).findMany({
                        orderBy: { createdAt: 'desc' }
                    });

                    for (let i = 0; i < items.length; i++) {
                        await strapi.db.query(collection.name).update({
                        where: { id: items[i].id },
                        data: { order: i + 1 }
                        });
                    }

                    results.push({
                        collection: collection.displayName,
                        count: items.length,
                        status: 'success'
                    });
                } catch (error) {
                    results.push({
                        collection: collection.displayName,
                        error: error.message,
                        status: 'failed'
                    });
                }
            }

            ctx.send({ message: 'Order 설정 완료', results });
        } catch (error) {
            ctx.badRequest('Order 설정 중 오류 발생', { error: error.message });
        }
    }
};