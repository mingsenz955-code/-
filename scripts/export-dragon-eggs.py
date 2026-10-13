"""Associate source egg thumbnails by source dragon base name or unique original ID."""
from pathlib import Path
import json
ROOT=Path(__file__).resolve().parents[1]
catalog=json.loads((ROOT/'assets/original/catalog.json').read_text(encoding='utf8'))
eggs={}
for d in catalog:
    image=ROOT/f"assets/original/ui/thumbs_egg_{d['base']}_0.png"
    if not image.exists():
        matches=list((ROOT/'assets/original/ui').glob(f"thumbs_egg_{d['id']}_*_0.png"))
        image=matches[0] if len(matches)==1 else None
    eggs[d['id']]=image.relative_to(ROOT).as_posix() if image and image.exists() else None
(ROOT/'assets/original/data/eggs.mjs').write_bytes(('export const ORIGINAL_EGGS='+json.dumps(eggs,ensure_ascii=False)+';\n').encode('utf8'))
print('Egg thumbnails:',sum(v is not None for v in eggs.values()),'of',len(eggs),'source records; missing retained null')
