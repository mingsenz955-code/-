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
 def test_bytecode_calls_are_never_executed(self):
  with self.assertRaisesRegex(ValueError,'Non-literal opcode'):reader['evaluate_literal']({'code':[28],'constants':[]})
 def test_bytecode_literal_strings_can_be_concatenated_without_calls(self):
  # LOADK r0 k0; LOADK r1 k1; CONCAT r0 r0 r1; RETURN r0.
  code=[1,1|(1<<6)|(1<<14),21|(1<<14),30|(2<<23)]
  self.assertEqual(reader['evaluate_literal']({'code':code,'constants':['#ui_','evolution.png']}),'#ui_evolution.png')
  with self.assertRaisesRegex(ValueError,'Non-string literal'):
   reader['evaluate_literal']({'code':code,'constants':['#ui_',{}]})
if __name__=='__main__':unittest.main()
