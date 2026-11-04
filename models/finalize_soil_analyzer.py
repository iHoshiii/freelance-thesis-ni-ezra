"""Finish supports, create an internal layout scene, and save the proposal."""
import bpy
import os
from mathutils import Vector

model_dir = r'C:\Users\Administrator\OneDrive\Desktop\thesis-ni-ezra\models'
assembly_scene = bpy.data.scenes['01 Proposed soil analyzer']
bpy.context.window.scene = assembly_scene
assembly_scene['nominal_enclosure_mm'] = '304 W x 224 D x 157 H including cover; excludes feet, panel, handle and accessories'

def support_box(name, loc, dims, collection):
    if name in bpy.data.objects:
        return bpy.data.objects[name]
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = dims
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    for old_collection in list(obj.users_collection):old_collection.objects.unlink(obj)
    collection.objects.link(obj)
    obj.data.materials.append(bpy.data.materials['Deep agricultural green polymer'])
    bevel = obj.modifiers.new('Rounded mounting bracket', 'BEVEL')
    bevel.width = .003
    bevel.segments = 3
    return obj

support_box('pH station detachable support bracket',(-.180,-.025,.042),(.100,.034,.022),bpy.data.collections['04 Soil water suspension pH station'])
for support_x in [-.115,.115]:
    support_box('Carry handle rear mounting block '+str(support_x),(support_x,.117,.156),(.025,.028,.038),bpy.data.collections['02 Solar charging and carry handle'])
if not assembly_scene.get('supports_finalized'):
    for obj in assembly_scene.objects:
        if obj.name.startswith('Rubber foot'):
            obj.scale.z *= .042/obj.dimensions.z
            obj.location.z = .021
    bpy.data.objects['Soil probe presentation support'].location.z = .009
    assembly_scene['supports_finalized'] = True
ground_obj = bpy.data.objects['Studio ground']
ground_obj.dimensions.x = 3
ground_obj.dimensions.y = 3

internal_name = '02 Internal component layout'
if internal_name not in bpy.data.scenes:
    internal_scene = bpy.data.scenes.new(internal_name)
    internal_scene.world = assembly_scene.world
    internal_scene.unit_settings.system = assembly_scene.unit_settings.system
    internal_scene.unit_settings.scale_length = 1
    internal_scene.collection.children.link(bpy.data.collections['05 Electronics conceptual arrangement'])
    internal_scene.collection.children.link(bpy.data.collections['07 Studio lighting and cameras'])
    internal_base = bpy.data.collections.new('08 Internal view base and camera')
    internal_scene.collection.children.link(internal_base)
    for obj in assembly_scene.objects:
        if obj.name == 'Lower enclosure floor' or obj.name.startswith('Rubber foot'):
            internal_base.objects.link(obj)
    internal_cam_data = bpy.data.cameras.new('Internal arrangement camera')
    internal_cam = bpy.data.objects.new('Camera internal component layout',internal_cam_data)
    internal_base.objects.link(internal_cam)
    internal_cam.location = (.34,-.46,.74)
    internal_cam.rotation_euler = (Vector((0,0,.075))-internal_cam.location).to_track_quat('-Z','Y').to_euler()
    internal_cam_data.type = assembly_scene.camera.data.type
    internal_cam_data.ortho_scale = .39
    internal_scene.camera = internal_cam
    internal_scene.render.engine = assembly_scene.render.engine
    internal_scene.render.resolution_x = 1400
    internal_scene.render.resolution_y = 1100
    internal_scene.render.resolution_percentage = 100
    internal_scene.render.image_settings.file_format = assembly_scene.render.image_settings.file_format
    internal_scene.render.filepath = os.path.join(model_dir,'soil_analyzer_internal_layout.png')
    internal_scene.view_settings.view_transform = assembly_scene.view_settings.view_transform
    internal_scene.view_settings.exposure = assembly_scene.view_settings.exposure
    internal_scene['note'] = 'Conceptual packaging only; dimensions, interconnects, ratings and board choices require engineering.'
    internal_scene['components'] = 'ESP32 front left, analog interfaces at front, solar charging PCB rear left, rechargeable battery at right.'

notes = bpy.data.texts.get('READ ME - proposed design assumptions')
if notes:
    original_notes = notes.as_string()
    notes.clear()
    notes.write(original_notes.replace('Nominal enclosure: 300 x 220 x 145 mm;', 'Enclosure envelope including cover: 304 x 224 x 157 mm;').replace('Collections 01 and 02 can be hidden to inspect the conceptual internal arrangement.', 'Switch to scene 02 Internal component layout to inspect the conceptual internal arrangement.'))

# Keep the completed assembly open, with a faster final render configuration.
bpy.context.window.scene = assembly_scene
assembly_scene.render.resolution_x = 1600
assembly_scene.render.resolution_y = 1244
assembly_scene.render.resolution_percentage = 100
if hasattr(assembly_scene,'eevee'):
    for prop in ['taa_render_samples','taa_samples']:
        if hasattr(assembly_scene.eevee,prop):setattr(assembly_scene.eevee,prop,32)
assembly_scene.render.filepath = os.path.join(model_dir,'soil_analyzer_proposed_design.png')
for selected_obj in bpy.context.selected_objects:selected_obj.select_set(False)
bpy.context.view_layer.objects.active = None
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(model_dir,'soil_analyzer_proposed.blend'))
print('Saved final assembly and internal view:',bpy.data.filepath)
print('Scenes:', [s.name for s in bpy.data.scenes])
