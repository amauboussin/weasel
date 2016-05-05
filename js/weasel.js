//simulation params
var target = "METHINKS IT IS LIKE A WEASEL";
var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ ";
var mutation_rate = 0.1;
var intervention_rate = 0.01;
var n_organisms = 100;
var sexual_selection_factor = 0.0;
var survival_rate = 0.1;
var n_iterations = 100;
var init = init_random;
var static_after = target.length;

//application params
var vis_div_id = 'main-vis';
var width = 900,
    height = 800;

var width = document.getElementById(vis_div_id).offsetWidth,
    height = 800;

var x_pad = 100;
var y_pad = 100;

var col_height = 20;
var delay = 750;
var redaw_every = 1;

var row_width = 350;
var per_row = Math.floor((width - x_pad)/row_width);



/* Historical model */
function darwin(){
    mutation_rate = 0.1;
    intervention_rate = 0.00;
    n_organisms = 100;
    sexual_selection_factor = 0.0;
    survival_rate = 0.5;
    n_iterations = 100;
    init = init_random;
    static_after = target.length;
}

function kelvin(){
    mutation_rate = 0.01;
    intervention_rate = 0.00;
    n_organisms = 100;
    sexual_selection_factor = 0.0;
    survival_rate = 0.5;
    n_iterations = 10;
    init = init_random;
    static_after = target.length;

}

function random(){
    mutation_rate = 1.0;
    intervention_rate = 0.00;
    n_organisms = 100;
    sexual_selection_factor = 0.0;
    survival_rate = 0.5;
    n_iterations = 100;
    init = init_random;
    static_after = target.length;
}

function owen(){
    mutation_rate = 0.0;
    intervention_rate = 1.00;
    n_organisms = 100;
    sexual_selection_factor = 0.0;
    survival_rate = 0.5;
    n_iterations = 100;
    init = init_perfect;
    static_after = -1;
}

function asa(){
    mutation_rate = 0.01;
    intervention_rate = 0.01;
    n_organisms = 100;
    sexual_selection_factor = 0.0;
    survival_rate = 0.5;
    n_iterations = 100;
    init = init_random;
    static_after = target.length;
}

function irreducible(){
    mutation_rate = 0.01;
    intervention_rate = 0.00;
    n_organisms = 100;
    sexual_selection_factor = 0.0;
    survival_rate = 0.5;
    n_iterations = 100;
    init = init_random;
    static_after = target.length - 7;
}


/* Simulation code */

//simulation state
var strings, generation, favorable_mutations, unfavorable_mutations,
interventions, births, deaths;

function reset_simulation(){
    generation = 0;
    favorable_mutations = 0;
    unfavorable_mutations = 0;
    interventions = 0;
    births = 0;
    deaths = 0;
}

function init_random(){
    strings = new Array(n_organisms).fill().map(random_string);
}

function init_perfect(){
    strings = new Array(n_organisms).fill().map(perfect_string);
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

function perfect_string(){
    return target;
}

function mate(couple){
    s1 = strings[couple[0]];
    s2 = strings[couple[1]];
    if (s1.length != s2.length)
        throw "Can't mate strings of different lengths";
    var res = "";
    for (var k = 0; k < s1.length; k++){
        // check for intelligent design
        if (k > static_after){
            res += target.charAt(k);
        }
        // check for divine intervention
        else if (Math.random() < intervention_rate ){
            res += target.charAt(k);
            interventions += 1;
        }
        //mutation or normal selection
        else if (Math.random() > mutation_rate){
            res += Math.random() < 0.5 ? s1.charAt(k) : s2.charAt(k);
        }
        else{
            res += random_char();
            if (res[res.length-1] == target.charAt(res.length-1))
                favorable_mutations += 1;
            else
                unfavorable_mutations += 1;
        }
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
    births += new_organisms.length;
    deaths += new_organisms.length - n_organisms;
    new_organisms.sort(function (a, b){
        return fitness(a) < fitness(b) ? 1 : -1 ;
    });

    return new_organisms.slice(0, n_organisms);
}

function run_sim(){
    
    reset_simulation();
    simulation_running = true;
    remove_organisms();
    init();
    
    function do_generation(){
        strings = spawn_new_generation();
        if (generation % redaw_every === 0){
            console.log(strings[0], fitness(strings[0]));
            draw_organisms(strings);
        }
        generation++;

        draw_stats();
        if (generation < n_iterations && simulation_running)
            setTimeout(do_generation, delay / redaw_every);
        else{
            simulation_end();
        }
    }

    draw_organisms(strings);
    setTimeout(do_generation, delay / redaw_every);
}

/* Visualization code */

var svg = d3.select("#" + vis_div_id).append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(" + x_pad + "," + y_pad + ")");

var text;
var simulation_running;


function draw_stats(){
    $('#generations').text(generation);
    $('#favorable').text(favorable_mutations);
    $('#unfavorable').text(unfavorable_mutations);
    $('#interventions').text(interventions);
    $('#births').text(births);
    $('#deaths').text(deaths);
}

function get_x_pos(d, i){
    return (i % per_row) * row_width;
}

function get_y_pos(d, i){
    return  (Math.floor(i/per_row)) * col_height;
}

function char_map(c){
    /** SVG tspan needs non-breaking space */
    return (c === ' ') ? '\u00A0' : c;
}

function init_organism(){
    var this_text = d3.select(this);
    for (var j = 0; j < target.length; j++){
        this_text.append("svg:tspan")
        .attr("class", "letter");
    }
}

function update_organism(d){
    var this_text = d3.select(this);
    this_text.selectAll(".letter")
        .text(function(_, j){
            return char_map(d[j]);
        })
        .style("fill", function(_, j){
            return (target.charAt(j) === char_map(d[j])) ? 'green' : 'red';
        });
}

function draw_organisms(organisms){

    text = svg.selectAll(".organism")
      .data(organisms, function(d, i) {return i;});

    text.enter().append("text")
      .attr("dy", ".35em")
      .attr("x", get_x_pos)
      .attr("y",get_y_pos)
      .style("font-family", "monospace")
      .each(init_organism);

    text.attr("class", "update organism")
      .each(update_organism);
}

function remove_organisms(){
    text.remove();
}

var mode_params = {
    'darwin': darwin,
    'kelvin': kelvin,
    'owen': owen,
    'random': random,
    'irreducible': irreducible,
    'asa': asa,
};

var mode_explanations = {
    'darwin': {'title': 'Darwinian Evolution',
        'body': 'An explanation of Darwinian Evolution.'
    },
    'kelvin': {'title': 'Lord Kelvin: A Scientific Objection',
        'body': 'An explanation of Darwinian Evolution.'
    },
    'owen': {'title': 'Intelligent Design',
        'body': 'An explanation of Darwinian Evolution.'
    },
    'irreducible': {'title': 'Modern Creationism and the Theory of Irreducible Complexity',
        'body': 'An explanation of Darwinian Evolution.'
    },
    'random': {'title': 'Randomness',
        'body': 'An explanation of Darwinian Evolution.'
    },
    'asa': {'title': 'Asa Gray',
        'body': 'An explanation of Darwinian Evolution.'
    },
};

// form controls

// form value -> float
function parse_val(val){
    if (val.indexOf("%") > -1){
        val = val.replace("%", "");
        return parseFloat(val) / 100.0;
    }
    return parseFloat(val);
}

// float -> form value
function encode_val(val){
    if (val <= 1.0)
        return (val * 100).toFixed(0) + "%";
    else
        return val.toString();
}

function set_form_values(){
    $("#iterations").val(encode_val(n_iterations));
    $("#organisms").val(encode_val(n_organisms));
    $("#birth-rate").val(encode_val(1 / survival_rate));
    $("#mutation-rate").val(encode_val(mutation_rate));
    $("#intervention-rate").val(encode_val(intervention_rate));
}

function read_form_values(){
   n_iterations = parse_val($("#iterations option:selected").text());
   n_organisms = parse_val($("#organisms option:selected").text());
   survival_rate = 1.0 / parse_val($("#birth-rate option:selected").text());
   mutation_rate = parse_val($("#mutation-rate option:selected").text());
   intervention_rate = parse_val($("#intervention-rate option:selected").text());
}

function simulation_end(){
    var run_button = $("#run-button");
    run_button.addClass('btn-primary');
    run_button.removeClass('btn-danger');
    run_button.text("Run Simulation");
    simulation_running = false;
}

function display_mode_info(){
    var mode_key = $('input[name=mode]:checked', '#mode-select').val();
    this_explanation = mode_explanations[mode_key];
    $('#explanation-title').text(this_explanation.title);
    $('#explanation-text').text(this_explanation.body);
    mode_params[mode_key]();
    set_form_values();
}

// don't jump to top of page on form submit
$("#set-params").submit(function(){
  return false;
});

$("#run-button").click(function(){
    read_form_values();
    if ($(this).hasClass('btn-primary')){
        $(this).removeClass('btn-primary');
        $(this).addClass('btn-danger');
        $(this).text("Stop Simulation");
        run_sim();
    }
    else{
        simulation_end();
    }
});

$("#mode-select").on("change", ":input", display_mode_info);

$("#set-params").on("change", ":input", read_form_values);

display_mode_info();
init_random();
draw_organisms(strings);


