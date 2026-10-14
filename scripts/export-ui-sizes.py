"""Export original atlas dimensions used where source layouts omit control size."""
from pathlib import Path
import json
ROOT=Path(__file__).resolve().parents[1]
manifest=json.loads((ROOT/'assets/original/manifest.json').read_text(encoding='utf8'))
sizes={key[3:]:[value['width'],value['height']] for key,value in manifest['assets'].items() if key.startswith('ui/') and 'width' in value and 'height' in value}
(ROOT/'assets/original/data/ui-sizes.mjs').write_bytes(('export default '+json.dumps(sizes,separators=(',',':'))+';\n').encode('utf8'))
print('Exported',len(sizes),'source image dimensions')
