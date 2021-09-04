var penman = '';
var usedVariables = [];

// Assign variable to nodes as they are being inserted
nodes.on('add', function (event, properties, senderId) {
    const node_id = properties.items[0];
    const node = nodes.get(node_id);

    var curVariable = 0;
    while (usedVariables.includes('x' + curVariable)) {
        curVariable++;
    }
    node.variable = 'x' + curVariable;
    usedVariables.push('x' + curVariable);
});

// Update penman representation as graph is being manipulated
nodes.on('add', function (event, properties, senderId) {
    // A recently added node is always a graph root
    nodes.get(properties.items[0]).isRoot = true;
    // Number of edges pointing to this node
    nodes.get(properties.items[0]).numEdgesTarget = 0;
});

nodes.on('update', function (event, properties, senderId) {
    generatePenman();
});

nodes.on('remove', function (event, properties, senderId) {
    usedVariables.splice(usedVariables.indexOf(properties.oldData[0].variable), 1);
    generatePenman();
});

edges.on('add', function (event, properties, senderId) {
    var edge = edges.get(properties.items[0])
    const targetNode = nodes.get(edge.to)
    edge.targetCount = ++targetNode.numEdgesTarget; // Number of this edge regarding its target number
    generatePenman();
});

edges.on('update', function (event, properties, senderId) {
    generatePenman();
});

edges.on('remove', function (event, properties, senderId) {
    // When removing an edge, its corresponding targets are turned into graph roots
    var targetNode = nodes.get(properties.oldData[0].to);
    if (targetNode.numEdgesTarget == 1) { // Only if it had one parent
        targetNode.isRoot = true;
    }

    // Reorganize the edges count to allow the node to "jump" to other subgraphs it pertains
    targetNode.numEdgesTarget--;
    var numEdge = 0;
    edges.forEach(edge => {
        if (edge.to == targetNode.id) {
            edge.targetCount = ++numEdge;
        }
    });
    generatePenman();
});

// Penman writing functions
function generatePenman() {
    var penman = '';

    for (let index = 0; index < nodes.length; index++) {
        const node = nodes.get(nodes.getIds()[index]);
        
        // Write each graph (according to the roots provided -- nodes without any incoming edge)
        if (node.isRoot) {
            penman += recursivePenman(node.id) + '\n';
        }
    }
    document.getElementById('penman').textContent = penman;
}

// TODO: Deal with inverse relations (:ARGX-of, consist-of...)
function recursivePenman(rootId, level = 1) {
    curNode = nodes.get(rootId);

    if (!curNode) {
        return '';
    }

    var penman = writeNode(curNode);
    if (isTerminal(rootId)) {
        return penman + ')';
    } else {
        var subgraphPenman = '\n';
        for (let index = 0; index < edges.length; index++) {
            const edge = edges.get(edges.getIds()[index]);
            const targetNode = nodes.get(edge.to);
            
            // Direct relation
            if (edge.from == rootId && (edge.targetCount == 1 || targetNode.numEdgesTarget == 1)) {
                subgraphPenman += '\t'.repeat(level) + edge.label + ' ';

                if (edge.targetCount == 1) {
                    subgraphPenman += recursivePenman(edge.to, level + 1) + '\n';
                } else {
                    subgraphPenman += targetNode.variable + '\n';
                }
            }

            // Inverse relation
            if (edge.to == rootId && edge.targetCount > 1 && curNode.numEdgesTarget > 1) {
                subgraphPenman += '\t'.repeat(level) + edge.label + '-of' + ' ';
                subgraphPenman += recursivePenman(edge.from, level + 1) + '\n';
            }
        }
        // Assign that the current node is not a graph root
        curNode.isRoot = false;
        return penman + subgraphPenman.slice(0, -1) + ')';
    }
}

function writeNode(node) {
    var nodePenman = '';
    if (node.label) {
        if (!node.label.startsWith(node.variable[0]) & !isLabelConstant(node.label)) {
            // Update variable to match node label
            const preffix = node.label[0];
            var i = 0;
            while (usedVariables.includes(preffix + i)) {
                i++;
            }
            usedVariables.splice(usedVariables.indexOf(node.variable, 1));
            node.variable = preffix + i;
            usedVariables.push(preffix + i);
        }

        if (!isLabelConstant(node.label)) {
            // Concept
            nodePenman += '(' + node.variable + ' / ' + node.label;
        } else {
            // Constant
            nodePenman += node.label;
        }
    } else {
        nodePenman += '(undefined';
    }

    return nodePenman;
}

// Checks
function isLabelConstant(label) {
    return !label.match(/^[a-zA-Z]/);
}

function isTerminal(node) {
    for (let index = 0; index < edges.length; index++) {
        const edge = edges.get(edges.getIds()[index]);
        if (edge.from == node) {
            return false;
        } else if (edge.to == node){
            if (nodes.get(node).numEdgesTarget > 1 && nodes.get(edge.from).numEdgesTarget == 0 && edge.targetCount > 1){
                return false;
            }
        }
    }
    return true;
}