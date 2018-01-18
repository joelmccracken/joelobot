'use strict';

const _ = require('lodash@4.8.2');
const request = require('request');

const baseURL = 'https://slack.com/api/';
const usersListEndpoint = 'users.list';
const imOpenEndpoint = 'im.open';
const chatPostEndpoint = 'chat.postMessage';
let token;

const callAPI = (endpoint, form, cb) => {
  request.post(baseURL + endpoint, {form}, (err, res, body) => {
    if (err) return cb(err);

    body = JSON.parse(body);
    if (!body.ok) return cb(body.error);

    return cb(null, body);
  });
};

/* Post message to specified Slack channel */
const postMsg = (channel, data, cb) => {
  const obj = {
    title: `#${data.id} | ${data.title}`,
    title_link: 'https://auth0.zendesk.com/agent/tickets/' + data.id,
    fields: [
      {title: 'Mentioned by', value: data.author},
      {title: 'Comment', value: data.comment},
      {title: 'Tags', value: data.tags}
    ]
  };
  callAPI(chatPostEndpoint, {
    token,
    channel,
    as_user: 'joelobot',
    username: 'joelobot',
    text: 'hi yinz'
    // , attachments: JSON.stringify([obj])
  }, (err, body) => {
    if (err) {
      console.log("callapi err", token, err);

      return cb(err);
    }
    cb(null);
  });
};


// module.exports = (context, cb) => {
//   // Slack bot token
//   token = context.secrets.BOT_TOKEN;


//   postMsg("@joelmccracken", "hello world", cb);

// };

function saveImg(data, timestamp, img) {
  //let dates = _.keys(imgs);
  next = {};
  next[timestamp] = img;
  return _.extend(next, data);
}


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



// const request = require('request');
// const _ = require('lodash@4.8.2');

// const baseURL = 'https://slack.com/api/';
// const usersListEndpoint = 'users.list';
// const imOpenEndpoint = 'im.open';
// const chatPostEndpoint = 'chat.postMessage';
// let token;

// /* Call the given endpoing in Slack API */
// const callAPI = (endpoint, form, cb) => {
//   request.post(baseURL + endpoint, {form}, (err, res, body) => {
//     if (err) return cb(err);

//     body = JSON.parse(body);
//     if (!body.ok) return cb(body.error);

//     return cb(null, body);
//   });
// };

// /* Find Slack ID of the user with given username */
// const findUser = (username, cb) => {
//   callAPI(usersListEndpoint, {token}, (err, body) => {
//     if (err) return cb(err);

//     const user = _.find(body.members, {name: username});

//     if (!user) return cb(`User ${username} not found`);
//     cb(null, user.id);
//   });
// };

// /* Open a direct msg channel with given Slack user id */
// const openIM = (user, cb) => {
//   callAPI(imOpenEndpoint, {token, user}, (err, body) => {
//     if (err) return cb(err);
//     cb(null, body.channel.id);
//   });
// };

// /* Post message to specified Slack channel */
// const postMsg = (channel, data, cb) => {
//   const obj = {
//     title: `#${data.id} | ${data.title}`,
//     title_link: 'https://auth0.zendesk.com/agent/tickets/' + data.id,
//     fields: [
//       {title: 'Mentioned by', value: data.author},
//       {title: 'Comment', value: data.comment},
//       {title: 'Tags', value: data.tags}
//     ]
//   };
//   callAPI(chatPostEndpoint, {
//     token,
//     channel,
//     as_user: false,
//     username: 'Zendesk Mentions Bot',
//     icon_url: 'http://i.imgur.com/IhN4IzR.png?1',
//     text: 'You were mentioned in this ticket:',
//     attachments: JSON.stringify([obj])
//   }, (err, body) => {
//     if (err) { console.log(err); return cb(err); }
//     cb(null);
//   });
// };

// const extractName = (comment) => {
//   const start = comment.indexOf('<@') + 2;
//   const end = comment.substr(start).indexOf('>');
//   return comment.substr(start, end);
// };

// module.exports = (context, cb) => {

//   // Slack bot token
//   token = context.data.BOT_TOKEN;

//   const name = extractName(context.data.comment).toLowerCase();

//   findUser(name, (err, id) => {
//     if (err) {
//       // If no such user, assume it's a channel
//       return postMsg(name, context.data, cb);
//     }

//     return openIM(id, (err, channelId) => {
//       if (err) { console.log(err); return cb(); }
//       else postMsg(channelId, context.data, cb);
//     });
//   });

// };
