import Remora from '../mod.ts';

/*

TEST QUERY

{
  getExamples(topic:"JavaScript") {
    id
    title
    author
    description
    topic
    url
  }
  getExample(id:2){
    id
    title
    author
    description
  }
}
*/

const server = new Remora("./lambdas");
await server.listen();