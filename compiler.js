var endTime = function (time, expr) {
    if (expr.tag === 'note') {
        return time + expr.dur;
    } else if (expr.tag === 'par') {
        return Math.max(
            endTime(time,expr.left),
            endTime(time,expr.right)
        );
    }
    return endTime(endTime(time, expr.left), expr.right);
};
// maybe some helper functions
var tcomp = function(musexpr, time) {
    if (musexpr.tag === 'note') {
        return {
            tag: 'note',
            pitch: musexpr.pitch,
            start: time,
            dur: musexpr.dur 
        };
    } 
    var l, r;
    if (musexpr.tag === 'par') {
        l = tcomp(musexpr.left, time);
        r = tcomp(musexpr.right, time);
        return [l,r];
    } else {//tag === 'seq'
        l = tcomp(musexpr.left, time);
        r = tcomp(musexpr.right, 
                      endTime(time, musexpr.left));
        return [l,r];
    }
};

var compile = function (musexpr) {
    var MUS = tcomp(musexpr,0);
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

var melody_mus = 
    { tag: 'seq',
      left: 
       { tag: 'par',
         left: { tag: 'note', pitch: 'a4', dur: 250 },
         right: { tag: 'note', pitch: 'b4', dur: 500 } },
      right:
       { tag: 'seq',
         left: { tag: 'note', pitch: 'c4', dur: 250 },
         right: { tag: 'note', pitch: 'd4', dur: 500 } } };

console.log(melody_mus);
console.log("");
console.log(compile(melody_mus));