/* 
### AlrightyCheckingPrices 2000 ###
Copyright well not copyright because I'm 13 sadly.
*/

// Code
const Puppy = require("puppeteer");
const File = require("fs");

const NTelegramBAPI = require('node-telegram-bot-api');
const Telegram = new NTelegramBAPI("token", {polling:true});

const ChatId = "your-telegram-id";
const UserAgent = "user-agent";

var CacheS = new Map();
var CacheP = new Map();
var CacheN = new Map();

var SoldOutRTX3070 = true;
var SoldOutRTX3080 = true;
var google;

/*
## Cache ##
*/
// Cache Type S: false or true for Sold Out!
// Cache Type P: price and check lower and higher!

async function start() {
    google = await Puppy.launch({defaultViewport: {width: 1280, height: 720}, headless: true});
    startscalp3070();
    startscalp3080();
    startcheck();
}

async function startcheck() {
    const list = JSON.parse(File.readFileSync("list.json", 'utf-8'));
    for (const item of list) {
        await check(item);
    }
    setTimeout(startcheck, 1440000);
}

async function startscalp3070() {
    var doublecheck = await scalp("https://www.bestbuy.com/site/nvidia-geforce-rtx-3070-8gb-gddr6-pci-express-4-0-graphics-card-dark-platinum-and-black/6429442.p?skuId=6429442");
    if (SoldOutRTX3070 != doublecheck) {
        if (doublecheck) {
            Telegram.sendMessage(ChatId, "The RTX 3070 just went out of stock.");
        } else {
            Telegram.sendMessage(ChatId, "The RTX 3070 is in stock!!! https://www.bestbuy.com/site/nvidia-geforce-rtx-3070-8gb-gddr6-pci-express-4-0-graphics-card-dark-platinum-and-black/6429442.p?skuId=6429442 https://www.bestbuy.com/site/nvidia-geforce-rtx-3070-8gb-gddr6-pci-express-4-0-graphics-card-dark-platinum-and-black/6429442.p?skuId=6429442 https://www.bestbuy.com/site/nvidia-geforce-rtx-3070-8gb-gddr6-pci-express-4-0-graphics-card-dark-platinum-and-black/6429442.p?skuId=6429442");
        }
        SoldOutRTX3070 = doublecheck;
    }
    if (SoldOutRTX3070) {
        console.log("[" + new Date().toLocaleString() + "]" + " The RTX 3070 is currently out of stock.");
    } else {
        console.log("[" + new Date().toLocaleString() + "]" + " The RTX 3070 is currently in stock!!");
    }
    startscalp3070();
}

async function startscalp3080() {
    var doublecheck = await scalp("https://www.bestbuy.com/site/nvidia-geforce-rtx-3080-10gb-gddr6x-pci-express-4-0-graphics-card-titanium-and-black/6429440.p?skuId=6429440");
    if (SoldOutRTX3080 != doublecheck) {
        if (doublecheck) {
            Telegram.sendMessage(ChatId, "The RTX 3080 just went out of stock.");
        } else {
            Telegram.sendMessage(ChatId, "The RTX 3080 is in stock!!! https://www.bestbuy.com/site/nvidia-geforce-rtx-3080-10gb-gddr6x-pci-express-4-0-graphics-card-titanium-and-black/6429440.p?skuId=6429440 https://www.bestbuy.com/site/nvidia-geforce-rtx-3080-10gb-gddr6x-pci-express-4-0-graphics-card-titanium-and-black/6429440.p?skuId=6429440 https://www.bestbuy.com/site/nvidia-geforce-rtx-3080-10gb-gddr6x-pci-express-4-0-graphics-card-titanium-and-black/6429440.p?skuId=6429440");
        }
        SoldOutRTX3080 = doublecheck;
    }
    if (SoldOutRTX3070) {
        console.log("[" + new Date().toLocaleString() + "] The RTX 3080 is currently out of stock.");
    } else {
        console.log("[" + new Date().toLocaleString() + "] The RTX 3080 is currently in stock!!");
    }
    startscalp3080();
}

async function check(link) {
    console.log("[" + new Date().toLocaleString() + "] Checking... (" + link + ")");
    const page = await google.newPage();
    await page.setUserAgent(UserAgent);
    await page.goto(link, {waitUntil: 'domcontentloaded', timeout: 0});
    const wp = await page.evaluate(() => {
        var pr, st;
        if (document.body.innerText.toLowerCase().includes("sold out")) {
            st = false;
        } else {
            st = true;
        }
        pr = document.getElementsByClassName("priceView-layout-large")[0].getElementsByClassName("priceView-hero-price priceView-customer-price")[0].innerText;
        pr = pr.replace(/\n/g, "§")
        pr = pr.substring(0, pr.indexOf("§"));
        return {
            price: pr,
            stock: st,
            name: document.getElementsByClassName("heading-5 v-fw-regular")[0].innerText,
            sku: parseInt(document.getElementsByClassName("sku product-data")[0].getElementsByClassName("product-data-value body-copy")[0].innerText)
        };
    })
    if (CacheS.has(wp.sku)) {
        if (wp.stock != CacheS.get(wp.sku)) {
            if (wp.stock) {
                Telegram.sendMessage(ChatId, "Your item \"" + wp.name + "\" is now back in stock, priced at " + wp.price + ".");
            } else {
                Telegram.sendMessage(ChatId, "Your item \"" + wp.name + "\" got sold out.");
            }
            CacheS.set(wp.sku, wp.stock);
        }
    } else {
        CacheS.set(wp.sku, wp.stock);
    }
    if (CacheP.has(wp.sku)) {
        if (wp.price != CacheP.get(wp.sku)) {
            console.log(wp.price.replace(/\D+/g, ""))
            console.log(CacheP.get(wp.sku).replace(/\D+/g, ""))
            if (wp.price.replace(/\D+/g, "") < CacheP.get(wp.sku).replace(/\D+/g, "")) {
                Telegram.sendMessage(ChatId, "Your item \"" + wp.name + "\" got cheaper or is on sale!");
            } else {
                Telegram.sendMessage(ChatId, "Your item \"" + wp.name + "\" got more expensive / inflation or it went back to its original price.");
            }
            CacheP.set(wp.sku, wp.price)
        }
    } else {
        CacheP.set(wp.sku, wp.price)
    }
    if (wp.stock) {
        console.log("[" + new Date().toLocaleString() + "]" + " \"" + wp.name + "\" is currently in stock for " + wp.price + "!");
    } else {
        console.log("[" + new Date().toLocaleString() + "]" + " \"" + wp.name + "\" is currently out of stock.");
    }
    if (!CacheN.has(wp.sku)) {
        CacheN.set(wp.sku, wp.name);
    }
    await page.close();
}

async function scalp(link) {
    console.log("[" + new Date().toLocaleString() + "] Checking... (" + link + ")");
    const page = await google.newPage();
    await page.setRequestInterception(true);
    page.on('request', (req) => {
        if(req.resourceType() == 'stylesheet' || req.resourceType() == 'font' || req.resourceType() == 'image'){
            req.abort();
        } else {
            req.continue();
        }
    });
    await page.setUserAgent(UserAgent);
    await page.goto(link, {waitUntil: 'domcontentloaded', timeout: 0});
    const check = await page.evaluate(() => {
        if (document.body.innerText.toLowerCase().includes("sold out")) {
            return true;
        } else {
            return false;
        }
    });
    await page.close();
    return check;
}

Telegram.sendMessage(ChatId, "RTX Sniper 3000 has started or reopened. If this wasn't you, it probably crashed and got self recovered.");

Telegram.onText(/status/, (msg, match) => {
    const skus = Array.from(CacheN.keys());
    var text = "Current Status for Prices:\n";
    for (const sku of skus) {
        if (CacheS.get(sku)) {
            text = text + CacheN.get(sku) + ": " + CacheP.get(sku) + ".\n";
        } else {
            text = text + CacheN.get(sku) + ": Sold Out.\n";
        }
    }
    text = text + "The RTX 3070 is currently " + (SoldOutRTX3070 ? "Sold Out.\n" : "IN STOCK GO BUY IT NOW!!! https://www.bestbuy.com/site/nvidia-geforce-rtx-3070-8gb-gddr6-pci-express-4-0-graphics-card-dark-platinum-and-black/6429442.p?skuId=6429442 https://www.bestbuy.com/site/nvidia-geforce-rtx-3070-8gb-gddr6-pci-express-4-0-graphics-card-dark-platinum-and-black/6429442.p?skuId=6429442 https://www.bestbuy.com/site/nvidia-geforce-rtx-3070-8gb-gddr6-pci-express-4-0-graphics-card-dark-platinum-and-black/6429442.p?skuId=6429442\n");
    text = text + "The RTX 3080 is currently " + (SoldOutRTX3080 ? "Sold Out.\n" : "IN STOCK GO BUY IT NOW!!! https://www.bestbuy.com/site/nvidia-geforce-rtx-3080-10gb-gddr6x-pci-express-4-0-graphics-card-titanium-and-black/6429440.p?skuId=6429440 https://www.bestbuy.com/site/nvidia-geforce-rtx-3080-10gb-gddr6x-pci-express-4-0-graphics-card-titanium-and-black/6429440.p?skuId=6429440 https://www.bestbuy.com/site/nvidia-geforce-rtx-3080-10gb-gddr6x-pci-express-4-0-graphics-card-titanium-and-black/6429440.p?skuId=6429440\n");
    Telegram.sendMessage(ChatId, text);
});

Telegram.onText(/list/, (msg, match) => {
    const skus = Array.from(CacheN.keys());
    var text = "Current List for Prices:\n";
    for (const sku of skus) {
        if (CacheS.get(sku)) {
            text = text + CacheN.get(sku) + ": " + CacheP.get(sku) + ".\n";
        } else {
            text = text + CacheN.get(sku) + ": Sold Out.\n";
        }
    }
    text = text + "The RTX 3070 is currently " + (SoldOutRTX3070 ? "Sold Out.\n" : "IN STOCK GO BUY IT NOW!!! https://www.bestbuy.com/site/nvidia-geforce-rtx-3070-8gb-gddr6-pci-express-4-0-graphics-card-dark-platinum-and-black/6429442.p?skuId=6429442 https://www.bestbuy.com/site/nvidia-geforce-rtx-3070-8gb-gddr6-pci-express-4-0-graphics-card-dark-platinum-and-black/6429442.p?skuId=6429442 https://www.bestbuy.com/site/nvidia-geforce-rtx-3070-8gb-gddr6-pci-express-4-0-graphics-card-dark-platinum-and-black/6429442.p?skuId=6429442\n");
    text = text + "The RTX 3080 is currently " + (SoldOutRTX3080 ? "Sold Out.\n" : "IN STOCK GO BUY IT NOW!!! https://www.bestbuy.com/site/nvidia-geforce-rtx-3080-10gb-gddr6x-pci-express-4-0-graphics-card-titanium-and-black/6429440.p?skuId=6429440 https://www.bestbuy.com/site/nvidia-geforce-rtx-3080-10gb-gddr6x-pci-express-4-0-graphics-card-titanium-and-black/6429440.p?skuId=6429440 https://www.bestbuy.com/site/nvidia-geforce-rtx-3080-10gb-gddr6x-pci-express-4-0-graphics-card-titanium-and-black/6429440.p?skuId=6429440\n");
    Telegram.sendMessage(ChatId, text);
});

Telegram.onText(/add (.+)/, (msg, match) => {
    const list = JSON.parse(File.readFileSync("list.json", 'utf-8'));
    list.push(match[1]);
    File.writeFileSync("./list.json", JSON.stringify(list));
    Telegram.sendMessage(ChatId, "Added item. It might take up to 45 minutes to take affect.");
});

Telegram.onText(/purge/, (msg, match) => {
    const list = JSON.parse(File.readFileSync("list.json", 'utf-8'));
    File.writeFileSync("./list.json", "[]");
    Telegram.sendMessage(ChatId, "Cleared list. It might take up to 45 minutes to take affect.");
});

Telegram.onText(/clear/, (msg, match) => {
    const list = JSON.parse(File.readFileSync("list.json", 'utf-8'));
    File.writeFileSync("./list.json", "[]");
    Telegram.sendMessage(ChatId, "Cleared list. It might take up to 45 minutes to take affect.");
});

try {
    start();
} catch (err) {
    console.log(err);
    Telegram.sendMessage(ChatId, "There is an error currently. Please fix!");
    Telegram.sendMessage(ChatId, err)
}

/*
    if (wp.stock) {
        Telegram.sendMessage(ChatId, "Your item \"" + wp.name + "\" is currently priced at " + wp.price + ".");
    } else {
        Telegram.sendMessage(ChatId, "Your item \"" + wp.name + "\" is currently sold out.");
    }
*/

// Check for Stock
// then Check for Price
// Check previous price
// If same do nothing if not same send telegram sms
