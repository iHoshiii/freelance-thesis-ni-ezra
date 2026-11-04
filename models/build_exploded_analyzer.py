"""Explode the saved simplified proposal into labeled, individually editable parts.
Run with Blender: --background soil_analyzer_simplified.blend --python this_file.
"""
import bpy
import math
import os
import json
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view

OUT = r'C:\Users\Administrator\OneDrive\Desktop\thesis-ni-ezra\models'
source = bpy.data.scenes['01 Simplified soil analyzer']
scene = bpy.data.scenes.new('03 Exploded and labeled parts')
bpy.context.window.scene = scene
scene.world = source.world
scene.unit_settings.system = source.unit_settings.system
scene['purpose'] = 'Labeled exploded presentation of the simplified thesis prototype.'
scene['scope'] = 'No SD storage, offline logging, RTC or GPS. NPK remains provisional.'
scene['electrical_status'] = 'Physical layout only. Draft charger, boost boards and battery arrangement are unverified.'
scene['source'] = 'paper_revised.docx and the in-scope parts from FL13_refined.docx.'
parts = bpy.data.collections.new('Exploded - individually separated parts')
labels = bpy.data.collections.new('Exploded - labels and leaders')
studio = bpy.data.collections.new('Exploded - camera and lights')
scene.collection.children.link(parts)
scene.collection.children.link(labels)
scene.collection.children.link(studio)
originals = list(source.objects)
groups = []

def starts(o,*names):return any(o.name == n or o.name.startswith(n+'.') for n in names)
def group(num,name,predicate,origin,destination,side,anchor=None,subtitle=''):
    root=bpy.data.objects.new('%02d %s'%(num,name),None)
    parts.objects.link(root)
    root.location=destination
    root['part_number']=num
    root['label']=name
    root['note']=subtitle
    root['assembled_reference_m']=list(origin)
    for old in originals:
        if not predicate(old):continue
        new=old.copy()
        if old.data:new.data=old.data.copy()
        parts.objects.link(new)
        new.name='Part %02d - '%num+old.name
        new.parent=root
        new.location=old.location-Vector(origin)
    entry=dict(num=num,name=name,root=root,side=side,anchor=Vector(anchor or destination),subtitle=subtitle)
    groups.append(entry)
    return root

g1=group(1,'Solar panel',lambda o:o.name in bpy.data.collections['Simple - flat solar panel'].objects,(0,0,.098),(0,0,.475),'L')
g2=group(2,'Removable lid and screws',lambda o:starts(o,'Plain removable lid','Lid screw'),(0,0,.090),(0,0,.355),'L')
g3=group(3,'ESP32 development board',lambda o:starts(o,'ESP32 development board','ESP32 RF shield','ESP32 antenna end'),(-.051,-.020,.034),(-.065,-.012,.272),'L',subtitle='Wi-Fi data acquisition')
g4=group(4,'pH interface board',lambda o:starts(o,'pH interface board','pH interface BNC socket'),(-.069,.038,.034),(-.120,.006,.202),'L')
g5=group(5,'MAX3485 RS485 interface',lambda o:starts(o,'MAX3485 RS485 interface','RS485 terminal block'),(-.027,.034,.034),(.008,.025,.248),'R')
g6=group(6,'TP4056 charging module',lambda o:starts(o,'TP4056 draft charging module placeholder') or (starts(o,'Module component placeholder') and o.location.y>.04),(.040,.053,.026),(.108,.020,.305),'R',subtitle='Draft part; electrical selection pending')
g7=group(7,'5 V boost converter',lambda o:starts(o,'5V boost module placeholder') or (starts(o,'Module component placeholder') and o.location.x<.04 and o.location.y<0),(.025,-.050,.026),(.022,-.048,.200),'R')
g8=group(8,'12 V boost converter',lambda o:starts(o,'12V boost module placeholder') or (starts(o,'Module component placeholder') and o.location.x>.04 and o.location.y<0),(.066,-.050,.026),(.106,-.045,.178),'R')
g9=group(9,'Two rechargeable 18650 cells',lambda o:starts(o,'18650 cell illustrative','18650 metal cap'),(.041,.005,.037),(.115,.040,.238),'R',subtitle='Battery wiring not specified')
g10=group(10,'Battery holder',lambda o:starts(o,'Two cell holder physical placeholder'),(.041,.005,.027),(.108,.040,.125),'R')
g11=group(11,'Perfboard mounting base',lambda o:starts(o,'Basic perfboard'),(-.049,-.002,.025),(-.005,.010,.133),'L')
g12=group(12,'0.96 inch OLED display',lambda o:starts(o,'0.96 inch OLED bezel','OLED status only','OLED status caption'),(.047,-.071,.068),(-.125,-.085,.148),'L',subtitle='Basic device status')
g13=group(13,'Power switch',lambda o:starts(o,'Basic power switch'),(.101,-.035,.055),(.133,-.098,.112),'R')
g14=group(14,'Capacitive moisture sensor',lambda o:starts(o,'Capacitive moisture blade','Moisture sensor upper board','Moisture electrode schematic'),(.148,.012,.059),(.215,-.005,.092),'R',anchor=(.215,-.005,.12))
g15=group(15,'DS18B20 temperature probe',lambda o:starts(o,'DS18B20 waterproof steel probe','Temperature probe cable sleeve'),(.188,.012,.058),(.245,.025,.094),'R',anchor=(.245,.025,.095))
g16=group(16,'RS485 NPK probe',lambda o:starts(o,'Provisional RS485 NPK probe','Provisional NPK marker','NPK identification','NPK tine'),(.233,.019,.088),(.255,.060,.175),'R',subtitle='Provisional; feasibility check first')
g17=group(17,'Liquid pH electrode',lambda o:starts(o,'Liquid pH electrode','Electrode upper sleeve'),(-.160,.014,.080),(-.232,.010,.130),'L')
g18=group(18,'Soil-water sample cup',lambda o:starts(o,'Separate pH soil water sample cup','Cup bottom','Prepared suspension','Separate cup label'),(-.160,.014,0),(-.232,.010,0),'L',anchor=(-.232,.010,.035),subtitle='Separate pH measurement sample')
g19=group(19,'Enclosure base',lambda o:starts(o,'Plain enclosure floor','Enclosure front wall','Enclosure rear wall','Enclosure left wall','Enclosure right wall','Plain rubber foot','Simple enclosure title'),(0,0,0),(0,0,0),'L',anchor=(-.065,-.065,.055))
g20=group(20,'Cable entries and seals',lambda o:'simple cable gland' in o.name or 'small label' in o.name,(0,0,0),(0,0,0),'L',anchor=(.025,-.073,.034))
g21=group(21,'Jumper wires and resistor',lambda o:False,(0,0,0),(-.075,-.102,.200),'L',subtitle='Wiring components; not a circuit diagram')
g22=group(22,'Push button',lambda o:False,(0,0,0),(.065,-.103,.125),'R',subtitle='Draft local control')

def material(name,color):
    m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True
    bs=next(n for n in m.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
    bs.inputs['Base Color'].default_value=(*color,1);bs.inputs['Roughness'].default_value=.48
    return m
dark=bpy.data.materials['Simple black plastic and cables']
silver=bpy.data.materials['Simple steel']
gold=bpy.data.materials['Simple contacts']
pcb=bpy.data.materials['Simple PCB']
blue=material('Exploded connector blue',(.035,.18,.38))
tan=material('Exploded resistor body',(.53,.38,.19))
wire_red=material('Exploded jumper red',(.46,.035,.025))

def mesh_box(name,parent,loc,size,mat,rounding=.0005):
    bpy.ops.mesh.primitive_cube_add(size=1)
    obj=bpy.context.object
    for c in list(obj.users_collection):c.objects.unlink(obj)
    parts.objects.link(obj);obj.name=name;obj.dimensions=size
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    obj.parent=parent;obj.location=loc;obj.data.materials.append(mat)
    if rounding:
        b=obj.modifiers.new('Edge radius','BEVEL');b.width=rounding;b.segments=2
    return obj

def mesh_cyl(name,parent,loc,radius,depth,mat,axis=(0,0,1)):
    bpy.ops.mesh.primitive_cylinder_add(vertices=20,radius=radius,depth=depth)
    obj=bpy.context.object
    for c in list(obj.users_collection):c.objects.unlink(obj)
    parts.objects.link(obj);obj.name=name;obj.parent=parent;obj.location=loc
    obj.rotation_euler=Vector(axis).to_track_quat('Z','Y').to_euler();obj.data.materials.append(mat)
    return obj

def curve(name,points,mat,radius=.0005,collection=parts,parent=None):
    data=bpy.data.curves.new(name,'CURVE');data.dimensions='3D';data.bevel_depth=radius;data.bevel_resolution=2
    spl=data.splines.new('POLY');spl.points.add(len(points)-1)
    for p,co in zip(spl.points,points):p.co=(*co,1)
    obj=bpy.data.objects.new(name,data);collection.objects.link(obj);data.materials.append(mat);obj.parent=parent
    return obj

# Small schematic details make the component types recognizable at presentation scale.
for xx in [-.012,.012]:
    for j in range(10):mesh_cyl('ESP32 header contact',g3,(xx,-.022+j*.0048,.005),.00065,.007,gold)
mesh_box('ESP32 USB connector',g3,(0,-.028,.005),(.009,.007,.004),silver)
for g in [g7,g8]:
    mesh_box('Converter trim potentiometer',g,(-.009,.003,.006),(.007,.007,.006),blue)
    mesh_cyl('Converter inductor schematic',g,(.007,-.001,.006),.004,.006,dark)
mesh_box('Draft charger USB connector',g6,(0,-.012,.003),(.008,.005,.004),silver)
for child in g10.children:
    if child.type=='MESH':child.dimensions.z=.004;child.location.z=-.0085
for xx in [-.022,.022]:mesh_box('Battery holder side wall',g10,(xx,0,.0015),(.003,.075,.016),dark)
mesh_box('Battery holder center divider',g10,(0,0,.0015),(.002,.069,.016),dark)
for yy in [-.035,.035]:
    mesh_box('Battery holder end wall',g10,(0,yy,.0015),(.047,.003,.016),dark)
    for xx in [-.010,.010]:mesh_box('Battery holder contact',g10,(xx,yy*.90,.001),(.008,.002,.007),silver)
mesh_box('OLED carrier PCB',g12,(0,.003,0),(.038,.002,.028),pcb)
for xx in [-.015,.015]:
    for zz in [-.010,.010]:mesh_cyl('OLED mounting contact',g12,(xx,.004,zz),.001,.0015,gold,(0,1,0))
mesh_box('Power switch rear body',g13,(-.006,0,0),(.009,.010,.012),dark)
mesh_box('Tactile switch square base',g22,(0,0,0),(.009,.009,.004),dark)
mesh_cyl('Tactile switch actuator',g22,(0,0,.004),.0028,.005,silver)
for xx in [-.005,.005]:
    for yy in [-.003,.003]:mesh_box('Tactile switch lead',g22,(xx,yy,-.001),(.003,.001,.001),silver,0)
for j,mat in enumerate([dark,wire_red,blue]):
    yy=(j-1)*.006
    pts=[(-.022,yy,0),(-.012,yy,.012),(.012,yy,.012),(.023,yy,0)]
    curve('Loose jumper wire',pts,mat,.0007,parent=g21)
    for xx in [-.023,.023]:mesh_box('Jumper connector',g21,(xx,yy,-.001),(.004,.003,.007),dark)
mesh_cyl('Pull-up resistor body schematic',g21,(0,-.017,.004),.0018,.008,tan,(1,0,0))
curve('Resistor leads',[(-.013,-.017,0),(-.004,-.017,.004),(.004,-.017,.004),(.013,-.017,0)],silver,.0003,parent=g21)
# Perfboard pads remain part of the perfboard assembly.
for x in range(6):
    for y in range(8):mesh_cyl('Perfboard pad',g11,((x-2.5)*.009,(y-3.5)*.011,.0023),.0012,.0003,gold)

# Neutral, evenly lit studio. No external probe rack or elaborate enclosure is added.
def aim(o,at):o.rotation_euler=(Vector(at)-o.location).to_track_quat('-Z','Y').to_euler()
for name,loc,energy,size in [('Exploded key',(-.5,-.6,1),28,.7),('Exploded fill',(.6,-.3,.7),18,.6),('Exploded rim',(.0,.6,.8),22,.6)]:
    data=bpy.data.lights.new(name,'AREA');data.energy=energy;data.size=size
    obj=bpy.data.objects.new(name,data);studio.objects.link(obj);obj.location=loc;aim(obj,(0,0,.22))
data=bpy.data.cameras.new('Exploded presentation camera')
cam=bpy.data.objects.new('Camera labeled exploded view',data);studio.objects.link(cam)
cam.location=(.58,-1.15,.86);aim(cam,(.018,0,.235))
data.type=next(e.identifier for e in data.bl_rna.properties['type'].enum_items if e.identifier=='ORTHO')
data.ortho_scale=1.10
scene.camera=cam
scene.render.engine=source.render.engine
scene.render.resolution_x=2200;scene.render.resolution_y=1800;scene.render.resolution_percentage=100
scene.render.image_settings.file_format=source.render.image_settings.file_format
scene.render.film_transparent=False
scene.render.filepath=os.path.join(OUT,'soil_analyzer_exploded_labeled.png')
scene.view_settings.view_transform=source.view_settings.view_transform
# Dynamic OCIO enum reports only NONE through RNA; Standard was verified through runtime validation.
scene.view_settings.view_transform='Standard'
scene.view_settings.exposure=0
if hasattr(scene,'eevee'):scene.eevee.taa_render_samples=16
bpy.context.view_layer.update()

# All annotation is native 3D text/curves saved in the .blend, facing the presentation camera.
def emission(name,color):
    m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True
    nodes=m.node_tree.nodes;nodes.clear()
    out=nodes.new('ShaderNodeOutputMaterial');sh=nodes.new('ShaderNodeEmission')
    sh.inputs['Color'].default_value=(*color,1);sh.inputs['Strength'].default_value=1
    m.node_tree.links.new(sh.outputs[0],out.inputs['Surface'])
    return m
ink=emission('Annotation dark ink',(.027,.043,.052))
lightink=emission('Annotation secondary ink',(.14,.18,.19))
leaderink=emission('Annotation leader ink',(.32,.38,.39))
white=emission('Annotation white',(.98,.98,.97))
accent=emission('Annotation number green',(.02,.16,.12))
whiteworld=bpy.data.worlds.new('Exploded clean background');whiteworld.use_nodes=True
bg=next(n for n in whiteworld.node_tree.nodes if n.type=='BACKGROUND')
bg.inputs['Color'].default_value=(1,1,1,1);bg.inputs['Strength'].default_value=.45
# Give camera rays a white backdrop while retaining soft environment illumination.
wn=whiteworld.node_tree.nodes
camera_bg=wn.new('ShaderNodeBackground');camera_bg.inputs['Color'].default_value=(1,1,1,1)
camera_bg.inputs['Strength'].default_value=1
lightpath=wn.new('ShaderNodeLightPath');mix=wn.new('ShaderNodeMixShader')
worldout=next(n for n in wn if n.type=='OUTPUT_WORLD')
whiteworld.node_tree.links.new(lightpath.outputs['Is Camera Ray'],mix.inputs[0])
whiteworld.node_tree.links.new(bg.outputs[0],mix.inputs[1])
whiteworld.node_tree.links.new(camera_bg.outputs[0],mix.inputs[2])
whiteworld.node_tree.links.new(mix.outputs[0],worldout.inputs['Surface'])
scene.world=whiteworld
solar_matte=material('Exploded matte solar blue',(.006,.018,.045))
for child in g1.children:
    if 'Solar cell' in child.name:
        child.data.materials.clear();child.data.materials.append(solar_matte)
case_gray=material('Exploded visible gray enclosure',(.17,.20,.21))
lid_gray=material('Exploded visible gray lid',(.06,.08,.09))
lid_shader=next(n for n in lid_gray.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
lid_shader.inputs['Roughness'].default_value=.85
if 'Specular IOR Level' in lid_shader.inputs:lid_shader.inputs['Specular IOR Level'].default_value=.15
cup_gray=material('Exploded visible sample cup',(.19,.27,.29))
board_green=material('Exploded dark PCB green',(.015,.070,.035))
for child in g2.children:
    if 'Plain removable lid' in child.name:
        child.data.materials.clear();child.data.materials.append(lid_gray)
for child in g19.children:
    if child.type=='MESH' and ('enclosure floor' in child.name or 'Enclosure ' in child.name):
        child.data.materials.clear();child.data.materials.append(case_gray)
for child in g18.children:
    if 'Separate pH soil water sample cup' in child.name or 'Cup bottom' in child.name:
        child.data.materials.clear();child.data.materials.append(cup_gray)
for g in groups:
    for child in g['root'].children:
        if child.type=='MESH':
            for index,mat in enumerate(child.data.materials):
                if mat and mat.name=='Simple PCB':child.data.materials[index]=board_green
regular=bpy.data.fonts.load(r'C:\Windows\Fonts\arial.ttf')
bold=bpy.data.fonts.load(r'C:\Windows\Fonts\arialbd.ttf')
q=cam.rotation_euler.to_quaternion()
right=q@Vector((1,0,0));up=q@Vector((0,1,0));forward=q@Vector((0,0,-1))
aspect=scene.render.resolution_x/scene.render.resolution_y
width=data.ortho_scale;height=width/aspect
plane=cam.location+forward*.55
def screen(u,v):return plane+right*((u-.5)*width)+up*((v-.5)*height)
def annotation(name,body,u,v,size,mat=ink,is_bold=False,align='LEFT'):
    cr=bpy.data.curves.new(name,'FONT');cr.body=body;cr.size=size
    cr.font=bold if is_bold else regular;cr.align_x=align
    obj=bpy.data.objects.new(name,cr);labels.objects.link(obj);obj.location=screen(u,v)-forward*.0003
    obj.rotation_euler=cam.rotation_euler;cr.materials.append(mat)
    return obj

annotation('Figure title','Exploded view of the proposed soil analyzer',.045,.948,.0205,is_bold=True)
annotation('Figure subtitle','Simplified prototype  |  Individually separated parts and labels',.045,.914,.0105,lightink)

# Left/right leader order follows projected part height to keep the paths readable.
layout=[]
for side in ['L','R']:
    ordered=sorted([g for g in groups if g['side']==side],key=lambda g:world_to_camera_view(scene,cam,g['anchor']).y,reverse=True)
    for index,g in enumerate(ordered):
        y=.852-index*(.69/max(1,len(ordered)-1))
        x=.044 if side=='L' else .764
        projected=world_to_camera_view(scene,cam,g['anchor'])
        name='%02d  %s'%(g['num'],g['name'])
        annotation('Label '+name,name,x,y,.0110,is_bold=True)
        if g['subtitle']:
            annotation('Note '+str(g['num']),g['subtitle'],x,y-.019,.0080,lightink)
        edge=.275 if side=='L' else .752
        elbow=.306 if side=='L' else .725
        curve('Leader %02d'%g['num'],[screen(edge,y-.004),screen(elbow,y-.004),screen(projected.x,projected.y)],leaderink,.00042,labels)
        # Small hollow target ring at the component, with no oversized graphic treatment.
        pts=[screen(projected.x+.0033*math.cos(2*math.pi*j/24),projected.y+.0033*aspect*math.sin(2*math.pi*j/24)) for j in range(25)]
        curve('Target %02d'%g['num'],pts,accent,.00045,labels)
        layout.append(dict(number=g['num'],name=g['name'],note=g['subtitle'],column=side,row=index))

annotation('Scope note','NPK inclusion is provisional. Charging boards and battery layout are draft physical placeholders.',.045,.083,.0082,lightink)
annotation('Method note','The pH electrode measures a separately prepared soil-water suspension. No SD storage, GPS or RTC is included.',.045,.060,.0082,lightink)
annotation('Drawing note','Concept illustration: component shapes, dimensions and separation distances are illustrative; this is not a wiring diagram.',.045,.037,.0082,lightink)

# A small second scene provides an unobstructed, labeled component reference.
atlas=bpy.data.scenes.new('04 Labeled component reference')
atlas.world=whiteworld;atlas.unit_settings.system=scene.unit_settings.system
atlas_parts=bpy.data.collections.new('Reference - component copies');atlas.collection.children.link(atlas_parts)
atlas_labels=bpy.data.collections.new('Reference - labels');atlas.collection.children.link(atlas_labels)
atlas_studio=bpy.data.collections.new('Reference - studio');atlas.collection.children.link(atlas_studio)
atlas_cam_data=bpy.data.cameras.new('Reference camera')
atlas_cam=bpy.data.objects.new('Camera all parts reference',atlas_cam_data);atlas_studio.objects.link(atlas_cam)
atlas_cam.location=(0,0,1.8);atlas_cam.rotation_euler=(0,0,0)
atlas_cam_data.type=data.type;atlas_cam_data.ortho_scale=.94;atlas.camera=atlas_cam
atlas.render.engine=scene.render.engine;atlas.render.resolution_x=2200;atlas.render.resolution_y=2000;atlas.render.resolution_percentage=100
atlas.render.image_settings.file_format=scene.render.image_settings.file_format
atlas.render.filepath=os.path.join(OUT,'soil_analyzer_parts_reference.png')
atlas.view_settings.view_transform=scene.view_settings.view_transform;atlas.view_settings.exposure=0
if hasattr(atlas,'eevee'):atlas.eevee.taa_render_samples=16
for obj in studio.objects:
    if obj.type=='LIGHT':atlas_studio.objects.link(obj)

atlas_order=sorted(groups,key=lambda g:g['num'])
tilew=.215;tileh=.132
for idx,g in enumerate(atlas_order):
    row=idx//4;col=idx%4
    cx=(col-1.5)*tilew;cy=.317-row*tileh
    # Rotate each detached part into a clear top/three-quarter presentation.
    root=bpy.data.objects.new('Reference %02d %s'%(g['num'],g['name']),None);atlas_parts.objects.link(root)
    root.location=(cx,cy,.02)
    root.rotation_euler=(math.radians(-62 if g['num']==12 else 28),math.radians(-18),math.radians(-8))
    copies=[]
    for child in g['root'].children:
        new=child.copy()
        if child.data:new.data=child.data.copy()
        atlas_parts.objects.link(new);new.parent=root;copies.append(new)
    # Cup/electrode parts use local semantic anchors; scale from their real geometry bounds.
    bpy.context.window.scene=atlas;bpy.context.view_layer.update()
    verts=[obj.matrix_world@Vector(p) for obj in copies if obj.type in ['MESH','FONT','CURVE'] for p in obj.bound_box]
    if verts:
        lo=Vector(tuple(min(p[k] for p in verts) for k in range(3)))
        hi=Vector(tuple(max(p[k] for p in verts) for k in range(3)))
        span=hi-lo
        scale=min(.150/max(span.x,.001),.068/max(span.y,.001),2.0)
        root.scale=(scale,)*3
        bpy.context.view_layer.update()
        verts=[obj.matrix_world@Vector(p) for obj in copies if obj.type in ['MESH','FONT','CURVE'] for p in obj.bound_box]
        lo=Vector(tuple(min(p[k] for p in verts) for k in range(3)))
        hi=Vector(tuple(max(p[k] for p in verts) for k in range(3)))
        root.location.x+=cx-(hi.x+lo.x)/2
        root.location.y+=cy-(hi.y+lo.y)/2
    # Labels lie in the camera-facing XY plane and remain editable in 3D.
    title='%02d  %s'%(g['num'],g['name'])
    if len(title)>29:
        words=title.split();split=len(words)//2;title=' '.join(words[:split])+'\n'+' '.join(words[split:])
    cr=bpy.data.curves.new('Reference label '+str(g['num']),'FONT');cr.body=title;cr.size=.008;cr.font=bold;cr.align_x='CENTER';cr.space_line=1.12
    obj=bpy.data.objects.new('Reference label '+str(g['num']),cr);atlas_labels.objects.link(obj);obj.location=(cx,cy-.049,.25);cr.materials.append(ink)

def atlas_text(name,body,x,y,size,boldface=False):
    cr=bpy.data.curves.new(name,'FONT');cr.body=body;cr.size=size;cr.font=bold if boldface else regular
    obj=bpy.data.objects.new(name,cr);atlas_labels.objects.link(obj);obj.location=(x,y,.25);cr.materials.append(ink)
atlas_text('Reference title','Parts of the simplified soil analyzer',-.431,.407,.018,True)
atlas_text('Reference subtitle','Numbered to match the exploded view. Model shapes are schematic.',-.431,.383,.009)
atlas_text('Reference footer','NPK is provisional. Charger and converter choices require final electrical verification.',-.431,-.408,.008)

bpy.context.window.scene=scene
bpy.context.view_layer.update()
for obj in bpy.context.selected_objects:obj.select_set(False)
bpy.context.view_layer.objects.active=None
for scr in bpy.data.screens:
    for area in scr.areas:
        if area.type=='VIEW_3D':
            area.spaces.active.region_3d.view_rotation=cam.rotation_euler.to_quaternion()
            area.spaces.active.region_3d.view_location=(.018,0,.235)
            area.spaces.active.region_3d.view_distance=1.25
            area.spaces.active.region_3d.view_perspective=next(e.identifier for e in bpy.types.RegionView3D.bl_rna.properties['view_perspective'].enum_items if e.identifier=='CAMERA')
            area.spaces.active.shading.color_type=next(e.identifier for e in bpy.types.View3DShading.bl_rna.properties['color_type'].enum_items if e.identifier=='MATERIAL')
for font in [regular,bold]:font.pack()
notes=bpy.data.texts.new('Exploded view read me');notes.use_fake_user=True
notes.write('Open scene 03 Exploded and labeled parts for the presentation view.\nOpen scene 04 Labeled component reference for an unobstructed reference of each numbered part.\nScenes 01 and 02 retain the simplified assembled and internal arrangements.\nAll labels and leader lines are native editable Blender objects.\nThe jumper/resistor bundle and push button visualize in-scope items in the supplied materials list; these do not add offline functions.\nConsumables and laboratory instruments, including pH buffers, are not installed parts of the device and are outside this exploded assembly.\nCharging modules, battery arrangement, dimensions and board shapes are conceptual and are not an electrical schematic.\n')
assert len(groups)==22
assert len([o for o in labels.objects if o.name.startswith('Label ')])==22
with open(os.path.join(OUT,'exploded_parts_index.json'),'w',encoding='utf-8') as file:json.dump(sorted(layout,key=lambda d:d['number']),file,indent=2)
target=os.path.join(OUT,'soil_analyzer_exploded_labeled.blend')
bpy.ops.wm.save_as_mainfile(filepath=target,compress=True)
print('Saved exploded proposal:',target,flush=True)
print('Labeled component groups:',len(groups),flush=True)
# Draft rendering checks label placement before final full-resolution export.
if os.environ.get('ANALYZER_FINAL_RENDER')=='1':
    bpy.ops.render.render(write_still=True)
    print('Final exploded overview rendered.',flush=True)
    bpy.context.window.scene=atlas
    bpy.ops.render.render(write_still=True)
    print('Final component reference rendered.',flush=True)
else:
    scene.render.resolution_percentage=55
    scene.render.filepath=os.path.join(OUT,'exploded_layout_check.png')
    if hasattr(scene,'eevee'):scene.eevee.taa_render_samples=8
    bpy.ops.render.render(write_still=True)
    print('Draft overview rendered.',flush=True)
