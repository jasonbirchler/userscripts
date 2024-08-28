// ==UserScript==
// @name        Dollars Per TB
// @description Calculate cost per TB for a page with a list of HDDs
// @match       *://*.amazon.com/*
// @match       *://*.macsales.com/*
// @match       *://*.serverpartdeals.com/*
// ==/UserScript==
let querySelector = "";

if (window.location.host.includes("amazon")) {
	querySelector = 'div[data-asin]:not([data-asin=""])';
} else if (window.location.host.includes("macsales")) {
	querySelector = "div.product-item__container";
} else if (window.location.host.includes("serverpartdeals")) {
	querySelector = ".boost-pfs-filter-product-item";
} else {
	querySelector = null;
}

function calculateCostPerTB(item) {
	const input = item;

	const regex = /(\d+(?:\.\d+)?\s*(?:TB|GB))[\s\S]*?(\$\d+(?:\.\d+)?)/;
	const match = input.match(regex);

	if (match && match.length) {
		let size = parseFloat(
			match[1].replace("TB", "").replace("GB", "").trim()
		);
		let price = parseFloat(match[2].replace("$", "").trim());

		if (match[1].includes("GB")) {
			size /= 1024; // Convert GB to TB
		}

		const costPerTB = price / size;
		return costPerTB.toPrecision(4);
	} else {
		console.log("no match found in: ", input);
		return null;
	}
}

function getTextContent(element) {
	// Create a variable to store the text content
	let textContent = "";
	// Iterate over the element and its children using a recursive function
	function traverse(node) {
		// If the node is a text node, add its text content to the string
		if (node.nodeType && node.nodeType === Node.TEXT_NODE) {
			textContent += node.textContent;
		}
		// Recursively call the traverse function for each child node
		for (let i = 0; i < node.childNodes.length; i++) {
			traverse(node.childNodes[i]);
		}
	}
	// Call the traverse function with the given element
	traverse(element);

	// Return the text content
	return textContent.trim();
}

function doTheThings() {
	let itemList = document.querySelectorAll(querySelector);

	itemList.forEach((item) => {
		// get all text
		let text = getTextContent(item);

		// calculate value
		const costPerTB = calculateCostPerTB(text);

		let el = document.createElement("p");
		el.className = "cost-per-byte";
		el.style.position = "relative";
		el.style.top = "32px";
		el.style.left = "10px";
		el.style.backgroundColor = "rgba(176,224,230,0.85)";
		el.style.padding = "1rem";
		el.style.margin = "0.25rem";
		el.style.boxShadow = "1px 1px 4px rgba(0,0,0,0.2)";
		el.style.zIndex = "999999";
		el.style.width = "min-content";
		el.style.borderRadius = "0.5rem";

		if (costPerTB !== null) {
			el.innerText = `$${costPerTB}/TB`;

			//insert value into DOM
			item.insertBefore(el, item.firstChild);
		}
	});
}

doTheThings();
