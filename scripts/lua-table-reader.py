"""Safe reader for Lua 5.1 constant table bytecode.
Only literal table construction opcodes are accepted. No Lua functions, libraries,
network operations, original game logic, or native code can run through this reader.
"""
from pathlib import Path
import struct,json,collections,re
ROOT=Path(__file__).resolve().parents[1]
class Reader:
 def __init__(self,data):self.data=data;self.pos=0
 def take(self,n):v=self.data[self.pos:self.pos+n];self.pos+=n;return v
 def integer(self):return struct.unpack('<I',self.take(4))[0]
 def string(self):n=self.integer();return self.take(n)[:-1].decode('utf8') if n else None
 def function(self):
  source=self.string();self.take(8);flags=self.take(4);code=[self.integer() for _ in range(self.integer())];constants=[]
  for _ in range(self.integer()):
   tag=self.take(1)[0]
   if tag==0:constants.append(None)
   elif tag==1:constants.append(bool(self.take(1)[0]))
   elif tag==3:
    v=struct.unpack('<d',self.take(8))[0];constants.append(int(v) if v.is_integer() else v)
   elif tag==4:constants.append(self.string())
   else:raise ValueError('Unsupported constant '+str(tag))
  nested=[self.function() for _ in range(self.integer())];self.take(self.integer()*4)
  for _ in range(self.integer()):self.string();self.take(8)
  for _ in range(self.integer()):self.string()
  return {'source':source,'code':code,'constants':constants,'nested':nested}
def parse(path):
 reader=Reader(path.read_bytes());header=reader.take(12)
 if header!=b'\x1bLua\x51\x00\x01\x04\x04\x04\x08\x00':raise ValueError('Unsupported Lua format')
 return reader.function()
def evaluate_literal(fn):
 regs={};constants=fn['constants'];code=fn['code'];pc=0;top=0
 def rk(v):return constants[v&255] if v&256 else regs.get(v)
 while pc<len(code):
  inst=code[pc];pc+=1;op=inst&63;a=(inst>>6)&255;c=(inst>>14)&511;b=(inst>>23)&511;bx=inst>>14
  if op==0:regs[a]=regs.get(b);top=max(top,a+1)
  elif op==1:regs[a]=constants[bx];top=max(top,a+1)
  elif op==2:regs[a]=bool(b);top=max(top,a+1);pc+=1 if c else 0
  elif op==3:
   for i in range(a,b+1):regs[i]=None
   top=max(top,b+1)
  elif op==10:regs[a]={};top=max(top,a+1)
  elif op==21:
   # Lua CONCAT used by literal layouts to join fixed texture name prefixes.
   # Accept strings only: never resolve globals, invoke metamethods or coerce
   # objects/numbers using unknown runtime behavior.
   parts=[regs.get(i) for i in range(b,c+1)]
   if not parts or not all(isinstance(v,str) for v in parts):raise ValueError('Non-string literal concatenation')
   result=''.join(parts)
   if len(result)>1000000:raise ValueError('Literal string too large')
   regs[a]=result;top=max(top,a+1)
  elif op==9:
   if not isinstance(regs.get(a),dict):raise ValueError('SETTABLE target not literal')
   regs[a][rk(b)]=rk(c)
  elif op==34:
   if c==0:c=code[pc];pc+=1
   count=b or top-a-1;offset=(c-1)*50
   for i in range(1,count+1):regs[a][offset+i]=regs.get(a+i)
   top=a+1
  elif op==30:
   if b!=2:raise ValueError('Expected one literal return')
   return regs.get(a)
  else:raise ValueError('Non-literal opcode %d at instruction %d'%(op,pc-1))
 raise ValueError('No literal return')
def normalize(value):
 if isinstance(value,dict):
  if value and all(isinstance(k,int) for k in value) and sorted(value)==list(range(1,len(value)+1)):return [normalize(value[k]) for k in range(1,len(value)+1)]
  return {str(k):normalize(v) for k,v in value.items()}
 return value
def evaluate_text_literal(text):
 pattern=re.compile(r'''\s+|--\[\[.*?\]\]|--[^\r\n]*|\[\[.*?\]\]|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|(?:0x[0-9a-fA-F]+|\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)|[A-Za-z_][A-Za-z_0-9]*|[{}\[\],;=+*/()\-]''',re.S)
 tokens=[];pos=0
 for m in pattern.finditer(text):
  if text[pos:m.start()].strip():raise ValueError('Non-literal text token')
  token=m.group();pos=m.end()
  if not token.isspace() and not token.startswith('--'):tokens.append(token)
 if text[pos:].strip():raise ValueError('Trailing non-literal text')
 index=0
 def peek(offset=0):return tokens[index+offset] if index+offset<len(tokens) else None
 def consume(expected=None):
  nonlocal index
  value=peek()
  if expected is not None and value!=expected:raise ValueError('Expected '+expected)
  index+=1;return value
 def atom():
  token=consume()
  if token in ['+','-']:return atom()*(1 if token=='+' else -1)
  if token=='(':result=value();consume(')');return result
  if token=='{':
   table={};array_index=1
   while peek()!='}':
    if peek()=='[':consume();key=value();consume(']');consume('=');table[key]=value()
    elif peek(1)=='=':key=consume();consume('=');table[key]=value()
    else:table[array_index]=value();array_index+=1
    if peek() in [',',';']:consume()
    elif peek()!='}':raise ValueError('Expected table separator')
   consume('}');return table
  if token=='nil':return None
  if token in ['true','false']:return token=='true'
  if token and token.startswith('[['):return token[2:-2]
  if token and token[0] in ['"',"'"]:
   raw=token[1:-1];result='';i=0;esc={'a':'\a','b':'\b','f':'\f','n':'\n','r':'\r','t':'\t','v':'\v'}
   while i<len(raw):
    if raw[i]!='\\':result+=raw[i];i+=1;continue
    i+=1
    if i>=len(raw):raise ValueError('Invalid string escape')
    m=re.match(r'\d{1,3}',raw[i:])
    if m:result+=chr(int(m.group()));i+=len(m.group())
    else:result+=esc.get(raw[i],raw[i]);i+=1
   return result
  if token and re.fullmatch(r'-?0x[0-9a-fA-F]+',token):return int(token,16)
  if token and re.fullmatch(r'-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?',token):
   result=float(token);return int(result) if result.is_integer() else result
  raise ValueError('Non-literal value '+str(token))
 def product():
  result=atom()
  while peek() in ['*','/']:
   op=consume();rhs=atom()
   if not isinstance(result,(int,float)) or not isinstance(rhs,(int,float)):raise ValueError('Non-numeric constant expression')
   result=result*rhs if op=='*' else result/rhs
  return result
 def value():
  result=product()
  while peek() in ['+','-']:
   op=consume();rhs=product()
   if not isinstance(result,(int,float)) or not isinstance(rhs,(int,float)):raise ValueError('Non-numeric constant expression')
   result=result+rhs if op=='+' else result-rhs
  return result
 variable=None
 if peek()=='local':consume();variable=consume();consume('=')
 else:consume('return')
 result=value()
 if variable:consume('return');consume(variable)
 if index!=len(tokens):raise ValueError('Additional code after literal')
 return result
if __name__=='__main__':
 out=ROOT/'work/config-json';out.mkdir(parents=True,exist_ok=True);report=[]
 for path in sorted((ROOT/'work/client-config/pcf').glob('*.lua')):
  try:
   raw=path.read_bytes();literal=evaluate_literal(parse(path)) if raw.startswith(b'\x1bLua') else evaluate_text_literal(raw.decode('utf-8-sig'));value=normalize(literal);(out/(path.stem+'.json')).write_text(json.dumps(value,ensure_ascii=False,indent=2),encoding='utf8');report.append({'file':path.name,'status':'literal-table-read','rows':len(value) if isinstance(value,(list,dict)) else 0})
  except Exception as e:report.append({'file':path.name,'status':'not-converted','reason':str(e)})
 (ROOT/'docs/reference/config-table-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
 print('Literal tables converted:',sum(x['status']=='literal-table-read' for x in report),'of',len(report))
 print('Unconverted:',[(x['file'],x.get('reason')) for x in report if x['status']!='literal-table-read'][:12])

