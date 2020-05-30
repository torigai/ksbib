
let linkAltM = document.getElementById("navMedien");
let linkAltS = document.getElementById("navSonstiges");

function blurMenu ()
{
	console.log("blur");
	let arrDropdownMedien = Array.from(linkAltM.nextElementSibling.children);
	arrDropdownMedien.push(linkAltM);

	let arrDropdownSonstiges = Array.from(linkAltS.nextElementSibling.children);
	arrDropdownSonstiges.push(linkAltS);

	setTimeout( () => 
	{
		if (linkAltM.className === "active" && arrDropdownMedien.indexOf(document.activeElement) === -1) {
			linkAltM.setAttribute("class", "");
		}
		if (linkAltS.className === "active" && arrDropdownSonstiges.indexOf(document.activeElement) === -1) {
			linkAltS.setAttribute("class", "");
		}
	}, 0);
}

function altM (event)
{
    if (event.altKey === true && event.keyCode === 77  || event.altKey === true && event.which === 77) {
        event.preventDefault();
        linkAltM.focus();
        if (linkAltS.className === "active") {
        	linkAltS.setAttribute("class", "");
        }
    }
}

function altS (event)
{
    if (event.altKey === true && event.keyCode === 83  || event.altKey === true && event.which === 83) {
        event.preventDefault();
        linkAltS.focus();
        if (linkAltM.className === "active") {
        	linkAltM.setAttribute("class", "");
        }
    }
}

function down (event)
{
	if (event.keyCode === 40 || event.which === 40) {
		event.preventDefault();
		let link = this.firstElementChild;
		link.setAttribute("class", "active");
		let arrDropdown = Array.from(link.nextElementSibling.children);
		let l = arrDropdown.length;
		let i = arrDropdown.indexOf(document.activeElement);
		if (link === document.activeElement) {
			arrDropdown[0].focus();
		} else {
			if (i === l-1) {link.focus();}
			else {arrDropdown[i+1].focus();}
		}
	}
}
function up (event)
{
	if (event.keyCode === 38 || event.which === 38) {
		event.preventDefault();
		let link = this.firstElementChild;
		link.setAttribute("class", "active");
		let arrDropdown = Array.from(link.nextElementSibling.children);
		let l = arrDropdown.length;
		let i = arrDropdown.indexOf(document.activeElement);
		if (link == document.activeElement) {
			arrDropdown[l-1].focus();
		} else {
			if (i === 0) {link.focus();}
			else {arrDropdown[i-1].focus();}
		}	
	}
}

function rightAndLeft (event)
{
	if (event.keyCode === 39 || event.keyCode ===37 || event.which === 39 || event.which == 37) {
		event.preventDefault();
		if (linkAltM === document.activeElement || linkAltM.className === "active") {
			linkAltS.focus();
			linkAltM.setAttribute("class", "");
			linkAltS.setAttribute("class", "active");
		} else if (linkAltS === document.activeElement || linkAltS.className === "active") {
			linkAltM.focus();
			linkAltS.setAttribute("class", "");
			linkAltM.setAttribute("class", "active");
		}
	}
}

function checkboxEnter (event)
{
	if (event.keyCode === 13 || event.which === 13) {
		event.preventDefault();
		this.click();
	}
}

function findCheckboxes ()
{
	let arr = Array.from(document.querySelectorAll("input[type='checkbox']"));
	arr.forEach((checkbox) => checkbox.addEventListener("keydown", checkboxEnter, false));	
	return arr;
}
findCheckboxes();


document.getElementsByTagName("ul")[0].addEventListener("keydown", down, false);
document.getElementsByTagName("ul")[0].addEventListener("keydown", up, false);
document.getElementsByTagName("ul")[0].addEventListener("keydown", rightAndLeft, false);
document.getElementsByTagName("ul")[0].addEventListener("focusout", blurMenu, false);
document.getElementsByTagName("ul")[1].addEventListener("keydown", down, false);
document.getElementsByTagName("ul")[1].addEventListener("keydown", up, false);
document.getElementsByTagName("ul")[1].addEventListener("keydown", rightAndLeft, false);
document.getElementsByTagName("ul")[1].addEventListener("focusout", blurMenu, false);

document.getElementsByTagName("body")[0].addEventListener("keydown", altM, false);
document.getElementsByTagName("body")[0].addEventListener("keydown", altS, false);




