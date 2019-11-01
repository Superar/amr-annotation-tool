var nodes = new vis.DataSet([]);
var edges = new vis.DataSet([]);

var container = document.getElementById("canvas");
var data = {
    nodes: nodes,
    edges: edges
};

var options = {
    physics: false,
    manipulation: {
        enabled: false,
        editNode: editNode
    }
};

var network = new vis.Network(container, data, options);
var selectedNode;

network.on('doubleClick', function (event) {
    var x = event.pointer.canvas.x,
        y = event.pointer.canvas.y;
    var node = network.getNodeAt(event.pointer.DOM);
    if (!node) {
        ids = nodes.update({ x: x, y: y, label: "" });
        network.selectNodes(ids);
        network.editNode();
    } else {
        network.editNode();
    }
});

network.on('deselectNode', function (event) {
    var input = document.getElementById('txt-edit');
    input.style.visibility = 'hidden';
})

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
        var input = document.getElementById('txt-edit');
        input.disabled = true;
        input.style.visibility = 'hidden';
        network.unselectAll();
    }
});

function editNode(data, callback) {
    var input = document.getElementById('txt-edit');
    input.style.left = (data.x + 283) + 'px';
    input.style.top = (data.y + 200) + 'px';
    input.disabled = false;
    input.value = data.label ? data.label : "";
    input.style.width = ((input.value.length + 1) * 8) + 'px';
    input.style.visibility = 'visible';
    input.focus();

    selectedNode = data;
    input.oninput = function () {
        input.style.width = ((input.value.length + 1) * 6) + 'px';
        node = nodes.update({ id: network.getSelectedNodes()[0], label: input.value });
    };

    callback(data);
}
