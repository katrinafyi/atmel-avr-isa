import csv 
import json
import re
from collections import defaultdict

def parse(text):
    reader = csv.reader(text)
    data = defaultdict(lambda: defaultdict(list))
    for x in reader:
        if re.match(r'\d+\. ', x[0]):
            # print('new section', x)
            timer = data[x[0].strip()]
        elif re.match(r'Table |\d+\.\d+\.', x[0]):
            name = ' '.join(x).strip()
            table = timer[name]
        elif all(not a for a in x):
            pass
        elif not x[0] and not x[1] and x[2]:
            table[-1][2] += '\n' + x[2]
        else:
            if not table:
                table_len = max(i for i in range(len(x)) if x[i])
            table.append(x[:table_len+1])
    return data

if __name__ == "__main__":
    with open('timers.csv', encoding='utf-8', newline='') as f:
        print(json.dumps(parse(f), indent=2))