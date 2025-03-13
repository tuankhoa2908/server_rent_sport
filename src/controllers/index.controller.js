const controllers = {};

controllers.user = require('./user.controller');
controllers.email = require('./email.controller');
controllers.field = require('./field.controller');
controllers.coupon = require('./coupon.controller');
controllers.order = require('./order.controller');
controllers.transaction = require('./transaction.controller');
controllers.upload = require('./upload.controller');
controllers.comment = require('./comment.controller');

module.exports = controllers;