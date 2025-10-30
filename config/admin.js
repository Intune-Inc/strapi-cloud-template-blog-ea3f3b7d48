// config/admin.js

// URL 생성 로직 함수
const getPreviewPathname = (uid, { locale, document }) => {
  const { slug, title, name, documentId } = document;
  
  // 컬렉션 타입별 URL 패턴 정의
  switch (uid) {
    // 미즈노 골프 컬렉션들
    case "api::dream-cup.dream-cup":
      return `/mizuno/golf/dreamcup/dreamcup.html?documentId=${documentId}`;
    
    case "api::golf-news.golf-news":
      return `/mizuno/golf/news/news_detail.html?documentId=${documentId}`;
    
    case "api::golf-product.golf-product":
      return `/mizuno/golf/product/prd_detail.html?documentId=${documentId}`;
    
    case "api::golf-sponsor.golf-sponsor":
      return `/mizuno/golf/sponsor/sponsor_detail.html?documentId=${documentId}`;
    
    case "api::golf-sponsor-support.golf-sponsor-support":
      return `/mizuno/golf/sponsor/prosupport.html?documentId=${documentId}`;
    
    // 미즈노 스포츠 컬렉션들
    case "api::sports-news.sports-news":
      return `/mizuno/sports/news/news_detail.html?documentId=${documentId}`;
    
    case "api::sports-product.sports-product":
      return `/mizuno/sports/product/prd_detail.html?documentId=${documentId}`;
    
    case "api::sports-sponsor.sports-sponsor":
      return `/mizuno/sports/sponsor/sponsor_detail.html?documentId=${documentId}`;
    
    case "api::team-wear.team-wear":
      // categoryName이 있으면 URL에 포함
      const categoryName = document.categoryName || '';
      return categoryName 
        ? `/mizuno/sports/teamwear/teamwear.html?categoryName=${encodeURIComponent(categoryName)}`
        : `/mizuno/sports/teamwear/teamwear.html`;
    
    default:
      // 기본적으로 slug가 있으면 해당 경로로, 없으면 컬렉션명으로
      const collectionName = uid.split('.')[1] || 'content';
      if (!slug && !title && !name) return `/${collectionName}`;
      const identifier = slug || title || name;
      return identifier ? `/${collectionName}/${identifier}` : `/${collectionName}`;
  }
};

module.exports = ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET'),
  },
  apiToken: {
    salt: env('API_TOKEN_SALT'),
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT'),
    },
  },
  flags: {
    nps: env.bool('FLAG_NPS', true),
    promoteEE: env.bool('FLAG_PROMOTE_EE', true),
  },
  // 미리보기 설정
  preview: {
    enabled: true,
    config: {
      // 미즈노 B2C 도메인 설정
      allowedOrigins: env("CLIENT_URL") || "https://mizuno-b2c.intune.co.kr",
      
      async handler(uid, { documentId, locale, status }) {
        try {
          // Strapi에서 문서 데이터 가져오기
          const document = await strapi.documents(uid).findOne({ 
            documentId,
            populate: '*'
          });

          if (!document) {
            console.warn(`Document not found: ${uid}/${documentId}`);
            return null;
          }

          // 미리보기 경로 생성
          const pathname = getPreviewPathname(uid, { locale, document });

          if (!pathname) {
            console.log(`Preview disabled for content type: ${uid}`);
            return null;
          }

          // 미즈노 컬렉션인지 확인
          const isMizunoCollection = uid.includes('golf-') || uid.includes('sports-') || uid.includes('dream-cup') || uid.includes('team-wear');
          
          let previewUrl;
          
          if (isMizunoCollection) {
            // 미즈노 컬렉션의 경우 직접 프론트엔드 페이지로 이동
            const mizunoBaseUrl = env("CLIENT_URL") || "https://mizuno-b2c.intune.co.kr";
            
            // team-wear의 경우 이미 URL에 파라미터가 포함되어 있으므로 추가 파라미터만 append
            if (uid === 'api::team-wear.team-wear') {
              const urlSearchParams = new URLSearchParams({
                preview: 'true',
                status: status || 'draft'
              });
              
              previewUrl = mizunoBaseUrl + pathname + (pathname.includes('?') ? '&' : '?') + urlSearchParams.toString();
            } else {
              const urlSearchParams = new URLSearchParams({
                documentId: documentId,
                preview: 'true',
                status: status || 'draft'
              });
              
              previewUrl = mizunoBaseUrl + pathname + (pathname.includes('?') ? '&' : '?') + urlSearchParams.toString();
            }
          } else {
            // 기존 Next.js draft mode 방식
            const baseParams = {
              url: pathname,
              status: status || 'draft'
            };
            
            // PREVIEW_SECRET이 있는 경우에만 추가
            const previewSecret = env("PREVIEW_SECRET");
            if (previewSecret) {
              baseParams.secret = previewSecret;
            }
            
            const urlSearchParams = new URLSearchParams(baseParams);
            const baseUrl = env("CLIENT_URL") || "https://mizuno-b2c.intune.co.kr";
            previewUrl = baseUrl + "/api/preview?" + urlSearchParams.toString();
          }
          
          console.log(`Preview URL generated for ${uid}/${documentId}:`, previewUrl);
          
          return previewUrl;
        } catch (error) {
          console.error(`Error generating preview URL for ${uid}/${documentId}:`, error);
          return null;
        }
      },
    },
  },
});