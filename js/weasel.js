
var target = "METHINKS IT IS LIKE A WEASEL";
var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ ";
var mutation_rate = 0.01;
var n_organisms = 10;
var sexual_selection_factor = 0.0;
var survival_rate = 0.5;

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

    function do_generation(iteration){
        console.log(iteration)
        strings = spawn_new_generation();
        if (iteration % 10 === 0){
            console.log(strings[0], fitness(strings[0]));
            draw_organisms(strings);
        }
    }

    for (var i = 0; i < 100; i++){
        setTimeout(function(){do_generation(i);}, 500 * i);
    }
}

var width = 2000,
    height = 800;

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(32," + (height / 2) + ")");

var row_width = 400;
var col_height = 15;
var per_row = 5;
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

