const Koa = require('koa');
const path = require('path');
const fs = require('fs');
const render = require('koa-ejs');
const bodyParser = require('koa-bodyparser');
const _ = require('koa-route');

const app = new Koa();
render(app, {
    root: path.join(__dirname, 'view'),
    layout: false,
    viewExt: 'html',
    cache: false,
    debug: false
});

app.use(bodyParser());
let users = require('./users.json');

app.use(_.get('/', async (ctx) => {
    await ctx.render('index', {
        users
    });
}));

app.use(_.get('/edit', async (ctx) => {
    const id = ctx.request.query.id;
    for (let user of users) {
        if (user.id == id) {
            await ctx.render('edit', {
                user
            });
            return;
        }
    }
    ctx.body = "<h1>Not Found</h1>"
}));

app.use(_.get('/readOnly', async (ctx) => {
    const id = ctx.request.query.id;
    for (let user of users) {
        if (user.id == id) {
            await ctx.render('readOnly', {
                user
            });
            return;
        }
    }
    ctx.body = "<h1>Not Found</h1>"
}));

app.use(_.post('/save', async ctx => {
    const user = ctx.request.body;
    users = users.map(_user => {
        if (_user.id == user.id) {
            return user;
        } else {
            return _user;
        }
    });
    await new Promise((resolve, reject) => {
        fs.writeFile(path.join(__dirname, 'users.json'), JSON.stringify(users), err => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
    ctx.response.redirect('/');
}));

app.listen(8080);