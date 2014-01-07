'use strict';

var filer = new Filer();
var entries = [];       // Cache of current working directory's entries.
var filesContainer = document.querySelector('#files');
var fileList = filesContainer.querySelector('ul');

/**
 *  Wrapper functions that do some of the basic file operations on the browser. This work is from Eric Bidelman's work
 *  on filer.js project. https://github.com/ebidel/filer.js with small changes. Using jQuery.
 *
 */
function openFS() {
    try {
        filer.init({persistent: true, size: 20 * 1024 * 1024}, function (fs) {
            console.log(fs.root.toURL());
            console.log('Opened: ' + fs.name +'.');

            setCwd('/'); // Display current path as root.
            refreshFolder();
//            openFsButton.innerHTML = '<div></div>';
//            openFsButton.classList.add('fakebutton');

        }, function (e) {
            if (e.name == 'SECURITY_ERR') {
//                errors.textContent = 'SECURITY_ERR: Are you running in incognito mode?';
//                openFsButton.innerHTML = '<div></div>';
//                openFsButton.classList.add('fakebutton');
                return;
            }
            onError(e);
        });
    } catch (e) {
        if (e.code == FileError.BROWSER_NOT_SUPPORTED) {
            fileList.innerHTML = 'BROWSER_NOT_SUPPORTED';
        }
    }
}

/**
 * Set Current Working Directory to path.
 * @param path
 */
function setCwd(path) {
    var cwd = $('#cwd').text();
//    var rootPath = filer.pathToFilesystemURL('/');
    var rootPath = '/';

    if (path == '/' || (path == '..' && (rootPath == cwd))) {
//        document.querySelector('#cwd').value = filer.pathToFilesystemURL('/');
//        $('#cwd').text(filer.pathToFilesystemURL('/'));
        $('#cwd').text('/');
        return;
    }
    else if (path == '..') {
        var parts = cwd.split('/');
//        var parts = '';

        parts.pop();
        path = parts.join('/');
        if (path == rootPath.substring(0, rootPath.length - 1)) {
            path += '/';
        }
    }

//    document.querySelector('#cwd').value = filer.pathToFilesystemURL(path);
//    $('#cwd').text(filer.pathToFilesystemURL(path));
    $('#cwd').text(path);
}


function refreshFolder(e) {
    // Open the FS, otherwise list the files.
    if (filer && !filer.isOpen) {
        openFS();
    } else {
        filer.ls('.', function (entries) {
            renderEntries(entries);
        }, onError);
    }
}

function renderEntries(resultEntries) {
    entries = resultEntries; // Cache the result set.
    fileList.innerHTML = ''; // Clear out existing entries and reset HTML.

    var li = document.createElement('li');

    var cwd = $('#cwd').text();
    if (cwd != '/') {
        li.innerHTML = '<a href="javascript:" onclick="cd(-1)" class="parentDir">' +
            '    <span class="file glyphicon glyphicon-folder-open"></span>' +
            '    <span class="file-entry-name">[ parent directory ]</span>' +
            '</a>';
        fileList.appendChild(li);
    }

    if (!resultEntries.length) {
        var li = document.createElement('li');
        li.innerHTML = 'No result files. Click on Generate Result File button when available!';
        fileList.appendChild(li);
        return;
    }

    resultEntries.forEach(function (entry, i) {
        addEntryToList(entry, i);
    });
}

function addEntryToList(entry, opt_idx) {
    // If an index isn't passed, we're creating a dir or adding a file. Append it.
    if (opt_idx == undefined) {
        entries.push(entry);
    }

    var idx = (opt_idx === undefined) ? entries.length - 1 : opt_idx;

    var li = document.createElement('li');
    li.innerHTML = constructEntryHTML(entry, idx);
    fileList.appendChild(li);
}

function constructEntryHTML(entry, i) {
    var actionLink = entry.isDirectory ?
        '<a href="javascript:" onclick="cd(' + i + ')" class="file-list"><span class="file glyphicon glyphicon-folder-open"></span>' :
        '<a href="javascript:" onclick="openFile(' + i + ')" class="file-list"><span class="file glyphicon glyphicon-file"></span>';

    var html = [actionLink, '<span class="file-entry-name">', entry.name, '</span></a>'];

    if (entry.isFile) {
//        html.push('<a href="javascript:" data-preview-link onclick="readFile(', i, ')">read</a>');
        html.push(
            '<a href="',
            entry.toURL(),
            '" download style="">',
            '<span class="glyphicon glyphicon-download-alt"></span></a>'
        );
    }
/*
    html.push(
        '<a href="javascript:" title="Rename this entry" data-rename-link onclick="rename(this,',
        i,
        ');"><span class="glyphicon glyphicon-edit"></span></a>'
    );
*/
    html.push(
        '<a href="javascript:" data-remove-link onclick="removeEntry(this,',
        i,
        ');"><span class="glyphicon glyphicon-trash"></span></a>'
    );

    return html.join('');
}


/**
    File operations
 **/

function mkdir(name, opt_callback) {
    if (!name) return;

    try {
        if (opt_callback) {
            filer.mkdir(name, false, opt_callback, onError);
        } else {
            filer.mkdir(name, true, addEntryToList, onError);
        }
    } catch(e) {
        console.error('Error: ' + e + '.');
    }
}


function cd(i, opt_callback) {
    if (i == -1) {
        var path = '..';
    } else {
        var path = entries[i].fullPath;
    }

    setCwd(path);

    if (opt_callback) {
        filer.ls(path, opt_callback, onError);
    } else {
        filer.ls(path, renderEntries, onError);
    }
}
function openFile(i) {
    var fileWin = self.open(entries[i].toURL(), 'fileWin');
}

function writeFile(fileName, file, opt_rerender, fileType) {
    if (!file) return;

    var rerender = opt_rerender == undefined ? true : false;

    var fType = fileType == undefined ? file.type : fileType;

    filer.write(fileName, {data: file, type: fType},
        function (fileEntry, fileWriter) {
            if (rerender) {
                addEntryToList(fileEntry);
                filer.ls('.', renderEntries, onError); // Just re-read this dir.
            }
        },
        onError
    );
}

function removeEntry(link, i) {
    var entry = entries[i];

    if (!confirm('Delete ' + entry.name + '?')) {
        return;
    }

    filer.rm(entry, function() {
        var li = link.parentNode;
        li.parentNode.removeChild(li);
        filer.ls('.', renderEntries, onError); // Just re-read this dir.
    }, onError);
}


function onError(e) {
    console.error(e);
}