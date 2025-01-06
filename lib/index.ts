import puppeteer, { ElementHandle } from 'puppeteer-core';
import fs from 'fs';
import axios from 'axios';

const browser = await puppeteer.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: false});
const page = await browser.newPage();

let url = Bun.env.URL;
if (url == undefined) throw new Error("No url");
await page.goto(url);





async function getImages() {
	let urls: string[] = [];
	
	for (let i = 1; i < 27; i++) {
		
		// Holds all the objects in the page with a "img" atribute
		let images: ElementHandle<any>[] = [];
		images = images.concat(await page.$$('img'));

		// Gets the objects and extracts only the urls using the getUrls() method, then pushes the strings into the urls list
		let extractedUrls = await getUrls(images);
		for (let i = 0; i < extractedUrls.length; i++) {
			urls.push(extractedUrls[i]);
		}

		// Changes the page
		await page.goto(`${url}/page/${i}`);

	}

	return urls;
}

async function getUrls(images: ElementHandle<any>[]) {
	let urlList: string[] = [];
	if (images.length > 0) {
		for (let i = 0; i < images.length; i++) {

			// Loops through the object list (images) taken by the getImages() function, then extracts only the urls
			const element = images[i];
			urlList.push(await page.evaluate(img => img.src, element));

		}
	}

	return urlList;
}

async function downloadImages(urlList: any[]){
	// fs.rmdirSync('./downloaded_images');
	fs.mkdirSync('./downloaded_images');
	if (urlList.length > 0) {
		for (let i = 0; i < urlList.length; i++) {
			const url = urlList[i];
			let response;

			try {
				response = await axios.get(url, { responseType: 'arraybuffer'});
			} catch (error) {
				console.log("Image not downloaded", error);
				continue;
			}
			
			const buffer = Buffer.from(response.data, 'binary');
	
			fs.writeFileSync(`./downloaded_images/image${i}.jpg`, new Uint8Array(buffer));
		}
	}
}

const images = await getImages();
await downloadImages(images);

await browser.close();
