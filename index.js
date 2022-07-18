//Importações
const csv = require("csv-parser")
const fs = require("fs")

//Main
const results = []
fs.createReadStream("data.csv").pipe(csv({}))
  .on("data", (data) => results.push(data)) 
  .on("end", () => {
    doAnalysis(results)
  })

//Respostas do exercício
function doAnalysis(jsonData){
  const countryGroup = groupByCategory(jsonData, obj =>  obj.Country_Region);
  
  analyze1(countryGroup)
    
  analyze2(countryGroup)
    
  analyze3(countryGroup)
    
  analyze4(countryGroup)
    
  analyze5(countryGroup)
}

//Os três países com os maiores valores de "Confirmed". Os nomes devem estar em ordem alfabética.
function analyze1(countryGroup){   
  let listOfCountries = [];
  listOfCountries = dataGroupingWithCustomMetrics(countryGroup)
    .sort((a,b) => b.TotalOfConfirmeds - a.TotalOfConfirmeds)
    .slice(0, 3)
    .map(object => ({ 'Pais' : object.Country,'TotalConfirmado' : object.TotalOfConfirmeds}))
    .sort(function(a,b) {
      if(a.Pais < b.Pais) return -1;
      if(a.Pais > b.Pais) return 1;
      return 0;
  });
  console.log("Os três países com mais casos de Covid-19 confirmados são:");  
  console.log(listOfCountries);  
}

//Dentre os dez países com maiores valores de "Active", a soma dos "Deaths" dos cinco países com menores valres de "Confirmed".
function analyze2(countryGroup){
  let listOfCountries = [];
  var sumOfDeaths = 0;  
  listOfCountries = dataGroupingWithCustomMetrics(countryGroup)
    .sort((a,b) => b.TotalActive - a.TotalActive)
    .slice(0, 10)
    .map(object => ({ 'Pais' : object.Country, 'TotaldeConfirmados': object.TotalOfConfirmeds, 'TotalCasosAtivos' : object.TotalActive, 'TotalMortes' : object.TotalOfDeaths}))
    .sort((a,b) => a.TotalOfConfirmeds - b.TotalOfConfirmeds)
    .slice(0, 5)
  sumOfDeaths = listOfCountries.reduce((a, b) => a + b.TotaldeConfirmados, 0);
  console.log("");
  console.log("Dentre os dez países com os maiores valores de casos de Covid-19 ativos,"); 
  console.log("a soma das mortes dos que apresentam os menores valores de casos confirmados é: " + sumOfDeaths);
}

//O maior valor de "Deaths" entre os países do hemisfério sul.
function analyze3(countryGroup){
  let listOfCountries = [];
  listOfCountries = dataGroupingWithCustomMetrics(countryGroup)
    .map(object => ({'Pais' : object.Country, 'TotaldeConfirmados': object.TotalOfConfirmeds, 'TotalCasosAtivos' : object.TotalActive, 'Totalmortes' : object.TotalOfDeaths, 'Latitudetotal': object.LatGlobal}))    
    .filter((object) => object.Latitudetotal < 0)
    .sort((a,b) => b.Totalmortes - a.Totalmortes)
    .slice(0, 1)
    console.log("");    
    console.log("Dentre os países do hemisfério sul, o que mais teve casos de morte por Covid-19 é:");
    console.log(listOfCountries);

}

//O maior valor de "Deaths" entre os países do hemisfério norte.
function analyze4(countryGroup){
  let listOfCountries = [];
  listOfCountries = dataGroupingWithCustomMetrics(countryGroup)
    .map(object => ({'Pais' : object.Country, 'TotaldeConfirmados': object.TotalOfConfirmeds, 'TotalCasosAtivos' : object.TotalActive, 'Totalmortes' : object.TotalOfDeaths, 'Latitudetotal': object.LatGlobal}))    
    .filter((object) => object.Latitudetotal >= 0)
    .sort((a,b) => b.Totalmortes - a.Totalmortes)
    .slice(0, 1)
    console.log("");    
    console.log("Dentre os países do hemisfério norte, o que mais teve casos de morte por Covid-19 é:");
    console.log(listOfCountries);
}

//A soma de "Active" de todos os países em que "Confirmed" é maior o igual que 1.000.000.
function analyze5(countryGroup){
  let listOfCountries = [];
  let somaOfActive = 0;
  listOfCountries = dataGroupingWithCustomMetrics(countryGroup)
    .map(object => ({'Pais' : object.Country, 'TotaldeConfirmados': object.TotalOfConfirmeds, 'TotalCasosAtivos' : object.TotalActive, 'Totalmortes' : object.TotalOfDeaths, 'Latitudetotal': object.LatGlobal}))
    .filter((object) => object.TotaldeConfirmados >= 1000000);
  somaOfActive = listOfCountries.reduce((a, b) => a + b.TotalCasosAtivos, 0);
  console.log("");
  console.log("Dentre os países com 1.000.000 ou mais de casos de Covid-19 confirmados, a soma de casos ativos desses países é: " + somaOfActive);
}


//Funções para usar como parametro para as chamadas funcionais
function dataGroupingWithCustomMetrics(countryGroup){
  const somaConfirmed = {'TotalOfConfirmed': 0};
  let somaActive = 0;
  let somaDeth = 0;
  let somaLat = 0;
  const listOfCountries = [];
  Object.entries(countryGroup).forEach(function(country){
    country[1].forEach(function(region){    
      somaConfirmed.TotalOfConfirmed = somaConfirmed.TotalOfConfirmed + parseInt(region['Confirmed']);      
      somaActive = somaActive + parseInt(region['Active']);      
      somaDeth = somaDeth + parseInt(region['Deaths']);
      somaLat = somaLat + Math.floor(region['Lat']);      
    });
    const tempData = Object.assign({'Country': country[0], 'States': country[1], 'TotalOfConfirmeds': somaConfirmed.TotalOfConfirmed, 'TotalActive': somaActive, 'TotalOfDeaths': somaDeth, 'LatGlobal': somaLat});    
    listOfCountries.push(tempData);   
    somaConfirmed.TotalOfConfirmed = 0;
    somaActive = 0;
    somaDeth = 0;
    somaLat = 0;
  }); 
  return listOfCountries; 
}

function groupByCategory(list, keyGetter) {
  const groupB = list.reduce((group, item) => {
    const key = keyGetter(item);
    group[key] = group[key] ?? [];
    group[key].push(item);
    return group;
  }, {});
  return groupB;
}