import json 
import urllib.request
import bs4

import inspect

hardcoded = {
    'BRLT': '''cpi r19,$8 ; compare r19 with $8
brlt label ; branch if r19 < $8
           ; (signed)''',
    'BRMI': '''subi r18, 4 ; subtract 4 from r18
brmi label ; branch if result
           ; negative'''
}

def main():
    URL = 'https://www.microchip.com/webdoc/avrassembler/avrassembler.wb_{}.html'
    with open('./data/instructions.json') as f:
        data = json.load(f)
    for i, cmd in enumerate(data):
        if cmd['command'] in hardcoded:
            print('hardcoded', cmd['command'])
            cmd['example'] = hardcoded[cmd['command']]
            continue
        print(URL.format(cmd['command']))
        with urllib.request.urlopen(urllib.request.Request(URL.format(cmd['command']), headers={'User-Agent': 'Mozilla'})) as url:
            soup = bs4.BeautifulSoup(url.read())
            try:
                example = (soup.find('pre', {'class': 'programlisting'}).text)
            except AttributeError:
                print('missing', cmd['command'])
                continue
                example = ''
            cmd['example'] = example
    for cmd in data:
        cmd['example'] = inspect.cleandoc(cmd['example'])
    with open('./data/instructions.json', 'w') as f:
        json.dump(data, f, indent=2)


if __name__ == "__main__":
    main()