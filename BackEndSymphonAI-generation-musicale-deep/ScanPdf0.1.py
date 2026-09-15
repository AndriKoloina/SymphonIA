from pdf2image import convert_from_path

# Convertir la première page du PDF en image pour analyse
images = convert_from_path('/home/zanahary/Documents/Projet python/SymphonAi/a_true2friend.pdf')
images[0].save('page_1.png', 'PNG')