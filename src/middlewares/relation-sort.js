module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    // Content Manager의 relation 요청인 경우
    if (ctx.request.url.includes('/content-manager/relations/')) {
      // 정렬이 없으면 name 내림차순으로 설정
      if (!ctx.query.sort) {
        ctx.query.sort = 'adminName:desc';
      }
    }
    
    await next();
  };
};