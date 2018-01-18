'use strict';

const _ = require('lodash@4.8.2');

module.exports = (ctx, cb) => {
  console.log(ctx.data);
  var attachments = ctx.data.event.attachments;
  if(attachments) {
    console.log(attachments[0].image_url);
    ctx.storage.get(function(err, data){
      if(err) {
        return cb(err, "ok");
      }

      let imgs = (data || {}).imgs || [];
      let imgs2 = _.take(_.concat([attachments[0].image_url], imgs), 10);
      ctx.storage.set(imgs2, function(error){
        return cb(error, null);
      });
      return null;
    });
  }
  else
  {
    return cb(null, "ok");
  }
};
