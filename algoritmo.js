/*Parametros*/
var torneioSize = 5;
var mutationRate = 0.15;
var populacao = 5;

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
	var pop2 = new Populacao();

	for(var i = 0; i<pop.saloes.length; i++){
		var salao1 = torneio(pop);
		var salao2 = torneio(pop);	
		var salao_filho = crossover(salao1, salao2);
		pop2.saloes.push(salao_filho);
	}

	for(var i = 0; i<pop2.saloes.length; i++){
		if(Math.random()>mutationRate){
			mutacao(pop2.saloes[i]);
		}
	}
	return pop2;
}

function Main(){
	var pop = getInput();
	for(var i = 0; i<10; i++){
		document.writeln(pop.soma());
		pop = evolvePopulation(pop);
	}

}

function getInput(){
	var pessoas = 6;
	var matriz_exemplo = [
		[1, 10, 5, 0, 0, 0],
		[10, 1, 3, 0, 0, 0],
		[5, 3, 1, 1, 0,  0],
		[0, 0, 0, 1, 10, 3],
		[0, 0, 0, 10, 1, 7],
		[0, 0, 0, 3, 7,  1],
	];

	var matriz = relacoes.getInstance();
	matriz.setMatriz(matriz_exemplo);
	var mesas = 3;
	var capacidade = 2;

	var pop_inicial = geraPopulacao(pessoas, mesas, capacidade);
	return pop_inicial;


}

function geraPopulacao(pessoas, mesas, capacidade){
	var pop_inicial = new Populacao();
	var arr = [];
	for(var i = 0; i<pessoas; i++){
		arr[i]=i;
	}
	for(var i = 0; i<5; i++){
		var salao1 = salao();
		for(var i = 0; i<mesas; i++){
			var mesa1 = mesa();
			for(var j = 0; j<capacidade; j++){
				var ind = (Math.random()*arr.length).toFixed(0);
				mesa1.ocupantes.push(arr[ind]);
				arr.splice(ind, 1);
			}
			salao1.mesas.push(mesa1);
		}
		pop_inicial.saloes.push(salao1);
	}

	return pop_inicial;
}
//Main(matriz_exemplo, mesas_exemplo, capacidade_exemplo);
