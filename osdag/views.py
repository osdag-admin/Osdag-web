from django.shortcuts import render

def input_view(request):
    #return render(request, 'gltf_render.html')
    return render(request,'embedded_gltf_render.html')

def cad_view(request):
    return render(request,'cad_create.html')

def create_view(request):
    return render(request,'create_sesh.html')

def del_view(request):
    return render(request,'del_sesh.html')

def render_view(request):
    return render(request,'cad_render.html')