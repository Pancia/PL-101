var assert = require('assert');

// To write convertPitch, you need to break apart the pitch letter and the octave. 
// The MIDI number is 12 + 12 * octave + letterPitch. 
// The letterPitch is 0 for C, 2 for D, up to 11 for B.

var letterPitch = function (letter) {
    switch (letter) {
        case 'c': return 0;
        case 'd': return 2;
        case 'e': return 4;
        case 'f': return 5;
        case 'g': return 7;
        case 'a': return 9;
        case 'b': return 11;
        default: throw new Error("invalid letter");
    }
}

var convertPitch = function (pitch) {
    var MIDI = 12 + 
        12 * parseInt(pitch[1]) +
        letterPitch(pitch[0]);
    return MIDI;
}

var endTime = function (time, expr) {
    if (expr.tag === 'note') {
        return time + expr.dur;
    } else if (expr.tag === 'rest') {
        return time + expr.dur;
    } else if (expr.tag === 'par') {
        return Math.max(
            endTime(time, expr.left),
            endTime(time, expr.right)
        );
    } else if (expr.tag === 'seq') {
        return endTime(endTime(time, expr.left), expr.right);
    } else if (expr.tag === 'repeat') {
        return time + expr.section.dur*expr.count;
    }
};
var compileT = function (musexpr, time, ret) {
    if (musexpr.tag === 'note') {
        ret.push( {
            tag: 'note',
            pitch: convertPitch(musexpr.pitch),
            start: time,
            dur: musexpr.dur 
        });
    } else if (musexpr.tag === 'rest') {
        ret.push({
            tag: 'rest',
            start: time,
            dur: musexpr.dur
        });
    } else if (musexpr.tag === 'repeat') {
        var i;
        for (i=0; i<musexpr.count; i++) {
            ret.push({
                tag: 'note',
                pitch: convertPitch(musexpr.section.pitch),
                start: time+i*musexpr.section.dur,
                dur: musexpr.section.dur
            });
        }
    } else if (musexpr.tag === 'par') {
        l = compileT(musexpr.left, time, ret);
        r = compileT(musexpr.right, time, ret);
    } else if (musexpr.tag === 'seq') {
        l = compileT(musexpr.left, time, ret);
        r = compileT(musexpr.right, 
                      endTime(time, musexpr.left), ret);
    }
};
var compile = function (musexpr) {
    var ret = [];
    compileT(musexpr,0,ret);
    return ret;
};

//WARNING: THERE BE TESTING DRAGONS BELOW
var melody_mus = { 
    tag: 'seq',
    left: { tag: 'seq',
            left: { tag: 'note', pitch: 'a4', dur: 500 },
            right: { tag: 'repeat', 
                    section: { tag: 'note', pitch: 'b4', dur: 250 },
                    count: 3} },
    right: { tag: 'par',
            left: { tag: 'rest', dur: 250 },
            right: { tag: 'note', pitch: 'd4', dur: 500 } } 
};
var melody_note = [
    {tag: 'note', pitch: 69, start: 0, dur: 500},
    {tag: 'note', pitch: 71, start: 500, dur: 250},
    {tag: 'note', pitch: 71, start: 750, dur: 250},
    {tag: 'note', pitch: 71, start: 1000, dur: 250},
    {tag: 'rest', start: 1250, dur: 250},
    {tag: 'note', pitch: 62, start: 1250, dur: 500}
];

console.log("melody_note:");
console.log(melody_note);
console.log();
console.log("melody_mus:");
console.log(compile(melody_mus));
assert.deepEqual(
    compile(melody_mus),
    melody_note,
    "Compile error!"
); console.log("Success! melody_note deepEquals compile(melody_mus)");