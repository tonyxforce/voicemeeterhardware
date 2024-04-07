
/**
 * This file is loaded via the <script> tag in the index.html file and will
 * be executed in the renderer process for that window. No Node.js APIs are
 * available in this process because `nodeIntegration` is turned off and
 * `contextIsolation` is turned on. Use the contextBridge API in `preload.js`
 * to expose Node.js functionality from the main process.
 */
var electron = window.electron;
var _portSelector = document.getElementById("portSelect");
var _connectBtn = document.getElementById("connect");
var _closeBtn = document.getElementById("close");
var _autoConnect = document.getElementById("autoconnect");
var _autoConnectDiv = document.getElementById("autoconnectDiv");

_autoConnect.checked = localStorage.getItem("autoconnect") == "true";

_autoConnect.addEventListener("click", (e) => {
	localStorage.setItem("autoconnect", _autoConnect.checked);
})

_closeBtn.addEventListener("click", (e) => {
	_closeBtn.classList.add("d-none");
	_portSelector.classList.remove("d-none");
	_connectBtn.classList.remove("d-none");
	_autoConnectDiv.classList.remove("d-none");
	electron.disconnect();

	electron.listPorts();

	_autoConnect.checked = false;
	cueInterval = setInterval(() => {
		electron.listPorts();
	}, 1000);
})

electron.subscribe("list", (a) => {
	var ports = JSON.parse(a);
	if (ports.error) return console.error(ports.data);
	while (_portSelector.options.length > 0) _portSelector.options.remove(0);

	if (ports.data.length == 0) {

		var nothing = new Option("No ports found!", "none");
		nothing.selected = true;
		nothing.disabled = true;
		_portSelector.add(nothing)
		return;
	};
	ports.data.forEach(port => {
		_portSelector.options = [];
		_portSelector.add(new Option(`${port.manufacturer} (${port.path})`, port.path));
		_portSelector.click();
	});

	if (_autoConnect.checked) {
		_connectBtn.click();
	}
});

_portSelector.addEventListener("click", () => {
	var path = _portSelector.options[_portSelector.selectedIndex].value;
	if (path == "none") {
		_connectBtn.classList.add("disabled")
	} else {
		_connectBtn.classList.remove("disabled")
	};
})

_connectBtn.addEventListener("click", () => {
	var path = _portSelector.options[_portSelector.selectedIndex].value;
	_connectBtn.classList.add("d-none");
	_closeBtn.classList.remove("d-none");
	_portSelector.classList.add("d-none");
	_autoConnectDiv.classList.add("d-none");
	electron.connectToPort(path)
	clearInterval(cueInterval)
});

[
	"open",
	"close",
	"data",
	"drain",
	"end",
	"error",
	"finish",
	"pause",
	"pipe",
	"readable",
	"resume",
	"unpipe"
].forEach((e) => {
	console.log(electron.subscribe(`port${e}`, (...params) => console.log(e, ...params)))
})

electron.listPorts();
var cueInterval = setInterval(() => {
	electron.listPorts();
}, 1000);

window.onbeforeunload = function () {
	electron.disconnect();
}