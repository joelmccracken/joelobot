module.exports = (ctx, cb) => {
  return cb(null, ctx.data.challenge);
};
