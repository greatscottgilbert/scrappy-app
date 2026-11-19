import contextlib, io, json, os, pathlib, runpy, tempfile, unittest
from unittest.mock import patch

SOURCE = pathlib.Path(__file__).resolve().with_name('update_vancouver.py')
ROW = {'permitnumber':'DB-2026-TEST','address':'Synthetic fixture','issuedate':'2026-11-01','projectdescription':'Demolish existing detached house'}

class SnapshotIntegrity(unittest.TestCase):
    def run_source(self, payloads):
        with tempfile.TemporaryDirectory() as directory:
            previous = os.getcwd()
            os.chdir(directory)
            try:
                pathlib.Path('data').mkdir()
                pathlib.Path('data/vancouver-sites.json').write_text('PRIOR VERIFIED SNAPSHOT')
                responses = [io.BytesIO(json.dumps(p).encode()) for p in payloads]
                with patch('urllib.request.urlopen', side_effect=responses), contextlib.redirect_stdout(io.StringIO()):
                    try:
                        runpy.run_path(str(SOURCE))
                    except RuntimeError:
                        pass
                return pathlib.Path('data/vancouver-sites.json').read_text()
            finally:
                os.chdir(previous)

    def test_complete_valid_snapshot_is_written(self):
        saved = json.loads(self.run_source([{'total_count':1,'results':[ROW]}]))
        self.assertEqual(saved['sourceRecordCount'], 1)
        self.assertEqual(saved['sites'][0]['permit'], ROW['permitnumber'])

    def test_complete_two_page_snapshot(self):
        rows = [{**ROW, 'permitnumber':f'TEST-{i}'} for i in range(101)]
        saved = json.loads(self.run_source([{'total_count':101,'results':rows[:100]}, {'total_count':101,'results':rows[100:]}]))
        self.assertEqual(len(saved['sites']), 101)

    def test_changed_total_between_pages_keeps_previous(self):
        rows = [{**ROW, 'permitnumber':f'TEST-{i}'} for i in range(100)]
        self.assertEqual(self.run_source([{'total_count':101,'results':rows}, {'total_count':100,'results':[]}]), 'PRIOR VERIFIED SNAPSHOT')

    def test_invalid_total_keeps_previous(self):
        self.assertEqual(self.run_source([{'total_count':True,'results':[ROW]}]), 'PRIOR VERIFIED SNAPSHOT')

    def test_missing_results_keeps_previous(self):
        self.assertEqual(self.run_source([{'total_count':1}]), 'PRIOR VERIFIED SNAPSHOT')

    def test_total_count_mismatch_keeps_previous(self):
        self.assertEqual(self.run_source([{'total_count':200,'results':[ROW]}]), 'PRIOR VERIFIED SNAPSHOT')

    def test_duplicate_permit_keeps_previous(self):
        self.assertEqual(self.run_source([{'total_count':2,'results':[ROW,ROW]}]), 'PRIOR VERIFIED SNAPSHOT')

    def test_missing_permit_keeps_previous(self):
        self.assertEqual(self.run_source([{'total_count':1,'results':[{**ROW,'permitnumber':''}]}]), 'PRIOR VERIFIED SNAPSHOT')

if __name__ == '__main__':
    unittest.main()
