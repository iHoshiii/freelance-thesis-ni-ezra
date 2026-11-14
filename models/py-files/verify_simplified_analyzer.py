import bpy
import os

scene = bpy.data.scenes['01 Simplified soil analyzer']
assert len(bpy.data.scenes) == 2, 'Only the simplified assembly and its internal arrangement should be saved.'
assert all(not any(word in obj.name.lower() for word in ['microsd','sd card','gps','rtc','carry handle','hinge']) for obj in bpy.data.objects)
assert 'Separate pH soil water sample cup' in bpy.data.objects
assert 'Provisional RS485 NPK probe' in bpy.data.objects
assert '0.96 inch OLED bezel' in bpy.data.objects
assert len([obj for obj in bpy.data.objects if obj.name.startswith('18650 cell illustrative')]) == 2
electrode = bpy.data.objects['Liquid pH electrode']
electrode.location.z = .080
electrode.dimensions.z = .083
bpy.context.view_layer.update()
assert electrode.location.z - electrode.dimensions.z/2 < bpy.data.objects['Prepared suspension'].location.z
scene['enclosure_envelope_mm'] = '204 x 144 x 83 including cover; illustrative, final fitting pending'
notes = bpy.data.texts['Simple design scope and assumptions']
body = notes.as_string().replace('204 x 144 x 79', '204 x 144 x 83')
notes.clear()
notes.write(body)
bpy.context.window.scene = scene
camera = scene.camera
for screen in bpy.data.screens:
    for area in screen.areas:
        if area.type == 'VIEW_3D':
            area.spaces.active.region_3d.view_rotation = camera.rotation_euler.to_quaternion()
            area.spaces.active.region_3d.view_location = (.025,0,.060)
            area.spaces.active.region_3d.view_distance = .65
bpy.ops.wm.save_as_mainfile(filepath=bpy.data.filepath,compress=True)
print('Verified scope, saved scenes, sensors, battery count, and absence of excluded modules.')
print('Assembly objects:', len(scene.objects))
