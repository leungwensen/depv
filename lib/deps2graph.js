const _ = require('lodash');

const MAX_RADIUS = 80;
const MIN_RADIUS = 10;

function addNode(nodes, nodeById, id) {
  if (!nodeById[id]) {
    const node = {
      id,
      size: 1,
    };
    nodeById[id] = node;
    nodes.push(node);
  }
}
function fixId(id) {
  return id.replace(/^([./]+)?node_modules\//, '$');
}

module.exports = (deps) => {
  const nodes = [];
  const edges = [];
  const nodeById = {};

  _.forIn(deps, (ds, id) => {
    id = fixId(id);
    addNode(nodes, nodeById, id);
    ds.forEach((d) => {
      d = fixId(d);
      addNode(nodes, nodeById, d);
      edges.push({
        source: d,
        target: id,
      });
      nodeById[d].size += 1;
      nodeById[id].size += 1;
    });
  });

  const sizes = nodes.map(node => node.size);
  console.log(sizes);
  const maxSize = _.max(sizes);
  const minSize = _.min(sizes);
  const sizeRange = maxSize - minSize;
  const radiusRange = MAX_RADIUS - MIN_RADIUS;
  nodes.forEach((node) => {
    node.radius = (node.size - minSize + 1) * radiusRange / sizeRange + MIN_RADIUS;
  });

  return {
    nodes,
    edges,
    nodeById,
  };
};