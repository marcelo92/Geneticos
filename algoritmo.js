/*Parametros*/
var torneioSize = 5;
var mutationRate = 0.15;

/* Matriz de relacoes (singleton)*/
var relacoes = (function(){
	var instance;
	function init(){
		var matriz = [];
		return{
			getMatriz: function(){
				return matriz;
			},
			setMatriz: function(m){
				matriz = m;
			}
		};
	};
	return{
		getInstance: function(){
			if(!instance){
				instance = init();
			}
			return instance;
		}
	}
})();

var Populacao = function(){
	this.saloes = [];
	this.fittest = function(){
		var fittest = 0;
		for(var i = 0; i<this.saloes.length; i++){
			var soma = this.saloes[i].soma();
			if(fittest<soma){
				fittest = soma;
			}
		};
		return fittest;
	}
}

var salao = function(){
	var that = {};
	that.mesas = [];
	that.soma = function(){
		var soma = 0;
		for(var i = 0; i<that.mesas.length; i++){
			soma += that.mesas[i].soma();
		}
		return soma;
	}

	return that;
}

var mesa = function(){
	var that = {};
	that.ocupantes = [];
	that.soma = function(){
		var matriz = relacoes.getInstance();
		var soma = 0;
		for(var i = 0; i<that.ocupantes.length; i++){
			for(var j=i+1; j<that.ocupantes.length; j++){
				var ind1 = that.ocupantes[i];
				var ind2 = that.ocupantes[j];
				soma += matriz.getMatriz()[ind1][ind2];
			}
		}
		return soma;
	};
	return that;
}


function torneio(pop){
	var pop_torneio = new Populacao();
	for(var i = 0;i<torneioSize; i++){
		var rand = (Math.random()*pop.mesas.length).toFixed(0);
		pop_torneio.mesas.push(pop.mesas[rand]);
	}
	return pop_torneio.fittest;
}

function crossover(salao1, salao2){
	var salao_filho = salao();
	var mesa_random = (Math.random()*(salao1.mesas.length-1)).toFixed(0);
	for(var i = 0; i<salao1.mesas.length; i++){
		if(i<mesa_random){
			salao_filho.mesas.push(salao1.mesas[i]);
		}else{
			salao_filho.mesas.push(salao2.mesas[i]);
		}
	}

	//podem haver numeros repetidos e faltantes, abaixo corrigimos esse problema
	var missing = checkMissingNumbers(salao_filho);
	var dups = checkDuplicateNumbers(salao_filho);
	//missing e dups devem ser do mesmo tamanho, para cada numero duplicado, deve haver um faltando
	for(var i = 0; i<salao_filho.mesas.length; i++){
		for (var j =0; j<salao_filho.mesas[i].ocupantes.length; j++){
			//caso encontre um numero duplicado
			var num = salao_filho.mesas[i].ocupantes[j];
			var index = dups.indexOf(num);
			if(index>-1){
				salao_filho.mesas[i].ocupantes[j] = missing[0];
				missing.splice(0,1);
				dups.splice(index, 1);
			}
		}
	}

	return salao_filho;
}

function mutacao(salao){
	var mesa1 = (Math.random()*(salao.mesas.length-1)).toFixed(0);
	var mesa2 = (Math.random()*(salao.mesas.length-1)).toFixed(0);
	if(mesa1==mesa2){
		mesa2 = (Number(mesa2)+1)%salao.mesas.length;
	}
	var qnt = (Math.random()*(salao.mesas[mesa1].ocupantes.length-1)).toFixed(0);
	if(qnt==0) qnt++;
	var swap = salao.mesas[mesa1].ocupantes.splice(0, qnt);
	salao.mesas[mesa1].ocupantes = salao.mesas[mesa1].ocupantes.concat(salao.mesas[mesa2].ocupantes.splice(0,qnt));
	salao.mesas[mesa2].ocupantes = salao.mesas[mesa2].ocupantes.concat(swap);
}

function checkMissingNumbers(salao){
	var missing = [];
	var arr = [];
	for(var i = 0;i<salao.mesas.length; i++){ 
		arr = arr.concat(salao.mesas[i].ocupantes);
	}

	arr.sort();
	for(var i = 0; i<arr.length; i++){
		if(arr.indexOf(i)<0){
			missing.push(i);
		}
	}
    return missing;
}

function checkDuplicateNumbers(salao){
	var arr = [];
	for(var i = 0;i<salao.mesas.length; i++){ 
		arr = arr.concat(salao.mesas[i].ocupantes);
	}
	var count = Array.apply(null, Array(arr.length)).map(Number.prototype.valueOf,0);
	var dups = [];
	for(var i = 0; i < arr.length; i++){  
	    if(count[arr[i]] == 1){
			dups.push(arr[i]);
	    }else{
			count[arr[i]]++;
	    }
	}
	return dups;
}

function evolvePopulation(pop){
	var salao1 = torneio(pop);
	var salao2 = torneio(pop);	
	
}

var global;
function Main(matriz_relacoes, mesas, capacidade){
	var matriz = relacoes.getInstance();
	matriz.setMatriz(matriz_relacoes);
	var pop_inicial = new Populacao();
	
	var m1 = mesa();
	m1.ocupantes = [0,1];
	var m2 = mesa();
	m2.ocupantes = [2,3];
	var salao1 = salao();
	salao1.mesas = [m1,m2];

	var m3 = mesa();
	m3.ocupantes = [0,3];
	var m4 = mesa();
	m4.ocupantes = [1,2];
	var salao2 = salao();
	salao2.mesas = [m3,m4];


	pop_inicial.saloes.push(salao1, salao2);
	global = pop_inicial;

}

var matriz_exemplo = [
	[1, 10, 0, 0],
	[10, 1, 0, 0],
	[0, 0, 1, 10],
	[0, 0, 10, 1]
];
var mesas_exemplo = 2;
var capacidade_exemplo = 2;
Main(matriz_exemplo, mesas_exemplo, capacidade_exemplo);
