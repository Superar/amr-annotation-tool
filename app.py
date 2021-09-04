from flask import Flask, render_template, request, jsonify

from amr.amr import AMR

app = Flask(__name__)


@app.route('/')
def index():  # put application's code here
    return render_template('index.html')


@app.route('/read_penman', methods=['GET'])
def read_penman():
    data = {'text': request.args.get('text')}
    text = data['text'].split('\n')
    cur_amr = AMR.get_amr_line(text)
    amr = AMR.parse_AMR_line(cur_amr)
    amr.rename_node('a')
    instances, attributes, relations = amr.get_triples()
    _remove_top_attribute(attributes)
    print(relations)
    print(attributes)
    graph = _create_graph(instances, attributes, relations)
    # data = {'inst': instances, 'rel': relations, 'attr': attributes}
    return jsonify({'graph': graph})


def _remove_top_attribute(attributes):
    idx = [y[0] for y in attributes].index('TOP')
    del attributes[idx]


def _get_nodes(instances, node):
    return [nd for _, var, nd in instances if node == var][0]


def _create_graph(instances, attributes, relations):
    ls = []
    for relation, in_node, ou_node in relations:
        node_in = _get_nodes(instances, in_node)
        node_ou = _get_nodes(instances, ou_node)
        ls.append((relation, node_in, node_ou))
    for attribute, in_node, ou_node in attributes:
        node_in = _get_nodes(instances, in_node)
        try:
            node = int(ou_node)
            ls.append((attribute, node_in, node))
        except ValueError:
            ls.append((attribute, node_in, '"'+ou_node.replace('_','')+'"'))
    return ls


@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404


if __name__ == '__main__':
    app.run()
