import { Server, buildSchema, GraphQLHTTP, existsSync } from './deps.ts';

interface AnyObject {
    [key: string]: any
}

class Remora {
    path: string;
    server: Server;
    constructor(path: string) {
        this.path = path;
        this.server = new Server();
    }

    async readDirs() {
        const dirNames: string[] = []
        for await (const dir of Deno.readDirSync(this.path)){
            if(dir.isDirectory) dirNames.push(dir.name);
        }
        return dirNames;
    }

    async importModules() {
        const rootValue: AnyObject = {};
        const globGql : string[] = [];
        const moduleDir = await this.readDirs();
        for await (const func of moduleDir){
            const indexPath = Deno.cwd()+'/'+this.path+'/'+func;
            const queryPath = indexPath+'/query.ts';
            const mutationPath = indexPath+'/mutation.ts';
            const schemaPath = indexPath+'/schema.gql';
            if (existsSync(queryPath)){
                const module = await import(queryPath);
                Object.assign(rootValue, module);
            }
            if (existsSync(mutationPath)){
                const module = await import(mutationPath);
                Object.assign(rootValue, module);
            }
            if (existsSync(schemaPath)){
                const gqlData = await Deno.readTextFile(schemaPath);
                globGql.push(gqlData);
            }
        }
        return { rootValue, globGql };
    }

    async use(middleware: any){
        await this.server.use(middleware);
    }

    async listen(port: number = parseInt(Deno.env.get("PORT")) || 3000) {
        const { rootValue, globGql } = await this.importModules();
        const schema = buildSchema(`
        ${globGql.join("\n")}
        `);
        this.server.post(
            "/graphql",
            async (ctx: any, next: any) => {
                const resp = await GraphQLHTTP<Request>({ schema, rootValue, context: (request) => ({ request }), graphiql: true })(ctx.req);
                ctx.res = resp;
                await next();
            },
        );
        console.log(`Graphql server listen to http://localhost:${port}`);
        await this.server.listen({ port });
    }

}
export default Remora;