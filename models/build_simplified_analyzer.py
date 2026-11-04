"""Minimal proposal based on paper_revised.docx and the user's FL13_refined.docx.
Run inside Blender. Mechanical envelopes are illustrative; no electrical wiring is specified.
"""
import bpy
import math
import os
from mathutils import Vector

OUT = r'C:\Users\Administrator\OneDrive\Desktop\thesis-ni-ezra\models'
simple = bpy.data.scenes.new('01 Simplified soil analyzer')
bpy.context.window.scene = simple
simple.unit_settings.system = next(e.identifier for e in simple.unit_settings.bl_rna.properties['system'].enum_items if e.identifier == 'METRIC')
simple['sources'] = 'docs/paper_revised.docx; user supplied FL13_refined.docx'
simple['scope'] = 'Wi-Fi to web/server storage. No SD logging, offline queue, GPS, or standalone RTC.'
simple['enclosure_envelope_mm'] = '204 x 144 x 83 including cover; illustrative, final fitting pending'
simple['pH'] = 'Separate soil-water suspension. Glass electrode is not a dry-soil insertion probe.'
simple['NPK'] = 'Provisional RS485 probe; feasibility validation required by revised paper.'

def coll(name, scene=simple):
    c=bpy.data.collections.new(name)
    scene.collection.children.link(c)
    return c

case=coll('Simple - plain enclosure')
panel=coll('Simple - flat solar panel')
sensing=coll('Simple - sensors and separate sample cup')
electronics=coll('Simple - selected draft components')
surface=coll('Simple - screen and cable entries')
stage=coll('Simple - presentation only')
active_coll=case

def mat(name,color,metal=0,rough=.45):
    m=bpy.data.materials.new('Simple '+name)
    m.use_nodes=True
    m.diffuse_color=(*color,1)
    bsdf=next(n for n in m.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
    bsdf.inputs['Base Color'].default_value=(*color,1)
    bsdf.inputs['Metallic'].default_value=metal
    bsdf.inputs['Roughness'].default_value=rough
    return m

gray=mat('gray plastic',(.58,.62,.60))
lidmat=mat('light gray lid',(.79,.82,.79))
black=mat('black plastic and cables',(.018,.023,.024))
steel=mat('steel',(.56,.63,.66),.75,.28)
bluecell=mat('solar cells',(.018,.055,.12),.25,.3)
boardmat=mat('PCB',(.04,.23,.13))
gold=mat('contacts',(.58,.34,.06),.65,.3)
oled=mat('OLED text',(.4,.85,.9),0,.4)
soilmat=mat('sample soil',(.17,.11,.065),0,.94)
slurrymat=mat('soil water suspension',(.22,.16,.1),0,.62)
cupmat=mat('sample container',(.67,.75,.73),0,.4)
amber=mat('provisional NPK marker',(.9,.43,.08))
red=mat('18650 sleeve',(.32,.055,.075))
groundmat=mat('studio background',(.86,.88,.87),0,.8)

def move(o,name,material):
    o.name=name
    for c in list(o.users_collection):c.objects.unlink(o)
    active_coll.objects.link(o)
    o.data.materials.append(material)
    return o

def box(name,loc,dims,material,bevel=.002):
    bpy.ops.mesh.primitive_cube_add(size=1,location=loc)
    o=move(bpy.context.object,name,material)
    o.dimensions=dims
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    if bevel:
        b=o.modifiers.new('Small edge radius','BEVEL');b.width=bevel;b.segments=3
    return o

def cyl(name,loc,r,h,material,axis=(0,0,1)):
    bpy.ops.mesh.primitive_cylinder_add(vertices=32,radius=r,depth=h,location=loc)
    o=move(bpy.context.object,name,material)
    o.rotation_euler=Vector(axis).to_track_quat('Z','Y').to_euler()
    for p in o.data.polygons:p.use_smooth=len(p.vertices)==4
    return o

def line(name,pts,r=.0015,material=black):
    cr=bpy.data.curves.new(name,'CURVE');cr.dimensions='3D';cr.bevel_depth=r;cr.bevel_resolution=3
    sp=cr.splines.new('BEZIER');sp.bezier_points.add(len(pts)-1)
    for p,co in zip(sp.bezier_points,pts):p.co=co;p.handle_left_type='AUTO';p.handle_right_type='AUTO'
    o=bpy.data.objects.new(name,cr);active_coll.objects.link(o);cr.materials.append(material)
    return o

def txt(name,body,loc,size,material,rotation=(math.pi/2,0,0)):
    cr=bpy.data.curves.new(name,'FONT');cr.body=body;cr.size=size;cr.align_x='CENTER'
    o=bpy.data.objects.new(name,cr);active_coll.objects.link(o);o.location=loc;o.rotation_euler=rotation;cr.materials.append(material)
    return o

# A plain off-the-shelf-style box; no carry frame, articulated panel, or cup station.
base=box('Plain enclosure floor',(0,0,.014),(.200,.140,.008),gray,.004)
box('Enclosure front wall',(0,-.067,.050),(.200,.006,.072),gray,.003)
box('Enclosure rear wall',(0,.067,.050),(.200,.006,.072),gray,.003)
box('Enclosure left wall',(-.097,0,.050),(.006,.128,.072),gray,.002)
box('Enclosure right wall',(.097,0,.050),(.006,.128,.072),gray,.002)
box('Plain removable lid',(0,0,.090),(.204,.144,.006),lidmat,.004)
for x in [-.085,.085]:
    for y in [-.055,.055]:
        cyl('Lid screw',(x,y,.0937),.0024,.0015,steel)
        box('Plain rubber foot',(x,y,.005),(.017,.017,.010),black,.002)

active_coll=panel
box('Flat solar panel frame',(0,0,.098),(.164,.110,.008),steel,.002)
box('Solar panel backing',(0,0,.1023),(.156,.102,.0015),black,.001)
for row in range(2):
    for col in range(4):
        cx=(col-1.5)*.0375;cy=(row-.5)*.048
        box('Solar cell', (cx,cy,.1035),(.035,.045,.001),bluecell,.001)
        box('Cell center strip',(cx,cy,.1041),(.0003,.043,.00015),steel,0)

active_coll=surface
txt('Simple enclosure title','SOIL ANALYZER',(-.047,-.0705,.070),.0065,black)
box('0.96 inch OLED bezel',(.047,-.071,.068),(.034,.004,.022),black,.0015)
txt('OLED status only','Wi-Fi',(.047,-.0733,.071),.004,oled)
txt('OLED status caption','CONNECT',(.047,-.0733,.064),.0027,oled)
for x,label in [(-.073,'pH'),(-.025,'MOIST'),(.025,'TEMP'),(.073,'NPK*')]:
    cyl(label+' simple cable gland',(x,-.073,.034),.0045,.009,black,(0,-1,0))
    txt(label+' small label',label,(x,-.0705,.022),.0038,black)
cyl('Basic power switch',(.101,-.035,.055),.0055,.004,black,(1,0,0))

active_coll=sensing
# Presentation soil block is context, not an added hardware component.
soilblock=box('Soil sample context',(.193,.019,.015),(.130,.095,.030),soilmat,.002)
soilblock['role']='Presentation soil sample only; not part of the materials list.'
box('Capacitive moisture blade',(.148,.012,.059),(.015,.0025,.084),boardmat,.0007)
box('Moisture sensor upper board',(.148,.012,.106),(.019,.008,.022),black,.001)
for x in [.144,.148,.152]:box('Moisture electrode schematic',(x,.0105,.055),(.0007,.0002,.057),gold,.0001)
cyl('DS18B20 waterproof steel probe',(.188,.012,.058),.003,.060,steel)
cyl('Temperature probe cable sleeve',(.188,.012,.095),.0045,.017,black)
npk=box('Provisional RS485 NPK probe',(.233,.019,.088),(.040,.021,.035),black,.002)
npk['status']='Provisional. Feasibility check and matched laboratory validation first.'
box('Provisional NPK marker',(.233,.008,.098),(.036,.001,.003),amber,.0003)
txt('NPK identification','NPK*',(.233,.0077,.083),.0045,lidmat)
for x in [.219,.233,.247]:cyl('NPK tine',(x,.019,.046),.002,.052,steel)

# A separate sample cup, rather than a built-in container or dry-soil pH probe.
cupx,cupy=-.160,.014
verts=[];faces=[];sides=48
for z,r in [(.001,.032),(.065,.032),(.001,.029),(.065,.029)]:
    verts.extend([(cupx+r*math.cos(2*math.pi*i/sides),cupy+r*math.sin(2*math.pi*i/sides),z) for i in range(sides)])
for i in range(sides):
    j=(i+1)%sides
    faces.extend([(i,j,sides+j,sides+i),(2*sides+j,2*sides+i,3*sides+i,3*sides+j),(sides+i,sides+j,3*sides+j,3*sides+i)])
mesh=bpy.data.meshes.new('Separate sample cup mesh');mesh.from_pydata(verts,[],faces);mesh.update()
cup=bpy.data.objects.new('Separate pH soil water sample cup',mesh);sensing.objects.link(cup);mesh.materials.append(cupmat)
cyl('Cup bottom',(cupx,cupy,.002),.030,.003,cupmat)
cyl('Prepared suspension',(cupx,cupy,.041),.0285,.002,slurrymat)
cyl('Liquid pH electrode',(cupx,cupy,.080),.0045,.083,black)
cyl('Electrode upper sleeve',(cupx,cupy,.125),.006,.015,boardmat)
txt('Separate cup label','pH SAMPLE',(cupx,cupy-.0325,.031),.004,black)

line('pH cable',[(-.073,-.078,.034),(-.12,-.10,.018),(-.189,-.065,.069),(cupx,cupy,.134)])
line('Moisture cable',[(-.025,-.078,.034),(.0,-.105,.012),(.105,-.09,.012),(.148,-.045,.065),(.148,.012,.118)])
line('Temperature cable',[(.025,-.078,.034),(.07,-.112,.009),(.157,-.08,.015),(.188,-.025,.065),(.188,.012,.105)],r=.0012)
line('NPK cable',[(.073,-.078,.034),(.118,-.11,.013),(.226,-.074,.012),(.25,-.03,.079),(.233,.019,.108)])

active_coll=electronics
box('Basic perfboard',(-.049,-.002,.025),(.076,.101,.004),boardmat,.001)
box('ESP32 development board',(-.051,-.020,.034),(.028,.052,.006),boardmat,.001)
box('ESP32 RF shield',(-.051,-.019,.040),(.018,.022,.007),steel,.0005)
box('ESP32 antenna end',(-.051,.002,.039),(.020,.012,.002),black,.0005)
box('pH interface board',(-.069,.038,.034),(.031,.025,.006),boardmat,.0007)
cyl('pH interface BNC socket',(-.069,.053,.039),.004,.011,steel,(0,1,0))
box('MAX3485 RS485 interface',(-.027,.034,.034),(.025,.026,.006),boardmat,.0007)
box('RS485 terminal block',(-.027,.043,.040),(.016,.008,.007),black,.0005)
box('Two cell holder physical placeholder',(.041,.005,.027),(.047,.075,.021),black,.001)
for x in [.031,.051]:
    cyl('18650 cell illustrative',(x,.005,.037),.009,.065,red,(0,1,0))
    cyl('18650 metal cap',(x,.038,.037),.0075,.001,steel,(0,1,0))
box('TP4056 draft charging module placeholder',(.040,.053,.026),(.034,.020,.004),boardmat,.0007)
box('5V boost module placeholder',(.025,-.050,.026),(.031,.020,.005),boardmat,.0007)
box('12V boost module placeholder',(.066,-.050,.026),(.031,.020,.005),boardmat,.0007)
for x,y in [(.025,-.05),(.066,-.05),(.04,.053)]:
    box('Module component placeholder',(x,y,.032),(.010,.010,.007),black,.0007)
# No wiring between the charging modules and cells: the electrical design is unverified.

active_coll=stage
box('Simple studio ground',(0,0,-.004),(3,3,.006),groundmat,0)
world=bpy.data.worlds.new('Simple neutral world');world.use_nodes=True
bg=next(n for n in world.node_tree.nodes if n.type=='BACKGROUND')
bg.inputs['Color'].default_value=(.8,.85,.88,1);bg.inputs['Strength'].default_value=.45
simple.world=world
def point(o,at):o.rotation_euler=(Vector(at)-o.location).to_track_quat('-Z','Y').to_euler()
for name,loc,energy,size in [('Simple key',(-.4,-.5,.7),18,.5),('Simple fill',(.5,-.1,.55),12,.4),('Simple rear',(.1,.5,.7),18,.5)]:
    d=bpy.data.lights.new(name,'AREA');d.energy=energy;d.size=size
    o=bpy.data.objects.new(name,d);stage.objects.link(o);o.location=loc;point(o,(0,0,.04))
d=bpy.data.cameras.new('Simple assembly camera');cam=bpy.data.objects.new('Camera simple assembly',d);stage.objects.link(cam)
cam.location=(.47,-.73,.55);point(cam,(.025,0,.060))
d.type=next(e.identifier for e in d.bl_rna.properties['type'].enum_items if e.identifier=='ORTHO');d.ortho_scale=.565
simple.camera=cam
# New scenes use this Blender installation's default render engine.
simple.render.resolution_x=1500;simple.render.resolution_y=1050;simple.render.resolution_percentage=100
simple.render.image_settings.file_format=next(e.identifier for e in simple.render.image_settings.bl_rna.properties['file_format'].enum_items if e.identifier=='PNG')
simple.render.filepath=os.path.join(OUT,'soil_analyzer_simplified.png')
if hasattr(simple,'eevee'):simple.eevee.taa_render_samples=16
if 'AgX' in [e.identifier for e in simple.view_settings.bl_rna.properties['view_transform'].enum_items]:simple.view_settings.view_transform='AgX'
simple.view_settings.exposure=-.4

internal=bpy.data.scenes.new('02 Simplified internal arrangement')
internal.world=world;internal.unit_settings.system=simple.unit_settings.system
internal.collection.children.link(electronics);internal.collection.children.link(stage)
basecollection=coll('Simple - internal base and camera',internal)
basecollection.objects.link(base)
icd=bpy.data.cameras.new('Simple internal camera');ic=bpy.data.objects.new('Camera simple internals',icd);basecollection.objects.link(ic)
ic.location=(.27,-.35,.60);point(ic,(0,0,.025));icd.type=d.type;icd.ortho_scale=.255
internal.camera=ic;internal.render.engine=simple.render.engine
internal.render.resolution_x=1200;internal.render.resolution_y=1000;internal.render.resolution_percentage=100
internal['note']='Physical component placeholders only. No validated electrical wiring, battery configuration or solar charger compatibility is implied.'

notes=bpy.data.texts.new('Simple design scope and assumptions')
notes.write('SIMPLIFIED THESIS PROPOSAL\n\nAuthority: docs/paper_revised.docx and the user\'s scope instructions; FL13_refined.docx supplies draft component choices.\n\nIncluded: plain enclosure, flat solar panel, ESP32, 2 physical 18650 cell placeholders and holder, draft charging and boost module placeholders, MAX3485, pH interface, basic perfboard, OLED status display, power switch, moisture sensor, DS18B20 and provisional RS485 NPK probe.\npH uses a separate prepared soil-water suspension cup.\nExcluded: microSD module/card, offline logging/buffering/sync, GPS and standalone RTC.\nThe OLED is from the materials list; it shows status, not offline history or fertilizer recommendations.\nThe web/server side stores records and runs monitoring and advisory functions. A local/institutional web server is allowed by the revised paper; a paid cloud service is not assumed.\nNPK remains conditional on the feasibility and laboratory checks in the revised paper.\nEnclosure approx 204 x 144 x 83 mm including cover; solar panel approx 164 x 110 mm. Sizes are illustrative and not verified against purchased parts.\nThe soil block and separate sample cup illustrate the measurement method. No mounted cup carrier, large handle, articulated solar frame, or custom probe rack is included.\nThe charging and boost boards are draft physical placeholders only. Battery configuration, input/output ratings and solar/charger suitability require the chosen parts\' datasheets. This is not a circuit diagram or fabrication CAD.\n')

for obj in bpy.context.selected_objects:obj.select_set(False)
bpy.context.view_layer.objects.active=None
for screen in bpy.data.screens:
    for area in screen.areas:
        if area.type=='VIEW_3D':
            area.spaces.active.region_3d.view_rotation=cam.rotation_euler.to_quaternion()
            area.spaces.active.region_3d.view_location=(.025,0,.06)
            area.spaces.active.region_3d.view_distance=.65

# Save normally: partial-library scene export crashes this Blender release candidate.
target_path=os.path.join(OUT,'soil_analyzer_simplified.blend')
notes.use_fake_user=True
for prior_scene in list(bpy.data.scenes):
    if prior_scene not in (simple,internal):bpy.data.scenes.remove(prior_scene)
bpy.data.orphans_purge(do_recursive=True)
bpy.context.window.scene=simple
bpy.ops.wm.save_as_mainfile(filepath=target_path,compress=True)
print('Saved simplified proposal:',target_path)
print('Assembly objects:',len(simple.objects))
print('Excluded: SD storage, offline logging, RTC and GPS.')
if bpy.app.background:
    bpy.ops.render.render(write_still=True)
    with open(os.path.join(OUT,'simplified_render_complete.txt'),'w') as complete:
        complete.write('Simplified model and render completed.\n'+target_path)
