#!/usr/bin/env python3
"""
Fix StyleSheet.create() to be lazy-evaluated in screens that import colors123.
Moves StyleSheet.create() into a function that is called inside the component.
"""

import re
import sys
from pathlib import Path

def fix_screen_file(file_path):
    """Fix a single screen file."""
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Check if file imports colors123
    if 'colors123' not in content or 'StyleSheet.create' not in content:
        print(f"✓ {file_path.name}: No fixes needed")
        return False
    
    # Check if already has 'useMemo' (means it's already fixed)
    if 'useMemo' in content or 'createStyles' in content:
        print(f"✓ {file_path.name}: Already fixed")
        return False
    
    # Find the imports section
    import_match = re.search(r'(import.*?\n.*?from .*?;)\n\n', content, re.DOTALL)
    if not import_match:
        print(f"✗ {file_path.name}: Could not find imports")
        return False
    
    import_section = import_match.group(1)
    
    # Add useMemo if not present in imports
    if 'useMemo' not in import_section and 'import React' in import_section:
        # Find the React import and add useMemo
        content = re.sub(
            r'import React,\s*{\s*([^}]*?)\s*}\s*from\s*["\']react["\']',
            lambda m: f'import React, {{ useMemo, {m.group(1).strip()} }} from "react"',
            content
        )
        content = re.sub(
            r'import React\s*from\s*["\']react["\']',
            'import React, { useMemo } from "react"',
            content
        )
    
    # Find StyleSheet.create block at module level (at the end)
    style_match = re.search(r'\n\nconst styles = StyleSheet\.create\(\{[\s\S]*?\}\);?\s*$', content)
    if not style_match:
        print(f"⚠ {file_path.name}: Could not find StyleSheet.create at end of file")
        return False
    
    styles_block = style_match.group(0)
    
    # Extract the styles object
    styles_obj = re.search(r'StyleSheet\.create\((\{[\s\S]*?\})\)', styles_block).group(1)
    
    # Create a createStyles function
    create_styles_func = f"""
const createStyles = (colors123, fonts, radius, spacing) => StyleSheet.create({styles_obj});
"""
    
    # Add useMemo call in the first component function
    # Find the component function and add styles creation
    comp_match = re.search(r'(export default function \w+\([^)]*\)\s*\{)', content)
    if not comp_match:
        print(f"⚠ {file_path.name}: Could not find component function")
        return False
    
    comp_start = comp_match.group(1)
    
    # Find the first statement after function opening
    insert_pos = comp_match.end()
    
    # Insert the useMemo call after first line
    styles_creation = "\n  const styles = useMemo(() => createStyles(colors123, fonts, radius, spacing), []);"
    
    # Remove old styles block from end
    content = content[:style_match.start()] + content[style_match.end():]
    
    # Add createStyles function before the component
    insert_pos_for_func = content.rfind('\nexport default function')
    content = content[:insert_pos_for_func] + create_styles_func + '\n' + content[insert_pos_for_func:]
    
    # Add useMemo call in component
    # Find where to insert (after component opening brace)
    comp_pattern = r'(export default function \w+\([^)]*\)\s*\{\n)'
    content = re.sub(
        comp_pattern,
        r'\1  const styles = useMemo(() => createStyles(colors123, fonts, radius, spacing), []);\n',
        content,
        count=1
    )
    
    # Write back
    with open(file_path, 'w') as f:
        f.write(content)
    
    print(f"✓ {file_path.name}: Fixed")
    return True

def main():
    screens_dir = Path('/Users/siddiqkolimi/Desktop/studygargae/stitchpro-app/screens')
    
    files_to_fix = [
        'CreateItemDetail.js',
        'CreateOrder.js',
        'CustomerDetailScreen.js',
        'CustomerSelectionScreen.js',
        'CustomersScreen.js',
        'MeasurementsScreen.js',
        'NotificationScreen.js',
        'OrderDetail.js',
        'RecordMeasurementScreen.js',
        'StaffScreen.js',
        'SubscriptionScreen.js',
        'ViewMeasurementsScreen.js',
    ]
    
    fixed_count = 0
    for filename in files_to_fix:
        file_path = screens_dir / filename
        if file_path.exists():
            if fix_screen_file(file_path):
                fixed_count += 1
        else:
            print(f"⚠ {filename}: File not found")
    
    print(f"\nFixed {fixed_count}/{len(files_to_fix)} files")

if __name__ == '__main__':
    main()
