'use strict';

/**
 * 보안 감사용 요청 로그
 *
 * 다음 요청을 Strapi 로그(Strapi Cloud Runtime logs)에 한 줄씩 남긴다.
 *  - /api/* 쓰기 요청 (POST, PUT, PATCH, DELETE)
 *  - /api/* 요청 중 401, 403 으로 거절된 요청
 *  - /api/* 요청 중 관리자 관계 필드(createdBy, updatedBy, publishedBy)를 쿼리에 포함한 요청
 *    (CVE-2026-27886 공격 패턴. 패치 후에는 거절되지만 시도 자체를 기록한다)
 *  - 관리자 인증 요청 (/admin/login, /admin/register, /admin/forgot-password, /admin/reset-password)
 *
 * 요청 본문과 Authorization 헤더 값은 기록하지 않는다.
 * Strapi Cloud 는 Cloudflare 뒤에서 동작하므로 실제 접속 IP 는 CF-Connecting-IP, X-Forwarded-For 헤더로 전달된다.
 *
 * config/middlewares.js 에서 'strapi::errors' 보다 앞에 등록해야 최종 응답 코드가 기록된다.
 */

const WRITE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const ADMIN_AUTH_PATH = /^\/admin\/(login|register|forgot-password|reset-password)$/;
const ADMIN_RELATION_QUERY = /(createdBy|updatedBy|publishedBy)/i;

const getAuthType = (ctx) => {
  const header = ctx.get('authorization');
  if (!header) return 'none';
  return /^bearer\s/i.test(header) ? 'bearer' : 'other';
};

const safeDecode = (value) => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const writeAuditLog = (ctx, strapi) => {
  const isApi = ctx.path.startsWith('/api/');
  const isAdminAuth = ctx.method === 'POST' && ADMIN_AUTH_PATH.test(ctx.path);
  const isSuspiciousQuery = isApi && ADMIN_RELATION_QUERY.test(safeDecode(ctx.querystring || ''));
  const isWrite = isApi && WRITE_METHODS.has(ctx.method);
  const isDenied = isApi && (ctx.status === 401 || ctx.status === 403);

  if (!(isAdminAuth || isWrite || isDenied || isSuspiciousQuery)) return;

  const fields = [
    `[audit] ${ctx.method} ${ctx.path}${isSuspiciousQuery ? `?${ctx.querystring}` : ''} ${ctx.status}`,
    `ip=${ctx.get('cf-connecting-ip') || '-'}`,
    `xff=${JSON.stringify(ctx.get('x-forwarded-for') || '')}`,
    `remote=${ctx.ip}`,
    `ua=${JSON.stringify(ctx.get('user-agent') || '')}`,
    `auth=${getAuthType(ctx)}`,
  ];
  strapi.log.info(fields.join(' '));
};

module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    try {
      await next();
    } finally {
      // 로깅 실패가 요청 처리에 영향을 주지 않도록 한다
      try {
        writeAuditLog(ctx, strapi);
      } catch (err) {
        strapi.log.warn(`[audit] logging failed: ${err.message}`);
      }
    }
  };
};
