"""Read Lua 5.1 instructions as data; never interpret or execute the program."""
from pathlib import Path
import argparse, hashlib, json, runpy

READER = runpy.run_path(str(Path(__file__).with_name('lua-table-reader.py')))
OPS = 'MOVE LOADK LOADBOOL LOADNIL GETUPVAL GETGLOBAL GETTABLE SETGLOBAL SETUPVAL SETTABLE NEWTABLE SELF ADD SUB MUL DIV MOD POW UNM NOT LEN CONCAT JMP EQ LT LE TEST TESTSET CALL TAILCALL RETURN FORLOOP FORPREP TFORLOOP SETLIST CLOSE CLOSURE VARARG'.split()


def disassemble(fn):
    constants = fn['constants']
    def rk(value):
        return json.dumps(constants[value - 256], ensure_ascii=False) if value >= 256 else f'r{value}'
    lines = []
    for pc, instruction in enumerate(fn['code']):
        op = instruction & 63
        a, b, c, bx = (instruction >> 6) & 255, (instruction >> 23) & 511, (instruction >> 14) & 511, instruction >> 14
        if op >= len(OPS):
            raise ValueError(f'Unknown opcode at {pc}')
        # Only these operands are RK references. Numeric counts/offsets must
        # never be decoded as constant indexes (e.g. FORPREP's signed jump).
        args = f'A={a} B={b} C={c}'
        if op in [1, 5, 7]:
            args = f'r{a} {json.dumps(constants[bx], ensure_ascii=False)}'
        elif op == 6:
            args = f'r{a} r{b}[{rk(c)}]'
        elif op == 9:
            args = f'r{a}[{rk(b)}] {rk(c)}'
        elif op == 11:
            args = f'r{a} self=r{b} method={rk(c)}'
        elif op in range(12, 18):
            args = f'r{a} {rk(b)} {rk(c)}'
        elif op in [23, 24, 25]:
            args = f'A={a} {rk(b)} {rk(c)}'
        elif op in [22, 31, 32]:
            args = f'A={a} target={pc + 1 + bx - 131071}'
        elif op == 36:
            args = f'r{a} nested={bx}'
        lines.append(f'{pc:04d} {OPS[op]} {args}')
    return lines


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('path', type=Path)
    parser.add_argument('--function', type=int, action='append', default=[])
    parser.add_argument('--output', type=Path)
    args = parser.parse_args()
    fn = READER['parse'](args.path)
    result = [f'SHA256 {hashlib.sha256(args.path.read_bytes()).hexdigest()}',
              'Static Lua 5.1 disassembly. PCs and nested function indexes are zero-based. No code executed.']
    if args.function:
        for index in args.function:
            child = fn['nested'][index]
            result.extend([f'\nFUNCTION {index}', 'CONSTANTS ' + json.dumps(child['constants'], ensure_ascii=False), *disassemble(child)])
    else:
        for index, child in enumerate(fn['nested']):
            result.append(f'{index}: {len(child["code"])} instructions; constants={json.dumps(child["constants"], ensure_ascii=False)}')
    text = '\n'.join(result) + '\n'
    if args.output:
        args.output.write_bytes(text.encode('utf8'))
    else:
        print(text)


if __name__ == '__main__':
    main()
