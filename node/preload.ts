/**
 * The preload script runs before `index.html` is loaded
 * in the renderer. It has access to web APIs as well as
 * Electron's renderer process modules and some polyfilled
 * Node.js functions.
 *
 * https://www.electronjs.org/docs/latest/tutorial/sandbox
 */

import { SerialPort } from "electron";

const { contextBridge, ipcRenderer, ipcMain } = require('electron')

contextBridge.exposeInMainWorld(
	'electron',
	{
		subscribe: (channel:string, func: Function) => {
			let validChannels = [
				"list",
				"portclose",
				"portdata",
				"portdrain",
				"portend",
				"porterror",
				"portfinish",
				"portpause",
				"portpipe",
				"portreadable",
				"portresume",
				"portunpipe",
				"portopen"
			];
			if (validChannels.includes(channel)) {
				ipcRenderer.on(channel, (event, ...args) => func(...args));
				return "OK"
			} else {
				return "err" + " " + channel
			}
		},
		listPorts: () => ipcRenderer.send('list'),
		connectToPort: (port: string) => {
			if (!port) return false;
			ipcRenderer.send("connect", port);
		},
		disconnect: () =>{
			ipcRenderer.send("disconnect");
		},
		anAsyncFunction: async () => 123,
		data: {
			myFlags: ['a', 'b', 'c'],
			bootTime: 1234
		},
		nestedAPI: {
			evenDeeper: {
				youCanDoThisAsMuchAsYouWant: {
					fn: () => ({
						returnData: 123
					})
				}
			}
		}
	}
)