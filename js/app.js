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
        smooth: false
    },
    manipulation: {
        enabled: false,
        editNode: editNode,
        editEdge: editEdge,
        addEdge: addEdge
    }
};

var network = new vis.Network(container, data, options);
var curEdge;

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

network.on('deselectNode', function (event) {
    hidePopup('label-popup');
});

document.addEventListener('keydown', function (event) {
    if (event.key == 'Shift') {
        network.addEdgeMode();
    }
});
document.addEventListener('keyup', function (event) {
    if (event.key == 'Shift') {
        network.disableEditMode();
    }
});

document.addEventListener('keypress', function (event) {
    if (event.key == 'Enter') {
        hidePopup('label-popup');
        network.unselectAll();
    }
});

function editNode(data, callback) {
    var input = document.getElementById('label-input');
    input.value = data.label ? data.label : '';
    input.focus();
    showPopup('label-popup');

    input.oninput = function () {
        nodes.update({ id: network.getSelectedNodes()[0], label: input.value });
    };

    callback(data);
}

function addEdge(data, callback) {
    id = edges.update(data)[0];
    editEdge(id);
    callback(data);
}

function editEdge(data) {
    edge = edges.get(data);
    var input = document.getElementById('label-input');
    input.value = edge.label ? edge.label : '';
    input.focus();
    curEdge = data;
    showPopup('label-popup');

    input.oninput = function () {
        edges.update({ id: data, label: input.value });
    };
}

function showPopup(id) {
    var popup = document.getElementById(id);
    popup.classList.remove('is-hidden');
}

function hidePopup(id) {
    var popup = document.getElementById(id);
    popup.classList.add('is-hidden');
}

function deleteElement() {
    var node = network.getSelectedNodes()[0];

    if (node) {
        // Deleting node
        nodes.remove(node);
    } else {
        // Deleting edge
        edges.remove(curEdge);
        curEdge = undefined;
    }
    hidePopup('label-popup');
}