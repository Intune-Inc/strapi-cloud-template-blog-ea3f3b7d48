module.exports = ({ env }) => ({
  'file-system': {
    enabled: true,
  },
  upload: {
    config: {
      sizeLimit: 500 * 1024 * 1024, // 500MB
    },
  },
});