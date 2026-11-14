import bpy

scene=bpy.context.scene
groups=[o for o in scene.objects if 'part_number' in o]
assert len(bpy.data.scenes)==1
assert {int(o['part_number']) for o in groups}==set(range(1,20))
assert len([o for o in scene.objects if o.name.startswith('Component label ')])==19
breadboard=next(o for o in groups if o['part_number']==2)
assert breadboard['socket_count']==830
holes=bpy.data.objects['Breadboard 830 socket opening marks']
assert len(holes.data.polygons)==830
assert not any(any(word in o.name.lower() for word in ['perfboard','enclosure','removable lid','microsd','gps','rtc']) for o in scene.objects)
for screen in bpy.data.screens:
    for area in screen.areas:
        if area.type=='VIEW_3D':assert not area.spaces.active.overlay.show_overlays
print('VERIFIED:',scene.name,'| 19 labeled component groups | 830 breadboard sockets | no box, lid or perfboard | helper overlays off',flush=True)
