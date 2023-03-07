import { WebContainer } from '@webcontainer/api';

let webcontainerInstance;

async function setup () {
  webcontainerInstance = await WebContainer.boot();

  const installProcess = await webcontainerInstance.spawn('npm', ['install', '@stencil/core@latest']);


