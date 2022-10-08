import { Server, makeExecutableSchema, GraphQLHTTP, gql, existsSync } from './deps.ts';

interface AnyObject {
    [key: string]: any
}

class Remora {
    path: string;
    constructor(path: string) {
        this.path = path;
    }

    async readDirs() {
        const dirNames: string[] = []
        for await (const dir of Deno.readDirSync(this.path)){
            if(dir.isDirectory) dirNames.push(dir.name);
        }
        return dirNames;
    }

    async importModules() {
        const resolvers: AnyObject = {
            Query : {},
            Mutation : {}
        };
        const globGql : string[] = [];
        const moduleDir = await this.readDirs();
        for await (const func of moduleDir){
            const indexPath = Deno.cwd()+'/'+this.path+'/'+func;
            const queryPath = indexPath+'/query.ts';
            const mutationPath = indexPath+'/mutation.ts';
            const schemaPath = indexPath+'/schema.gql';
            if (existsSync(queryPath)){
                const module = await import(queryPath);
                Object.assign(resolvers.Query, module);
            }
            if (existsSync(mutationPath)){
                const module = await import(mutationPath);
                Object.assign(resolvers.Mutation, module);
            }
            if (existsSync(schemaPath)){
                const gqlData = await Deno.readTextFile(schemaPath);
                globGql.push(gqlData);
            }
        }
        if(Object.keys(resolvers.Query).length === 0){
            delete resolvers.Query;
        }
        if(Object.keys(resolvers.Mutation).length === 0){
            delete resolvers.Mutation;
        }
        return { resolvers, globGql };
    }

    async listen(port: number = parseInt(Deno.env.get("PORT")) || 3000) {
        const server = new Server();
        const { resolvers, globGql } = await this.importModules();
        const typeDefs = gql`
        ${globGql.join("\n")}
        `
        const schema = makeExecutableSchema({ resolvers, typeDefs });
        server.post(
            "/graphql",
            async (ctx: any, next: any) => {
                const resp = await GraphQLHTTP<Request>({ schema, context: (request) => ({ request }), graphiql: true })(ctx.req);
                ctx.res = resp;
                await next();
            },
        );
        console.log(`Graphql server listen to http://localhost:${port}`);
        await server.listen({ port });
    }

}
export default Remora;