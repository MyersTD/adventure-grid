from os import walk

f = []
fd = open('./token-names.json', 'w')
fd.write('{ "files": [')
for (dirpath, dirnames, filenames) in walk('./tokens'):
    for file in filenames:
        fd.write('"' + file + '",\r')
fd.write(']}')
fd.close()        
# Remove last , manually (im lazy)