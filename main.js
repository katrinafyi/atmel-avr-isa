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

  // === Instructions table ===
  let instOptions = {
    valueNames: ['command', 'operands', 'operation', 'description', 'flags', 'cycles', 'opcode', 'example'],
  };
  instOptions['item'] = makeRowTemplate(instOptions.valueNames);
  let instList = new List('instructions', instOptions);

  let searchCmdBox = document.querySelector('input.search-command');
  searchCmdBox.addEventListener('input', _.debounce(
    ev => instList.search(searchCmdBox.value, ['command']), 
  100));

  fetch('instructions.json')
  .then(resp => resp.json())
  .then(json => instList.add(json));

  // === Operands table ===
  let opsOptions = {
    valueNames: ['operand', 'meaning', 'values', 'pattern']
  };
  opsOptions['item'] = makeRowTemplate(opsOptions.valueNames);
  let opsList = new List('operands', opsOptions);

  fetch('operands.json')
  .then(resp => resp.json())
  .then(json => opsList.add(json));

  // === Notations table ===
  let notationOptions = {
    valueNames: ['notation', 'meaning']
  };
  notationOptions['item'] = makeRowTemplate(notationOptions.valueNames);
  let notationList = new List('notations', notationOptions);

  fetch('notations.json')
  .then(resp => resp.json())
  .then(json => notationList.add(json));


  // Select instructions tab
  hideAllTabs();
  showTab(document.querySelector('.tab-link[data-tab=instructions]'));
}

window.addEventListener('load', main);