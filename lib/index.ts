import puppeteer, { ElementHandle } from 'puppeteer-core';
import fs from 'fs';
import axios from 'axios';
import { error } from 'console';

const browser = await puppeteer.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: false});
const page = await browser.newPage();

let url = Bun.env.URL;
if (url == undefined) throw new Error("No url");
await page.goto(url);



async function getImages() {
	let urls = [];
	for (let i = 0; i < 27; i++) {
		let images: ElementHandle<any>[] = [];

		console.log(`Page ${i}`);
		images = images.concat(await page.$$('img'));
		urls.push(await getUrls(images));
		console.log(urls);
		await page.goto(`${url}/page/${i}`);
	}

	return urls;
}

async function getUrls(images: ElementHandle<any>[]) {
	let urlList = [];
	if (images.length > 0) {
		for (let i = 0; i < images.length; i++) {
			const element = images[i];
			urlList.push(await page.evaluate(img => img.src, element));
		}
	}

	return urlList;
}

async function downloadImages(urlList: any[]){
	fs.rmdirSync('./downloaded_images');
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
