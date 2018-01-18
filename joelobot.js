'use strict';

const _ = require('lodash@4.8.2');

function messageDeleted(ctx, cb){
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

function messageWithAttachment(ctx, cb) {
  let data = ctx.data;
  var event_ts = data.event.event_ts;
  var attachments = data.event.attachments;

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

function handleEvent(ctx, cb) {

  if(ctx.data.event.subtype == 'message_deleted') {
    return messageDeleted(ctx, cb);
  }

  if(ctx.data.event.attachments) {
    return messageWithAttachment(ctx, cb);
  }
}

module.exports = (ctx, cb) => {
  if(ctx.data) {
    console.log(ctx.data);
    if(ctx.data.type == 'url_verification'){
      return cb(null, ctx.data.challenge);
    }
    if(ctx.data.event){
      return handleEvent(ctx,cb);
    }
    else
    {
      return cb(null, "ok");
    }
  } else {
    console.log("Error no data: ", ctx);
  }
};
