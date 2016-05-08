/*Parametros*/
var torneioSize = 10;
var mutationRate = 0.90;
var populacao = 40;
var iteracoes = 700;	
var elitismo = true;

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
	
	this.fittestSalao = function(){
		var fittest = 0;
		var index = 0;
		for(var i = 0; i<this.saloes.length; i++){
			var soma = this.saloes[i].soma();
			if(fittest<soma){
				fittest = soma;
				index = i;
			}
		};
		return this.saloes[index];	
	}

	this.indexOfFittest = function(){
		var fittest = 0;
		var index = 0;
		for(var i = 0; i<this.saloes.length; i++){
			var soma = this.saloes[i].soma();
			if(fittest<soma){
				fittest = soma;
				index = i;
			}
		};
		return index;		
	}

	this.printSaloes = function(){
		for(var i = 0; i<this.saloes.length; i++){
			this.saloes[i].printMesas();
		}
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

	that.printMesas = function(){
		var arrMesas = [];
		for(var i = 0; i<that.mesas.length; i++){
			arrMesas.push(that.mesas[i].ocupantes);
		}
		var soma = that.soma();
		console.log(arrMesas.join(" ")+" ("+soma+")");
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


/* Funcao auxiliar pro crossover*/
function cloneMesa(obj){
	copy = mesa();
    copy.ocupantes = obj.ocupantes.slice();
    return copy;
}

function torneio(pop){
	var pop_torneio = new Populacao();
	for(var i = 0;i<torneioSize; i++){
		var rand = (Math.random()*(pop.saloes.length-1)).toFixed(0);
		pop_torneio.saloes.push(pop.saloes[rand]);
	}
	return pop_torneio.fittestSalao();
}

function crossover(salao1, salao2){
	var salao_filho = salao();
	var mesa_random = (Math.random()*(salao1.mesas.length-1)).toFixed(0);
	for(var i = 0; i<salao1.mesas.length; i++){
		if(i<mesa_random){
			salao_filho.mesas.push(cloneMesa(salao1.mesas[i]));
		}else{
			salao_filho.mesas.push(cloneMesa(salao2.mesas[i]));
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
	var inicio = 0;
	if(elitismo){
		inicio = 1;
		var salaoFittest = pop.fittestSalao();
		var indiceFittest = pop.saloes.indexOf(salaoFittest);
		var change = pop.saloes[0];
		pop.saloes[0] = salaoFittest;
		pop.saloes[indiceFittest] = change;
		pop2.saloes.push(salaoFittest);

		//debug
		var debugFittest = pop2.fittestSalao();
		var debugIndex = pop2.saloes.indexOf(debugFittest);
		//console.log("Fittest: "+debugFittest.soma()+" at "+debugIndex);
	}

	for(var i = inicio; i<pop.saloes.length; i++){
		var salao1 = torneio(pop);
		var salao2 = torneio(pop);	
		var salao_filho = crossover(salao1, salao2);
		pop2.saloes.push(salao_filho);
	}
	for(var i = inicio; i<pop2.saloes.length; i++){
		var chance = Math.random();
		if(chance<=mutationRate){
			mutacao(pop2.saloes[i]);
		}
	}
	return pop2;
}

function createChartResultados(resultados){
	var ctx = document.getElementById("resultados");

	var labels = [];
	for(var i = 0; i<iteracoes; i++){
		labels[i] = i;
	}
	Chart.defaults.global.responsive = true;
	Chart.defaults.global.maintainAspectRatio = false;
	var barData = {
	    labels: labels,
	    datasets: [
		        {
		            label: '2014 customers #',
		            fillColor: '#7BC225',
		            data: resultados
		        }
	    	]
	};
	var skillsChart = new Chart(ctx, {
		type: 'line',
	    data: {
	        labels: labels,
	        datasets: [{
	            label: 'Fittest',
	            data: resultados
	        }]
	    },
	    options: {
	        scales: {
	            yAxes: [{
	                ticks: {
	                    beginAtZero:true
	                }
	            }]
	        }
	    }
	});
}

function createChartEvolucao(evol){
	var ctx = document.getElementById("evolucao");

	var labels = [];
	for(var i = 0; i<iteracoes; i++){
		labels[i] = i;
	}
	Chart.defaults.global.responsive = true;
	Chart.defaults.global.maintainAspectRatio = false;
	var barData = {
	    labels: labels,
	    datasets: [
		        {
		            label: '2014 customers #',
		            fillColor: '#7BC225',
		            data: resultados
		        }
	    	]
	};
	var skillsChart = new Chart(ctx, {
		type: 'line',
	    data: {
	        labels: labels,
	        datasets: [{
	            label: 'Fittest',
	            data: evol
	        }]
	    },
	    options: {
	        scales: {
	            yAxes: [{
	                ticks: {
	                    beginAtZero:true
	                }
	            }]
	        }
	    }
	});
}

function getInput(){
	var mesas = 10;
	var capacidade = 10;

	var matriz = relacoes.getInstance().getMatriz();
	var pessoas = matriz[0].length;
	var pop_inicial = geraPopulacao(pessoas, mesas, capacidade);
	return pop_inicial;


}

function readMatriz(files){
	var file = files[0];
	var reader = new FileReader();
	var linhas = [];
	reader.onload = function(e){ 
		console.log(reader.result);
		linhas = reader.result.trim().split("\n");
		for(var i = 0; i<linhas.length; i++){ 
			linhas[i] = linhas[i].trim().split(" ").map(Number);
		};
		var matriz = relacoes.getInstance();
		matriz.setMatriz(linhas);
		Main();
	}
	reader.readAsText(file);
}

function geraPopulacao(pessoas, mesas, capacidade){
	var pop_inicial = new Populacao();
	var contador = [];
	for(var i = 0; i<pessoas; i++){
		contador[i]=i;
	}
	for(var i = 0; i<populacao; i++){
		var salao1 = salao();
		var arr = contador.slice();
		for(var k = 0; k<mesas; k++){
			var mesa1 = mesa();
			for(var j = 0; j<capacidade; j++){
				var ind = (Math.random()*(arr.length-1)).toFixed(0);
				mesa1.ocupantes.push(arr[ind]);
				arr.splice(ind, 1);
			}
			salao1.mesas.push(mesa1);
		}
		pop_inicial.saloes.push(salao1);
	}

	return pop_inicial;
}

function Main(){
	var now = new Date();
	//for(var chgMut = 0; chgMut<4; chgMut++){
		console.log("Populacao: "+populacao);
		var melhoras = [];
		var melhores = [];
		for(var teste = 0; teste<5; teste++){
			console.log("Teste: "+teste);
			var resultados = [];
			var evolucao = [];
			var pop = getInput();
			var primeiroResultado = pop.fittest();
			$(".relatorio").append("<br>Inicio: "+primeiroResultado);
			resultados.push(pop.fittest());
			for(var i = 1; i<=iteracoes; i++){
				resultados.push(pop.fittest());
				var evolRelativa = (resultados[i-1]/resultados[i]);
				evolucao.push(evolRelativa);
				pop = evolvePopulation(pop);
			}
			var ultimoResultado = pop.fittest();
			melhores.push(ultimoResultado);
			$(".relatorio").append("<br>Fim: "+ultimoResultado);
			var melhora = (ultimoResultado/primeiroResultado)-1;
			melhoras.push(melhora);
			$(".relatorio").append("<br>Melhora: "+ melhora+"<br>");
			console.log("Estou vivo");
		}
		var soma = 0;
		for(var i = 0; i<5; i++){
			soma = soma + melhores[i];
		}
		var media = soma/5;
		$(".relatorio").append("<br><br>Media: "+ media);
		populacao += 20;
		
	//}
	var after = new Date();
	var span = after-now;
	$(".relatorio").append("<br><br>Tempo decorrido: "+ (span/60000)+" minutos");
	//createChartResultados(resultados);
	//createChartEvolucao(evolucao);
}