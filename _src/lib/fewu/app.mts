import Context from '#lib/fewu/context';

const ctx = new Context();

async function App() {

    await ctx.initialized;

    await ctx.emit('afterStartup', ctx);

    await ctx.emit('beforeProcess', ctx);

    await ctx.emit('$$Process', ctx);

    await ctx.emit('afterProcess', ctx);

    await ctx.emit('beforeDeploy', ctx);

    await ctx.emit('$$Deploy', ctx);

    await ctx.emit('afterDeploy', ctx);

    await ctx.emit('ready', ctx);

    await ctx.emit('exit', ctx);
}

export default App;
export {
    App,
    ctx
}