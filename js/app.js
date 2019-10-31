var nodes = new vis.DataSet([]);
var edges = new vis.DataSet([]);

var container = document.getElementById("canvas");
var data = {
    nodes: nodes,
    edges: edges
};

var options = {
    physics: false
};

var network = new vis.Network(container, data, options);

network.on('doubleClick', function (event) {
    var x = event.pointer.canvas.x,
        y = event.pointer.canvas.y;
    nodes.update({ x: x, y: y });
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