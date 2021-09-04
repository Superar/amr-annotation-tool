var nodes = new vis.DataSet([]);
var edges = new vis.DataSet([]);

var container = document.getElementById("canvas");
var data = {
    nodes: nodes,
    edges: edges
};

var options = {
    physics: false,
    edges: {
        smooth: false,
        arrows: {
            to: {
                enabled: true
            }
        }
    },
    manipulation: {
        enabled: true,
        editNode: editNode,
        editEdge: editEdge,
        addEdge: addEdge
    }
};

var network = new vis.Network(container, data, options);


/** KEYBINDS DEFINITIONS **/

// Edit edges/nodes or add nodes
network.on('doubleClick', function (event) {
    var x = event.pointer.canvas.x,
        y = event.pointer.canvas.y;
    var node = network.getNodeAt(event.pointer.DOM);
    var edge = network.getEdgeAt(event.pointer.DOM);
    if (node) {
        network.editNode();
    } else if (edge) {
        editEdge(edge);
    } else {
        ids = nodes.update({ x: x, y: y, label: "" });
        network.selectNodes(ids);
        network.editNode();
    }
});

// Enter to finish editing
document.addEventListener('keypress', function (event) {
    if (event.key == 'Enter') {
        hidePopup('label-popup');
    }
});

// Delete to erase an node/edge
// F2 to add an edge
document.addEventListener('keydown', function (event) {
    if (event.key == 'Delete') {
        deleteElement();
    } else if (event.key == 'F2') {
        network.addEdgeMode();
    }
});


/** GRAPH MANIPULATION **/

// Add
function addEdge(data, callback) {
    id = edges.update(data)[0];
    editEdge(id);
    callback(data);
}


// Edit
function editNode(data, callback) {
    var input = document.getElementById('label-input');
    input.value = data.label ? data.label : '';
    showPopup('label-popup');
    input.focus();

    input.oninput = function () {
        nodes.update({ id: network.getSelectedNodes()[0], label: input.value });
    };

    callback(data);
}

function editEdge(data) {
    edge = edges.get(data);
    network.selectEdges([data])

    var input = document.getElementById('label-input');
    input.value = edge.label ? edge.label : '';
    showPopup('label-popup');
    input.focus();

    input.oninput = function () {
        edges.update({ id: data, label: input.value });
    };
}

// Delete
function deleteElement() {
    var node = network.getSelectedNodes()[0];
    var edge = network.getSelectedEdges()[0];

    if (node) {
        // Deleting node
        nodes.remove(node);
    } else if (edge){
        // Deleting edge
        edges.remove(edge);
    }
    hidePopup('label-popup');
}

// If a node is deleted, delete all edges linked to it
nodes.on('remove', function (event, properties, senderId) {
    const node = properties.oldData[0].id;
    var edgesToRemove = [];
    edges.forEach(edge => {
        if (edge.from == node || edge.to == node) {
            edgesToRemove.push(edge.id)
        }
    });
    edges.remove(edgesToRemove);
});

/** POPUP CONTROL **/

function showPopup(id) {
    var popup = document.getElementById(id);
    popup.classList.remove('is-hidden');
}

function hidePopup(id) {
    var popup = document.getElementById(id);
    popup.classList.add('is-hidden');
    network.unselectAll();
}

network.on('deselectNode', function (event) {
    hidePopup('label-popup');
});
