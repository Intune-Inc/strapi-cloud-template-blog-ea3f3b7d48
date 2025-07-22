// config/admin.js

// URL 생성 로직 함수
const getPreviewPathname = (uid, { locale, document }) => {
  const { slug, title, name } = document;
  
  // 컬렉션 타입별 URL 패턴 정의
  switch (uid) {
    // 페이지 컬렉션
    case "api::golf-product.golf-product":
      return `/product-detail.html?documentId=${slug}`;
    
    // 블로그 아티클
    case "api::article.article":
    case "api::blog.blog":
      if (!slug) return "/blog";
      return `/blog/${slug}`;
    
    // 제품 페이지
    case "api::product.product":
      if (!slug) return "/products";
      return `/products/${slug}`;
    
    // 뉴스/공지사항
    case "api::news.news":
    case "api::notice.notice":
      if (!slug) return "/news";
      return `/news/${slug}`;
    
    // 이벤트
    case "api::event.event":
      if (!slug) return "/events";
      return `/events/${slug}`;
    
    // 카테고리
    case "api::category.category":
      if (!slug) return "/categories";
      return `/category/${slug}`;
    
    // 포트폴리오
    case "api::portfolio.portfolio":
      if (!slug) return "/portfolio";
      return `/portfolio/${slug}`;
    
    // 서비스 페이지
    case "api::service.service":
      if (!slug) return "/services";
      return `/services/${slug}`;
    
    // FAQ
    case "api::faq.faq":
      return "/faq";
    
    // 회사 소개 페이지들
    case "api::about.about":
      return "/about";
    
    case "api::contact.contact":
      return "/contact";
    
    // 커스텀 랜딩 페이지
    case "api::landing.landing":
      if (!slug) return null;
      return `/landing/${slug}`;
    
    // 사전 정의된 특별 페이지들
    case "api::special-page.special-page":
      switch (slug) {
        case "pricing":
          return "/pricing";
        case "features":
          return "/features";
        case "testimonials":
          return "/testimonials";
        case "team":
          return "/team";
        default:
          return slug ? `/${slug}` : null;
      }
    
    // 전역 설정이나 메타데이터 (미리보기 불필요)
    case "api::global.global":
    case "api::seo.seo":
    case "api::config.config":
      return null;
    
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
  // 미리보기 설정 추가
  preview: {
    enabled: true,
    config: {
      allowedOrigins: "https://intunedev.cafe24.com/homepage",
      
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

          // Next.js draft mode URL 생성
          const urlSearchParams = new URLSearchParams({
            url: pathname,
            secret: env("PREVIEW_SECRET"),
            status: status || 'draft',
            uid: uid,
            documentId: documentId,
            ...(locale && { locale })
          });

          const previewUrl = `${env("CLIENT_URL")}/api/preview?${urlSearchParams}`;
          
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