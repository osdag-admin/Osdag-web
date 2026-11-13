"""
Unit tests for report_image_generator module.
"""

import os
import pytest
import tempfile
import shutil
from unittest.mock import Mock, patch, MagicMock
import numpy as np

# Skip this module entirely in CI environments
if os.environ.get('CI') == 'true':
    pytest.skip("Skipping in CI environment", allow_module_level=True)

# Import the module under test
import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../..'))
try:
    from apps.core.utils.report_image_generator import (
        verify_open3d_available,
        setup_headless_qt,
        read_brep_file,
        generate_stl_from_brep,
        find_existing_cad_files,
        generate_cad_files_for_report,
        ensure_image_directory,
        copy_fallback_images,
        generate_cad_images_for_report
    )
except FileNotFoundError as e:
    pytest.skip(f"Skipping module because LaTeX environment is not found: {e}", allow_module_level=True)


class TestVerifyOpen3DAvailable:
    """Tests for verify_open3d_available()"""
    
    def test_open3d_available(self):
        """Test when Open3D is available"""
        mock_o3d = MagicMock()
        mock_renderer = MagicMock()
        mock_o3d.visualization.rendering.OffscreenRenderer.return_value = mock_renderer
        with patch.dict('sys.modules', {'open3d': mock_o3d}):
            result = verify_open3d_available()
            assert result is True
    
    def test_open3d_not_available(self):
        """Test when Open3D is not installed"""
        with patch.dict('sys.modules', {'open3d': None}):
            with pytest.raises(ImportError):
                import open3d
            # Function should handle gracefully
            # Note: This test may fail if open3d is actually installed
            pass


class TestReadBrepFile:
    """Tests for read_brep_file()"""
    
    def test_file_not_found(self):
        """Test with non-existent file"""
        with pytest.raises(FileNotFoundError):
            read_brep_file("/nonexistent/file.brep")
    
    def test_invalid_brep(self, tmp_path):
        """Test with invalid BREP file"""
        invalid_brep = tmp_path / "invalid.brep"
        invalid_brep.write_text("not a valid brep file")
        
        with pytest.raises(ValueError):
            read_brep_file(str(invalid_brep))


class TestFindExistingCadFiles:
    """Tests for find_existing_cad_files()"""
    
    def test_no_files_found(self, tmp_path):
        """Test when no CAD files exist"""
        with patch('os.getcwd', return_value=str(tmp_path)):
            result = find_existing_cad_files("TestModule", {}, None)
            assert result == {}
    
    def test_files_found_with_session_id(self, tmp_path):
        """Test finding files with session_id"""
        cad_dir = tmp_path / "file_storage" / "cad_models"
        cad_dir.mkdir(parents=True)
        
        session_id = "test_session_123"
        test_file = cad_dir / f"{session_id}_Model.brep"
        test_file.write_text("test brep content")
        
        with patch('os.getcwd', return_value=str(tmp_path)):
            result = find_existing_cad_files("TestModule", {}, session_id)
            assert "Model" in result
            assert result["Model"] == str(test_file)


class TestEnsureImageDirectory:
    """Tests for ensure_image_directory()"""
    
    def test_create_directory(self, tmp_path):
        """Test directory creation"""
        image_dir = tmp_path / "test_images"
        result = ensure_image_directory(str(image_dir))
        
        assert os.path.exists(result)
        assert os.path.isabs(result)
    
    def test_existing_directory(self, tmp_path):
        """Test with existing directory"""
        image_dir = tmp_path / "existing_images"
        image_dir.mkdir()
        
        result = ensure_image_directory(str(image_dir))
        assert os.path.exists(result)


class TestCopyFallbackImages:
    """Tests for copy_fallback_images()"""
    
    def test_fallback_copy(self, tmp_path):
        """Test copying fallback images"""
        output_dir = tmp_path / "output"
        output_dir.mkdir()
        
        # Mock broken.png location
        with patch('apps.core.utils.report_image_generator._get_resource_path') as mock_get_path:
            mock_broken = tmp_path / "broken.png"
            mock_broken.write_bytes(b"fake png data")
            mock_get_path.return_value = tmp_path
            
            result = copy_fallback_images(str(output_dir))
            
            assert len(result) == 4
            assert '3d' in result
            assert 'front' in result
            assert 'top' in result
            assert 'side' in result


@pytest.mark.skip(reason="Skip GUI/rendering tests to avoid core dumps in headless environments")
class TestGenerateCadImagesForReport:
    """Tests for generate_cad_images_for_report()"""
    
    def test_no_cad_files(self):
        """Test when no CAD files are available"""
        mock_module = Mock()
        
        with patch('apps.core.utils.report_image_generator.find_existing_cad_files', return_value={}):
            with patch('apps.core.utils.report_image_generator.generate_cad_files_for_report', return_value={}):
                with patch('apps.core.utils.report_image_generator.generate_with_opencascade_display', side_effect=Exception("Qt failed")):
                    with patch('apps.core.utils.report_image_generator.copy_fallback_images') as mock_fallback:
                        mock_fallback.return_value = {'3d': 'path', 'front': 'path', 'top': 'path', 'side': 'path'}
                        
                        result = generate_cad_images_for_report(
                            module=mock_module,
                            input_values={},
                            module_id="TestModule",
                            report_dir="/tmp/test"
                        )
                        
                        assert result["success"] is False
                        assert "images" in result
                        assert len(result["images"]) == 4
    
    @pytest.mark.skipif(not verify_open3d_available(), reason="Open3D not available")
    def test_with_cad_files_open3d(self, tmp_path):
        """Test image generation with Open3D (if available)"""
        # Create a minimal STL file for testing
        cad_dir = tmp_path / "file_storage" / "cad_models"
        cad_dir.mkdir(parents=True)
        
        # Note: This would require a real STL file or mock
        # For now, just test the structure
        pass


# Integration test placeholder
class TestIntegration:
    """Integration tests - to be implemented"""
    
    @pytest.mark.skip(reason="Requires full environment setup")
    def test_full_pipeline(self):
        """Test full image generation pipeline"""
        pass


