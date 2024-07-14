# ColorGeneratorMA3.js

The generator creates a xml containg macros to build up a colorpicker.
A default version using the config below is avaiable in this repository. You can import the file `MA3-ColorPicker-Macros.xml` in MA3, and use it as described at: `How to use the generated Macro in MA3` below.

The generated macro will build a sequence for each color group, and create cues using recipies. The recipie lines refrences color presets, and allows for use with easy update of groups to change fixture selection for each color group.

To make the color picker in a layout view, with filled and unfilled images the macros to trigger each color sequence will refrence an apperance in the apperance pool, and each apperance refrences the filled and unfilled images importet in the image pool.

The generated macro(s) will take care of the most of the work, but you have to take some manual steps to make everything work.

## How to run the generator script

To run the colorgenerator you first need to have node installed on your computer.
For installation check: [Node webpage](https://nodejs.org/en)

### Step 1: Generate the color macro
First you'll need to generate the color macor xml.
Edit the `ColorGeneratorMA3.js` file according to your needs.

At start of the  generator you'll bee able to edit the `setup` object according to your needs.

eg:

```
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
```

## How to use the generated Macro in MA3
### Step 1: Import images
Import the filled and unfilled images starting at the pool item numbers specified in step 1

A default set of images (not complete), matching the autogenerate config in the example above is located [here](./images/)


### Step 2: Create color presets
For the color picker to work, you'll need to create som color presets. The setup macro uses color preset 1 to X (where x is the number of colors you specified) to create the color sequences.

If you use the `autoCreateColors` option, there will automaticly be generated a set of colors. This uses the same function as within `ShowCreator` in the MA settings window.

If not the `autoCreateColors`option is used, you would have to create the color presets yourself.

### Step 3: Import the macro in the macro pool
In MA open up the macro pool, and choose an empty pool item. Then chose `edit`, and `import` in the macro editor. In the import menu locate the `ma3colormacros.xml` file, and import.

The file imoports a macro to create user variables, and a macro for each color and group you generated color macros for. The space after the empty pool item should be enough space for them to follow the initial variable macro.

### Step 4: Run the setup macro
By clicking the setup macro the following will be setup for you:
- User vaiables to refrence, and update appearances for macros.
- An apperance will be created and assigned to each color macro.
- A seqence for each color group will be created, and the color presets you created in step 3 will be assigned to the corresponding the que as a recipie line.
- A layout pool with the name "Color" gets created, and the corresponding macros are added in a grid layout.

### Step 5: Update groups
The macro creates a group with the same name as specified in the input, including an grop called "All". If the names specified as input is the same as existing groups, the exiting groups will be used.

Update the groups to include the fixtures you want, and then you'll be able to use the colorpicker,

