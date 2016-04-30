//simulation params
var target = "METHINKS IT IS LIKE A WEASEL";
var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ ";
var mutation_rate = 0.01;
var divine_intervention_rate = 0.0;
var n_organisms = 100;
var sexual_selection_factor = 0.0;
var survival_rate = 1.0;
var n_iterations = 10;


//application params
var width = 1600,
    height = 800;

var x_pad = 200;
var y_pad = 100;

var col_height = 15;
var per_row = 3;
var delay = 50;
var redaw_every = 1;

var row_width = width / per_row;


var strings = new Array(n_organisms).fill().map(random_string);


function fleeming_jenkins(){
    mutation_rate = 0.01;
    n_organisms = 100;
    sexual_selection_factor = 0.0;
    survival_rate = 1.0;
}

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
    for (var i = 0; i < strings.length; i++){
        for (j = 0; j < strings.length; j++){
            if (i != j){
                var remaining = (strings.length - j - 1);
                var match_prob = 1 / remaining + sexual_selection_factor * (remaining - 1)/ remaining;
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
    for (var i = 0; i < Math.ceil(1 / survival_rate); i++){
        var couples = get_couples();
        new_organisms = new_organisms.concat(couples.map(mate));
    }
    new_organisms.sort(function (a, b){
        return fitness(a) < fitness(b) ? 1 : -1 ;
    });

    return new_organisms.slice(0, n_organisms);
}

function main(){
    var i = 0;
    function do_generation(){
        strings = spawn_new_generation();
        if (i % redaw_every === 0){
            console.log(strings[0], fitness(strings[0]));
            draw_organisms(strings);
        }
        i++;
        if (i < n_iterations)
            setTimeout(do_generation, delay / redaw_every);
    }
    do_generation();
}

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(" + x_pad + "," + y_pad + ")");

var text;

function get_x_pos(d, i){
    return (i % per_row) * row_width;
}

function get_y_pos(d, i){
    return  (Math.floor(i/per_row)) * col_height;
}

function draw_organisms(organisms){

    text = svg.selectAll("text")
      .data(organisms, function(d, i) {return i;});

    text.attr("class", "update")
    .transition()
      .duration(750)
      .attr("x", get_x_pos)
      .text(function(d){ return d;});
    text.enter().append("text")
      .attr("class", "enter")
      .attr("dy", ".35em")
      .attr("x", get_x_pos)
      .attr("y",get_y_pos)
      // .style("fill-opacity", 1e-6)
      .text(function(d) { return d; })
    .transition()
      .duration(750)
      .style("fill-opacity", 1);

    // text.exit()
    //   .attr("class", "exit")
    // .transition()
    //   .duration(750)
    //   .attr("y", 60)
    //   .style("fill-opacity", 1e-6)
    //   .remove();


}


main();

