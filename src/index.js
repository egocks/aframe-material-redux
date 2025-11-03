(()=>{
  if (!AFRAME) { return console.error('AFRAME is required!'); }
  if (!AFRAME.ASSETS_PATH) { AFRAME.ASSETS_PATH = "./assets"; }
  require('./rounded');
  require("./fade");
  //require("./alert"); @TODO ;)
  require('./core/material-form-system');
  require("./keyboard");
  require("./input");
  require("./textarea");
  require("./switch");
  require("./form");
  require("./radio");
  require("./checkbox");
  require("./button");
  require("./toast");
})();
