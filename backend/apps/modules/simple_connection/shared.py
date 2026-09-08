"""
Shared utilities for simple_connection modules
"""
from osdag_core.cad.common_logic import CommonDesignLogic


def setup_for_cad(cdl: CommonDesignLogic, module_class):
    """Minimal setup helper used by simple_connection adapters.

    This mirrors the expectations in adapters: set the module_class/module_object
    so downstream common logic can access them.
    """
    cdl.module_class = module_class
    cdl.module_object = module_class
