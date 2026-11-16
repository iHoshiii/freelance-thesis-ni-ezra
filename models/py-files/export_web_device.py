import bpy
import json
from pathlib import Path
from mathutils import Vector

models = Path(__file__).resolve().parents[1]
output = models.parent / 'apps' / 'web' / 'public' / 'models'
output.mkdir(parents=True, exist_ok=True)
scene = bpy.context.scene
collections = [c for c in scene.collection.children if c.name.startswith(('Components -', 'Schematic sensor cables'))]
objects = {o for collection in collections for o in collection.all_objects}
groups = [o for o in objects if 'part_number' in o]
assert len(groups) == 19, 'Expected the compact breadboard model with 19 components'
for collection in scene.collection.children:
    if collection not in collections and not collection.name.startswith('Studio -'):
        collection.hide_render = True
bpy.ops.object.select_all(action='DESELECT')
for obj in objects:
    if obj.type in {'CURVE', 'FONT'}:
        obj.select_set(True)
if bpy.context.selected_objects:
    bpy.context.view_layer.objects.active = bpy.context.selected_objects[0]
    bpy.ops.object.convert(target='MESH')
bpy.ops.object.select_all(action='DESELECT')
for collection in collections:
    for obj in collection.all_objects:
        obj.select_set(True)
bpy.ops.export_scene.gltf(
    filepath=str(output / 'compact-breadboard.glb'), export_format='GLB',
    use_selection=True, export_apply=True, export_animations=False,
    export_cameras=False, export_lights=False, export_extras=True,
)
meshes = [o for collection in collections for o in collection.all_objects if o.type == 'MESH']
corners = [obj.matrix_world @ Vector(corner) for obj in meshes for corner in obj.bound_box]
minimum = Vector(tuple(min(v[i] for v in corners) for i in range(3)))
maximum = Vector(tuple(max(v[i] for v in corners) for i in range(3)))
center = (minimum + maximum) / 2
camera = scene.camera
direction = camera.rotation_euler.to_quaternion() @ Vector((0, 0, -1))
camera.location = center - direction * 2
camera.rotation_euler = (center - camera.location).to_track_quat('-Z', 'Y').to_euler()
scene.render.resolution_x = 768
scene.render.resolution_y = 600
scene.render.resolution_percentage = 100
bpy.context.view_layer.update()
local = [camera.matrix_world.inverted() @ corner for corner in corners]
width = max(v.x for v in local) - min(v.x for v in local)
height = max(v.y for v in local) - min(v.y for v in local)
offset = Vector(((max(v.x for v in local) + min(v.x for v in local)) / 2, (max(v.y for v in local) + min(v.y for v in local)) / 2, 0))
camera.location += camera.rotation_euler.to_quaternion() @ offset
camera.data.ortho_scale = max(width, height * (768 / 600)) * 1.2
scene.render.film_transparent = True
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'RGBA'
scene.render.filepath = str(output / 'compact-breadboard.png')
if hasattr(scene, 'cycles'):
    scene.cycles.samples = 24
bpy.ops.render.render(write_still=True)
print('WEB_DEVICE', json.dumps({'components': len(groups), 'meshes': len(meshes), 'bytes': (output / 'compact-breadboard.glb').stat().st_size}))
