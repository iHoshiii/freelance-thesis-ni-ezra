"""Proposed thesis enclosure, built in the live Blender through MCP.

Source: docs/paper_revised.docx, Components of the Device and Hardware Development.
All mechanical dimensions are concept assumptions, in metres. This is not fabrication CAD.
"""
import bpy
import math
import os
from mathutils import Vector

ROOT = r'C:\Users\Administrator\OneDrive\Desktop\thesis-ni-ezra\models'
scene = bpy.data.scenes.new('01 Proposed soil analyzer')
bpy.context.window.scene = scene
scene.unit_settings.system = next(i.identifier for i in scene.unit_settings.bl_rna.properties['system'].enum_items if i.identifier == 'METRIC')
scene.unit_settings.scale_length = 1
scene['design_status'] = 'Concept only; dimensions illustrative, component selection and fitting pending.'
scene['thesis_source'] = 'docs/paper_revised.docx: Components of the Device; Hardware Development'
scene['nominal_enclosure_mm'] = '304 W x 224 D x 157 H including cover; excludes feet, panel, handle and accessories'
scene['pH_method'] = 'Liquid pH electrode in separately prepared soil-water suspension, never directly in dry soil.'
scene['NPK_status'] = 'Optional module; subject to feasibility checks and laboratory validation.'
scene['display_note'] = 'Local status LEDs only; measurements and advisory are accessed through the web application.'

def collection(name):
    c = bpy.data.collections.new(name)
    scene.collection.children.link(c)
    return c

housing = collection('01 Enclosure and removable cover')
power = collection('02 Solar charging and carry handle')
probes = collection('03 Detachable soil probes')
ph = collection('04 Soil water suspension pH station')
internals = collection('05 Electronics conceptual arrangement')
details = collection('06 Controls connectors and markings')
studio = collection('07 Studio lighting and cameras')
current = housing

def move(obj, name, mat=None):
    obj.name = name
    for c in list(obj.users_collection):
        c.objects.unlink(obj)
    current.objects.link(obj)
    if mat:
        obj.data.materials.append(mat)
    return obj

def material(name, color, metallic=0, rough=.4):
    m = bpy.data.materials.new(name)
    m.diffuse_color = (*color, 1)
    m.use_nodes = True
    n = next(n for n in m.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
    n.inputs['Base Color'].default_value = (*color, 1)
    n.inputs['Metallic'].default_value = metallic
    n.inputs['Roughness'].default_value = rough
    return m

teal = material('Deep agricultural green polymer', (.025,.135,.12), .05,.31)
ivory = material('Warm light gray enclosure', (.77,.8,.75), 0,.32)
rubber = material('Rubber seals and cables', (.017,.025,.027), 0,.52)
silver = material('Stainless steel probes', (.56,.64,.67), .85,.23)
solarblue = material('Photovoltaic blue cells', (.018,.057,.125), .4,.23)
solarline = material('Solar cell silver busbars', (.36,.48,.59), .55,.3)
white = material('Printed ivory markings', (.91,.95,.91), 0,.5)
ink = material('Dark printed markings', (.03,.1,.09), 0,.5)
amber = material('Provisional component amber', (.95,.42,.055), .12,.35)
green = material('Power indicator green', (.22,.8,.35), .1,.25)
blue = material('WiFi indicator blue', (.07,.5,.95), .1,.25)
pcbmat = material('Printed circuit board', (.025,.24,.16), .1,.4)
copper = material('PCB contact gold', (.65,.39,.09), .7,.28)
slurry = material('Soil water suspension schematic', (.19,.12,.065), 0,.73)
cupmat = material('Sample cup translucent polymer schematic', (.65,.77,.75), .05,.28)
floor = material('Studio off white', (.86,.88,.87), 0,.78)

def box(name, loc, dims, mat, bevel=.003):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    o = move(bpy.context.object, name, mat)
    o.dimensions = dims
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel:
        m = o.modifiers.new('Rounded manufactured edges', 'BEVEL')
        m.width = bevel
        m.segments = 3
    return o

def cyl(name, loc, radius, depth, mat, axis=None, vertices=48):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=depth, location=loc)
    o = move(bpy.context.object, name, mat)
    if axis:
        o.rotation_euler = Vector(axis).to_track_quat('Z','Y').to_euler()
    m = o.modifiers.new('Edge fillet', 'BEVEL')
    m.width = min(.0012, radius*.14)
    m.segments = 3
    for p in o.data.polygons:
        p.use_smooth = len(p.vertices) == 4
    return o

def sphere(name, loc, scale, mat):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=12, location=loc)
    o = move(bpy.context.object, name, mat)
    o.scale = scale
    for p in o.data.polygons:
        p.use_smooth = True
    return o

def rod(name, a,b, r,mat):
    a,b = Vector(a),Vector(b)
    return cyl(name, (a+b)/2, r,(b-a).length,mat,b-a)

def cable(name, pts, mat=rubber, radius=.0021):
    cr = bpy.data.curves.new(name,'CURVE')
    cr.dimensions = '3D'
    cr.bevel_depth = radius
    cr.bevel_resolution = 4
    s = cr.splines.new('BEZIER')
    s.bezier_points.add(len(pts)-1)
    for p,v in zip(s.bezier_points,pts):
        p.co = v
        p.handle_left_type = 'AUTO'
        p.handle_right_type = 'AUTO'
    o = bpy.data.objects.new(name,cr)
    current.objects.link(o)
    cr.materials.append(mat)
    return o

def text(name, body, loc, size, mat, rotation=(math.pi/2,0,0), align='CENTER'):
    cr = bpy.data.curves.new(name,'FONT')
    cr.body=body
    cr.size=size
    cr.align_x=align
    cr.extrude=.00003
    o=bpy.data.objects.new(name,cr)
    current.objects.link(o)
    o.location=loc
    o.rotation_euler=rotation
    cr.materials.append(mat)
    return o

# Hollow modular shell, rather than a solid enclosure hiding the electronics.
box('Lower enclosure floor',(0,0,.048),(.300,.220,.012),teal,.009)
box('Front enclosure wall',(0,-.105,.116),(.300,.010,.136),teal,.005)
box('Rear enclosure wall',(0,.105,.116),(.300,.010,.136),teal,.005)
box('Left enclosure wall',(-.145,0,.116),(.010,.200,.136),teal,.004)
box('Right enclosure wall',(.145,0,.116),(.010,.200,.136),teal,.004)
box('Perimeter cover gasket',(0,0,.186),(.301,.221,.004),rubber,.009)
box('Removable enclosure cover',(0,0,.193),(.304,.224,.012),ivory,.009)
for x in [-.126,.126]:
    for y in [-.086,.086]:
        cyl('Rubber foot',(x,y,.021),.014,.042,rubber)
        cyl('Cover captive screw',(x,y,.200),.0037,.002,silver)
        box('Screw slot',(x,y,.2012),(.0045,.00065,.00025),rubber,.0001)
for x in [-.151,.151]:
    for y in [-.073,.073]:
        box('Corner impact bumper',(x,y,.113),(.014,.043,.10),rubber,.006)

# Local indicators are schematic; the thesis uses a browser for readings and advice.
current=details
text('Front product name','HYBRID SOIL ANALYZER',(0,-.1105,.160),.011,white)
text('Front subtitle','MULTI-SENSOR  /  SOLAR + RECHARGEABLE',(0,-.1106,.146),.0046,white)
for x,label,mat in [(-.052,'POWER',green),(0,'WI-FI',blue),(.052,'CHARGE',amber)]:
    cyl(label+' LED bezel',(x,-.112,.129),.0047,.003,rubber,(0,-1,0))
    sphere(label+' LED',(x,-.114,.129),(.0032,.0015,.0032),mat)
    text(label+' legend',label,(x,-.111,.117),.004,white)
for x,label in [(-.103,'pH'),(-.034,'MOIST'),(.035,'TEMP'),(.104,'NPK*')]:
    cyl(label+' connector outer',(x,-.114,.087),.008,.009,silver,(0,-1,0))
    cyl(label+' connector seal',(x,-.120,.087),.0061,.005,rubber,(0,-1,0))
    text(label+' port marking',label,(x,-.111,.066),.005,white)
text('Optional NPK marking','*NPK: FEASIBILITY CHECK REQUIRED',(0,-.111,.052),.0036,white)
box('Covered auxiliary charging port',(.151,.038,.111),(.007,.032,.020),rubber,.003)
cyl('Power switch',(.152,-.023,.116),.008,.008,silver,(1,0,0))
cyl('Power switch center',(.157,-.023,.116),.0055,.003,rubber,(1,0,0))

# Solar panel on a hinged support, illustrative envelope 270 x 165 mm.
current=power
panel_tilt=math.radians(18)
panel_center=Vector((0,.013,.273))
def panelpoint(x,y,z):
    return panel_center+Vector((x,y*math.cos(panel_tilt)-z*math.sin(panel_tilt),y*math.sin(panel_tilt)+z*math.cos(panel_tilt)))
def panelbox(name,x,y,z,w,d,h,mat,b=.001):
    o=box(name,panelpoint(x,y,z),(w,d,h),mat,b)
    o.rotation_euler.x=panel_tilt
    return o
panelbox('Solar panel aluminum frame',0,0,0,.270,.165,.009,silver,.003)
panelbox('Solar panel dark perimeter',0,0,.0051,.260,.155,.002,rubber,.001)
for row in range(4):
    for col in range(6):
        xx=(col-2.5)*.041
        yy=(row-1.5)*.0356
        panelbox('PV cell %02d'%(row*6+col+1),xx,yy,.0065,.0385,.0327,.0016,solarblue,.0018)
        for dx in [-.009,.009]:
            panelbox('Cell conductive busbar',xx+dx,yy,.0074,.00035,.031,.00015,solarline,0)
for x in [-.105,.105]:
    rod('Solar panel hinged support',(x,.055,.201),panelpoint(x,.055,-.005),.005,teal)
    rod('Solar front angle stay',(x,-.052,.201),panelpoint(x,-.055,-.004),.0035,silver)
    cyl('Solar hinge pin',(x,.055,.205),.008,.022,silver,(1,0,0))
cable('Solar charge cable',[(.13,.075,.29),(.142,.098,.25),(.141,.099,.211)],rubber,.0018)
# U handle sits behind the panel so the enclosure can be carried.
cable('Carry handle frame',[(-.115,.125,.155),(-.115,.142,.327),(-.083,.145,.354),(.083,.145,.354),(.115,.142,.327),(.115,.125,.155)],teal,.007)
rod('Carry handle rubber grip',(-.073,.145,.353),(.073,.145,.353),.011,rubber)
for x in [-.115,.115]:
    box('Carry handle rear mounting block',(x,.117,.156),(.025,.028,.038),teal,.004)

# Three soil probes shown detached, with recognizable sensor geometries.
current=probes
box('Soil probe presentation support',(.285,-.002,.009),(.180,.110,.018),ivory,.007)
text('Probe support caption','FIELD SOIL PROBES',(.285,-.058,.018),.006,ink)
box('Capacitive moisture PCB',(.218,-.005,.087),(.022,.003,.130),pcbmat,.0018)
box('Moisture sensor insulated upper module',(.218,-.005,.164),(.030,.013,.031),rubber,.004)
for x in [.211,.218,.225]:
    box('Capacitive electrode schematic',(x,-.0067,.073),(.0013,.00025,.080),copper,.0004)
text('Moisture probe marking','MOIST',(.218,-.012,.160),.0045,white)
rod('DS18B20 stainless immersion sheath',(.269,-.005,.027),(.269,-.005,.113),.004,silver)
sphere('Temperature probe rounded tip',(.269,-.005,.027),(.004,.004,.004),silver)
cyl('Temperature strain relief',(.269,-.005,.125),.0055,.024,rubber)
box('Temperature identification collar',(.269,-.005,.146),(.025,.014,.014),teal,.003)
text('Temperature probe marking','TEMP',(.269,-.0125,.144),.004,white)
box('Optional NPK probe head',(.330,0,.144),(.056,.027,.055),rubber,.005)
box('NPK optional amber stripe',(.330,-.014,.156),(.051,.0015,.007),amber,.0005)
text('NPK probe marking','NPK*',(.330,-.0145,.137),.006,white)
for x in [.310,.330,.350]:
    rod('Optional NPK stainless tine',(x,0,.032),(x,0,.116),.003,silver)
    bpy.ops.mesh.primitive_cone_add(vertices=32,radius1=0,radius2=.003,depth=.009,location=(x,0,.0275))
    move(bpy.context.object,'NPK pointed tine',silver)
cable('Moisture detachable cable',[(-.034,-.125,.087),(-.02,-.16,.042),(.12,-.165,.036),(.203,-.10,.09),(.218,-.005,.182)])
cable('Temperature detachable cable',[(.035,-.125,.087),(.071,-.157,.045),(.19,-.16,.042),(.264,-.10,.118),(.269,-.005,.155)],radius=.0017)
cable('Optional NPK detachable cable',[(.104,-.125,.087),(.153,-.151,.055),(.27,-.139,.044),(.356,-.08,.126),(.330,0,.173)])

# pH suspension station: liquid electrode separate from the direct soil probes.
current=ph
cyl('Removable sample cup support',(-.238,-.025,.023),.056,.022,teal)
box('pH station detachable support bracket',(-.180,-.025,.042),(.100,.034,.022),teal,.003)
# Open cup built as rings, exposing the liquid surface in the hero view.
def tube(name, loc, ro,ri,h,mat):
    verts=[]
    n=64
    for z,r in [(-h/2,ro),(h/2,ro),(-h/2,ri),(h/2,ri)]:
        verts.extend([(loc[0]+r*math.cos(2*math.pi*i/n),loc[1]+r*math.sin(2*math.pi*i/n),loc[2]+z) for i in range(n)])
    faces=[]
    for i in range(n):
        j=(i+1)%n
        faces.extend([(i,j,n+j,n+i),(2*n+j,2*n+i,3*n+i,3*n+j),(n+i,n+j,3*n+j,3*n+i),(j,i,2*n+i,2*n+j)])
    mesh=bpy.data.meshes.new(name)
    mesh.from_pydata(verts,[],faces)
    mesh.update()
    o=bpy.data.objects.new(name,mesh)
    current.objects.link(o)
    mesh.materials.append(mat)
    for p in mesh.polygons:p.use_smooth=True
    return o
tube('Open soil water sample cup',(-.238,-.025,.080),.046,.042,.092,cupmat)
cyl('Sample cup base',(-.238,-.025,.035),.044,.005,cupmat)
cyl('Soil water suspension surface',(-.238,-.025,.095),.0415,.003,slurry)
tube('Cup reinforced rim',(-.238,-.025,.126),.048,.042,.006,ivory)
text('Cup method label','SOIL + WATER',(-.238,-.072,.076),.006,ink)
text('Cup pH label','pH SAMPLE',(-.238,-.072,.065),.005,ink)
rod('Liquid pH electrode body',(-.238,-.025,.105),(-.238,-.025,.204),.0065,rubber)
cyl('pH electrode neck',(-.238,-.025,.099),.0045,.020,ivory)
sphere('pH electrode sensing bulb submerged',(-.238,-.025,.087),(.005,.005,.007),cupmat)
cyl('pH electrode cable strain relief',(-.238,-.025,.212),.008,.019,teal)
rod('Electrode holder post',(-.177,.017,.037),(-.177,.017,.175),.0035,silver)
rod('Electrode support arm',(-.177,.017,.17),(-.238,-.025,.17),.003,teal)
cable('pH electrode coaxial cable',[(-.103,-.125,.087),(-.147,-.153,.09),(-.212,-.123,.172),(-.260,-.086,.243),(-.238,-.025,.224)])

# Simplified internal packaging; no implied final schematic or component ratings.
current=internals
box('Internal component mounting plate',(0,0,.061),(.267,.180,.006),ivory,.003)
box('ESP32 carrier PCB',(-.063,-.032,.078),(.071,.054,.006),pcbmat,.002)
box('ESP32 RF shield',(-.063,-.029,.087),(.025,.026,.009),silver,.001)
box('ESP32 WiFi antenna end',(-.063,-.010,.087),(.025,.012,.004),rubber,.001)
for x in [-.090,-.036]:
    for j in range(9):
        cyl('ESP32 header pin',(x,-.055+j*.005,.084),.001,.008,copper,vertices=12)
box('Rechargeable battery illustrative pack',(.071,.028,.091),(.087,.107,.041),rubber,.006)
text('Battery pack label','RECHARGEABLE',(.071,.028,.113),.007,white,rotation=(0,0,0))
text('Battery rating pending','CAPACITY TBD',(.071,.011,.113),.005,white,rotation=(0,0,0))
box('Solar charge controller PCB',(-.071,.057,.077),(.065,.045,.005),pcbmat,.002)
box('Charge controller heat sink',(-.072,.06,.086),(.023,.021,.014),silver,.001)
box('Sensor analog interface PCB',(-.047,-.075,.082),(.095,.021,.005),pcbmat,.001)
for x in [-.08,-.05,-.02]:
    box('Sensor interface terminal block',(x,-.074,.09),(.017,.011,.009),blue,.001)
cable('Battery to controller positive',[(.044,.065,.102),(.01,.08,.09),(-.04,.066,.085)],amber,.0012)
cable('Battery to controller return',[(.044,.052,.102),(.005,.069,.088),(-.041,.054,.084)],rubber,.0012)
cable('Regulated power harness',[(-.07,.039,.083),(-.105,.008,.085),(-.09,-.026,.087)],amber,.0011)

# Studio and camera setup.
current=studio
box('Studio ground',(0,0,-.006),(3,3,.01),floor,0)
world=bpy.data.worlds.new('Neutral studio world')
world.use_nodes=True
bg=next(n for n in world.node_tree.nodes if n.type=='BACKGROUND')
bg.inputs['Color'].default_value=(.78,.83,.86,1)
bg.inputs['Strength'].default_value=.45
scene.world=world
def aim(obj,point):obj.rotation_euler=(Vector(point)-obj.location).to_track_quat('-Z','Y').to_euler()
def area(name,loc,energy,size):
    data=bpy.data.lights.new(name,'AREA')
    data.energy=energy
    data.shape=next(i.identifier for i in data.bl_rna.properties['shape'].enum_items if i.identifier=='DISK')
    data.size=size
    obj=bpy.data.objects.new(name,data)
    studio.objects.link(obj)
    obj.location=loc
    aim(obj,(0,0,.1))
area('Large softbox key',(-.55,-.6,1.0),38,.65)
area('Right softbox fill',(.7,-.1,.65),23,.55)
area('Rear edge light',(-.1,.65,.8),30,.5)
data=bpy.data.cameras.new('Proposed design orthographic camera')
camera=bpy.data.objects.new('Camera proposed assembly',data)
studio.objects.link(camera)
camera.location=(.79,-1.12,.84)
aim(camera,(.035,0,.164))
data.type=next(i.identifier for i in data.bl_rna.properties['type'].enum_items if i.identifier=='ORTHO')
data.ortho_scale=.79
data.lens=50
scene.camera=camera
scene.render.resolution_x=1800
scene.render.resolution_y=1400
scene.render.resolution_percentage=100
scene.render.image_settings.file_format=next(i.identifier for i in scene.render.image_settings.bl_rna.properties['file_format'].enum_items if i.identifier=='PNG')
scene.render.filepath=os.path.join(ROOT,'images','soil_analyzer_proposed_design.png')
scene.render.film_transparent=False
scene.render.engine=bpy.data.scenes['Scene'].render.engine
if hasattr(scene,'eevee'):
    if hasattr(scene.eevee,'taa_render_samples'):scene.eevee.taa_render_samples=96
# Use the available neutral photographic transform.
transforms=[i.identifier for i in scene.view_settings.bl_rna.properties['view_transform'].enum_items]
if 'AgX' in transforms:scene.view_settings.view_transform='AgX'
scene.view_settings.exposure=-.3

# Open the saved file on the modeled assembly.
for screen in bpy.data.screens:
    for a in screen.areas:
        if a.type=='VIEW_3D':
            a.spaces.active.region_3d.view_rotation=camera.rotation_euler.to_quaternion()
            a.spaces.active.region_3d.view_distance=.9
            a.spaces.active.region_3d.view_location=(.03,0,.15)
            a.spaces.active.clip_end=1000
for o in bpy.context.selected_objects:o.select_set(False)
bpy.context.view_layer.objects.active=None

notes=bpy.data.texts.new('READ ME - proposed design assumptions')
notes.write('HYBRID MULTI-SENSOR SOIL ANALYZER\nBased on docs/paper_revised.docx.\n\nConcept geometry, not a manufacturing drawing.\nEnclosure envelope including cover: 304 x 224 x 157 mm; excludes feet, solar panel, handle and accessories. Mechanical sizes, solar area, cup holder, handle and connector layout are design assumptions.\nESP32, capacitive moisture sensor and DS18B20 follow the proposed components in the thesis.\npH electrode measures a prepared soil-water suspension in the side cup.\nNPK probe is provisional and requires feasibility checks against matching laboratory measurements.\nBattery capacity, PV rating, waterproofing and electrical compatibility remain to be engineered.\nLocal LEDs and service layout are conceptual additions. Browser dashboard and fertilizer advice run on an external computer or mobile device, not on the box.\nCollections 01 and 02 can be hidden to inspect the conceptual internal arrangement.\nThe original scene is retained separately.\n')
exec(compile(open(os.path.join(ROOT,'py-files','finalize_soil_analyzer.py'), encoding='utf-8').read(), 'finalize_soil_analyzer.py', 'exec'))
print('Created',len(scene.objects),'objects in',scene.name)
print('Saved',bpy.data.filepath)
print('Ready to render:',scene.render.filepath)
