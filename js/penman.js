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
});

nodes.on('update', function (event, properties, senderId) {
    generatePenman();
});

nodes.on('remove', function (event, properties, senderId) {
    usedVariables.splice(usedVariables.indexOf(properties.oldData[0].variable), 1);
    generatePenman();
});

edges.on('add', function (event, properties, senderId) {
    generatePenman();
});

edges.on('update', function (event, properties, senderId) {
    generatePenman();
});

edges.on('remove', function (event, properties, senderId) {
    // When removing an edge, its corresponding targets are turned into graph roots
    nodes.get(properties.oldData[0].to).isRoot = true;
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

// TODO: Deal with reentrancies
function recursivePenman(rootId, level = 1) {
    curNode = nodes.get(rootId);

    if (!curNode) {
        return '';
    }

    var penman = writeNode(curNode);
    if (isTerminal(rootId)) {
        return penman + ')';
    } else {
        var subgraphPenman = '';
        for (let index = 0; index < edges.length; index++) {
            const edge = edges.get(edges.getIds()[index]);
            if (edge.from == rootId) {
                subgraphPenman += '\t'.repeat(level) + edge.label + ' ';
                subgraphPenman += recursivePenman(edge.to, level + 1) + '\n';
            }
        }
        // Assign that the current node is not a graph root
        curNode.isRoot = false;
        return penman + '\n' + subgraphPenman.slice(0, -1) + ')';
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
        }
    }
    return true;
}