"""Copy the client's rune/gem particle settings and textures as data, never run Lua."""
from pathlib import Path
import hashlib, json, plistlib, zipfile

root = Path(__file__).resolve().parents[1]
archive = root / 'work/yulong-dcn.apk'
expected = '6011e9026f35d3377edf6dae7ec7479fde82c058ad413a4f4327e31e1c2555c5'
assert hashlib.file_digest(archive.open('rb'), 'sha256').hexdigest() == expected
out = root / 'assets/original/particles'
out.mkdir(exist_ok=True)
manifest_path = root / 'assets/original/manifest.json'
manifest = json.loads(manifest_path.read_bytes())
settings = {}
with zipfile.ZipFile(archive) as z:
    for name in ['cj_putong', 'cj_niudan02', 'cj_gaoji', 'cj_gaojichuxian01', 'cj_gaojichuxian02']:
        source = 'assets/res/particle/' + name
        data = plistlib.loads(z.read(source + '.plist'))
        assert data['emitterType'] == 0
        texture = z.read(source + '.png')
        target = out / (name + '.png')
        target.write_bytes(texture)
        settings[name] = {**data, 'texture': 'assets/original/particles/' + target.name}
        manifest['assets']['particles/' + target.name] = {
            'archive': source + '.png', 'sha256': hashlib.sha256(texture).hexdigest()}
target = out / 'index.mjs'
target.write_text('export default ' + json.dumps(settings, separators=(',', ':')) + ';\n', encoding='utf8')
manifest['assets']['particles/index.mjs'] = {
    'archive': 'assets/res/particle/cj_*.plist',
    'conversion': 'plist settings, no particle parameters invented',
    'sha256': hashlib.file_digest(target.open('rb'), 'sha256').hexdigest()}
manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf8')
print('Exported', len(settings), 'source particle systems')
