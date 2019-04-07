import bs4
import csv

from collections import namedtuple

Result = namedtuple('Result', 'operands notation instructions')

def parse(soup: bs4.BeautifulSoup):
    all_tables = []
    for table in soup.findAll('table', {'class': 'TableGrid'}):
        tbody = table
        if tbody is None:
            print('no tbody')
            print(table)
            continue
        table = []
        for tr in tbody.findAll('tr'):
            row = []
            for td in tr.findAll('td'):
                row.append(td.text)
            table.append(row)
        all_tables.append(table)
    # print(all_tables[2:])

    instructions = []
    columns = ('command', 'operands', 'operation', 'description', 'flags', 'cycles', 'opcode', 'example')

    for t in all_tables[2:]:
        for i, r in enumerate(t):
            if 'Mnemonic' in r[0]:
                continue 
            if len(r) < 8:
                r.append(t[i-1][7])
            r[:-1] = (x.strip() for x in r[:-1])
            r[-1] = r[-1].strip('\r\n')
            for f in (2, 3, 6):
                r[f] = ' '.join(r[f].split())
            assert len(r) == 8
            instructions.append(dict(zip(columns, r)))

    operands = [] 
    op_names = ('operand', 'meaning', 'values', 'pattern')
    for r in all_tables[0]:
        if 'Operand' in r[0]:
            continue 
        for f in range(len(r)):
            r[f] = ' '.join(r[f].split())
        if len(r) < 4:
            for i, x in enumerate(r):
                operands[-1][i+2] += ('\n'+x)
        else:
            operands.append(r)
    operands = [dict(zip(op_names, op)) for op in operands]

    notation = [] 
    not_names = ('notation', 'meaning')
    for r in all_tables[1]:
        if 'Operation' in r[0]:
            continue 
        for f in range(len(r)):
            r[f] = ' '.join(r[f].split())
        notation.append(dict(zip(not_names, r)))
        
            
    return operands, notation , instructions
    pass 

if __name__ == "__main__":
    import os 
    os.chdir(os.path.dirname(__file__))

    path = './'
    with open(path+'isa_raw.htm') as f:
        ops, nots, items = parse(bs4.BeautifulSoup(f.read()))

    import json
    with open(path+'instructions.json', 'w') as f:
        json.dump(items, f, indent=2)
    with open(path+'operands.json', 'w') as f:
        json.dump(ops, f, indent=2)
    with open(path+'notations.json', 'w') as f:
        json.dump(nots, f, indent=2)