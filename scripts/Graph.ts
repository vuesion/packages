// tslint:disable-next-line:prefer-for-of

import { getPackages, IPackage } from './Packages';

export interface INode {
  name: string;
  edges: INode[];
}

export class Graph {
  private cb: any;
  public graph: INode[] = [];

  private resolve(node: INode, visited: any) {
    if (!visited[node.name]) {
      visited[node.name] = true;

      node.edges.forEach(async (edge: INode) => {
        this.resolve(edge, visited);
      });

      this.cb(node);
    }
  }

  public addNode(node: INode) {
    this.graph.push(node);
  }

  public walk(cb: any) {
    this.cb = cb;
    const visited = {};

    this.graph.forEach((node) => this.resolve(node, visited));
  }
}

const packages = getPackages();
const graph = new Graph();

packages.forEach((p: IPackage) =>
  graph.addNode({ name: p.name, edges: p.graphDeps.map((dep: string) => ({ name: dep, edges: [] })) }),
);

export const getGraph = () => {
  return graph;
};
