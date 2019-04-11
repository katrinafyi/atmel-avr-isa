function main() {
  const qs = document.querySelector.bind(document);
  const qsa = document.querySelectorAll.bind(document);

  const getTab = el => document.querySelector('#'+el.dataset.tab);
  const showTab = el => {
    el.classList.add('selected');
    getTab(el).classList.remove('hidden');
    window.location.hash = '_'+el.dataset.tab;
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
    row['_command'] = c;
    row['command'] = `<a target="_blank" href="https://www.microchip.com/webdoc/avrassembler/avrassembler.wb_${c}.html">${c}</a>`;
    row['example'] = '<pre>'+row['example']+'</pre>';
    return row;
  };

  const replaceLineBreaks = row => {
    Object.keys(row).forEach(key => row[key] = row[key].replace(/\n/g, '<br>'));
    return row;
  };

  const tables = {
    instructions: {
      columns: ['_command', 'command', 'operands', 'operation', 'description', 'flags', 'cycles', 'opcode', 'example'],
      processRow: processInstRow,
    },
    operands: {
      columns: ['operand', 'meaning', 'values', 'pattern'],
      processRow: replaceLineBreaks,
    },
    notations: {
      columns: ['notation', 'meaning'],
      processRow: replaceLineBreaks,
    },
    io_registers: {
      columns: ['register', 'address', 'name', 'bit7', 'bit6', 'bit5', 'bit4', 'bit3', 'bit2', 'bit1', 'bit0']
    }
  };

  const escapeRow = row => {
    Object.keys(row).forEach(key => row[key] = _.escape(row[key]));
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

  // Search functionality.

  const searchCmdBox = document.querySelector('input.search-command');
  searchCmdBox.addEventListener('input', _.debounce(
    ev => listObjects[0].search(searchCmdBox.value, ['_command']), 
  100));
  const searchAllBox = document.querySelector('input.search-all');
  searchAllBox.addEventListener('input', _.debounce(
    ev => listObjects[0].search(searchAllBox.value, 
      tables['instructions'].columns.filter(x => x !== 'command')
  ), 100));

  // Answer checker
  const responseBox = qs('textarea#responses');
  const answerBox = qs('textarea#answers');

  const responseRow = qs('tr.responses');
  const answerRow = qs('tr.answers');
  const percent = qs('.percent');

  const parseText = text => 
    text.split(/[,\s]/).map(r => /^[a-ex.]$/i.exec(r))
      .filter(x => x).map(x => x[0]).flat(1).map(x => x.toUpperCase());
  
  const checkAnswers = () => {
    const resp = parseText(responseBox.value);
    const ans = parseText(answerBox.value);

    if (resp.length != ans.length) {
      alert(`${resp.length} responses provided but there were ${ans.length} answers.`);
      return;
    }

    const matches = resp.map((x, i) => ans[i] === x);
    
    const letterClass = correct => correct ? 'correct' : 'incorrect' 
    const makeRow = r => r.map(
      (x, i) => `<td class="${letterClass(matches[i])}">${x}</td>`)
      .join('');
    const respRowHTML = makeRow(resp);
    const ansRowHTML = makeRow(ans)
    responseRow.innerHTML = respRowHTML;
    answerRow.innerHTML = ansRowHTML;

    n = matches.filter(x => x).length;
    N = resp.length;
    p = Math.floor(n/N*100);
    percent.textContent = `${n} / ${N} = ${p}%`;
    qs('.results').classList.remove('hidden');
  };

  qs('#check').addEventListener('click', checkAnswers);

  // Select appropriate tab
  hideAllTabs();
  let selected;
  if (window.location.hash) {
    selected = window.location.hash.replace('#_', '');
  } else {
    selected = 'instructions';
  }
  showTab(qs(`.tab-link[data-tab=${selected}]`));
}

window.addEventListener('DOMContentLoaded', main);