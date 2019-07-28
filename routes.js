const routes = require('next-routes')();

//create routes with custom tokens

routes
     .add('/profile/:address', '/profile')
     .add('/questions/lend', '/questions/postQuestion')
     .add('/questions/:address', '/questions/show')
     .add('/:value','/index')

module.exports = routes;
