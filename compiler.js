var endTime = function (time, expr) {
    if (expr.tag === 'note') {
        return time + expr.dur;
    } else if (expr.tag === 'rest') {
        return time + expr.dur;
    } else if (expr.tag === 'par') {
        return Math.max(
            endTime(time,expr.left),
            endTime(time,expr.right)
        );
    }
    return endTime(endTime(time, expr.left), expr.right);
};
var compileT = function(musexpr, time) {
    if (musexpr.tag === 'note') {
        return {
            tag: 'note',
            pitch: musexpr.pitch,
            start: time,
            dur: musexpr.dur 
        };
    } else if (musexpr.tag === 'rest') {
        return {
            tag: 'rest',
            start: time,
            dur: musexpr.dur
        };
    }
    var l, r;
    if (musexpr.tag === 'par') {
        l = compileT(musexpr.left, time);
        r = compileT(musexpr.right, time);
        return [l,r];
    } else {//if (tag === 'seq')
        l = compileT(musexpr.left, time);
        r = compileT(musexpr.right, 
                      endTime(time, musexpr.left));
        return [l,r];
    }
};
var compile = function (musexpr) {
    var MUS = compileT(musexpr,0);
    if (MUS.length === undefined) {
        return [MUS];
    }
    var NOTE = [];
    var i,j;
    for (i=0; i<MUS.length; i++){
        var l = MUS[i];
        for (j=0; j<MUS.length; j++){
            NOTE.push(l[j]);
        }
    }
    return NOTE;
};

//WARNING: THERE BE TESTING DRAGONS BELOW
var melody_mus = { 
    tag: 'seq',
    left: 
        { tag: 'par',
            left: { tag: 'note', pitch: 'a4', dur: 250 },
            right: { tag: 'note', pitch: 'b4', dur: 500 } },
    right:
        { tag: 'seq',
            left: { tag: 'rest', dur: 250 },
            right: { tag: 'note', pitch: 'd4', dur: 500 } } 
};
var melody_note = [
    {tag: 'note', pitch: 'a4', start: 0, dur: 250},
    {tag: 'note', pitch: 'b4', start: 0, dur: 500},
    {tag: 'rest', start: 500, dur: 250},
    {tag: 'note', pitch: 'd4', start: 750, dur: 500}
];

var assert = require('assert');
console.log(melody_note);
console.log(compile(melody_mus));
assert.deepEqual(
    compile(melody_mus),
    melody_note,
    "Compile() malfunction!"
)
console.log("Compiled successfully!");