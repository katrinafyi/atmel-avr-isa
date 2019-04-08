function main() {
  const getTab = el => document.querySelector('#'+el.dataset.tab);
  const showTab = el => {
    el.classList.add('selected');
    getTab(el).classList.remove('hidden');
  };
  const hideTab = el => {
    el.classList.remove('selected');
    getTab(el).classList.add('hidden');
  };

  const tabLinks = document.querySelectorAll('.tab-link');

  const hideAllTabs = () => tabLinks.forEach(hideTab);

  tabLinks.forEach(el => el.addEventListener('click',
    () => {
      hideAllTabs();
      showTab(el);
  }));

  const makeRowTemplate = (columns) => '<tr>' + columns.map(x => `<td class="${x}"></td>`).join(' ') + '</tr>';

  const processInstRow = row => {
    const c = row['command'];
    row['command'] = `<a target="_blank" href="https://www.microchip.com/webdoc/avrassembler/avrassembler.wb_${c}.html">${c}</a>`;
    row['example'] = '<pre>'+row['example'].replace('\n', '<br>')+'</pre>';
    return row;
  };

  const tables = {
    instructions: {
      columns: ['_command', 'command', 'operands', 'operation', 'description', 'flags', 'cycles', 'opcode', 'example'],
      processRow: processInstRow,
    },
    operands: {
      columns: ['operand', 'meaning', 'values', 'pattern']
    },
    notations: {
      columns: ['notation', 'meaning']
    }
  };

  const escapeRow = row => {
    Object.keys(row).forEach(key => row[key] = _.escape(row[key]));
    row._command = row['command'];
    return row;
  };

  const listObjects = Object.keys(tables).map(t => {
    const columns = tables[t].columns;
    const options = {
      valueNames: columns,
      item: makeRowTemplate(columns),
    };
    const list = new List(t, options);

    const process = tables[t].processRow || _.identity;
    fetch(`data/${t}.json`)
    .then(resp => resp.json())
    .then(json => list.add(json.map(escapeRow).map(process)));

    return list;
  });

  let searchCmdBox = document.querySelector('input.search-command');
  searchCmdBox.addEventListener('input', _.debounce(
    ev => listObjects[0].search(searchCmdBox.value, ['_command']), 
  100));

  // Select instructions tab
  hideAllTabs();
  showTab(document.querySelector('.tab-link[data-tab=instructions]'));
}

window.addEventListener('DOMContentLoaded', main);