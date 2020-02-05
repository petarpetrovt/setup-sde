module.exports=function(e,t){"use strict";var r={};function __webpack_require__(t){if(r[t]){return r[t].exports}var n=r[t]={i:t,l:false,exports:{}};e[t].call(n.exports,n,n.exports,__webpack_require__);n.l=true;return n.exports}__webpack_require__.ab=__dirname+"/";function startup(){return __webpack_require__(104)}return startup()}({87:function(e){e.exports=require("os")},104:function(e,t,r){const n=r(470);const s=r(622);const i=r(129).exec;function npmInstall(e){return new Promise((t,r)=>{i("npm install",{cwd:e},(e,s,i)=>{n.debug(s);n.debug(i);if(e){r(e);return}t()})})}function installSDE(e,t){return new Promise((r,s)=>{i(`node ${t}`,{cwd:e},(e,t,i)=>{n.debug(t);n.debug(i);if(e){s(e);return}r(t)})})}async function run(){try{const e=n.getInput("environmentVariableName")||"SDE_PATH";n.debug(`environmentVariableName: ${e}`);if(!e||e.length<=0){throw new Error("Missing enviroment variable name.")}const t=s.join(__dirname,"../../installer");const r="index.js";await npmInstall(t);const i=await installSDE(t,r);n.exportVariable(e,i)}catch(e){n.error(e);n.setFailed("An error has occured while setuping SDE binaries.")}}run()},129:function(e){e.exports=require("child_process")},431:function(e,t,r){"use strict";var n=this&&this.__importStar||function(e){if(e&&e.__esModule)return e;var t={};if(e!=null)for(var r in e)if(Object.hasOwnProperty.call(e,r))t[r]=e[r];t["default"]=e;return t};Object.defineProperty(t,"__esModule",{value:true});const s=n(r(87));function issueCommand(e,t,r){const n=new Command(e,t,r);process.stdout.write(n.toString()+s.EOL)}t.issueCommand=issueCommand;function issue(e,t=""){issueCommand(e,{},t)}t.issue=issue;const i="::";class Command{constructor(e,t,r){if(!e){e="missing.command"}this.command=e;this.properties=t;this.message=r}toString(){let e=i+this.command;if(this.properties&&Object.keys(this.properties).length>0){e+=" ";let t=true;for(const r in this.properties){if(this.properties.hasOwnProperty(r)){const n=this.properties[r];if(n){if(t){t=false}else{e+=","}e+=`${r}=${escapeProperty(n)}`}}}}e+=`${i}${escapeData(this.message)}`;return e}}function escapeData(e){return(e||"").replace(/%/g,"%25").replace(/\r/g,"%0D").replace(/\n/g,"%0A")}function escapeProperty(e){return(e||"").replace(/%/g,"%25").replace(/\r/g,"%0D").replace(/\n/g,"%0A").replace(/:/g,"%3A").replace(/,/g,"%2C")}},470:function(e,t,r){"use strict";var n=this&&this.__awaiter||function(e,t,r,n){function adopt(e){return e instanceof r?e:new r(function(t){t(e)})}return new(r||(r=Promise))(function(r,s){function fulfilled(e){try{step(n.next(e))}catch(e){s(e)}}function rejected(e){try{step(n["throw"](e))}catch(e){s(e)}}function step(e){e.done?r(e.value):adopt(e.value).then(fulfilled,rejected)}step((n=n.apply(e,t||[])).next())})};var s=this&&this.__importStar||function(e){if(e&&e.__esModule)return e;var t={};if(e!=null)for(var r in e)if(Object.hasOwnProperty.call(e,r))t[r]=e[r];t["default"]=e;return t};Object.defineProperty(t,"__esModule",{value:true});const i=r(431);const o=s(r(87));const u=s(r(622));var a;(function(e){e[e["Success"]=0]="Success";e[e["Failure"]=1]="Failure"})(a=t.ExitCode||(t.ExitCode={}));function exportVariable(e,t){process.env[e]=t;i.issueCommand("set-env",{name:e},t)}t.exportVariable=exportVariable;function setSecret(e){i.issueCommand("add-mask",{},e)}t.setSecret=setSecret;function addPath(e){i.issueCommand("add-path",{},e);process.env["PATH"]=`${e}${u.delimiter}${process.env["PATH"]}`}t.addPath=addPath;function getInput(e,t){const r=process.env[`INPUT_${e.replace(/ /g,"_").toUpperCase()}`]||"";if(t&&t.required&&!r){throw new Error(`Input required and not supplied: ${e}`)}return r.trim()}t.getInput=getInput;function setOutput(e,t){i.issueCommand("set-output",{name:e},t)}t.setOutput=setOutput;function setFailed(e){process.exitCode=a.Failure;error(e)}t.setFailed=setFailed;function debug(e){i.issueCommand("debug",{},e)}t.debug=debug;function error(e){i.issue("error",e)}t.error=error;function warning(e){i.issue("warning",e)}t.warning=warning;function info(e){process.stdout.write(e+o.EOL)}t.info=info;function startGroup(e){i.issue("group",e)}t.startGroup=startGroup;function endGroup(){i.issue("endgroup")}t.endGroup=endGroup;function group(e,t){return n(this,void 0,void 0,function*(){startGroup(e);let r;try{r=yield t()}finally{endGroup()}return r})}t.group=group;function saveState(e,t){i.issueCommand("save-state",{name:e},t)}t.saveState=saveState;function getState(e){return process.env[`STATE_${e}`]||""}t.getState=getState},622:function(e){e.exports=require("path")}});