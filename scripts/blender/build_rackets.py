"""
RACKET LAB — procedural racket generator for Blender (bpy 5.x).

For every catalogue entry it builds a detailed, PBR-shaded racket from the
product's real head size, beam width, length and string pattern, then:
  * exports a web-ready GLB   -> public/models/<slug>.glb
  * renders studio images      -> <out>/renders/<slug>-{hero,front,detail}.png

The geometry is a REPRESENTATIVE model: proportions and string pattern follow the
published specs, but it is not a scan of the manufacturer's frame (no logos,
cosmetics are approximate). The website labels it accordingly.

Usage (from repo root):
  python scripts/blender/build_rackets.py --catalog scripts/blender/catalog.json \
      --assets <dir with hdr + leather textures> --out <work dir> [--only slug,slug] [--no-render]
"""

import argparse
import json
import math
import os
import sys

import bpy
import bmesh
from mathutils import Vector, Matrix

IN = 0.0254  # inch → metre
ASPECT = 0.76  # string-bed width / length
FACE_IN = 0.48  # frame face width (in-plane), inches
SIN_CUT = -0.8  # where the hoop opens into the throat (sine of the angle)
STRING_D = 0.00125  # 1.25 mm gauge


# ───────────────────────────── helpers ─────────────────────────────

def hex_rgba(h, a=1.0):
    h = h.lstrip("#")
    r, g, b = (int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))
    # sRGB → linear for Blender colour sockets
    lin = lambda c: c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    return (lin(r), lin(g), lin(b), a)


def luminance(h):
    r, g, b, _ = hex_rgba(h)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def link(obj):
    bpy.context.scene.collection.objects.link(obj)
    return obj


def mesh_from_curve(curve_obj, name):
    dg = bpy.context.evaluated_depsgraph_get()
    me = bpy.data.meshes.new_from_object(curve_obj.evaluated_get(dg))
    me.name = name
    obj = bpy.data.objects.new(name, me)
    link(obj)
    bpy.data.objects.remove(curve_obj)
    return obj


def poly_curve(name, pts, profile=None, depth=0.0, res=4, closed=False, radii=None):
    cu = bpy.data.curves.new(name, "CURVE")
    cu.dimensions = "3D"
    cu.twist_mode = "Z_UP"
    sp = cu.splines.new("POLY")
    sp.points.add(len(pts) - 1)
    for i, p in enumerate(pts):
        sp.points[i].co = (p[0], p[1], p[2] if len(p) > 2 else 0.0, 1.0)
        if radii:
            sp.points[i].radius = radii[i]
    sp.use_cyclic_u = closed
    if profile is not None:
        cu.bevel_mode = "OBJECT"
        cu.bevel_object = profile
        cu.use_fill_caps = True
    elif depth:
        cu.bevel_mode = "ROUND"
        cu.bevel_depth = depth
        cu.bevel_resolution = res
        cu.use_fill_caps = True
    obj = bpy.data.objects.new(name, cu)
    return link(obj)


def bezier_curve(name, pts, depth, res=2):
    cu = bpy.data.curves.new(name, "CURVE")
    cu.dimensions = "3D"
    cu.resolution_u = 2
    sp = cu.splines.new("BEZIER")
    sp.bezier_points.add(len(pts) - 1)
    for i, p in enumerate(pts):
        bp = sp.bezier_points[i]
        bp.co = p
        bp.handle_left_type = bp.handle_right_type = "AUTO"
    cu.bevel_mode = "ROUND"
    cu.bevel_depth = depth
    cu.bevel_resolution = res
    cu.use_fill_caps = True
    return link(bpy.data.objects.new(name, cu))


def rounded_rect_profile(name, w, h, r, steps=4):
    """Closed 2D profile (X = in-plane width, Y = beam depth)."""
    r = min(r, w / 2 * 0.95, h / 2 * 0.95)
    pts = []
    corners = [(w / 2 - r, h / 2 - r, 0), (-w / 2 + r, h / 2 - r, 90), (-w / 2 + r, -h / 2 + r, 180), (w / 2 - r, -h / 2 + r, 270)]
    for cx, cy, a0 in corners:
        for i in range(steps + 1):
            a = math.radians(a0 + 90 * i / steps)
            pts.append((cx + r * math.cos(a), cy + r * math.sin(a), 0))
    obj = poly_curve(name, pts, closed=True)
    obj.data.dimensions = "2D"
    obj.hide_render = True
    obj.hide_viewport = True
    return obj


def smooth(obj, angle=35):
    obj.data.shade_smooth()
    try:
        mod = obj.modifiers.new("AutoSmooth", "SMOOTH_BY_ANGLE")
        mod["Input_1"] = math.radians(angle)
    except Exception:
        pass


# ───────────────────────────── materials ─────────────────────────────

def principled(name, color, rough=0.4, metal=0.0, coat=0.0, coat_rough=0.05, spec=0.5):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = color
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    for key, val in (("Coat Weight", coat), ("Coat Roughness", coat_rough), ("Specular IOR Level", spec)):
        if key in b.inputs:
            b.inputs[key].default_value = val
    return m


def image_node(nt, path, non_color=False):
    n = nt.nodes.new("ShaderNodeTexImage")
    n.image = bpy.data.images.load(path, check_existing=True)
    if non_color:
        n.image.colorspace_settings.name = "Non-Color"
    return n


def grip_material(color, tex_dir, for_export):
    """Leather-textured grip. For export the diffuse map stays untinted (tint is
    applied at runtime via baseColorFactor); for renders it is multiplied by the colourway."""
    m = principled("Grip", color, rough=0.75)
    nt = m.node_tree
    b = nt.nodes["Principled BSDF"]
    mapping = nt.nodes.new("ShaderNodeMapping")
    texco = nt.nodes.new("ShaderNodeTexCoord")
    mapping.inputs["Scale"].default_value = (3.0, 3.0, 3.0)
    nt.links.new(texco.outputs["UV"], mapping.inputs["Vector"])
    diff = image_node(nt, os.path.join(tex_dir, "leather_white_diff_1k.jpg"))
    rough = image_node(nt, os.path.join(tex_dir, "leather_white_rough_1k.jpg"), True)
    nor = image_node(nt, os.path.join(tex_dir, "leather_white_nor_gl_1k.jpg"), True)
    for n in (diff, rough, nor):
        nt.links.new(mapping.outputs["Vector"], n.inputs["Vector"])
    nmap = nt.nodes.new("ShaderNodeNormalMap")
    nmap.inputs["Strength"].default_value = 0.8
    nt.links.new(nor.outputs["Color"], nmap.inputs["Color"])
    nt.links.new(nmap.outputs["Normal"], b.inputs["Normal"])
    nt.links.new(rough.outputs["Color"], b.inputs["Roughness"])
    if for_export:
        nt.links.new(diff.outputs["Color"], b.inputs["Base Color"])
    else:
        mix = nt.nodes.new("ShaderNodeMix")
        mix.data_type = "RGBA"
        mix.blend_type = "MULTIPLY"
        mix.inputs["Factor"].default_value = 1.0
        nt.links.new(diff.outputs["Color"], mix.inputs[6])
        mix.inputs[7].default_value = color
        nt.links.new(mix.outputs[2], b.inputs["Base Color"])
    return m


def carbon_textures(work):
    """Bakes a 2x2 twill carbon-fibre weave (base colour + normal) to PNG once."""
    import numpy as np

    path_c = os.path.join(work, "carbon_color.png")
    path_n = os.path.join(work, "carbon_normal.png")
    if os.path.exists(path_c) and os.path.exists(path_n):
        return path_c, path_n
    N = 512
    tows = 16  # tows across the tile
    y, x = np.mgrid[0:N, 0:N] / N * tows
    cell_x, cell_y = np.floor(x).astype(int), np.floor(y).astype(int)
    fx, fy = x - cell_x, y - cell_y
    over = ((cell_x + cell_y) // 2) % 2 == 0  # twill: diagonal 2x2 pattern
    # height: each tow is a rounded bump across its width
    h_warp = np.sin(np.pi * fx) ** 0.6
    h_weft = np.sin(np.pi * fy) ** 0.6
    height = np.where(over, h_warp, h_weft)
    # fibre direction modulates sheen
    sheen = np.where(over, 0.55 + 0.45 * np.sin(np.pi * fy) ** 2, 0.55 + 0.45 * np.sin(np.pi * fx) ** 2)
    base = (0.035 + 0.05 * sheen * height)[..., None].repeat(3, axis=2)
    gy, gx = np.gradient(height * 3.0)
    nz = np.ones_like(gx)
    n = np.stack([-gx, gy, nz], axis=-1)
    n /= np.linalg.norm(n, axis=-1, keepdims=True)
    nrm = (n * 0.5 + 0.5)

    def save(arr, path, non_color):
        img = bpy.data.images.new(os.path.basename(path), N, N, alpha=False)
        rgba = np.concatenate([arr, np.ones((N, N, 1))], axis=2).astype(np.float32)
        img.pixels.foreach_set(rgba[::-1].ravel())
        img.filepath_raw = path
        img.file_format = "PNG"
        img.save()

    save(base, path_c, False)
    save(nrm, path_n, True)
    return path_c, path_n


def frame_material(name, color, carbon_maps=None):
    m = principled(name, color, rough=0.32, coat=1.0, coat_rough=0.04, spec=0.5)
    if carbon_maps:
        nt = m.node_tree
        b = nt.nodes["Principled BSDF"]
        texco = nt.nodes.new("ShaderNodeTexCoord")
        mapping = nt.nodes.new("ShaderNodeMapping")
        mapping.inputs["Scale"].default_value = (6.0, 6.0, 6.0)
        nt.links.new(texco.outputs["UV"], mapping.inputs["Vector"])
        c = image_node(nt, carbon_maps[0])
        n = image_node(nt, carbon_maps[1], True)
        for t in (c, n):
            nt.links.new(mapping.outputs["Vector"], t.inputs["Vector"])
        nmap = nt.nodes.new("ShaderNodeNormalMap")
        nmap.inputs["Strength"].default_value = 0.6
        nt.links.new(c.outputs["Color"], b.inputs["Base Color"])
        nt.links.new(n.outputs["Color"], nmap.inputs["Color"])
        nt.links.new(nmap.outputs["Normal"], b.inputs["Normal"])
        b.inputs["Roughness"].default_value = 0.38
    return m


# ───────────────────────────── geometry ─────────────────────────────

class Dims:
    def __init__(self, head_sq_in, beam_mm, length_in):
        a_in = math.sqrt(head_sq_in / (math.pi * ASPECT))
        self.L = length_in * IN
        self.aIn = a_in * IN
        self.bIn = a_in * ASPECT * IN
        self.face = FACE_IN * IN
        self.aMid = self.aIn + self.face / 2
        self.bMid = self.bIn + self.face / 2
        self.aOut = self.aIn + self.face
        self.bOut = self.bIn + self.face
        self.cy = self.L - self.aOut  # hoop centre (y)
        self.depth = beam_mm / 1000.0
        self.handle_top = 7.2 * IN
        self.handle_r = 0.0163  # flat-to-flat half width (≈ L2)
        self.t_left = math.pi - math.asin(SIN_CUT)  # bottom-left of hoop
        self.t_right = math.asin(SIN_CUT)  # bottom-right
        self.yoke_y = self.cy + SIN_CUT * self.aIn

    def hoop(self, t, a=None, b=None):
        a = a or self.aMid
        b = b or self.bMid
        return Vector((b * math.cos(t), self.cy + a * math.sin(t), 0))


def quad_bezier(p0, c, p1, n):
    return [(1 - t) ** 2 * p0 + 2 * (1 - t) * t * c + t * t * p1 for t in (i / n for i in range(n + 1))]


def frame_path(d):
    """Continuous centre-line: handle → left arm → hoop → right arm → handle."""
    pts = []
    n_hoop = 180
    # hoop from bottom-left, over the top, to bottom-right (t decreasing)
    hoop = [d.hoop(d.t_left + (d.t_right - d.t_left) * i / n_hoop) for i in range(n_hoop + 1)]
    # arm geometry: tangent-continuous quadratic Bézier into the hoop
    def arm(t, side):
        p = d.hoop(t)
        # direction of travel along the hoop at its start/end
        tangent = Vector((d.bMid * math.sin(t), -d.aMid * math.cos(t), 0)).normalized()  # for decreasing t
        if side > 0:
            tangent = -tangent
        h = Vector((side * 0.011, d.handle_top - 0.004, 0))
        c = p - tangent * (p - h).length * 0.55
        return quad_bezier(h, c, p, 36)

    left = arm(d.t_left, -1)
    right = list(reversed(arm(d.t_right, +1)))
    pts = left[:-1] + hoop + right[1:]
    return pts


def build_racket(spec, tex_dir, work, for_export):
    d = Dims(spec["headSizeSqIn"], spec["beamMm"], spec["lengthIn"])
    cw = spec["colorway"]
    carbon = carbon_textures(work) if spec.get("carbon") else None

    mats = {
        "Frame": frame_material("Frame", hex_rgba(cw["frame"]), carbon),
        "Accent": frame_material("Accent", hex_rgba(cw["accent"])),
        "Grip": grip_material(hex_rgba(cw["grip"]), tex_dir, for_export),
        "Strings": principled("Strings", hex_rgba(cw["strings"]), rough=0.38, spec=0.6),
        "Polymer": principled("Polymer", hex_rgba("#151516"), rough=0.55),
        "Cap": principled("Cap", hex_rgba("#1b1b1d"), rough=0.3, coat=0.6),
    }
    parts = []

    # ── Frame (one continuous beam) ──
    prof = rounded_rect_profile("FrameProfile", d.face, d.depth, 0.0035)
    path = frame_path(d)
    # taper: slightly slimmer at the tip, fuller at 3/9 o'clock and in the throat
    radii = []
    for p in path:
        rel = (p.y - d.cy) / d.aMid  # -1 bottom … +1 top
        radii.append(1.0 - 0.06 * max(0.0, rel) ** 2)
    frame = mesh_from_curve(poly_curve("FrameCurve", path, profile=prof, radii=radii), "Frame")
    frame.data.materials.append(mats["Frame"])
    frame.data.materials.append(mats["Accent"])
    # throat below the yoke → accent paint
    for poly in frame.data.polygons:
        if poly.center.y < d.yoke_y - 0.004:
            poly.material_index = 1
    parts.append(frame)

    # ── Yoke (bridge closing the string bed) ──
    yl = d.hoop(d.t_left, d.aIn + 0.002, d.bIn + 0.002)
    yr = d.hoop(d.t_right, d.aIn + 0.002, d.bIn + 0.002)
    mid = Vector((0, d.yoke_y - 0.006, 0))
    yoke_pts = quad_bezier(Vector((yl.x - 0.004, yl.y, 0)), mid, Vector((yr.x + 0.004, yr.y, 0)), 40)
    yprof = rounded_rect_profile("YokeProfile", 0.0085, d.depth * 0.82, 0.003)
    yoke = mesh_from_curve(poly_curve("YokeCurve", yoke_pts, profile=yprof), "Yoke")
    yoke.data.materials.append(mats["Accent"])
    parts.append(yoke)

    # ── Bumper guard (top of the hoop, outer edge) ──
    bump_pts = []
    for i in range(81):
        t = math.pi / 2 + math.radians(-58 + 116 * i / 80)
        p = d.hoop(t, d.aOut + 0.0012, d.bOut + 0.0012)
        bump_pts.append(p)
    bprof = rounded_rect_profile("BumperProfile", 0.0032, d.depth * 0.66, 0.0012)
    bumper = mesh_from_curve(poly_curve("BumperCurve", bump_pts, profile=bprof), "Bumper")
    bumper.data.materials.append(mats["Polymer"])
    parts.append(bumper)

    # ── Strings with real over/under weave ──
    mains_n, crosses_n = spec["mains"], spec["crosses"]
    half_w = d.bIn * 0.94
    mains_x = [-half_w + (k + 0.5) * 2 * half_w / mains_n for k in range(mains_n)]
    y0, y1 = d.yoke_y + 0.009, d.cy + d.aIn * 0.95
    cross_y = [y0 + (y1 - y0) * j / max(1, crosses_n - 1) for j in range(crosses_n)]
    amp = STRING_D * 0.5
    string_objs = []
    def bottom_of(x):
        # lowest point inside the string bed at this x: the yoke, or the hoop where it is narrower
        hoop_low = d.cy - d.aIn * math.sqrt(max(0.0, 1 - (x / d.bIn) ** 2))
        return max(d.yoke_y + 0.002, hoop_low + 0.0008)

    for k, x in enumerate(mains_x):
        top = d.cy + d.aIn * math.sqrt(max(0.0, 1 - (x / d.bIn) ** 2))
        pts = [Vector((x, bottom_of(x), 0))]
        for j, y in enumerate(cross_y):
            half = d.bIn * math.sqrt(max(0.0, 1 - ((y - d.cy) / d.aIn) ** 2))
            if abs(x) < half and pts[-1].y < y < top:
                pts.append(Vector((x, y, amp * (1 if (k + j) % 2 else -1))))
        pts.append(Vector((x, top - 0.0005, 0)))
        string_objs.append(bezier_curve(f"Main{k}", pts, STRING_D / 2, res=1))
    for j, y in enumerate(cross_y):
        half = d.bIn * math.sqrt(max(0.0, 1 - ((y - d.cy) / d.aIn) ** 2))
        pts = [Vector((-half + 0.0005, y, 0))]
        for k, x in enumerate(mains_x):
            if -half < x < half:
                pts.append(Vector((x, y, amp * (-1 if (k + j) % 2 else 1))))
        pts.append(Vector((half - 0.0005, y, 0)))
        string_objs.append(bezier_curve(f"Cross{j}", pts, STRING_D / 2, res=1))
    strings = []
    for s in string_objs:
        strings.append(mesh_from_curve(s, s.name))
    bpy.ops.object.select_all(action="DESELECT")
    for s in strings:
        s.select_set(True)
    bpy.context.view_layer.objects.active = strings[0]
    bpy.ops.object.join()
    strings_obj = bpy.context.view_layer.objects.active
    strings_obj.name = "Strings"
    strings_obj.data.name = "Strings"
    strings_obj.data.materials.clear()
    strings_obj.data.materials.append(mats["Strings"])
    parts.append(strings_obj)

    # ── Grommets: one barrel per string end, through the frame face ──
    gm = bmesh.new()
    ends = []
    for x in mains_x:
        top = d.cy + d.aIn * math.sqrt(max(0.0, 1 - (x / d.bIn) ** 2))
        ends.append((Vector((x, top, 0)), Vector((x / d.bIn ** 2, (top - d.cy) / d.aIn ** 2, 0)).normalized()))
        low = bottom_of(x)
        if low > d.yoke_y + 0.003:  # outer mains end in the hoop, not the yoke
            ends.append((Vector((x, low, 0)), Vector((x / d.bIn ** 2, (low - d.cy) / d.aIn ** 2, 0)).normalized()))
    for y in cross_y:
        half = d.bIn * math.sqrt(max(0.0, 1 - ((y - d.cy) / d.aIn) ** 2))
        for sx in (-1, 1):
            p = Vector((sx * half, y, 0))
            ends.append((p, Vector((p.x / d.bIn ** 2, (p.y - d.cy) / d.aIn ** 2, 0)).normalized()))
    for p, nrm in ends:
        mat = Matrix.Translation(p + nrm * (d.face * 0.5)) @ Vector((0, 0, 1)).rotation_difference(nrm).to_matrix().to_4x4()
        bmesh.ops.create_cone(gm, cap_ends=True, segments=10, radius1=0.0016, radius2=0.0016, depth=d.face + 0.0016, matrix=mat)
    gme = bpy.data.meshes.new("Grommets")
    gm.to_mesh(gme)
    gm.free()
    grommets = link(bpy.data.objects.new("Grommets", gme))
    grommets.data.materials.append(mats["Polymer"])
    parts.append(grommets)

    # ── Handle: bevelled octagon + spiral overwrap + butt cap + collar ──
    def octa(name, r_flat, y0_, y1_, bevel):
        bm = bmesh.new()
        r = r_flat / math.cos(math.pi / 8)
        bmesh.ops.create_cone(bm, cap_ends=True, segments=8, radius1=r, radius2=r, depth=y1_ - y0_,
                              matrix=Matrix.Translation((0, (y0_ + y1_) / 2, 0)) @ Matrix.Rotation(math.radians(-90), 4, "X") @ Matrix.Rotation(math.pi / 8, 4, "Z"))
        # slightly elongated octagon (racket handles are deeper than wide)
        bmesh.ops.scale(bm, vec=(1.0, 1.0, 0.93), verts=bm.verts)
        me = bpy.data.meshes.new(name)
        bm.to_mesh(me)
        bm.free()
        ob = link(bpy.data.objects.new(name, me))
        mod = ob.modifiers.new("Bevel", "BEVEL")
        mod.width = bevel
        mod.segments = 3
        mod.limit_method = "ANGLE"
        return ob

    handle = octa("Handle", d.handle_r, 0.012, d.handle_top, 0.0028)
    # UVs for the leather texture: cylindrical unwrap
    bpy.context.view_layer.objects.active = handle
    handle.select_set(True)
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.uv.cylinder_project(direction="ALIGN_TO_OBJECT", scale_to_bounds=True)
    bpy.ops.object.mode_set(mode="OBJECT")
    handle.select_set(False)
    handle.data.materials.append(mats["Grip"])
    parts.append(handle)

    # overwrap seam: a helix sitting on the grip surface
    helix = []
    turns, y_a, y_b = 7.2, 0.022, d.handle_top - 0.016
    r_h = d.handle_r * 1.035
    for i in range(int(turns * 48) + 1):
        t = i / 48 * 2 * math.pi
        y = y_a + (y_b - y_a) * i / (turns * 48)
        helix.append(Vector((r_h * math.cos(t), y, r_h * 0.93 * math.sin(t))))
    seam = mesh_from_curve(poly_curve("SeamCurve", helix, depth=0.0006, res=1), "GripSeam")
    seam.data.materials.append(mats["Grip"])
    parts.append(seam)

    cap = octa("ButtCap", d.handle_r * 1.08, 0.0, 0.013, 0.0035)
    cap.data.materials.append(mats["Cap"])
    parts.append(cap)
    collar = octa("Collar", d.handle_r * 1.02, d.handle_top - 0.011, d.handle_top + 0.004, 0.002)
    collar.data.materials.append(mats["Accent"])
    parts.append(collar)

    # UVs for frame materials (carbon weave follows the beam)
    for ob in (frame, yoke):
        bpy.context.view_layer.objects.active = ob
        ob.select_set(True)
        bpy.ops.object.mode_set(mode="EDIT")
        bpy.ops.mesh.select_all(action="SELECT")
        bpy.ops.uv.smart_project(angle_limit=math.radians(66), island_margin=0.002)
        bpy.ops.object.mode_set(mode="OBJECT")
        ob.select_set(False)

    for ob in parts:
        if ob.type == "MESH":
            smooth(ob)

    # Parent everything; centre on the racket's mid-length, Y = length axis.
    root = link(bpy.data.objects.new("Racket", None))
    for ob in parts:
        ob.parent = root
    root.location = (0, -d.L / 2, 0)
    bpy.context.view_layer.update()
    return root, parts, d


# ───────────────────────────── export & render ─────────────────────────────

def apply_and_flatten(root, parts):
    """Apply modifiers and root transform so the GLB is clean (Y-up after export)."""
    for ob in list(bpy.data.objects):
        if ob.name.endswith("Profile"):
            bpy.data.objects.remove(ob)
    bpy.ops.object.select_all(action="DESELECT")
    for ob in parts:
        ob.select_set(True)
        bpy.context.view_layer.objects.active = ob
        bpy.ops.object.convert(target="MESH")
    for ob in parts:
        mw = ob.matrix_world.copy()
        ob.parent = None
        ob.matrix_world = mw
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    bpy.data.objects.remove(root)


def to_z_up(parts):
    # model is built Y-up in Blender's XY plane; rotate so length runs along +Z
    for ob in parts:
        ob.matrix_world = Matrix.Rotation(math.radians(90), 4, "X") @ ob.matrix_world


def export_glb(path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    # web budget: 512 px textures, embedded as WebP (geometry is compressed afterwards
    # with scripts/optimize-models.mjs — the PyPI bpy build ships without Draco/Meshopt)
    for img in bpy.data.images:
        if img.size[0] > 512:
            img.scale(512, 512)
    bpy.ops.export_scene.gltf(
        filepath=path,
        export_format="GLB",
        export_yup=True,
        export_apply=True,
        export_image_format="WEBP",
        export_image_quality=80,
        export_texcoords=True,
        export_normals=True,
        export_materials="EXPORT",
        use_selection=False,
    )


def setup_render_scene(hdr_path, samples):
    sc = bpy.context.scene
    sc.render.engine = "CYCLES"
    sc.cycles.device = "CPU"
    sc.cycles.samples = samples
    sc.cycles.use_denoising = True
    sc.cycles.max_bounces = 8
    sc.render.film_transparent = True
    sc.render.image_settings.file_format = "PNG"
    sc.render.image_settings.color_mode = "RGBA"
    try:
        # "Standard" keeps the catalogue colourways faithful (AgX desaturates bright paints)
        sc.view_settings.view_transform = "Standard"
        sc.view_settings.look = "Medium High Contrast"
    except Exception:
        pass
    w = bpy.data.worlds.new("Studio")
    sc.world = w
    w.use_nodes = True
    nt = w.node_tree
    env = nt.nodes.new("ShaderNodeTexEnvironment")
    env.image = bpy.data.images.load(hdr_path)
    bg = nt.nodes["Background"]
    bg.inputs["Strength"].default_value = 0.55
    nt.links.new(env.outputs["Color"], bg.inputs["Color"])
    # key softbox + rim for crisp clearcoat highlights
    for name, loc, rot, energy, size in (
        ("Key", (0.9, -1.2, 1.4), (math.radians(55), 0, math.radians(35)), 95, 1.2),
        ("Rim", (-1.1, 0.9, 0.8), (math.radians(70), 0, math.radians(-140)), 80, 0.6),
        ("Fill", (-0.8, -1.4, -0.2), (math.radians(95), 0, math.radians(-30)), 18, 1.6),
    ):
        ld = bpy.data.lights.new(name, "AREA")
        ld.energy = energy
        ld.size = size
        lo = link(bpy.data.objects.new(name, ld))
        lo.location = loc
        lo.rotation_euler = rot
    cam = link(bpy.data.objects.new("Camera", bpy.data.cameras.new("Camera")))
    sc.camera = cam
    return cam


def look_at(cam, target, loc):
    cam.location = loc
    direction = Vector(target) - Vector(loc)
    cam.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()


def render_views(slug, parts, d, out_dir, res_scale):
    sc = bpy.context.scene
    cam = sc.camera
    os.makedirs(out_dir, exist_ok=True)
    pivot = link(bpy.data.objects.new("Pivot", None))
    for ob in parts:
        mw = ob.matrix_world.copy()
        ob.parent = pivot
        ob.matrix_world = mw

    views = {
        # in-plane tilt (Y axis after z-up rotation), turn around the length axis (Z)
        "hero": dict(rot=(0, math.radians(-22), math.radians(26)), res=(1000, 1250), lens=85, dist=1.62, target=(0, 0, 0), dof=None),
        "front": dict(rot=(0, 0, 0), res=(1000, 1250), lens=85, dist=1.55, target=(0, 0, 0), dof=None),
        "detail": dict(rot=(0, math.radians(-18), math.radians(32)), res=(1000, 1000), lens=100, dist=0.42,
                       target=(0.0, 0.0, d.yoke_y - d.L / 2 - 0.015), dof=True),
    }
    for name, v in views.items():
        pivot.rotation_euler = v["rot"]
        bpy.context.view_layer.update()
        target = Matrix.Rotation(v["rot"][2], 4, "Z") @ Matrix.Rotation(v["rot"][1], 4, "Y") @ Vector(v["target"])
        sc.render.resolution_x = int(v["res"][0] * res_scale)
        sc.render.resolution_y = int(v["res"][1] * res_scale)
        cam.data.lens = v["lens"]
        loc = (target.x, target.y - v["dist"], target.z + 0.01)
        look_at(cam, target, loc)
        cam.data.dof.use_dof = bool(v["dof"])
        if v["dof"]:
            cam.data.dof.focus_distance = (Vector(loc) - target).length
            cam.data.dof.aperture_fstop = 5.6
        sc.render.filepath = os.path.join(out_dir, f"{slug}-{name}.png")
        bpy.ops.render.render(write_still=True)


def main():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else sys.argv[1:]
    ap = argparse.ArgumentParser()
    ap.add_argument("--catalog", required=True)
    ap.add_argument("--assets", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--models", default="public/models")
    ap.add_argument("--only", default="")
    ap.add_argument("--no-render", action="store_true")
    ap.add_argument("--no-export", action="store_true")
    ap.add_argument("--samples", type=int, default=96)
    ap.add_argument("--res-scale", type=float, default=1.0)
    a = ap.parse_args(argv)

    catalog = json.load(open(a.catalog))
    only = set(filter(None, a.only.split(",")))
    hdr = os.path.join(a.assets, "studio_small_09_2k.hdr")
    os.makedirs(a.out, exist_ok=True)

    for spec in catalog:
        if only and spec["slug"] not in only:
            continue
        print(f"=== {spec['slug']}", flush=True)
        if not a.no_export:
            reset()
            root, parts, d = build_racket(spec, a.assets, a.out, for_export=True)
            apply_and_flatten(root, parts)
            to_z_up(parts)
            export_glb(os.path.join(a.models, f"{spec['slug']}.glb"))
        if not a.no_render:
            reset()
            root, parts, d = build_racket(spec, a.assets, a.out, for_export=False)
            apply_and_flatten(root, parts)
            to_z_up(parts)
            setup_render_scene(hdr, a.samples)
            render_views(spec["slug"], parts, d, os.path.join(a.out, "renders"), a.res_scale)


if __name__ == "__main__":
    main()
