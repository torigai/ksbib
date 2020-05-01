
let linkAltM = document.getElementById("navMedien");
let linkAltS = document.getElementById("navSonstiges");


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
	let i;
	let link = this.firstElementChild;
	if (event.keyCode === 40 || event.which === 40) {
		event.preventDefault();
		link.setAttribute("class", "active");
		let dropdown = link.nextElementSibling;
		console.log(dropdown);
		let l = dropdown.children.length;
		if (link === document.activeElement) {
			dropdown.children[0].focus();
		} else {
			for(i = 0; i < l; i++) {
				if (dropdown.children[i] === document.activeElement) {
					if (i === l-1) {
						link.focus();
					} else {
						dropdown.children[i + 1].focus();
					}
					break;
				}	
			}
		}
	}
}
function up (event)
{
	let i;
	let link = this.firstElementChild;
	if (event.keyCode === 38 || event.which === 38) {
		event.preventDefault();
		link.setAttribute("class", "active");
		let dropdown = link.nextElementSibling;
		let l = dropdown.children.length;
		if (link == document.activeElement) {
			dropdown.children[l - 1].focus();
		} else {
			for(i = 0; i < l; i++) {
				if (dropdown.children[i] == document.activeElement) {
					if (i === 0) {
						link.focus();
					} else {
						dropdown.children[i-1].focus();
					}
					break;
				}	
			}
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

document.getElementsByTagName("ul")[0].addEventListener("keydown", down, false);
document.getElementsByTagName("ul")[0].addEventListener("keydown", up, false);
document.getElementsByTagName("ul")[0].addEventListener("keydown", rightAndLeft, false);
document.getElementsByTagName("ul")[1].addEventListener("keydown", down, false);
document.getElementsByTagName("ul")[1].addEventListener("keydown", up, false);
document.getElementsByTagName("ul")[1].addEventListener("keydown", rightAndLeft, false);

document.getElementsByTagName("body")[0].addEventListener("keydown", altM, false);
document.getElementsByTagName("body")[0].addEventListener("keydown", altS, false);
