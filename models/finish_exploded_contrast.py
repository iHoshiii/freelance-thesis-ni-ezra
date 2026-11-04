import bpy

for name,color in [('Exploded matte solar blue',(.006,.018,.045)),('Exploded visible gray lid',(.06,.08,.09))]:
    mat=bpy.data.materials[name]
    mat.diffuse_color=(*color,1)
    shader=next(n for n in mat.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
    shader.inputs['Base Color'].default_value=(*color,1)
    if 'lid' in name:
        shader.inputs['Roughness'].default_value=.85
        if 'Specular IOR Level' in shader.inputs:shader.inputs['Specular IOR Level'].default_value=.15
main=bpy.data.scenes['03 Exploded and labeled parts']
bpy.context.window.scene=main
bpy.ops.wm.save_as_mainfile(filepath=bpy.data.filepath,compress=True)
for name in ['03 Exploded and labeled parts','04 Labeled component reference']:
    bpy.context.window.scene=bpy.data.scenes[name]
    bpy.ops.render.render(write_still=True)
    print('Final image saved:',bpy.context.scene.render.filepath,flush=True)
