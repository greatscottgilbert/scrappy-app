import contextlib, io, json, os, pathlib, runpy, tempfile, unittest
from unittest.mock import patch
import test_snapshot_integrity as fixture
ROW, SOURCE = fixture.ROW, fixture.SOURCE
class CrossReview(unittest.TestCase):
 def test_malformed_identifiers_retain_previous(self):
  for number in [True,123,{'id':'a'},['a']]:
   with self.subTest(number=number):
    self.assertEqual(fixture.SnapshotIntegrity().run_source([{'total_count':1,'results':[{**ROW,'permitnumber':number}]}]),'PRIOR VERIFIED SNAPSHOT')
 def test_malformed_row_retain_previous(self):
  for row in [None,[],42]:
   self.assertEqual(fixture.SnapshotIntegrity().run_source([{'total_count':1,'results':[row]}]),'PRIOR VERIFIED SNAPSHOT')
 def test_failed_replace_preserves_prior_and_cleans_temp(self):
  with tempfile.TemporaryDirectory() as directory:
   previous=os.getcwd();os.chdir(directory)
   try:
    pathlib.Path('data').mkdir();dest=pathlib.Path('data/vancouver-sites.json');dest.write_bytes(b'PRIOR VERIFIED SNAPSHOT')
    with patch('urllib.request.urlopen',return_value=io.BytesIO(json.dumps({'total_count':1,'results':[ROW]}).encode())),patch('os.replace',side_effect=OSError('synthetic failure')),contextlib.redirect_stdout(io.StringIO()):
     with self.assertRaises(OSError):runpy.run_path(str(SOURCE))
    self.assertEqual(dest.read_bytes(),b'PRIOR VERIFIED SNAPSHOT');self.assertEqual(list(pathlib.Path('data').glob('*.tmp')),[])
   finally:os.chdir(previous)
 def test_failed_fsync_preserves_prior(self):
  with tempfile.TemporaryDirectory() as directory:
   previous=os.getcwd();os.chdir(directory)
   try:
    pathlib.Path('data').mkdir();dest=pathlib.Path('data/vancouver-sites.json');dest.write_bytes(b'PRIOR VERIFIED SNAPSHOT')
    with patch('urllib.request.urlopen',return_value=io.BytesIO(json.dumps({'total_count':1,'results':[ROW]}).encode())),patch('os.fsync',side_effect=OSError('synthetic disk failure')),contextlib.redirect_stdout(io.StringIO()):
     with self.assertRaises(OSError):runpy.run_path(str(SOURCE))
    self.assertEqual(dest.read_bytes(),b'PRIOR VERIFIED SNAPSHOT');self.assertEqual(list(pathlib.Path('data').glob('*.tmp')),[])
   finally:os.chdir(previous)
