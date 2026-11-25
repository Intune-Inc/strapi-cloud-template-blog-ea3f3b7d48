module.exports = ({ env }) => ({
  upload: {
    config: {
      sizeLimit: 500 * 1024 * 1024, // 500MB
      // 업로드 파일 형식 제한 (관리자 화면, Content API 모두 적용)
      security: {
        allowedTypes: [
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
          'video/mp4',
          'application/pdf',
        ],
        // 허용 형식의 파일 머리글을 붙여 위장한 파일을 확장자 기준으로 차단 (브라우저에서 스크립트가 실행되는 형식)
        deniedTypes: [
          'text/html',
          'application/xhtml+xml',
          'image/svg+xml',
          'text/xml',
          'application/xml',
          'text/javascript',
          'application/javascript',
        ],
      },
    },
  },
});