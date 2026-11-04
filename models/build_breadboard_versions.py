"""Create one exposed breadboard proposal from the saved labeled parts.

Blender CLI: --background soil_analyzer_exploded_labeled.blend --python this.py -- --variant compact
Use scattered for the second variant. Source files are preserved.
"""
import bpy
import math
import os
import sys
import json
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view

OUT=r'C:\Users\Administrator\OneDrive\Desktop\thesis-ni-ezra\models'
variant=sys.argv[sys.argv.index('--variant')+1] if '--variant' in sys.argv else 'compact'
assert variant in ['compact','scattered']
old_scene=bpy.data.scenes['03 Exploded and labeled parts']
old_groups={int(o['part_number']):o for o in bpy.data.objects if 'part_number' in o}
world=old_scene.world
engine=old_scene.render.engine
view_transform=old_scene.view_settings.view_transform
camera_type=old_scene.camera.data.type
image_format=old_scene.render.image_settings.file_format
regular=bpy.data.fonts.get('Arial Regular') or bpy.data.fonts.load(r'C:\Windows\Fonts\arial.ttf')
bold=bpy.data.fonts.get('Arial Bold') or bpy.data.fonts.load(r'C:\Windows\Fonts\arialbd.ttf')
scene=bpy.data.scenes.new('Compact exposed breadboard' if variant=='compact' else 'Scattered breadboard components')
bpy.context.window.scene=scene
scene.world=world
scene.unit_settings.system=old_scene.unit_settings.system
scene['design_scope']='Exposed prototype; no enclosure or lid. Breadboard replaces perfboard.'
scene['source']='paper_revised.docx; selected FL13_refined.docx components; user requested breadboard.'
scene['exclusions']='No SD-card storage, GPS, standalone RTC or offline logging.'
scene['status']='NPK provisional. Power modules and all connections are conceptual.'
parts=bpy.data.collections.new('Components - 19 labeled groups')
labels=bpy.data.collections.new('Labels - hide this collection to inspect bare parts')
studio=bpy.data.collections.new('Studio - helper overlays disabled')
cables=bpy.data.collections.new('Schematic sensor cables')
for col in [parts,labels,studio,cables]:scene.collection.children.link(col)

def material(name,color,rough=.65,metal=0,emission=False):
    m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True
    if emission:
        n=m.node_tree.nodes;n.clear();out=n.new('ShaderNodeOutputMaterial');s=n.new('ShaderNodeEmission')
        s.inputs['Color'].default_value=(*color,1);s.inputs['Strength'].default_value=1
        m.node_tree.links.new(s.outputs[0],out.inputs['Surface'])
    else:
        s=next(n for n in m.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
        s.inputs['Base Color'].default_value=(*color,1);s.inputs['Roughness'].default_value=rough;s.inputs['Metallic'].default_value=metal
    return m

white=material('Breadboard ivory body',(.42,.45,.43),.85)
rim=material('Breadboard lower edge',(.19,.21,.20),.85)
socketmat=material('Breadboard dark recessed socket marks',(.012,.017,.015),.9)
groove=material('Breadboard center channel',(.22,.25,.23),.9)
red=material('Breadboard positive rail red',(.38,.012,.018),.7)
blue=material('Breadboard negative rail blue',(.012,.055,.25),.7)
ink=material('Figure dark text',(.022,.036,.041),emission=True)
secondary=material('Figure secondary text',(.13,.17,.18),emission=True)
badge_mat=material('Figure badge green',(.020,.13,.095),emission=True)
badge_white=material('Figure badge white',(.98,.98,.98),emission=True)
black=bpy.data.materials['Simple black plastic and cables']
specs=[
    (1,1,'Solar panel'),(2,None,'Solderless breadboard'),(3,3,'ESP32 development board'),
    (4,4,'pH interface board'),(5,5,'MAX3485 RS485 interface'),(6,6,'TP4056 charging module'),
    (7,7,'5 V boost converter'),(8,8,'12 V boost converter'),(9,9,'Two rechargeable 18650 cells'),
    (10,10,'Battery holder'),(11,12,'0.96 inch OLED display'),(12,13,'Power switch'),
    (13,14,'Capacitive moisture sensor'),(14,15,'DS18B20 temperature probe'),
    (15,16,'RS485 NPK probe'),(16,17,'Liquid pH electrode'),(17,18,'Soil-water sample cup'),
    (18,21,'Jumper wires and resistor'),(19,22,'Push button')]

def root(num,name):
    o=bpy.data.objects.new('%02d %s'%(num,name),None);parts.objects.link(o);o.empty_display_size=.003
    o['part_number']=num;o['component_label']=name
    return o

groups={}
for num,old_num,name in specs:
    r=root(num,name);groups[num]=r
    if old_num is None:continue
    for old in old_groups[old_num].children:
        o=old.copy()
        if old.data:o.data=old.data.copy()
        parts.objects.link(o);o.name='%02d - %s'%(num,old.name)
        o.parent=r
    if num==15:r['status']='Provisional NPK module; feasibility validation required.'
    if num in [6,7,8,9]:r['status']='Draft physical component only; electrical design unverified.'

def box(name,parent,loc,dims,mat,bevel=.0005):
    bpy.ops.mesh.primitive_cube_add(size=1)
    o=bpy.context.object
    for c in list(o.users_collection):c.objects.unlink(o)
    parts.objects.link(o);o.name=name;o.dimensions=dims
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    o.parent=parent;o.location=loc;o.data.materials.append(mat)
    if bevel:
        b=o.modifiers.new('Small molded radius','BEVEL');b.width=bevel;b.segments=3
    return o

def line(name,points,mat,radius=.00065,parent=None,collection=cables):
    d=bpy.data.curves.new(name,'CURVE');d.dimensions='3D';d.bevel_depth=radius;d.bevel_resolution=3
    s=d.splines.new('BEZIER');s.bezier_points.add(len(points)-1)
    for p,co in zip(s.bezier_points,points):p.co=co;p.handle_left_type='AUTO';p.handle_right_type='AUTO'
    o=bpy.data.objects.new(name,d);collection.objects.link(o);o.parent=parent;d.materials.append(mat)
    return o

def text(name,body,loc,size,mat,parent=None,rotation=(0,0,0),align='CENTER',boldface=False,collection=parts):
    d=bpy.data.curves.new(name,'FONT');d.body=body;d.size=size;d.font=bold if boldface else regular;d.align_x=align
    o=bpy.data.objects.new(name,d);collection.objects.link(o);o.parent=parent;o.location=loc;o.rotation_euler=rotation;d.materials.append(mat)
    return o

# Generic full-size solderless breadboard: 630 terminal + 200 rail socket marks.
bb=groups[2]
bb['type']='Generic 830-contact solderless breadboard'
bb['illustrative_size_mm']='165 x 55 x 10'
box('Breadboard lower base',bb,(0,0,-.0035),(.166,.056,.003),rim,.001)
box('Breadboard molded body',bb,(0,0,0),(.165,.055,.010),white,.0015)
box('Breadboard central trench',bb,(0,0,.00515),(.158,.0044,.00025),groove,.0002)
socket_centers=[]
for i in range(63):
    x=(i-31)*.00254
    for sign in [-1,1]:
        for j in range(5):socket_centers.append((x,sign*(.00381+j*.00254),.00528))
for i in range(50):
    x=-.073+(i//5)*.015+(i%5)*.00254
    for y in [-.02286,-.02032,.02032,.02286]:socket_centers.append((x,y,.00528))
verts=[];faces=[]
for x,y,z in socket_centers:
    k=len(verts);r=.00046
    verts.extend([(x-r,y-r,z),(x+r,y-r,z),(x+r,y+r,z),(x-r,y+r,z)])
    faces.append((k,k+1,k+2,k+3))
mesh=bpy.data.meshes.new('830 socket openings mesh');mesh.from_pydata(verts,[],faces);mesh.update()
holes=bpy.data.objects.new('Breadboard 830 socket opening marks',mesh);parts.objects.link(holes);holes.parent=bb;mesh.materials.append(socketmat)
bb['socket_count']=len(socket_centers)
assert len(socket_centers)==830
for sign in [-1,1]:
    box('Positive power rail stripe',bb,(0,sign*.0253,.00530),(.153,.00040,.00015),red,.00008)
    box('Negative power rail stripe',bb,(0,sign*.0183,.00530),(.153,.00040,.00015),blue,.00008)
    text('Power rail plus','+',(-.077,sign*.0250,.0055),.0022,red,parent=bb)
    text('Power rail minus','-',(-.077,sign*.0183,.0055),.0022,blue,parent=bb)
for i in [1,5,10,15,20,25,30,35,40,45,50,55,60,63]:
    text('Breadboard column '+str(i),str(i),((i-32)*.00254,.0160,.0056),.00165,ink,parent=bb)

def bounds(objects):
    points=[o.matrix_world@Vector(p) for o in objects if o.type in ['MESH','CURVE','FONT'] for p in o.bound_box]
    lo=Vector(tuple(min(p[k] for p in points) for k in range(3)))
    hi=Vector(tuple(max(p[k] for p in points) for k in range(3)))
    return lo,hi

if variant=='compact':
    positions={1:(0,.195,.005),2:(-.015,0,.009),3:(-.060,0,.018),4:(-.070,.065,.004),
        5:(.015,0,.018),6:(.003,.055,.003),7:(.040,.055,.003),8:(.078,.055,.003),
        9:(.046,.098,.013),10:(.046,.098,.0105),11:(.030,-.068,.016),12:(-.070,-.060,.006),
        13:(.165,-.025,.012),14:(.195,-.020,.011),15:(.225,.025,.020),
        16:(-.185,-.010,.080),17:(-.185,-.010,0),18:(-.008,-.005,.019),19:(.050,0,.017)}
    for n,p in positions.items():groups[n].location=p
    for n in [3,5,9,10]:groups[n].rotation_euler.z=math.pi/2
    groups[11].rotation_euler.x=math.radians(-25)
    for n in [13,14,15]:groups[n].rotation_euler.x=math.radians(75)
    line('pH electrode cable',[(-.185,-.010,.134),(-.158,-.045,.10),(-.108,.014,.009),(-.070,.080,.009)],black)
    line('Moisture sensor cable',[(.165,-.082,.027),(.14,-.075,.012),(.10,-.04,.007),(.05,-.02,.020)],black)
    line('Temperature probe cable',[(.195,-.064,.023),(.158,-.092,.007),(.09,-.080,.006),(.025,-.015,.021)],black)
    line('NPK interface cable schematic',[(.225,.006,.025),(.18,.03,.008),(.12,.01,.006),(.015,.005,.021)],black)
    line('Solar charge lead schematic',[(-.05,.142,.010),(-.025,.13,.007),(-.030,.090,.006),(.003,.065,.007)],black)
else:
    # Spread the same 19 groups into a clear, editable 3D reference layout.
    for num,oldnum,name in specs:
        row=(num-1)//4;col=(num-1)%4
        cx=(col-1.5)*.215;cy=.292-row*.152
        g=groups[num];g.location=(cx,cy,.025)
        tilt=-62 if num==11 else (-28 if num in [13,15] else 28)
        g.rotation_euler=(math.radians(tilt),math.radians(-18),math.radians(-8))
        bpy.context.view_layer.update()
        lo,hi=bounds(g.children);span=hi-lo
        scale=min(.154/max(span.x,.001),.078/max(span.y,.001),2.5)
        g.scale=(scale,)*3
        bpy.context.view_layer.update()
        lo,hi=bounds(g.children)
        g.location.x+=cx-(lo.x+hi.x)/2;g.location.y+=cy-(lo.y+hi.y)/2
        caption='%02d  %s'%(num,name)
        if len(caption)>30:
            words=caption.split();split=len(words)//2;caption=' '.join(words[:split])+'\n'+' '.join(words[split:])
        text('Component label %02d'%num,caption,(cx,cy-.055,.25),.0083,ink,boldface=True,collection=labels)

# Lighting is kept gentle so white breadboard details remain visible.
def aim(o,at):o.rotation_euler=(Vector(at)-o.location).to_track_quat('-Z','Y').to_euler()
for name,loc,energy,size in [('Key',(-.45,-.55,.95),7,.65),('Fill',(.6,-.2,.8),4,.65),('Rear',(.1,.65,.9),5,.6)]:
    d=bpy.data.lights.new('Breadboard '+name,'AREA');d.energy=energy;d.size=size
    o=bpy.data.objects.new(d.name,d);studio.objects.link(o);o.location=loc;aim(o,(0,.04,.03))
cd=bpy.data.cameras.new('Breadboard presentation camera')
cam=bpy.data.objects.new('Camera '+variant,cd);studio.objects.link(cam);cd.type=camera_type;cd.display_size=.02
scene.camera=cam
scene.render.engine=engine
scene.render.resolution_x=2200;scene.render.resolution_y=1800 if variant=='compact' else 2000
scene.render.resolution_percentage=100;scene.render.image_settings.file_format=image_format
scene.render.film_transparent=False
scene.view_settings.view_transform=view_transform;scene.view_settings.exposure=0
if hasattr(scene,'eevee'):scene.eevee.taa_render_samples=16
scene.render.filepath=os.path.join(OUT,'soil_analyzer_breadboard_'+variant+'.png')

if variant=='compact':
    target=Vector((.015,.05,.035));cam.location=(.36,-.60,.95);aim(cam,target);cd.ortho_scale=.68
    q=cam.rotation_euler.to_quaternion();right=q@Vector((1,0,0));up=q@Vector((0,1,0));fwd=q@Vector((0,0,-1))
    height=cd.ortho_scale*scene.render.resolution_y/scene.render.resolution_x
    cam.location-=up*(.14*height)
    plane=cam.location+fwd*.40
    def screen(u,v):return plane+right*((u-.5)*cd.ortho_scale)+up*((v-.5)*height)
    def screen_text(name,body,u,v,size,mat=ink,boldface=False):
        return text(name,body,screen(u,v)-fwd*.0001,size,mat,rotation=cam.rotation_euler,align='LEFT',boldface=boldface,collection=labels)
    screen_text('Figure title','Compact exposed breadboard prototype',.045,.950,.014,boldface=True)
    screen_text('Figure subtitle','No enclosure or lid  |  Numbers identify the components listed below',.045,.918,.0078,secondary)
    bpy.context.view_layer.update()
    anchors={n:Vector(p) for n,p in positions.items()}
    anchors[2]=Vector((-.094,-.020,.014));anchors[10]=Vector((.087,.098,.013))
    anchors[17]=Vector((-.185,-.010,.033));anchors[13]=Vector((.165,-.035,.012))
    desired={n:Vector((world_to_camera_view(scene,cam,p).x,world_to_camera_view(scene,cam,p).y)) for n,p in anchors.items()}
    placed={n:p.copy() for n,p in desired.items()}
    # Keep small number badges apart; only short displaced leaders are used.
    for iteration in range(90):
        for n in placed:placed[n]+=(desired[n]-placed[n])*.035
        for a in placed:
            for b in placed:
                if a>=b:continue
                diff=placed[a]-placed[b];distance=diff.length
                if distance<.026:
                    direction=diff.normalized() if distance>.00001 else Vector((1,0))
                    shift=direction*(.026-distance)*.52;placed[a]+=shift;placed[b]-=shift
    for n,p in placed.items():
        center=screen(p.x,p.y)-fwd*.0002;r=.0044
        verts=[center]+[center+right*(r*math.cos(2*math.pi*j/40))+up*(r*math.sin(2*math.pi*j/40)) for j in range(40)]
        faces=[(0,j+1,(j+1)%40+1) for j in range(40)]
        mesh=bpy.data.meshes.new('Number badge '+str(n));mesh.from_pydata(verts,[],faces);mesh.update()
        o=bpy.data.objects.new('Number badge %02d'%n,mesh);labels.objects.link(o);mesh.materials.append(badge_mat)
        text('Component number %02d'%n,'%02d'%n,center-up*.00175-fwd*.0002,.0051,badge_white,rotation=cam.rotation_euler,boldface=True,collection=labels)
        if (p-desired[n]).length>.008:
            line('Short label leader %02d'%n,[screen(desired[n].x,desired[n].y),screen(p.x,p.y)],secondary,.00018,collection=labels)
    screen_text('Legend heading','Components',.045,.316,.0086,boldface=True)
    for num,oldnum,name in specs:
        col=(num-1)//7;row=(num-1)%7
        screen_text('Component label %02d'%num,'%02d  %s'%(num,name),[.045,.365,.685][col],.285-row*.031,.0073,boldface=True)
    screen_text('Scope note','NPK is provisional. Jumper routes and power modules are schematic; final wiring is not specified.',.045,.038,.0064,secondary)
else:
    cam.location=(0,0,1.8);cam.rotation_euler=(0,0,0);cd.ortho_scale=.94
    text('Figure title','Separated breadboard prototype components',(-.431,.405,.25),.017,ink,boldface=True,align='LEFT',collection=labels)
    text('Figure subtitle','Same components as the compact version  |  No enclosure, lid or perfboard',(-.431,.380,.25),.0088,secondary,align='LEFT',collection=labels)
    text('Scope note','NPK is provisional. Board shapes and power modules are conceptual; this is not a wiring diagram.',(-.431,-.405,.25),.0078,secondary,align='LEFT',collection=labels)

# Save a clean single-scene file for each version, leaving the earlier files untouched.
for old in list(bpy.data.scenes):
    if old!=scene:bpy.data.scenes.remove(old)
for old in list(bpy.data.texts):bpy.data.texts.remove(old)
notes=bpy.data.texts.new('Breadboard prototype notes');notes.use_fake_user=True
notes.write('Version: '+variant+'\n\nNo enclosure or lid is included. The perfboard is replaced with a generic 830-contact solderless breadboard.\nThe compact assembly has the ESP32, RS485 interface, resistor/jumpers and push button around the breadboard; the other modules and battery holder sit adjacent. The solar panel is beside the exposed assembly.\nThe scattered view presents the same 19 numbered component groups separately.\nLabels are editable Blender objects. Hide the Labels collection to inspect geometry alone. Viewport helper overlays are disabled by default.\nThe pH electrode uses a separate soil-water suspension. NPK remains provisional. No microSD, RTC, GPS or offline storage is included.\nShapes, dimensions, breadboard socket marks and wire routes are illustrative. No complete electrical circuit, validated solar charging configuration or series/parallel battery arrangement is specified.\n')
bpy.data.orphans_purge(do_recursive=True)
bpy.context.window.scene=scene;bpy.context.view_layer.update()
for o in bpy.context.selected_objects:o.select_set(False)
bpy.context.view_layer.objects.active=None
for scr in bpy.data.screens:
    for area in scr.areas:
        if area.type=='VIEW_3D':
            area.spaces.active.region_3d.view_rotation=cam.rotation_euler.to_quaternion()
            area.spaces.active.region_3d.view_location=(.015,.05,.035) if variant=='compact' else (0,0,.02)
            area.spaces.active.region_3d.view_distance=.8 if variant=='compact' else 1.1
            area.spaces.active.region_3d.view_perspective=next(e.identifier for e in bpy.types.RegionView3D.bl_rna.properties['view_perspective'].enum_items if e.identifier=='CAMERA')
            area.spaces.active.overlay.show_overlays=False
            area.spaces.active.overlay.show_relationship_lines=False
            area.spaces.active.overlay.show_extras=False
            area.spaces.active.shading.color_type=next(e.identifier for e in bpy.types.View3DShading.bl_rna.properties['color_type'].enum_items if e.identifier=='MATERIAL')
for f in [regular,bold]:
    if not f.packed_file:f.pack()
assert len(groups)==19 and len(bpy.data.scenes)==1
assert len([o for o in labels.objects if o.name.startswith('Component label ')])==19
assert not any(any(word in o.name.lower() for word in ['perfboard','enclosure','removable lid','microsd','gps','rtc']) for o in scene.objects)
file_path=os.path.join(OUT,'soil_analyzer_breadboard_'+variant+'.blend')
bpy.ops.wm.save_as_mainfile(filepath=file_path,compress=True)
print('Saved',variant,':',file_path,flush=True)
print('19 labeled groups; 830 breadboard socket marks; no enclosure, cover or perfboard.',flush=True)
bpy.ops.render.render(write_still=True)
print('Rendered:',scene.render.filepath,flush=True)
