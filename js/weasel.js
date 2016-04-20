
var target = "METHINKS IT IS LIKE A WEASEL";
var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ ";
var mutation_rate = 0.01;
var n_organisms = 1000;
var sexual_selection_factor = 0.0;
var death_rate = 0.2;

var strings = new Array(n_organisms).fill().map(random_string);

function random_char(){
    return possible.charAt(Math.floor(Math.random() * possible.length));
}

function random_string(){
    var res = "";
    for (var i = 0; i < target.length; i++)
        res += random_char();
    return res;
}

function mate(couple){
    s1 = strings[couple[0]];
    s2 = strings[couple[1]];
    if (s1.length != s2.length)
        throw "Can't mate strings of different lengths";
    var res = "";
    for (var k = 0; k < s1.length; k++){
        if (Math.random() > mutation_rate)
            res += Math.random() < 0.5 ? s1.charAt(k) : s2.charAt(k);
        else
            res += random_char();
    }
    return res;
}

function fitness(s){
    var score = 0;
    for (var i = 0; i < target.length; i++){
        if (s.charAt(i) == target.charAt(i))
            score ++;
    }
    return score;
}

function get_couples(){
    var couples = [];
    for (var i = 0; i < 2; i++){
        for (j = 0; j < strings.length; j++){
            if (i != j){
                var remaining = (strings.length - j - 1);
                match_prob = 1 / remaining + sexual_selection_factor * (remaining - 1)/ remaining;
                if (Math.random() < match_prob){
                    couples.push([i, j]);
                    break;
                }
            }
        }
    }
    return couples;
}

function spawn_new_generation(){
    var new_organisms = [];
    for (var i = 0; i < Math.ceil(1 / death_rate); i++){
        var couples = get_couples();
        new_organisms = new_organisms.concat(couples.map(mate));
    }
    new_organisms.sort(function (a, b){
        return fitness(a) < fitness(b) ? 1 : -1 ;
    });
    return new_organisms.slice(0, n_organisms);
}

function main(){
    for (var i = 0; i < 1000; i++){
    strings = spawn_new_generation();
        if (i % 10 == 0)
        console.log(strings[0], fitness(strings[0]));
    }
}

main();

