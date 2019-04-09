import csv 
import json 

def main():
    with open('data/io_registers.csv') as f:
        io_csv = csv.DictReader(f)
        with open('data/io_registers.json', 'w') as j:
            json.dump(list(io_csv), j, indent=2)

if __name__ == "__main__":
    main()