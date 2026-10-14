"""Ensure audit tooling reads instructions without treating offsets as literals."""
from pathlib import Path
import runpy, unittest

audit = runpy.run_path(str(Path(__file__).parents[1] / 'scripts/inspect-lua.py'))


class LuaInspectionTests(unittest.TestCase):
    def test_signed_jump_operand_is_not_a_constant_index(self):
        instruction = 32 | (131071 << 14)  # FORPREP targets next PC.
        self.assertEqual(audit['disassemble']({'code': [instruction], 'constants': []}),
                         ['0000 FORPREP A=0 target=1'])

    def test_calls_are_only_printed(self):
        fn = {'code': [28 | (1 << 23) | (1 << 14)], 'constants': []}
        self.assertEqual(audit['disassemble'](fn), ['0000 CALL A=0 B=1 C=1'])

    def test_unknown_opcode_rejected(self):
        with self.assertRaisesRegex(ValueError, 'Unknown opcode'):
            audit['disassemble']({'code': [63], 'constants': []})


if __name__ == '__main__':
    unittest.main()
