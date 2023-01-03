import Koa from 'koa';
import Router from 'koa-router';

const koa = new Koa();
const router = new Router();
const port = 3003;

router.get('/', async ctx => {
    ctx.body = 'Hello world';
});

console.log(`Server start at port ${port}`)
koa.use(router.routes());
koa.listen(port);
