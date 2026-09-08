"""
Builds a flat, raw {key: value} dict from a module's output_values() tuple
list, for the web app's "Download Outputs CSV" export.
"""
from osdag_core.Common import TYPE_TEXTBOX, TYPE_OUT_BUTTON


def build_raw_output_dict(out_list, status=True):
    """
    Given a module's raw output_values(status) tuple list, build a flat
    {key: value} dict: TextBox rows kept verbatim, and TYPE_OUT_BUTTON rows
    (e.g. Spacing Details) inlined by calling the function each button tuple
    carries. Works for any module without per-module knowledge, since the
    nested function is discovered from the tuple itself.
    """
    to_save = {}
    for option in out_list:
        if len(option) < 4:
            continue
        if option[0] is not None and option[2] == TYPE_TEXTBOX:
            to_save[option[0]] = option[3]
        if option[2] == TYPE_OUT_BUTTON:
            try:
                _, fn = option[3]
            except (TypeError, ValueError):
                continue
            for item in fn(status):
                label, value = item[0], item[3]
                if label is not None and value is not None:
                    to_save[label] = value
    return to_save
