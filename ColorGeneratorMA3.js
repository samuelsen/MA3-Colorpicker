/*******************************************
 * Change these to match your needs
 *******************************************/

const setup =
{
    numberOfColors: 25,
    filledImageStart: 1,
    unfilledImageStart: 26,
    appearanceStart: 101,
    groups: ['Spot', 'Wash', 'Beam', 'Led'],
    autoCreateColors:
    {
        enabled: true,
        AmountHue: 12,
        AmountSaturation: 2
    }
}

/*******************************************
 * Don't change anything below if you don't know what you are doing
 *******************************************/

const fs = require('fs');
const crypto = require('crypto');

function write(text)
{
    fs.writeFile('./MA3-ColorPicker-Macros.xml', text + "\n", err => {
        if (err) {
          console.error(err);
        }
      });
}

function macroLine(command, name = 'macro') {
    return '<MacroLine Guid="'+crypto.randomUUID()+'"Name="'+ name +'" Command="'+command+'"/>';
}

function generate()
{
    // Fetch from setup object
    let numberOfColors = setup.numberOfColors;
    let filledImageStart = setup.filledImageStart;
    let unfilledImageStart = setup.unfilledImageStart;
    let appearanceStart = setup.appearanceStart;

    let groups = ['All'].concat(setup.groups)
    // End fetch from setup object

    let imagePoolRefrenceForApperanceAssignment = "13.2.3."
    let seqnamePostfix = "Colors"

    var xml = '<?xml version="1.0" encoding="UTF-8"?><GMA3 DataVersion="1.9.7.0">';

    // macro 1 - variabel, sequence, appearance, preset, layout and group creation
    xml += '<Macro name="Setup ColorPicker" Guid="'+crypto.randomUUID()+'">';
    xml += macroLine('ClearAll')

    if (setup.autoCreateColors)
    {
        xml += macroLine('AutoCreate Universal 1 At Preset 4.\'*\' \'AmountHue\' ' + setup.autoCreateColors.AmountHue + ' \'AmountSaturation\' '+ setup.autoCreateColors.AmountSaturation +' \'SortColor\' \'Hue\' /NoConfirmation', 'Auto create color presets')
    }

    groups.map((key) => {
        let seqName = key + seqnamePostfix
        xml += macroLine('Store Group \'' + key + '\' /m', 'create color groups')
        xml += macroLine('Store Seq \'' + seqName + '\'', 'Create Sequence for all colors')
        xml += macroLine('Set seq \''+ seqName + '\' Property \'offwhenoverridden\' false', 'Do not off sequenc when overridden')
        xml += macroLine('Store Cue 1 Thru ' + numberOfColors + ' Seq \'' + seqName + '\' /o', 'Create cue for each number of colors')
        xml += macroLine('Assign Group \'' + key + '\' at seq \'' + seqName + '\' cue 1 thru part 0.1')
    })

    xml += macroLine('Store Layout \'Colors\'', 'Create layout for colors')

    for (let j = 0; j < numberOfColors; j++)
    {
        xml += macroLine('Setu A' + j + ' \'' + groups.map( function(_, index){ return ((index * numberOfColors) + appearanceStart + j) }).join(" + ") + '\'', 'Appearance colorvariable A'+j)
        groups.map((key, index) => {
            let macroName = key + ' ' + (j + 1)
            let seqName = key + seqnamePostfix

            xml += macroLine('Store Appearance $A' + j, 'Creat apperance for colorvariable A'+j)
            xml += macroLine('Set Appearance $A' + j + ' Property Appearance \'' + imagePoolRefrenceForApperanceAssignment + (j + unfilledImageStart) + '\'', 'Set appearance for colorvariable A'+j)
            xml += macroLine('Assign Appearance ' + ((index * numberOfColors) + appearanceStart + j) + ' At Macro \'' + macroName + '\'', 'Assign appearance to macro: ' + macroName)
            xml += macroLine('Assign Preset 4.' + (j+1) + ' At Seq \'' + seqName + '\' cue ' + (j+1) + ' part 0.1', 'Assign Color preset 1 to n at each cue')

            // Assign to layout
            xml += macroLine('Assign Macro \'' + macroName + '\' at Layout \'Colors\'')
            xml += macroLine('Set Layout \'Colors\'. \'' + macroName + '\' \'posX\' \'' + (50 * j) + '\'')
            xml += macroLine('Set Layout \'Colors\'.\'' + macroName + '\' \'posY\' \'' + (-50 * index) + '\'')
        })
    }
    xml += '</Macro>';

    // macro 2 - Allcolor macros
    groups.filter((_, index) => index === 0).map((key) => {
        let seqName = key + seqnamePostfix
        for(let j = 0; j < numberOfColors; j++) {
            let macroName = key + ' ' + (j + 1)
            xml += '<Macro name="' + macroName + '" Guid="'+crypto.randomUUID()+'">';
            let setUnfilled = ''
            for (k = 0; k < numberOfColors; k++){
                setUnfilled += 'Set Appearance $A' + k + ' Property Appearance \'' + imagePoolRefrenceForApperanceAssignment + (k + unfilledImageStart) + '\';'
            }
            xml += macroLine(setUnfilled, 'Set unfilled')
            xml += macroLine('Set Appearance $A' + j + ' Property Appearance \'' + imagePoolRefrenceForApperanceAssignment + (j + filledImageStart) + '\'', 'Set filled')
            xml += macroLine('GoTo Cue ' + (j+1) + ' Seq \'' + seqName + '\'', 'Go to cue')
            xml += '</Macro>'
        }
    })

    // macro 3 - Groupcolor macros
    groups.filter((_, index) => index > 0).map((key, index) => {
        let seqName = key + seqnamePostfix
        let appearancePoolItem = ((index+1) * numberOfColors) + appearanceStart;

        for(let j = 0; j < numberOfColors; j++) {
            let macroName = key + ' ' + (j + 1)
            xml += '<Macro name="' + macroName + '" Guid="'+crypto.randomUUID()+'">';
            let setUnfilled = ''
            for (k = 0; k < numberOfColors; k++){
                // set all colors unfilled
                setUnfilled += 'Set Appearance ' + (appearanceStart + k) + ' Property Appearance \'' + imagePoolRefrenceForApperanceAssignment + (k + unfilledImageStart) + '\';'

                // set current group colors unfilled
                setUnfilled += 'Set Appearance ' + (appearancePoolItem + k) + ' Property Appearance \'' + imagePoolRefrenceForApperanceAssignment + (k + unfilledImageStart) + '\';'
            }
            xml += macroLine(setUnfilled, 'Set unfilled')
            xml += macroLine('Set Appearance ' + (appearancePoolItem + j) + ' Property Appearance \'' + imagePoolRefrenceForApperanceAssignment + (j + filledImageStart) + '\'', 'Set filled')
            xml += macroLine('GoTo Cue ' + (j+1) + ' Seq \'' + seqName + '\'', 'Go to cue')
            xml += '</Macro>'

        }
    })

    ///// write everything
    write(xml + "</GMA3>");
}

generate()
