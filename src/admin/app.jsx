export default {
  config: {
    locales: ['ko'],
  },
  bootstrap(app) {
    // CSS 주입
    const style = document.createElement('style');
    style.innerHTML = `
      /* Strapi v5 Relation 드롭다운 - 스크롤 활성화 */
      [data-strapi-dropdown-popover] {
        max-height: 400px !important;
        overflow-y: auto !important;  /* 추가 */
      }
      
      /* Combobox 옵션 리스트 */
      [role="listbox"] {
        max-height: 400px !important;
        overflow-y: auto !important;
      }
      
      /* Select 메뉴 */
      div[class*="MenuList"] {
        max-height: 400px !important;
        overflow-y: auto !important;  /* 추가 */
      }
      
      /* 스크롤 컨테이너 강제 설정 */
      [class*="menu"] > div {
        overflow-y: auto !important;
      }
    `;
    document.head.appendChild(style);
  },
};