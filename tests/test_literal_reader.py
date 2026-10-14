"""Regression checks for the static reader's execution boundary."""
from pathlib import Path
import runpy,unittest
reader=runpy.run_path(str(Path(__file__).parents[1]/'scripts/lua-table-reader.py'))
class LiteralReaderTests(unittest.TestCase):
 def test_table_and_numeric_layout_expression(self):
  value=reader['normalize'](reader['evaluate_text_literal']('local layout = { width=500+150, x=-4, color=0xffffffff, items={1,nil,3} } return layout'))
  self.assertEqual(value,{'width':650,'x':-4,'color':4294967295,'items':[1,None,3]})
 def test_rejects_global_calls_and_trailing_statements(self):
  for text in ['return os.execute("x")','return {x=function() end}','return {} print("x")','return {x=unknownName}']:
   with self.assertRaises(ValueError):reader['evaluate_text_literal'](text)
 def test_literal_local_colors_and_layout_are_data_only(self):
  result=reader['normalize'](reader['evaluate_text_literal']('local color=0xffffffff local border=0xff000000 local layout={children={{color=color,outlineColor=border}}} return layout'))
  self.assertEqual(result,{'children':[{'color':4294967295,'outlineColor':4278190080}]})
 def test_locals_cannot_call_mutate_redeclare_or_reference_globals(self):
  for text in ['local a=os.execute("x") return a','local a={} a.x=1 return a','local a=1 local a=2 return a','local a=unknown return a','local a={} return a print("x")','local a=1 return function() end']:
   with self.assertRaises(ValueError):reader['evaluate_text_literal'](text)
 def test_literal_local_table_indexes_are_static_values(self):
  result=reader['normalize'](reader['evaluate_text_literal']('local ys={60,-50,-180} local layout={y=ys[2],first=ys[1]} return layout'))
  self.assertEqual(result,{'y':-50,'first':60})
 def test_literal_table_index_cannot_lookup_globals_call_or_mutate(self):
  for text in ['local a={1} return a[unknown]','local a={1} return a[2]','local a={1} a[1]=2 return a','local a={1} return a[os.execute("x")]','local a={1} return a[1]()']:
   with self.assertRaises(ValueError):reader['evaluate_text_literal'](text)
 def test_one_explicit_source_typo_does_not_enable_other_identifiers(self):
  read=reader['evaluate_text_literal'];allow=frozenset({'juqing018'})
  self.assertEqual(reader['normalize'](read('return {juqing018,nil,true,false}',allowed_bare_identifiers=allow)),['juqing018',None,True,False])
  for text in ['return {otherName}','local a=unknown return a','return juqing018()']:
   with self.assertRaises(ValueError):read(text,allowed_bare_identifiers=allow)
 def test_bytecode_calls_are_never_executed(self):
  with self.assertRaisesRegex(ValueError,'Non-literal opcode'):reader['evaluate_literal']({'code':[28],'constants':[]})
 def test_bytecode_literal_strings_can_be_concatenated_without_calls(self):
  # LOADK r0 k0; LOADK r1 k1; CONCAT r0 r0 r1; RETURN r0.
  code=[1,1|(1<<6)|(1<<14),21|(1<<14),30|(2<<23)]
  self.assertEqual(reader['evaluate_literal']({'code':code,'constants':['#ui_','evolution.png']}),'#ui_evolution.png')
  with self.assertRaisesRegex(ValueError,'Non-string literal'):
   reader['evaluate_literal']({'code':code,'constants':['#ui_',{}]})
if __name__=='__main__':unittest.main()
