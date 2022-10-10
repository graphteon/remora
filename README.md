# Remora
Simple GraphQl server with 3 line code.

## Project structure

```
your_remora_project/
├─ server.ts
├─ lambdas/
│  ├─ ExampleLambda/
│  │  ├─ schema.gql <-- GraphQL schema
│  │  ├─ query.ts <---- Query function here (optional)
│  │  ├─ mutation.ts <- Mutation function here (optional)
```

### `server.ts`

```typescript
import Remora from 'https://deno.land/x/remora/mod.ts';
const server = new Remora("./lambdas"); // import your lambda directory
await server.listen();
```

### `schema.gql`

```graphql
type Query {
    getExample(id: Int!): Example
    getExamples(topic: String): [Example]
},

type Example {
    id: Int
    title: String
    author: String
    description: String
    topic: String
    url: String
}
```

### `query.ts`

```typescript
var coursesData = [
    {
        id: 1,
        title: 'The Complete Node.js Developer Course',
        author: 'Andrew Mead, Rob Percival',
        description: 'Learn Node.js by building real-world applications with Node, Express, MongoDB, Mocha, and more!',
        topic: 'Node.js',
        url: 'https://codingthesmartway.com/courses/nodejs/'
    },
    {
        id: 2,
        title: 'Node.js, Express & MongoDB Dev to Deployment',
        author: 'Brad Traversy',
        description: 'Learn by example building & deploying real-world Node.js applications from absolute scratch',
        topic: 'Node.js',
        url: 'https://codingthesmartway.com/courses/nodejs-express-mongodb/'
    },
    {
        id: 3,
        title: 'JavaScript: Understanding The Weird Parts',
        author: 'Anthony Alicea',
        description: 'An advanced JavaScript course for everyone! Scope, closures, prototypes, this, build your own framework, and more.',
        topic: 'JavaScript',
        url: 'https://codingthesmartway.com/courses/understand-javascript/'
    }
]

export function getExample(args) {
    var id = args.id;
    return coursesData.filter(course => {
        return course.id == id;
    })[0];
}

export function getExamples(args) {
    if (args.topic) {
        var topic = args.topic;
        return coursesData.filter(course => course.topic === topic);
    } else {
        return coursesData;
    }
}
```