'use strict';

var resultJson = {};    // Result from the conversion process
var importButton = document.querySelector('[type="file"]');
var topFolder = '';
var METHOD_PARAMETERS = [
    'Method',
    'PVM_EchoTime',
    'EffectiveTE',
    'PVM_RareFactor',
    'PVM_RepetitionTime',
    'PVM_NAverages',
    'PVM_NEchoImages',
    'PVM_ScanTimeStr',
    'PVM_EncMatrix',
    'PVM_FovCm',
    'PVM_SpatResol',
    'PVM_SliceThick',
    'PVM_SPackArrNSlices',
    'FatSupOnOff'
];
var VISPARS_PARAMETERS = [
    'VisuCoreSize',
    'VisuCoreExtent',
    'VisuCoreFrameCount',
    'VisuCoreWordType',
    'VisuCoreDataSlope',
    'VisuSubjectBirthDate',
    'VisuSubjectWeight',
    'VisuAcquisitionProtocol'
];
/*
*/
/*
var METHOD_PARAMETERS = [
 'PVM_SpatResol'
];

var VISPARS_PARAMETERS = [
    'VisuCoreDataSlope'
];
*/


function onFileSelect(evt) {
    if (filer && !filer.isOpen) {
        openFS();
    }

    var files = evt.target.files;

    if (files) {
        resultJson = {};
        if (files.length > 0) {
            var firstFile = files[0];
            var folders = firstFile.webkitRelativePath.split('/');
            if (folders && folders.length > 0) {
                topFolder = (folders.slice(0, 1))[0];
                $('.current-folder').text(' - ' + topFolder);

                mkdir(topFolder, function(dirEntry) {
                    processFiles(files);
                });
            }
        }
    }
    else {
        $('.current-folder').text('');
        disableOutputOption();
    }
}

function processFiles(files) {

    /**
     * Traverse each file.
     * Find two files:
     *      1) method,
     *      2) visu_pars
     * Depending on the file, a particular set of parameters will be used to get the parameters
     *
     * @param fIdx
     */
    function processFile(fIdx) {
        if (fIdx >= files.length) {
            enableOutputOption();
            return;
        }

        var file = files[fIdx];
        console.info('processing file #' + (fIdx+1) + ': ' + file.name);

        var fileReader = new FileReader();

        var parameters = [];
        var proceedProcess = false;

        if (file.name) {
            if ('method' == file.name.toLowerCase()) {
                parameters = METHOD_PARAMETERS;
                proceedProcess = true;
            }
            else if ('visu_pars' == file.name.toLowerCase()) {
                parameters = VISPARS_PARAMETERS;
                proceedProcess = true;
            }
        }

        fileReader.onload = function(event) {
            var contents = event.target.result;
            processFileContent(contents, parameters);

            processFile(++fIdx);
        };

        fileReader.onerror = function(event) {
            console.error("File Error. " + event.target.error.name + '. Msg: ' + event.target.error.message);

            processFile(++fIdx);
        };

        iterateFileAsync(fIdx, files.length, file.webkitRelativePath);

        if (proceedProcess) {
            fileReader.readAsText(file);
        }
        else {
            processFile(++fIdx);
        }
    }

    processFile(0);
}


/**
    Misc. helper functions
**/

//  Helper functions for processing file content - BEGIN
/**
 *  When a parameter is located in contents, grab its associated value and tie it to an ID. Values can be found on the
 *  same line as the parameter. Or they can be found on the next line.
 *
 * @param contents
 * @param parameters
 */
function processFileContent(contents, parameters) {
    var contentsId = getContentsId(contents);

    if (!contentsId) {
        console.error('No ID found in content: ' + contents);
        return;
    }

    for (var i = 0, paramMatched, regExp, param, value; i < parameters.length; i++) {
        regExp = new RegExp('(' + parameters[i] + ')=\\(.+\\)[\n\r]([\\s\\S]+?)(##\\$|\\$\\$)', 'mi');
        paramMatched = regExp.exec(contents);

        if (paramMatched) {         // multi-line found
            param = paramMatched[1].toLowerCase();
            value = paramMatched[2];
            var values = value.split(' ');
            for (var j = 0, newParam = ''; j < values.length; j++) {
                newParam = param + '_' + (j+1);
                pushToResult(contentsId, newParam, values[j]);
            }
        }
        else {
            regExp = new RegExp('(' + parameters[i] + ')=(.+)', 'i');
            paramMatched = regExp.exec(contents);

            if (paramMatched) {     // single line found
                param = paramMatched[1].toLowerCase();
                value = paramMatched[2];

                pushToResult(contentsId, param, value);
            }
        }
    }
}

function pushToResult(id, param, value) {
    if (!id || !param || !value) {
        return;
    }

    if (!resultJson[id]) {
        resultJson[id] = {};
//      resultJson[id] = [];
    }

    resultJson[id][param.trim()] = value.trim();
//  resultJson[id].push({param: param, value: value});
}

/**
 *  Search and return the matched ID based on a RegEx. If the pattern is not found, null is returned.
 *  An example of the pattern that will be matching: B0711_D0332_CACE_P2_R13-65_D0.kK1/1/
 *  An example of the returned ID: B0711_D0332_CACE_P2_R13-65_D0.kK1_1 *
 *
 * @param contents
 * @returns {*}: ID if the pattern is matched. Or null if nothing is found.
 */
var idRegExp = /.*(\w{5}_\w{5}_\w{4}_\w{2}_\w{3}\-\w{2}_\w{2}\.\w{3})\/(\d+)/i;
function getContentsId(contents) {
    var foundId = idRegExp.exec(contents);

    if (!foundId) {
        return null;
    }
    else {
        return foundId[1] + '_' + foundId[2];
    }
}

function updatePercentageUI(percentage, fileName) {
    $('#process-progress').css('width', percentage+'%');
    $('#process-progress').attr('aria-valuenow', percentage);
    $('.process-progress-status').text(percentage + ' % done.');
    $('.process-progress-percentage').text(percentage);
//    $('.process-progress-file').text('Processing ' + fileName);
}

function enableOutputOption() {
//    $('.generate-output .page-header').removeClass('disabled');
//    $('.generate-output p').removeClass('disabled');
//    $('.generate-btn').prop('disabled', false);
    toggleOutputOption(false);
    $('#step2 span').hide();
}
function disableOutputOption() {
//    $('.generate-output .page-header').addClass('disabled');
//    $('.generate-output p').removeClass('disabled');
//    $('.generate-btn').prop('disabled', false);
    toggleOutputOption(true);
    $('#step2 span').show();
}
function toggleOutputOption(flag) {
    $('.generate-output .page-header').toggleClass('disabled', flag);
    $('.generate-output p').toggleClass('disabled', flag);
//    $('.generate-btn').toggleClass('disabled', flag);
    $('.generate-btn').prop('disabled', flag);
}

function iterateFileAsync(filesCountDown, filesCount, fileName) {
    var percentage = Math.ceil( ((filesCountDown+1)/filesCount) * 100 ) ;
    updatePercentageUI(percentage, fileName);
}
//  Helper functions for processFile - END


function generateResultCsvFile() {
    var idKeys = _(resultJson).keys();
    var allParams = {};

    for (var i = 0, id = '', cParamsArray = [], cParamsObject = {}; i < idKeys.length; i++) {
        id = idKeys[i];
        cParamsArray = _(resultJson[id]).keys();

        for (var j = 0, cParamsObject = {}; j < cParamsArray.length; j++) {
            cParamsObject[cParamsArray[j]] = undefined;
        }

        _.extend(allParams, cParamsObject);
    }

    allParams = _(_(allParams).keys()).sortByNat(function(item) {return item;});
    var result = _.union(['id'], allParams).toString() + '\r\n';    // construct the header row

    for (var i = 0, id = '', item = {}; i < idKeys.length; i++) {
        id = idKeys[i];
        item = resultJson[id];
        result += id + ',';

        for (var j = 0, value = ''; j < allParams.length; j++) {
            value = item[allParams[j]];
            if (value) {
                result += value;
            }
            if (j < allParams.length - 1) {
                result += ',';
            }
        }

        result += '\r\n';
    }

    var timeNow = moment().format('YYYYMMDD-hhmmss');
    var fileName = 'Result File - ' + timeNow + '.csv';

    if (topFolder) {
        fileName = '/' + topFolder + '/' + fileName;
    }

    writeFile(fileName, result, undefined, 'text/csv');
    // writeFile('result.json', JSON.stringify(resultJson), undefined, 'application/json');
}


//  Start the app
function addListeners() {
    importButton.addEventListener('change', onFileSelect, false);
}

window.addEventListener('DOMContentLoaded', function (e) {
    addListeners();

    if (filer && !filer.isOpen) {
        openFS();
    }
}, false);