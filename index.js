const cheerio = require('cheerio');
const request = require('request');
const fs = require('fs');
const axios = require('axios');
const { exec } = require('child_process');
const figlet = require('figlet');
var log = require('console-emoji')

figlet('ScR ICH',function(err,data){
	if(err)
		throw err;
	console.log(data);
})


function decodeEntities(encodedString) {
    var translate_re = /&(nbsp|amp|quot|lt|gt);/g;
    var translate = {
        "nbsp":" ",
        "amp" : "&",
        "quot": "\"",
        "lt"  : "<",
        "gt"  : ">"
    };
    return encodedString.replace(translate_re, function(match, entity) {
        return translate[entity];
    }).replace(/&#(\d+);/gi, function(match, numStr) {
        var num = parseInt(numStr, 10);
        return String.fromCharCode(num);
    });
}


function extract([beg, end]) {
    const matcher = new RegExp(`${beg}(.*?)${end}`,'gm');
    const normalise = (str) => str.slice(beg.length,end.length*-1);
    return function(str) {
        return str.match(matcher).map(normalise);
    }
}


function download(url, path) {

	return new Promise((resolve, reject) => {
		exec('wget "' + url + '" -O "anime/' + path + '.mp4"', (error, stdout, stderr) => {
			resolve(":+1:" + path + " | Downloaded")
		})
	})
}

async function Scrape(data)
{
	let datsa = [];
	return new Promise((resolve, reject) => {
		var div = data;
		let link = 'https://www.xvideos.com' + div.find('a').attr('href');
		let thumb = div.find('img').attr('data-src');

		request('https://scrapestack.com/scrape_api.php?url=' + link, async function(error, data, html){
		var $ = cheerio.load(decodeEntities(html));
		let log = $('#video-player-bg > script:nth-child(6)');

		let js = log.children()?.prevObject.get(0)?.children[0]?.data;

		if(js !== undefined) {
			let url =  extract(['html5player.setVideoUrlHigh(',');'])(js)[0].replace(/["']/g, "");
			let title = extract(['html5player.setVideoTitle(',');'])(js)[0].replace(/["']/g, "");

			let result = {
				'thumbnail' : thumb,
				'link_video' : link,
				'stream_url': url,
				'title': title
			};


			// Mau Langsung Download? Uncommennt Code Di Bawah

			// await download(url, title).then(res => {
			// 	console.log(title + " Downloaded")
			// })


			resolve({...datsa, ...result})
		}
	})
	})
}






async function Main(kntl) {
	request('https://scrapestack.com/scrape_api.php?url=https://www.xvideos.com/?k=' + kntl, async function(error, data, html){
	   var $ = cheerio.load(decodeEntities(html));
	   let arr = [];
	   console.log("Gathering Information")
	   let count = 0;
	   var today = new Date();
	   var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
       var time = today.getHours() + " " + today.getMinutes() + " " + today.getSeconds();
	   var filename = "result/"+kntl.replace(/(\r\n|\n|\r)/gm, "") + " " + date+' '+time+".json";
	   await Promise.all($('.thumb').map(async function(e, d) {
	   
			    await Scrape($(this)).then(res => {
					count++;
				   (count == 20) ? (
					fs.writeFile(filename, JSON.stringify(arr, null, 4), { flag: 'wx' }, function (err) {
						if (err) throw err;
						console.log("File Saved to " + filename);
					})
					) : arr.push(res)
			   })
	   }))
   })
   
}



setTimeout(() => {
	process.stdout.write("Masukin Judulnya : >_ ");
	process.stdin.on('readable', () => { 
		process.stdin.setEncoding('utf8');
		let chunk; 
		// Use a loop to make sure we read all available data. 
		while ((chunk = process.stdin.read()) !== null) { 
			kntl = chunk.replace(' ','-');
			Main(kntl)
		} 
	});
}, 2000)