'use strict';

const _ = require('lodash@4.8.2');

module.exports = (ctx, cb) => {
  let data = ctx.data;
  if(data) {
    console.log(data);
    if(data.type == 'url_verification'){
      return cb(null, data.challenge);
    }
    if(data.event) {
      var event_ts = data.event.event_ts;

      if(data.event.subtype == 'message_deleted') {
        return ctx.storage.get(function(err, data){
          if(err) {
            return cb(err, null);
          }
          let deletions = (data || {}).deletions || [];
          let deletions2 = _.concat([ctx.data.event.deleted_ts], deletions);
          let newData = _.extend({}, data, {deletions: deletions2});
          console.log({newData: newData});
          ctx.storage.set(
            newData,
            function(error){
              return cb(error, null);
            });
          return null;
        });
      }
      var attachments = data.event.attachments;

      if(attachments) {
        console.log(data);
        ctx.storage.get(function(err, data){
          if(err) {
            return cb(err, null);
          }
          let imgs = (data || {}).imgs || {};
          imgs[event_ts] = attachments[0].image_url;
          console.log("imgs:", imgs);
          ctx.storage.set({imgs: imgs}, function(error){
            return cb(error, null);
          });
          return null;
        });
      }
      else
      {
        return cb(null, "ok");
      }
    }
  } else {
    console.log("Error no data: ", ctx);
  }
};
